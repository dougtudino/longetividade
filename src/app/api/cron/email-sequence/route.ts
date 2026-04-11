import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { valueEmail, offerEmail } from "@/lib/email-sequence";

// Endpoint publico protegido por CRON_SECRET. Roda diariamente
// (sugerido 9h BRT = 12h UTC) e avanca a sequencia de boas-vindas:
// - Leads com sequenceStep=0 e idade >= 2 dias → envia D+2 (valor)
// - Leads com sequenceStep=1 e idade >= 5 dias → envia D+5 (oferta)
//
// Configuracao:
//   CRON_SECRET=<string> em Railway
//   Cron externo: 0 12 * * * curl https://www.longetividade.com.br/api/cron/email-sequence -H "x-cron-secret: $CRON_SECRET"

const D2_MS = 2 * 24 * 60 * 60 * 1000;
const D5_MS = 5 * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 100; // limite por execucao para evitar burst

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET nao configurado." },
      { status: 503 }
    );
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const cutD2 = new Date(now.getTime() - D2_MS);
  const cutD5 = new Date(now.getTime() - D5_MS);

  // D+2 — sequenceStep=0 e createdAt <= cutD2
  const d2Leads = await prisma.lead.findMany({
    where: { sequenceStep: 0, createdAt: { lte: cutD2 } },
    take: BATCH_SIZE,
  });

  let d2Sent = 0;
  const d2Failed: Array<{ email: string; error: string }> = [];
  for (const lead of d2Leads) {
    const tmpl = valueEmail(lead.name);
    try {
      await sendEmail({
        to: lead.email,
        toName: lead.name ?? "amiga",
        subject: tmpl.subject,
        htmlContent: tmpl.html,
      });
      await prisma.lead.update({
        where: { id: lead.id },
        data: { sequenceStep: 1, lastEmailAt: new Date() },
      });
      d2Sent += 1;
    } catch (e) {
      d2Failed.push({ email: lead.email, error: (e as Error).message });
    }
  }

  // D+5 — sequenceStep=1 e createdAt <= cutD5
  const d5Leads = await prisma.lead.findMany({
    where: { sequenceStep: 1, createdAt: { lte: cutD5 } },
    take: BATCH_SIZE,
  });

  let d5Sent = 0;
  const d5Failed: Array<{ email: string; error: string }> = [];
  for (const lead of d5Leads) {
    const tmpl = offerEmail(lead.name);
    try {
      await sendEmail({
        to: lead.email,
        toName: lead.name ?? "amiga",
        subject: tmpl.subject,
        htmlContent: tmpl.html,
      });
      await prisma.lead.update({
        where: { id: lead.id },
        data: { sequenceStep: 2, lastEmailAt: new Date() },
      });
      d5Sent += 1;
    } catch (e) {
      d5Failed.push({ email: lead.email, error: (e as Error).message });
    }
  }

  return NextResponse.json({
    ok: true,
    runAt: now.toISOString(),
    d2: { found: d2Leads.length, sent: d2Sent, failed: d2Failed },
    d5: { found: d5Leads.length, sent: d5Sent, failed: d5Failed },
  });
}
