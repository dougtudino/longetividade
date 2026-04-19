// Gaia *review — analise automatica de performance de ad sets
// Aplica a filosofia start small, test aggressive, scale what works.
//
// Recebe: insights agregados por ad set (ja existe em meta-ads.ts)
// Retorna: verdict por ad set com acao proposta + razao em PT-BR
//
// Regras sao codificadas em objetos para facilitar tuning posterior
// via knowledge base (Doug pode ajustar limiares sem mexer em codigo).

import type { AggregatedInsights } from "./meta-ads";

export type Verdict =
  | "KILL"
  | "KEEP"
  | "SCALE_HORIZONTAL"
  | "SCALE_VERTICAL"
  | "INSUFFICIENT_DATA"
  // ─── Growth Operator (Sprint 1) ────────────────────────────
  | "FIX_AUDIENCE"        // audiencia saturou, trocar interesses
  | "FIX_COPY"            // texto nao ressoa
  | "FIX_CREATIVE"        // imagem cansou ou quality below
  | "FIX_BUDGET"          // budget mal calibrado
  | "DIAGNOSE_FUNNEL"     // anuncio OK mas nao converte (problema fora do Meta)
  | "PROPOSE_ITERATION";  // linha toda nao funciona, propor v2

export type ReviewInput = {
  adSetId: string;
  adSetName: string;
  dailyBudgetCents: number;
  insights: AggregatedInsights;
  daysActive: number; // quantos dias o ad set esta rodando
  // Contexto historico opcional pra regra PROPOSE_ITERATION
  campaignKillCount?: number; // quantos ad sets dessa campanha ja foram killed
  campaignTotalAdSets?: number;
  // Targeting atual pra propor mudanca (FIX_AUDIENCE)
  currentTargeting?: Record<string, unknown>;
  // Funnel stats pra DIAGNOSE_FUNNEL — vem do backend Longetividade
  funnelStats?: {
    pageViews: number;
    leads: number;
    initiateCheckouts: number;
    purchases: number;
  };
};

export type ReviewVerdict = {
  adSetId: string;
  adSetName: string;
  verdict: Verdict;
  priority: "low" | "normal" | "high" | "critical";
  reasoning: string[];
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    cpa: number;
    purchases: number;
    purchaseValue: number;
    roas: number;
    frequency?: number;
    qualityRanking?: string | null;
  };
  proposedAction: ProposedAction | null;
};

// Bottleneck do funil — onde vaza mais clientes.
export type FunnelBottleneck = "top_of_funnel" | "landing" | "offer" | "checkout" | "unknown";

export type ProposedAction =
  | { type: "PAUSE_ADSET" }
  | { type: "DUPLICATE_ADSET"; budgetMultiplier?: number }
  | { type: "INCREASE_BUDGET"; newBudgetCents: number; delta: number }
  | { type: "DECREASE_BUDGET"; newBudgetCents: number; delta: number }
  // ─── Growth Operator ───────────────────────────────────────
  | {
      type: "FIX_AUDIENCE";
      reason: string;
      currentTargeting?: Record<string, unknown>;
      proposedTargeting: Record<string, unknown>;
      expectedImpact: string;
    }
  | {
      type: "FIX_COPY";
      reason: string;
      currentCopy?: string;
      proposedCopyDirection: string; // briefing, nao copy final (Uma faz)
    }
  | {
      type: "FIX_CREATIVE";
      reason: string;
      currentCreativeId?: string;
      proposedCreativeBriefing: string; // briefing pra Uma gerar novo
    }
  | {
      type: "FIX_BUDGET";
      reason: string;
      currentBudgetCents: number;
      proposedBudgetCents: number;
      delta: number;
    }
  | {
      type: "DIAGNOSE_FUNNEL";
      reason: string;
      funnelBreakdown: {
        impressions: number;
        clicks: number;
        pageViews: number;
        leads: number;
        initiateCheckouts: number;
        purchases: number;
      };
      bottleneck: FunnelBottleneck;
      recommendationText: string;
      noExecution: true;
    }
  | {
      type: "PROPOSE_ITERATION";
      reason: string;
      learnings: string[];
      suggestedNextStep: {
        personaShift?: string;
        angleShift?: string;
        offerShift?: string;
        notes?: string;
      };
      noExecution: true;
    };

// Helper: tipos que NAO executam ao serem aprovados (so registram).
export function isNoExecutionAction(action: ProposedAction | null): boolean {
  if (!action) return false;
  return action.type === "DIAGNOSE_FUNNEL" || action.type === "PROPOSE_ITERATION";
}

