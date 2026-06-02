import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { claimVipSlot } from "@/lib/vip-slots";
import { generateDownloadToken, getTokenExpiration } from "@/lib/download";
import { sendEmail, buildDeliveryEmail } from "@/lib/email";
import { getSetting } from "@/lib/settings";
import { sendPurchaseEvent } from "@/lib/meta-capi";

// GET handler — Hotmart valida a URL com GET antes de salvar
export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar assinatura do Hotmart (busca do banco ou env var)
    const hottok = request.headers.get("x-hotmart-hottok");
    const secret = await getSetting("HOTMART_WEBHOOK_SECRET");
    if (secret && hottok !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = body.event;
    // Hotmart envia "PURCHASE_APPROVED", "PURCHASE_COMPLETE", etc.
    if (event !== "PURCHASE_APPROVED" && event !== "PURCHASE_COMPLETE") {
      return NextResponse.json({ received: true });
    }

    const buyer = body.data?.buyer;
    const purchase = body.data?.purchase;
    const product = body.data?.product;

    if (!buyer?.email || !purchase) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const email = buyer.email.trim().toLowerCase();
    const name = buyer.name || email;
    const offerId = purchase.offer?.code || "";
    const amount = Math.round((purchase.price?.value ?? 0) * 100);

    // Determinar plano pelo offer_code (com fallback por valor)
    // Offer codes vivem em AppSetting (admin-editavel) ou em env vars.
    const offerBasico = await getSetting("HOTMART_OFFER_BASICO", "zxq5tgew");
    const offerCompleto = await getSetting("HOTMART_OFFER_COMPLETO", "uzvdkzkf");
    const offerVip = await getSetting("HOTMART_OFFER_VIP", "h84hak4e");

    let plan: string;
    if (offerId && offerId === offerVip) {
      plan = "vip";
    } else if (offerId && offerId === offerCompleto) {
      plan = "completo";
    } else if (offerId && offerId === offerBasico) {
      plan = "basico";
    } else {
      // Fallback por valor caso offer_code venha vazio/desconhecido
      if (amount >= 9700) plan = "vip";
      else if (amount >= 6700) plan = "completo";
      else plan = "basico";
    }

    // Roteamento multi-tenant: a offer mapeia o workspace dono da venda.
    // Fallback longetividade (produto atual). Defensivo: se a tabela ainda
    // não foi migrada, cai no default sem quebrar a venda.
    let workspaceId = "longetividade";
    try {
      const wsPlan = offerId
        ? await prisma.workspacePlan.findUnique({ where: { hotmartOffer: offerId } })
        : null;
      if (wsPlan) {
        workspaceId = wsPlan.workspaceId;
        // Para workspaces não-longetividade, o plano é o planKey do banco
        // (ex: corretores → lt|bump|upsell), não basico|completo|vip.
        if (workspaceId !== "longetividade") plan = wsPlan.planKey;
      }
    } catch {
      /* tabela não migrada → longetividade */
    }
    const isLongetividade = workspaceId === "longetividade";

    // Criar ou atualizar Order — idempotente por hotmartTransactionId pra
    // suportar retry da Hotmart sem duplicar. Se nao veio txn (improvavel),
    // cai num create simples pra nao bloquear venda.
    const hotmartTransactionId = (purchase.transaction as string | undefined) ?? null;

    const existing = hotmartTransactionId
      ? await prisma.order.findUnique({ where: { hotmartTransactionId } })
      : null;
    const isNewOrder = !existing;

    const downloadToken = existing?.downloadToken ?? generateDownloadToken();
    const tokenExpiresAt = existing?.tokenExpiresAt ?? getTokenExpiration();

    const order = hotmartTransactionId
      ? await prisma.order.upsert({
          where: { hotmartTransactionId },
          create: {
            workspaceId,
            email,
            name,
            phone: buyer.phone ?? null,
            plan,
            amount,
            status: "approved",
            downloadToken,
            tokenExpiresAt,
            hotmartTransactionId,
          },
          update: {
            // Em retry/refund/chargeback a Hotmart manda eventos novos —
            // refletir status atual sem perder o downloadToken original.
            status: "approved",
            email,
            name,
            plan,
            amount,
          },
        })
      : await prisma.order.create({
          data: {
            workspaceId,
            email,
            name,
            phone: buyer.phone ?? null,
            plan,
            amount,
            status: "approved",
            downloadToken,
            tokenExpiresAt,
          },
        });

    // Side-effects abaixo são específicos do produto longetividade (app VIP,
    // email de entrega do ebook, CAPI no pixel do longetividade). Para outros
    // workspaces (ex: corretores), a entrega/pixel próprios entram quando o
    // produto Hotmart deles for criado. Por ora só registramos o Order.
    if (!isLongetividade) {
      return NextResponse.json({ received: true, plan, workspaceId, orderId: order.id });
    }

    // Se VIP, reivindicar vaga no app (claimVipSlot ja eh idempotente)
    if (plan === "vip") {
      await claimVipSlot(order.id, email);
    }

    // Enviar email de entrega APENAS em ordem nova — em retry da Hotmart
    // nao queremos spammar o comprador com o mesmo email.
    if (isNewOrder) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.longetividade.com.br";
      const downloadUrl = `${baseUrl}/api/download?token=${order.downloadToken}`;

      const { subject, htmlContent } = buildDeliveryEmail(name, downloadUrl);

      try {
        await sendEmail({
          to: email,
          toName: name,
          subject,
          htmlContent,
        });
      } catch (emailError: unknown) {
        console.error("Failed to send delivery email:", emailError);
      }
    }

    // CAPI: enviar evento Purchase server-side pro Meta
    // event_id usa o transaction do Hotmart (que tambem chega na obrigado URL
    // via ?transaction=) pra Meta deduplicar com o pixel client-side.
    // Sem dedup, cada compra contava 2x — uma do pixel e outra do CAPI.
    const txnId = purchase.transaction || `order_${order.id}`;
    sendPurchaseEvent({
      email,
      phone: buyer.phone ?? null,
      name,
      value: amount / 100,
      orderId: order.id,
      contentName: `Metodo S.E.M - ${plan}`,
      eventId: `purchase_${txnId}`,
    }).catch((err) => console.error("CAPI Purchase error:", err));

    return NextResponse.json({ received: true, plan, orderId: order.id });
  } catch (error: unknown) {
    console.error("Hotmart webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
