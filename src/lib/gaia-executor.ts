// Executa decisoes aprovadas da Gaia via Marketing API.
// Cada acao tem um handler que chama o endpoint certo e retorna
// ok/erro. O decisions endpoint persiste o resultado.

import { getLauncherCreds } from "./meta-launcher";

const GRAPH_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

type ExecutionResult = {
  ok: boolean;
  result?: Record<string, unknown>;
  error?: string;
};

async function postGraph(
  path: string,
  token: string,
  body: Record<string, unknown>
): Promise<ExecutionResult> {
  const params = new URLSearchParams();
  params.set("access_token", token);
  for (const [k, v] of Object.entries(body)) {
    if (typeof v === "object" && v !== null) {
      params.set(k, JSON.stringify(v));
    } else if (v !== undefined && v !== null) {
      params.set(k, String(v));
    }
  }
  const res = await fetch(`${BASE}/${path}`, {
    method: "POST",
    body: params,
    cache: "no-store",
  });
  const data = (await res.json()) as Record<string, unknown> & {
    error?: { message: string; error_user_msg?: string };
  };
  if (data.error) {
    return { ok: false, error: data.error.error_user_msg ?? data.error.message };
  }
  return { ok: true, result: data };
}

export async function executePauseAdSet(adSetId: string): Promise<ExecutionResult> {
  const creds = await getLauncherCreds();
  if (!creds) return { ok: false, error: "Credenciais Meta ausentes" };
  return postGraph(adSetId, creds.token, { status: "PAUSED" });
}

export async function executeActivateAdSet(adSetId: string): Promise<ExecutionResult> {
  const creds = await getLauncherCreds();
  if (!creds) return { ok: false, error: "Credenciais Meta ausentes" };
  return postGraph(adSetId, creds.token, { status: "ACTIVE" });
}

export async function executePauseCampaign(campaignId: string): Promise<ExecutionResult> {
  const creds = await getLauncherCreds();
  if (!creds) return { ok: false, error: "Credenciais Meta ausentes" };
  return postGraph(campaignId, creds.token, { status: "PAUSED" });
}

export async function executeDuplicateAdSet(
  adSetId: string,
  options: { newName?: string; newBudgetCents?: number } = {}
): Promise<ExecutionResult> {
  const creds = await getLauncherCreds();
  if (!creds) return { ok: false, error: "Credenciais Meta ausentes" };
  const body: Record<string, unknown> = {
    deep_copy: true,
    status_option: "PAUSED",
  };
  if (options.newName) body.rename_options = { rename_suffix: ` (Gaia scale ${Date.now()})` };
  if (options.newBudgetCents) body.daily_budget = options.newBudgetCents;
  return postGraph(`${adSetId}/copies`, creds.token, body);
}

export async function executeUpdateBudget(
  adSetId: string,
  newBudgetCents: number
): Promise<ExecutionResult> {
  const creds = await getLauncherCreds();
  if (!creds) return { ok: false, error: "Credenciais Meta ausentes" };
  return postGraph(adSetId, creds.token, { daily_budget: newBudgetCents });
}

// ─── Growth Operator handlers (Sprint 1) ─────────────────────

// Atualiza targeting de um ad set (FIX_AUDIENCE).
// Aceita o objeto `targeting` no formato Meta — caller monta com
// flexible_spec, geo_locations, age_min/max, advantage_audience etc.
// Importante: PATCH em ad_set sem PAUSE primeiro pode resetar learning
// phase. Aviso: Meta best practice eh trocar audiencia em ad set NOVO,
// nao no existente — esse handler eh pra ajustes pequenos (ligar
// Advantage+, expandir geo).
export async function executeUpdateTargeting(
  adSetId: string,
  targeting: Record<string, unknown>
): Promise<ExecutionResult> {
  const creds = await getLauncherCreds();
  if (!creds) return { ok: false, error: "Credenciais Meta ausentes" };
  return postGraph(adSetId, creds.token, { targeting });
}

