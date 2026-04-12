import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { abandonedEmail30min, abandonedEmail24h } from "@/lib/email-abandoned";

// GET /api/cron/abandoned-cart
// Cron protegido por CRON_SECRET. Roda a cada 30 min (ou 1h).
// Busca AbandonedCheckout e envia emails de recuperacao:
//   - 30min apos abandono: lembrete gentil
//   - 24h apos abandono: urgencia + objecoes
//
// Controle: usa campo `step` do AbandonedCheckout pra rastrear:
//   "checkout" = abandono inicial (padrao)
//   "email_30min" = email 1 enviado
//   "email_24h" = email 2 enviado
//   "recovered" = comprou depois (detectado por Order com mesmo email)
//   "done" = sequencia finalizada
//
// Schedule sugerido: */30 * * * * (a cada 30min) ou 0 * * * * (a cada hora)

const MIN_30 = 30 * 60 * 1000;
const HOURS_24 = 24 * 60 * 60 * 1000;
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
  let sent30min = 0;
  let sent24h = 0;
  let recovered = 0;
  const errors: string[] = [];

  // 1. Email 30min — abandonos com step="checkout" e idade >= 30min
  const cutoff30 = new Date(now - MIN_30);
  const abandoned30 = await prisma.abandonedCheckout.findMany({
    where: { step: "checkout", createdAt: { lte: cutoff30 } },
    take: BATCH,
  });

  for (const ab of abandoned30) {
    // Checa se ja comprou (Order aprovada com mesmo email)
    const bought = await prisma.order.findFirst({
      where: { email: ab.email, status: "approved" },
    });
    if (bought) {
      await prisma.abandonedCheckout.update({
        where: { id: ab.id },
        data: { step: "recovered" },
      });
      recovered += 1;
      continue;
    }

    try {
      const tmpl = abandonedEmail30min(ab.email);
      await sendEmail({
        to: ab.email,
        toName: ab.email.split("@")[0],
        subject: tmpl.subject,
        htmlContent: tmpl.html,
      });
      await prisma.abandonedCheckout.update({
        where: { id: ab.id },
        data: { step: "email_30min" },
      });
      sent30min += 1;
    } catch (e) {
      errors.push(`30min ${ab.email}: ${(e as Error).message}`);
    }
  }

  // 2. Email 24h — abandonos com step="email_30min" e idade >= 24h
  const cutoff24 = new Date(now - HOURS_24);
  const abandoned24 = await prisma.abandonedCheckout.findMany({
    where: { step: "email_30min", createdAt: { lte: cutoff24 } },
    take: BATCH,
  });

  for (const ab of abandoned24) {
    const bought = await prisma.order.findFirst({
      where: { email: ab.email, status: "approved" },
    });
    if (bought) {
      await prisma.abandonedCheckout.update({
        where: { id: ab.id },
        data: { step: "recovered" },
      });
      recovered += 1;
      continue;
    }

    try {
      const tmpl = abandonedEmail24h(ab.email);
      await sendEmail({
        to: ab.email,
        toName: ab.email.split("@")[0],
        subject: tmpl.subject,
        htmlContent: tmpl.html,
      });
      await prisma.abandonedCheckout.update({
        where: { id: ab.id },
        data: { step: "email_24h" },
      });
      sent24h += 1;
    } catch (e) {
      errors.push(`24h ${ab.email}: ${(e as Error).message}`);
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    runAt: new Date().toISOString(),
    sent30min,
    sent24h,
    recovered,
    errors: errors.length > 0 ? errors : undefined,
  });
}
