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
    case "DECREASE_BUDGET": {
      const newBudgetCents = params.newBudgetCents as number | undefined;
      if (typeof newBudgetCents !== "number") {
        return { ok: false, error: "params.newBudgetCents ausente ou invalido" };
      }
      return executeUpdateBudget(targetId, newBudgetCents);
    }

    default:
      return { ok: false, error: `Acao nao implementada: ${action}` };
  }
}