// Atualiza creative de um ad (FIX_COPY ou FIX_CREATIVE).
// Workflow Meta: criar novo AdCreative → atualizar Ad.creative apontando
// pro novo creative_id. Nao deleta o antigo (audit trail).
//
// Por hora aceitamos creativeSpec (objeto) que o caller monta. Em fases
// futuras, integrar com Uma pra gerar imagem/copy automaticamente.
export async function executeUpdateAdCreative(
  adId: string,
  newCreativeSpec: Record<string, unknown>
): Promise<ExecutionResult> {
  const creds = await getLauncherCreds();
  if (!creds) return { ok: false, error: "Credenciais Meta ausentes" };

  // 1. Cria novo AdCreative
  // Path: act_<accountId>/adcreatives — mas precisa do accountId, nao do adId.
  // Por enquanto, exigimos que o caller forneca account context completo via
  // params do decision. Aqui retornamos guidance ao inves de executar errado.
  return {
    ok: false,
    error:
      "FIX_COPY/FIX_CREATIVE requer fluxo Uma+Meta integrado (criar AdCreative novo + apontar Ad). " +
      "Por hora, decisao executa como noop — admin deve trocar manual no Ads Manager ou via /admin/criativos. " +
      `adId=${adId}, spec=${JSON.stringify(newCreativeSpec).slice(0, 80)}`,
  };
}

export type DecisionPayload = {
  action: string;
  targetId: string;
  params: Record<string, unknown>;
};

export async function executeDecision(decision: DecisionPayload): Promise<ExecutionResult> {
  const { action, targetId, params } = decision;

  switch (action) {
    case "PAUSE_ADSET":
      return executePauseAdSet(targetId);

    case "ACTIVATE_ADSET":
      return executeActivateAdSet(targetId);

    case "PAUSE_CAMPAIGN":
      return executePauseCampaign(targetId);

    case "DUPLICATE_ADSET": {
      const newBudgetCents =
        typeof params.newBudgetCents === "number" ? params.newBudgetCents : undefined;
      return executeDuplicateAdSet(targetId, { newBudgetCents });
    }

    case "INCREASE_BUDGET":
    case "DECREASE_BUDGET":
    case "FIX_BUDGET": {
      // FIX_BUDGET usa o mesmo handler — campo `proposedBudgetCents` ou
      // `newBudgetCents` (compat com regras antigas).
      const newBudgetCents =
        (params.newBudgetCents as number | undefined) ??
        (params.proposedBudgetCents as number | undefined);
      if (typeof newBudgetCents !== "number") {
        return { ok: false, error: "params.newBudgetCents/proposedBudgetCents ausente ou invalido" };
      }
      return executeUpdateBudget(targetId, newBudgetCents);
    }

    case "FIX_AUDIENCE": {
      const proposed = params.proposedTargeting as Record<string, unknown> | undefined;
      if (!proposed || typeof proposed !== "object") {
        return { ok: false, error: "params.proposedTargeting ausente ou invalido" };
      }
      return executeUpdateTargeting(targetId, proposed);
    }

    case "FIX_COPY":
    case "FIX_CREATIVE": {
      // Por enquanto noop com guidance — pipeline Uma+Meta nao integrada
      // automaticamente nesta sprint. Decisao fica como executed=true com
      // mensagem direcionando admin pra ajuste manual.
      const briefing =
        (params.proposedCreativeBriefing as string | undefined) ??
        (params.proposedCopyDirection as string | undefined) ??
        "(sem briefing)";
      return {
        ok: true,
        result: {
          status: "guidance_only",
          message:
            "FIX_COPY/FIX_CREATIVE registrada. Crie novo creative em /admin/criativos (Uma) e ative no Ads Manager.",
          briefing: briefing.slice(0, 300),
        },
      };
    }

    case "DIAGNOSE_FUNNEL":
    case "PROPOSE_ITERATION": {
      // noExecution=true — decisao eh report, nao acao. Marca executed
      // com snapshot dos params pra audit.
      return {
        ok: true,
        result: {
          status: "report_only",
          type: action,
          recorded_at: new Date().toISOString(),
        },
      };
    }

    default:
      return { ok: false, error: `Acao nao implementada: ${action}` };
  }
}
