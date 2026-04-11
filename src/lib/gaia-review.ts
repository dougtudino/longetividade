// Gaia *review — analise automatica de performance de ad sets
// Aplica a filosofia start small, test aggressive, scale what works.
//
// Recebe: insights agregados por ad set (ja existe em meta-ads.ts)
// Retorna: verdict por ad set com acao proposta + razao em PT-BR
//
// Regras sao codificadas em objetos para facilitar tuning posterior
// via knowledge base (Doug pode ajustar limiares sem mexer em codigo).

import type { AggregatedInsights } from "./meta-ads";

export type Verdict = "KILL" | "KEEP" | "SCALE_HORIZONTAL" | "SCALE_VERTICAL" | "INSUFFICIENT_DATA";

export type ReviewInput = {
  adSetId: string;
  adSetName: string;
  dailyBudgetCents: number;
  insights: AggregatedInsights;
  daysActive: number; // quantos dias o ad set esta rodando
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
  };
  proposedAction: ProposedAction | null;
};

export type ProposedAction =
  | { type: "PAUSE_ADSET" }
  | { type: "DUPLICATE_ADSET"; budgetMultiplier?: number }
  | { type: "INCREASE_BUDGET"; newBudgetCents: number; delta: number }
  | { type: "DECREASE_BUDGET"; newBudgetCents: number; delta: number };

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

  // ─── 2. KILL CRITERIA ───────────────────────────────────────────
  // 2a. Spend alto sem conversao
  const killSpendThreshold = thresholds.killSpendMultiplier * ticket;
  if (insights.spend > killSpendThreshold && insights.purchases === 0) {
    verdict = "KILL";
    priority = "high";
    reasoning.push(
      `Gastou ${fmtBRLNum(insights.spend)} (> ${thresholds.killSpendMultiplier}x o ticket de ${fmtBRLNum(ticket)}) sem 1 venda. Matando.`
    );
    proposedAction = { type: "PAUSE_ADSET" };
  }

  // 2b. CTR muito baixo apos volume suficiente
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
  };
}

// Resumo agregado da campanha inteira
export function summarizeReview(verdicts: ReviewVerdict[]): {
  total: number;
  kill: number;
  keep: number;
  scale: number;
  insufficient: number;
  totalSpend: number;
  totalRevenue: number;
  blendedRoas: number;
  blendedCpa: number;
} {
  let kill = 0;
  let keep = 0;
  let scale = 0;
  let insufficient = 0;
  let totalSpend = 0;
  let totalRevenue = 0;
  let totalPurchases = 0;

  for (const v of verdicts) {
    if (v.verdict === "KILL") kill += 1;
    else if (v.verdict === "KEEP") keep += 1;
    else if (v.verdict === "SCALE_HORIZONTAL" || v.verdict === "SCALE_VERTICAL") scale += 1;
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
    totalSpend,
    totalRevenue,
    blendedRoas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
    blendedCpa: totalPurchases > 0 ? totalSpend / totalPurchases : 0,
  };
}