// Parametros da Gaia — podem vir da knowledge base no futuro
export type GaiaThresholds = {
  ticketMedioCents: number;          // ticket medio esperado (default: R$37 = 3700 cents)
  killSpendMultiplier: number;        // spend > killSpendMultiplier × ticket → kill se zero purchases
  killCtrMin: number;                 // ctr% minimo pra nao matar (padrao 0.8)
  killCtrAfterImpressions: number;    // so aplica CTR kill apos N impressions (evita kill prematuro)
  killCpaMultiplier: number;          // cpa > killCpaMultiplier × ticket apos minDaysActive → kill
  killMinDaysForCpa: number;          // dias minimos antes de aplicar criterio CPA
  keepRoasMin: number;                // roas >= keepRoasMin → keep
  scaleHorizontalRoasMin: number;     // roas >= scaleHorizontalRoasMin → duplicar
  scaleVerticalRoasMin: number;       // roas >= scaleVerticalRoasMin → +20% budget
  scaleBudgetDeltaPct: number;        // quanto subir budget (padrao 0.2 = 20%)
  minSpendForVerdict: number;         // spend minimo (cents) pra tomar decisao
};

export const DEFAULT_THRESHOLDS: GaiaThresholds = {
  ticketMedioCents: 3700, // R$ 37 (plano basico)
  killSpendMultiplier: 3,
  killCtrMin: 0.8,
  killCtrAfterImpressions: 5000,
  killCpaMultiplier: 1.5,
  killMinDaysForCpa: 3,
  keepRoasMin: 1.0,
  scaleHorizontalRoasMin: 2.0,
  scaleVerticalRoasMin: 1.5,
  scaleBudgetDeltaPct: 0.2,
  minSpendForVerdict: 1500, // R$ 15 minimo pra decidir qualquer coisa
};

// Thresholds Growth Operator (Sprint 1)
export const GROWTH_THRESHOLDS = {
  // FIX_CREATIVE — quality ranking ruim mas CTR ainda OK = troca a arte
  fixCreativeCtrMin: 0.8,        // CTR precisa estar OK pra nao ser KILL
  // FIX_AUDIENCE — frequency alta + volume = audiencia saturou
  fixAudienceFrequencyMin: 3.0,
  fixAudienceImpressionsMin: 10000,
  // DIAGNOSE_FUNNEL — anuncio bom mas nao converte = problema fora
  diagnoseFunnelCtrMin: 1.0,
  diagnoseFunnelSpendMultiplier: 3, // gasto > 3x ticket sem conv
  // PROPOSE_ITERATION — campanha toda matou = repensar
  proposeIterationKillRatioMin: 0.7, // 70%+ dos ad sets killed
};

