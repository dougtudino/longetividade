import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { postPurchaseD1, postPurchaseD7, postPurchaseD21 } from "@/lib/email-post-purchase";

// GET /api/cron/post-purchase
// Cron diario (CRON_SECRET). Envia emails pos-compra baseado na idade
// do Order. Usa o campo downloadCount como proxy pra "ja enviou email X"
// (hack temporario — ideal seria um campo dedicado no Order).
//
// Na verdade, vamos usar Lead com source="buyer" pra rastrear.
// Quando o webhook Hotmart cria o Order, tambem cria um Lead com
// source="buyer-{plan}" e sequenceStep=0. O cron avanca:
//   step 10 = D+1 enviado
//   step 11 = D+7 enviado
//   step 12 = D+21 enviado (fim)
//
// Pra compatibilidade, se nao existe Lead "buyer", cria na hora.

const D1_MS = 1 * 24 * 60 * 60 * 1000;
const D7_MS = 7 * 24 * 60 * 60 * 1000;
const D21_MS = 21 * 24 * 60 * 60 * 1000;
const BATCH = 50;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET nao configurado" }, { status: 503 });
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  let d1Sent = 0;
  let d7Sent = 0;
  let d21Sent = 0;
  const errors: string[] = [];

  // Busca Orders aprovadas que podem precisar de emails pos-compra
  const orders = await prisma.order.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  for (const order of orders) {
    const age = now - order.createdAt.getTime();

    // Busca ou cria Lead "buyer" pra esse email
    let lead = await prisma.lead.findUnique({ where: { email: order.email } });
    if (!lead) {
      try {
        lead = await prisma.lead.create({
          data: {
            email: order.email,
            name: order.name,
            source: `buyer-${order.plan}`,
            sequenceStep: 9, // 9 = comprador, ainda nao recebeu D+1
          },
        });
      } catch {
        // Email duplicado (ja existe como lead de captura)
        lead = await prisma.lead.findUnique({ where: { email: order.email } });
        if (lead && lead.sequenceStep < 9) {
          // Promove pra buyer
          lead = await prisma.lead.update({
            where: { id: lead.id },
            data: { sequenceStep: 9, source: `buyer-${order.plan}` },
          });
        }
      }
    }

    if (!lead) continue;

    // D+1 (step 9 → 10)
    if (lead.sequenceStep === 9 && age >= D1_MS) {
      try {
        const tmpl = postPurchaseD1(order.name, order.plan);
        await sendEmail({ to: order.email, toName: order.name, subject: tmpl.subject, htmlContent: tmpl.html });
        await prisma.lead.update({ where: { id: lead.id }, data: { sequenceStep: 10, lastEmailAt: new Date() } });
        d1Sent += 1;
      } catch (e) {
        errors.push(`D+1 ${order.email}: ${(e as Error).message}`);
      }
      continue;
    }

    // D+7 (step 10 → 11)
    if (lead.sequenceStep === 10 && age >= D7_MS) {
      try {
        const tmpl = postPurchaseD7(order.name, order.plan);
        await sendEmail({ to: order.email, toName: order.name, subject: tmpl.subject, htmlContent: tmpl.html });
        await prisma.lead.update({ where: { id: lead.id }, data: { sequenceStep: 11, lastEmailAt: new Date() } });
        d7Sent += 1;
      } catch (e) {
        errors.push(`D+7 ${order.email}: ${(e as Error).message}`);
      }
      continue;
    }

    // D+21 (step 11 → 12)
    if (lead.sequenceStep === 11 && age >= D21_MS) {
      try {
        const tmpl = postPurchaseD21(order.name, order.plan);
        await sendEmail({ to: order.email, toName: order.name, subject: tmpl.subject, htmlContent: tmpl.html });
        await prisma.lead.update({ where: { id: lead.id }, data: { sequenceStep: 12, lastEmailAt: new Date() } });
        d21Sent += 1;
      } catch (e) {
        errors.push(`D+21 ${order.email}: ${(e as Error).message}`);
      }
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    runAt: new Date().toISOString(),
    d1Sent,
    d7Sent,
    d21Sent,
    ordersProcessed: orders.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
