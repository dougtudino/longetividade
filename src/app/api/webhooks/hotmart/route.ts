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

    let plan: "basico" | "completo" | "vip";
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

    // Criar ou atualizar Order
    const downloadToken = generateDownloadToken();
    const tokenExpiresAt = getTokenExpiration();

    const order = await prisma.order.create({
      data: {
        email,
        name,
        plan,
        amount,
        status: "approved",
        downloadToken,
        tokenExpiresAt,
      },
    });

    // Se VIP, reivindicar vaga no app
    if (plan === "vip") {
      await claimVipSlot(order.id, email);
    }

    // Enviar email de entrega
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.longetividade.com.br";
    const downloadUrl = `${baseUrl}/api/download?token=${downloadToken}`;

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

    // CAPI: enviar evento Purchase server-side pro Meta
    // Roda em background (nao bloqueia resposta do webhook)
    sendPurchaseEvent({
      email,
      phone: buyer.phone ?? null,
      name,
      value: amount / 100,
      orderId: order.id,
      contentName: `Metodo S.E.M - ${plan}`,
    }).catch((err) => console.error("CAPI Purchase error:", err));

    return NextResponse.json({ received: true, plan, orderId: order.id });
  } catch (error: unknown) {
    console.error("Hotmart webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