function fmtBRL(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2)}`;
}

function fmtBRLNum(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

export function reviewAdSet(
  input: ReviewInput,
  thresholds: GaiaThresholds = DEFAULT_THRESHOLDS
): ReviewVerdict {
  const { adSetId, adSetName, dailyBudgetCents, insights, daysActive } = input;

  const ticket = thresholds.ticketMedioCents / 100;
  const spendCents = Math.round(insights.spend * 100);
  const cpa = insights.purchases > 0 ? insights.spend / insights.purchases : 0;

  const reasoning: string[] = [];
  let verdict: Verdict = "KEEP";
  let priority: ReviewVerdict["priority"] = "normal";
  let proposedAction: ProposedAction | null = null;

  // ─── 1. INSUFFICIENT_DATA ───────────────────────────────────────
  if (spendCents < thresholds.minSpendForVerdict) {
    return {
      adSetId,
      adSetName,
      verdict: "INSUFFICIENT_DATA",
      priority: "low",
      reasoning: [
        `Spend de ${fmtBRL(spendCents)} abaixo do minimo (${fmtBRL(thresholds.minSpendForVerdict)}) para decidir. Aguardar mais dados.`,
      ],
      metrics: buildMetrics(insights, cpa),
      proposedAction: null,
    };
  }

  // ─── 2. PROPOSE_ITERATION (campanha toda morreu) ───────────────
  // Avaliada PRIMEIRO porque vence todas as outras: se a linha inteira
  // ja foi quase toda killed, nao adianta correcao cirurgica neste ad set.
  if (
    !proposedAction &&
    input.campaignKillCount &&
    input.campaignTotalAdSets &&
    input.campaignTotalAdSets >= 3 &&
    input.campaignKillCount / input.campaignTotalAdSets >= GROWTH_THRESHOLDS.proposeIterationKillRatioMin
  ) {
    verdict = "PROPOSE_ITERATION";
    priority = "critical";
    const learnings: string[] = [
      `${input.campaignKillCount}/${input.campaignTotalAdSets} ad sets dessa campanha foram killed`,
      `Blended ROAS provavelmente abaixo de 1.0`,
      `Persona/angulo/oferta atual nao ressoa com o algoritmo Meta nem com o publico`,
    ];
    reasoning.push(
      `Campanha exauriu hipoteses (${Math.round((input.campaignKillCount / input.campaignTotalAdSets) * 100)}% killed). Repensar persona/angulo/oferta vs continuar otimizando ad sets.`
    );
    proposedAction = {
      type: "PROPOSE_ITERATION",
      reason: `${input.campaignKillCount}/${input.campaignTotalAdSets} kills`,
      learnings,
      suggestedNextStep: {
        notes: "Council humano revisa learnings e decide proxima iteracao (LAUNCH-NNN+1).",
      },
      noExecution: true,
    };
  }

  // ─── 3. DIAGNOSE_FUNNEL (anuncio OK mas nao converte) ──────────
  // CTR bom + volume + 0 conv + spend > 3x ticket = problema NAO eh o ad.
  // Provavel: landing lenta, oferta fraca, checkout quebrado, top-of-funnel.
  if (
    !proposedAction &&
    insights.ctr >= GROWTH_THRESHOLDS.diagnoseFunnelCtrMin &&
    insights.purchases === 0 &&
    insights.spend > GROWTH_THRESHOLDS.diagnoseFunnelSpendMultiplier * ticket
  ) {
    verdict = "DIAGNOSE_FUNNEL";
    priority = "critical";

    // Identifica bottleneck via funnel stats (se vieram) OU via Meta actions.
    const funnel = input.funnelStats ?? {
      pageViews: insights.clicks, // fallback: clicks ~ pageviews
      leads: insights.leads,
      initiateCheckouts: insights.initiatedCheckouts,
      purchases: insights.purchases,
    };
    let bottleneck: FunnelBottleneck = "unknown";
    let recommendation = "";
    if (funnel.pageViews === 0 && insights.clicks > 0) {
      bottleneck = "landing";
      recommendation = "Landing nao carrega ou pixel quebrado. Checar Core Web Vitals + Pixel test events.";
    } else if (funnel.leads === 0 && funnel.initiateCheckouts === 0 && funnel.pageViews > 50) {
      bottleneck = "landing";
      recommendation = "Trafego chega mas ninguem age. Headline da landing nao bate com o ad? CTA invisivel? Mobile quebrado?";
    } else if (funnel.initiateCheckouts === 0 && funnel.pageViews > 100) {
      bottleneck = "offer";
      recommendation = "PageViews altos mas 0 InitiateCheckout. Oferta nao convence — preco, garantia, prova social ou bonus fracos.";
    } else if (funnel.initiateCheckouts > 0 && funnel.purchases === 0) {
      bottleneck = "checkout";
      recommendation = "Pessoas comecam checkout mas abandonam. Provavel friction no Hotmart (parcelamento, taxa, etapa extra).";
    } else {
      bottleneck = "top_of_funnel";
      recommendation = "Trafego clica mas nao se qualifica. Audiencia ampla demais ou anuncio engana sobre o produto.";
    }

    reasoning.push(
      `CTR ${insights.ctr.toFixed(2)}% saudavel mas 0 vendas com ${fmtBRLNum(insights.spend)} gasto. Anuncio funciona, problema esta no funil (bottleneck=${bottleneck}).`
    );
    proposedAction = {
      type: "DIAGNOSE_FUNNEL",
      reason: `CTR ${insights.ctr.toFixed(2)}% bom, 0 conv, spend ${fmtBRLNum(insights.spend)}`,
      funnelBreakdown: {
        impressions: insights.impressions,
        clicks: insights.clicks,
        pageViews: funnel.pageViews,
        leads: funnel.leads,
        initiateCheckouts: funnel.initiateCheckouts,
        purchases: funnel.purchases,
      },
      bottleneck,
      recommendationText: recommendation,
      noExecution: true,
    };
  }

  // ─── 4. FIX_AUDIENCE (audiencia saturou) ───────────────────────
  // Frequency alta + volume = mesma gente vendo o ad N vezes. Antes de
  // KILL, trocar interesses pra abrir alcance (Meta best practice 2024+:
  // broad + Advantage+ supera interest stacking).
  if (
    !proposedAction &&
    insights.frequency >= GROWTH_THRESHOLDS.fixAudienceFrequencyMin &&
    insights.impressions >= GROWTH_THRESHOLDS.fixAudienceImpressionsMin
  ) {
    verdict = "FIX_AUDIENCE";
    priority = "high";
    reasoning.push(
      `Frequency ${insights.frequency.toFixed(2)} apos ${insights.impressions.toLocaleString("pt-BR")} impressoes — audiencia saturou. Trocar interesses ou ativar Advantage+ Audience antes de matar.`
    );
    proposedAction = {
      type: "FIX_AUDIENCE",
      reason: `frequency=${insights.frequency.toFixed(2)} (limite ${GROWTH_THRESHOLDS.fixAudienceFrequencyMin})`,
      currentTargeting: input.currentTargeting,
      proposedTargeting: {
        // Best practice Meta 2024+: ampliar pra broad + Advantage+
        targeting_automation: { advantage_audience: 1 },
        // Mantem geo/idade/genero, remove flexible_spec de interesse
        flexible_spec: undefined,
      },
      expectedImpact: "Reduz frequency, abre alcance pra novos perfis sem reset do learning phase.",
    };
  }

  // ─── 5. FIX_CREATIVE (quality ranking ruim, CTR ainda OK) ──────
  // Rankings vem direto da Meta. "below_average_*" = problema na arte
  // ou texto, mas se CTR esta OK significa que ainda funciona — vale
  // trocar criativo antes de matar. Se ranking==null = nao temos sinal,
  // skip regra.
  if (
    !proposedAction &&
    insights.qualityRanking &&
    insights.qualityRanking.startsWith("below_average") &&
    insights.ctr >= GROWTH_THRESHOLDS.fixCreativeCtrMin
  ) {
    verdict = "FIX_CREATIVE";
    priority = "high";
    reasoning.push(
      `Quality ranking ${insights.qualityRanking} (Meta classifica abaixo da media), mas CTR ${insights.ctr.toFixed(2)}% ainda OK. Trocar criativo pode recuperar — anuncio nao morreu, so nao destaca.`
    );
    proposedAction = {
      type: "FIX_CREATIVE",
      reason: `quality_ranking=${insights.qualityRanking}, ctr=${insights.ctr.toFixed(2)}%`,
      proposedCreativeBriefing: `Reformular criativo de "${adSetName}". Briefing pra Uma: manter angulo atual (que esta atraindo cliques), melhorar quality (imagem mais limpa, texto mais editorial, paleta marca Longetividade verde-oliva/off-white). Evitar: estoque generico, texto truncado, fundos poluidos.`,
    };
  }

  // ─── 6. KILL CRITERIA (originais) ──────────────────────────────
  // 6a. Spend alto sem conversao
  const killSpendThreshold = thresholds.killSpendMultiplier * ticket;
  if (!proposedAction && insights.spend > killSpendThreshold && insights.purchases === 0) {
    verdict = "KILL";
    priority = "high";
    reasoning.push(
      `Gastou ${fmtBRLNum(insights.spend)} (> ${thresholds.killSpendMultiplier}x o ticket de ${fmtBRLNum(ticket)}) sem 1 venda. Matando.`
    );
    proposedAction = { type: "PAUSE_ADSET" };
  }

  // 6b. CTR muito baixo apos volume suficiente
  if (
    !proposedAction &&
    insights.impressions >= thresholds.killCtrAfterImpressions &&
    insights.ctr < thresholds.killCtrMin
  ) {
    verdict = "KILL";
    priority = "high";
    reasoning.push(
      `CTR ${insights.ctr.toFixed(2)}% esta abaixo do minimo (${thresholds.killCtrMin}%) apos ${insights.impressions.toLocaleString("pt-BR")} impressoes. Criativo/audiencia nao engaja.`
    );
    proposedAction = { type: "PAUSE_ADSET" };
  }

  // 2c. CPA muito alto apos periodo minimo
  if (
    !proposedAction &&
    daysActive >= thresholds.killMinDaysForCpa &&
    insights.purchases > 0 &&
    cpa > thresholds.killCpaMultiplier * ticket
  ) {
    verdict = "KILL";
    priority = "high";
    reasoning.push(
      `CPA ${fmtBRLNum(cpa)} esta ${(cpa / ticket).toFixed(1)}x o ticket (${fmtBRLNum(ticket)}) apos ${daysActive} dias. Economicamente inviavel.`
    );
    proposedAction = { type: "PAUSE_ADSET" };
  }

  // ─── 3. SCALE CRITERIA ──────────────────────────────────────────
  if (!proposedAction && insights.roas >= thresholds.scaleHorizontalRoasMin) {
    verdict = "SCALE_HORIZONTAL";
    priority = "high";
    reasoning.push(
      `ROAS excelente ${insights.roas.toFixed(2)}x (≥ ${thresholds.scaleHorizontalRoasMin}x). Duplicar ad set para nao arriscar reset de aprendizado do original.`
    );
    proposedAction = { type: "DUPLICATE_ADSET" };
  }

  if (
    !proposedAction &&
    insights.roas >= thresholds.scaleVerticalRoasMin &&
    insights.roas < thresholds.scaleHorizontalRoasMin
  ) {
    verdict = "SCALE_VERTICAL";
    priority = "normal";
    const newBudgetCents = Math.round(dailyBudgetCents * (1 + thresholds.scaleBudgetDeltaPct));
    const delta = newBudgetCents - dailyBudgetCents;
    reasoning.push(
      `ROAS saudavel ${insights.roas.toFixed(2)}x. Subir budget ${(thresholds.scaleBudgetDeltaPct * 100).toFixed(0)}% (de ${fmtBRL(dailyBudgetCents)} para ${fmtBRL(newBudgetCents)}) sem resetar aprendizado.`
    );
    proposedAction = { type: "INCREASE_BUDGET", newBudgetCents, delta };
  }

  // ─── 4. KEEP (default) ──────────────────────────────────────────
  if (!proposedAction) {
    verdict = "KEEP";
    priority = "low";
    if (insights.purchases > 0) {
      reasoning.push(
        `ROAS ${insights.roas.toFixed(2)}x · CPA ${fmtBRLNum(cpa)} · ${insights.purchases.toFixed(0)} vendas em ${daysActive}d. Dentro do esperado, deixar rodar.`
      );
    } else {
      reasoning.push(
        `Spend ${fmtBRLNum(insights.spend)} · CTR ${insights.ctr.toFixed(2)}% · sem vendas ainda mas dentro dos limites. Aguardar.`
      );
    }
  }

  return {
    adSetId,
    adSetName,
    verdict,
    priority,
    reasoning,
    metrics: buildMetrics(insights, cpa),
    proposedAction,
  };
}

function buildMetrics(
  insights: AggregatedInsights,
  cpa: number
): ReviewVerdict["metrics"] {
  return {
    spend: insights.spend,
    impressions: insights.impressions,
    clicks: insights.clicks,
    ctr: insights.ctr,
    cpc: insights.cpc,
    cpa,
    purchases: insights.purchases,
    purchaseValue: insights.purchaseValue,
    roas: insights.roas,
    frequency: insights.frequency,
    qualityRanking: insights.qualityRanking,
  };
}

// Resumo agregado da campanha inteira
export function summarizeReview(verdicts: ReviewVerdict[]): {
  total: number;
  kill: number;
  keep: number;
  scale: number;
  insufficient: number;
  // Growth Operator
  fix: number;       // FIX_AUDIENCE + FIX_COPY + FIX_CREATIVE + FIX_BUDGET
  diagnose: number;  // DIAGNOSE_FUNNEL
  iterate: number;   // PROPOSE_ITERATION
  totalSpend: number;
  totalRevenue: number;
  blendedRoas: number;
  blendedCpa: number;
} {
  let kill = 0;
  let keep = 0;
  let scale = 0;
  let insufficient = 0;
  let fix = 0;
  let diagnose = 0;
  let iterate = 0;
  let totalSpend = 0;
  let totalRevenue = 0;
  let totalPurchases = 0;

  for (const v of verdicts) {
    if (v.verdict === "KILL") kill += 1;
    else if (v.verdict === "KEEP") keep += 1;
    else if (v.verdict === "SCALE_HORIZONTAL" || v.verdict === "SCALE_VERTICAL") scale += 1;
    else if (v.verdict === "FIX_AUDIENCE" || v.verdict === "FIX_COPY" || v.verdict === "FIX_CREATIVE" || v.verdict === "FIX_BUDGET") fix += 1;
    else if (v.verdict === "DIAGNOSE_FUNNEL") diagnose += 1;
    else if (v.verdict === "PROPOSE_ITERATION") iterate += 1;
    else insufficient += 1;
    totalSpend += v.metrics.spend;
    totalRevenue += v.metrics.purchaseValue;
    totalPurchases += v.metrics.purchases;
  }

  return {
    total: verdicts.length,
    kill,
    keep,
    scale,
    insufficient,
    fix,
    diagnose,
    iterate,
    totalSpend,
    totalRevenue,
    blendedRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
    blendedCpa: totalPurchases > 0 ? totalSpend / totalPurchases : 0,
  };
}
