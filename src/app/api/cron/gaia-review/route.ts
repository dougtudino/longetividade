import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCampaignsWithInsights } from "@/lib/meta-ads";
import { reviewAdSet, summarizeReview, DEFAULT_THRESHOLDS } from "@/lib/gaia-review";
import { sendEmail } from "@/lib/email";

// Cron diario: Gaia review + notificacao por email.
// Nao executa acoes automaticamente — apenas cria decisoes proposed
// e avisa Doug/Barbara por email pra revisarem no painel.
//
// Schedule sugerido: 0 11 * * * (8h BRT) — mesmo horario do Maya daily report
// Config: CRON_SECRET no Railway + cron externo (cron-job.org)

function fmtBRL(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function actionLabel(action: string): string {
  switch (action) {
    case "PAUSE_ADSET":
      return "Pausar ad set";
    case "DUPLICATE_ADSET":
      return "Duplicar ad set";
    case "INCREASE_BUDGET":
      return "Aumentar budget";
    case "DECREASE_BUDGET":
      return "Diminuir budget";
    default:
      return action;
  }
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET nao configurado" },
      { status: 503 }
    );
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 1. Busca insights
  const result = await fetchCampaignsWithInsights("last_7d");
  if (result.ok === false) {
    return NextResponse.json({ ok: false, error: result.error });
  }

  // 2. Roda review e cria decisoes proposed (se ainda nao existir hoje)
  const verdicts: Array<{
    adSetId: string;
    adSetName: string;
    verdict: string;
    reasoning: string;
    priority: string;
  }> = [];
  let decisionsCreated = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const camp of result.campaigns) {
    const verdict = reviewAdSet(
      {
        adSetId: camp.id,
        adSetName: camp.name,
        dailyBudgetCents: 3000,
        insights: camp.insights,
        daysActive: 7, // cron roda diariamente, assume janela de 7d
      },
      DEFAULT_THRESHOLDS
    );

    verdicts.push({
      adSetId: verdict.adSetId,
      adSetName: verdict.adSetName,
      verdict: verdict.verdict,
      reasoning: verdict.reasoning.join(" · "),
      priority: verdict.priority,
    });

    if (verdict.proposedAction) {
      const existing = await prisma.agentDecision.findFirst({
        where: {
          agentId: "gaia",
          targetId: verdict.adSetId,
          status: "proposed",
          createdAt: { gte: today },
        },
      });
      if (!existing) {
        await prisma.agentDecision.create({
          data: {
            agentId: "gaia",
            action: verdict.proposedAction.type,
            targetType: "campaign",
            targetId: verdict.adSetId,
            targetName: verdict.adSetName,
            params: JSON.parse(JSON.stringify(verdict.proposedAction)),
            reasoning: verdict.reasoning.join(" · "),
            priority: verdict.priority,
            status: "proposed",
          },
        });
        decisionsCreated += 1;
      }
    }
  }

  // 3. Se tem decisoes novas, envia email pros admins
  if (decisionsCreated > 0) {
    const admins = await prisma.adminUser.findMany({ select: { email: true, name: true } });

    const decisionsToNotify = verdicts.filter((v) => v.verdict !== "KEEP" && v.verdict !== "INSUFFICIENT_DATA");

    const rows = decisionsToNotify
      .map(
        (v) => `
      <tr>
        <td style="padding:8px 10px;font-size:13px;border-bottom:1px solid #F0EDE5;"><strong>${v.adSetName}</strong></td>
        <td style="padding:8px 10px;font-size:13px;border-bottom:1px solid #F0EDE5;color:${v.verdict === "KILL" ? "#C4787A" : "#6B9E6B"};"><strong>${v.verdict}</strong></td>
        <td style="padding:8px 10px;font-size:12px;border-bottom:1px solid #F0EDE5;color:#666;">${v.reasoning}</td>
      </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="pt-br">
<body style="font-family:'Nunito',Arial,sans-serif;background:#FAF8F5;margin:0;padding:24px;color:#2D2D2D;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #E5E5E5;">
    <div style="padding:24px;background:linear-gradient(135deg,#7A9E7E,#3D5A3E);color:#fff;">
      <div style="font-size:12px;letter-spacing:0.08em;opacity:0.85;text-transform:uppercase;">Gaia · Growth Operator</div>
      <h1 style="margin:6px 0 0 0;font-size:22px;font-weight:700;">🌱 Review diario — ${decisionsCreated} decisoes aguardando aprovacao</h1>
    </div>
    <div style="padding:24px;">
      <p style="font-size:14px;line-height:1.6;margin:0 0 18px 0;">
        Analisei as campanhas dos ultimos 7 dias e encontrei <strong>${decisionsCreated} ad sets</strong> que pedem acao.
        Todas estao com status <em>proposed</em> aguardando sua aprovacao.
      </p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#F0EDE5;">
            <th style="padding:10px;text-align:left;font-size:11px;color:#3D5A3E;text-transform:uppercase;letter-spacing:0.05em;">Ad Set</th>
            <th style="padding:10px;text-align:left;font-size:11px;color:#3D5A3E;text-transform:uppercase;letter-spacing:0.05em;">Verdict</th>
            <th style="padding:10px;text-align:left;font-size:11px;color:#3D5A3E;text-transform:uppercase;letter-spacing:0.05em;">Razao</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:24px;text-align:center;">
        <a href="https://www.longetividade.com.br/admin/agents/gaia" style="display:inline-block;padding:14px 28px;background:#3D5A3E;color:#fff;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;">Ir pro painel da Gaia</a>
      </div>
    </div>
  </div>
</body>
</html>`;

    for (const admin of admins) {
      try {
        await sendEmail({
          to: admin.email,
          toName: admin.name ?? "admin",
          subject: `🌱 Gaia · ${decisionsCreated} decisoes aguardando aprovacao`,
          htmlContent: html,
        });
      } catch (e) {
        console.error("Failed to email admin:", admin.email, e);
      }
    }
  }

  const summary = summarizeReview(
    verdicts.map((v, i) => ({
      adSetId: v.adSetId,
      adSetName: v.adSetName,
      verdict: v.verdict as
        | "KILL"
        | "KEEP"
        | "SCALE_HORIZONTAL"
        | "SCALE_VERTICAL"
        | "INSUFFICIENT_DATA",
      priority: v.priority as "low" | "normal" | "high" | "critical",
      reasoning: [v.reasoning],
      metrics: {
        spend: result.campaigns[i]?.insights.spend ?? 0,
        impressions: result.campaigns[i]?.insights.impressions ?? 0,
        clicks: result.campaigns[i]?.insights.clicks ?? 0,
        ctr: result.campaigns[i]?.insights.ctr ?? 0,
        cpc: result.campaigns[i]?.insights.cpc ?? 0,
        cpa: 0,
        purchases: result.campaigns[i]?.insights.purchases ?? 0,
        purchaseValue: result.campaigns[i]?.insights.purchaseValue ?? 0,
        roas: result.campaigns[i]?.insights.roas ?? 0,
      },
      proposedAction: null,
    }))
  );

  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    verdicts,
    decisionsCreated,
    summary,
  });
}
