import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchCampaignsWithInsights, type CampaignWithInsights } from "@/lib/meta-ads";
import {
  reviewAdSet,
  summarizeReview,
  DEFAULT_THRESHOLDS,
  type ReviewVerdict,
  type ProposedAction,
} from "@/lib/gaia-review";

// POST /api/admin/agents/gaia/review
// Body: { preset?: "yesterday" | "last_7d" | "last_30d", dryRun?: boolean }
//
// Executa a Gaia *review:
// 1. Busca insights de todas as campanhas Meta do ultimo periodo
// 2. Para cada ad set, roda reviewAdSet() aplicando as regras Gaia
// 3. Para cada verdict que nao seja KEEP/INSUFFICIENT, cria uma
//    AgentDecision com status=proposed (aguardando aprovacao humana)
// 4. Retorna resumo + lista de verdicts + decisoes criadas
//
// Idempotente: se rodar 2x no mesmo dia, nao cria decisoes duplicadas
// (checa decisoes proposed existentes pro mesmo ad set).

type ReviewRequestBody = {
  preset?: "yesterday" | "last_7d" | "last_30d";
  dryRun?: boolean;
};

function actionToString(action: ProposedAction): string {
  switch (action.type) {
    case "PAUSE_ADSET":
      return "PAUSE_ADSET";
    case "DUPLICATE_ADSET":
      return "DUPLICATE_ADSET";
    case "INCREASE_BUDGET":
      return "INCREASE_BUDGET";
    case "DECREASE_BUDGET":
      return "DECREASE_BUDGET";
  }
}

function priorityFromVerdict(verdict: ReviewVerdict): string {
  return verdict.priority;
}

export async function POST(req: Request) {
  let body: ReviewRequestBody = {};
  try {
    body = await req.json();
  } catch {
    /* empty body ok */
  }

  const preset = body.preset ?? "last_7d";
  const dryRun = body.dryRun === true;

  // Busca campanhas com insights
  const result = await fetchCampaignsWithInsights(preset);
  if (result.ok === false) {
    return NextResponse.json({
      ok: false,
      error: result.error,
    });
  }

  const campaigns = result.campaigns;
  const verdicts: ReviewVerdict[] = [];
  const decisionsCreated: string[] = [];

  // Pra cada campanha, pra cada ad set (atualmente o fetch retorna por
  // campanha — assumimos 1 campanha tem N ad sets, mas meta-ads retorna
  // CampaignWithInsights por campanha. Vamos tratar campaigns como ad-level
  // por enquanto — refinar depois se precisar granularidade de ad set)
  //
  // Na v1 do review, tratamos cada Campaign como uma unidade de decisao.
  // O blueprint LAUNCH-001 so tem 1 campanha com 3 ad sets, entao isso
  // esta simplificado. Para granularidade por ad set, usar fetchAdSetsWithInsights
  // (a implementar).

  for (const camp of campaigns) {
    // Usa o insights.spend como proxy de days active (aproximado)
    // Em producao, calcular via campaign.createdAt do DB local ou via /campaigns?fields=created_time
    const daysActive = Math.max(
      1,
      Math.ceil((camp.insights.impressions > 0 ? 1 : 0) + 3)
    );

    const verdict = reviewAdSet(
      {
        adSetId: camp.id,
        adSetName: camp.name,
        dailyBudgetCents: 3000, // R$ 30 — valor do blueprint, ajustar via knowledge base futuro
        insights: camp.insights,
        daysActive,
      },
      DEFAULT_THRESHOLDS
    );

    verdicts.push(verdict);

    // Cria AgentDecision pra verdicts que requerem acao
    if (verdict.proposedAction && !dryRun) {
      // Checa se ja existe uma decision proposed pra esse target hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await prisma.agentDecision.findFirst({
        where: {
          agentId: "gaia",
          targetId: verdict.adSetId,
          status: "proposed",
          createdAt: { gte: today },
        },
      });

      if (!existing) {
        const decision = await prisma.agentDecision.create({
          data: {
            agentId: "gaia",
            action: actionToString(verdict.proposedAction),
            targetType: "campaign", // granularidade atual
            targetId: verdict.adSetId,
            targetName: verdict.adSetName,
            params: JSON.parse(JSON.stringify(verdict.proposedAction)),
            reasoning: verdict.reasoning.join(" · "),
            priority: priorityFromVerdict(verdict),
            status: "proposed",
          },
        });
        decisionsCreated.push(decision.id);
      }
    }
  }

  const summary = summarizeReview(verdicts);

  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    preset,
    dryRun,
    summary,
    verdicts,
    decisionsCreated: decisionsCreated.length,
    decisionIds: decisionsCreated,
  });
}

// GET: snapshot sem criar decisoes (equivalente a dryRun)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const preset = (url.searchParams.get("preset") ?? "last_7d") as
    | "yesterday"
    | "last_7d"
    | "last_30d";

  const fakeReq = { json: async () => ({ preset, dryRun: true }) } as unknown as Request;
  return POST(fakeReq);
}
