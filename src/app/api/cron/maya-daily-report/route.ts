import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildDailyReportData, renderDailyReportHTML } from "@/lib/maya-report";

// Endpoint publico protegido por CRON_SECRET para ser chamado por
// cron externo (Railway scheduler, cron-job.org, EasyCron, etc.) sem
// dependencia de cookie de admin.
//
// Configurar:
//   CRON_SECRET=<string-aleatoria-longa> em Railway
//   cron diario as 8h BRT = 11h UTC: 0 11 * * *
//   curl https://www.longetividade.com.br/api/cron/maya-daily-report \
//     -H "x-cron-secret: $CRON_SECRET"

function adminGreetingName(email: string, name: string | null): string {
  if (name && name.trim()) return name.split(" ")[0];
  return email.split("@")[0];
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET nao configurado no Railway." },
      { status: 503 }
    );
  }

  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = await buildDailyReportData();
  const admins = await prisma.adminUser.findMany({
    select: { email: true, name: true },
  });

  if (admins.length === 0) {
    return NextResponse.json({
      ok: false,
      error: "Nenhum AdminUser cadastrado.",
    });
  }

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const admin of admins) {
    const greetingName = adminGreetingName(admin.email, admin.name);
    const html = renderDailyReportHTML(data, greetingName);
    const subject = `${data.greeting}, ${greetingName}! Resumo Longetividade — ${data.date}`;

    try {
      await sendEmail({
        to: admin.email,
        toName: admin.name ?? greetingName,
        subject,
        htmlContent: html,
      });
      results.push({ email: admin.email, ok: true });
    } catch (e) {
      results.push({ email: admin.email, ok: false, error: (e as Error).message });
    }
  }

  return NextResponse.json({
    ok: results.every((r) => r.ok),
    sentAt: new Date().toISOString(),
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
  });
}
