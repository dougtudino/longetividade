import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildDailyReportData, renderDailyReportHTML } from "@/lib/maya-report";

// Endpoint dual-mode:
// - Auth admin (cookie) → manual trigger pelo painel
// - Header x-cron-secret == CRON_SECRET → cron externo (Railway scheduler,
//   cron-job.org, etc.) sem precisar de cookie
//
// O middleware ja protege /api/admin/* exigindo cookie. Esta rota e
// excecao: o middleware vai bloquear chamadas sem cookie. Por isso a
// pasta esta sob /api/admin mas precisamos de uma rota publica
// alternativa OU configurar o middleware para liberar via header.
//
// Solucao mais simples: este endpoint requer cookie (uso manual), e a
// versao automatizada via cron usa /api/cron/maya-daily-report (rota
// publica protegida por CRON_SECRET — criada separadamente).

function adminGreetingName(email: string, name: string | null): string {
  if (name && name.trim()) return name.split(" ")[0];
  return email.split("@")[0];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const previewOnly = searchParams.get("preview") === "1";
  const dryRun = searchParams.get("dry") === "1";

  const data = await buildDailyReportData();

  if (previewOnly) {
    const html = renderDailyReportHTML(data, "Doug");
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const admins = await prisma.adminUser.findMany({
    select: { email: true, name: true },
  });

  if (admins.length === 0) {
    return NextResponse.json({
      ok: false,
      error: "Nenhum AdminUser cadastrado para receber o relatorio.",
    });
  }

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const admin of admins) {
    const greetingName = adminGreetingName(admin.email, admin.name);
    const html = renderDailyReportHTML(data, greetingName);
    const subject = `${data.greeting}, ${greetingName}! Resumo Longetividade — ${data.date}`;

    if (dryRun) {
      results.push({ email: admin.email, ok: true });
      continue;
    }

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
    data: { vendasHoje: data.vendasHoje, receitaMes: data.receitaMes, pendenciasAbertas: data.pendenciasAbertas },
  });
}
