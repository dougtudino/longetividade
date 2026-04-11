// Marketing API launcher — Gaia (@growth) usa pra criar campanhas direto
// na Meta sem clique manual. Tudo vai como PAUSED para revisao humana
// antes de ativar. Permissoes necessarias no token: ads_management.
//
// Filosofia: idempotente por nome — se ja existe campanha com o mesmo
// nome, retorna o ID existente em vez de criar duplicata.

import { getSetting, getSettingWithFallback } from "./settings";

const GRAPH_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export type LauncherCreds = {
  token: string;
  accountId: string; // sem prefixo act_
  pixelId: string;
  pageId?: string; // opcional — sem ele nao cria ads
};

export type Targeting = {
  age_min: number;
  age_max: number;
  genders: number[]; // 1=male, 2=female
  geo_locations: { countries: string[] };
  flexible_spec?: Array<{ interests?: Array<{ id: string; name: string }> }>;
  excluded_custom_audiences?: Array<{ id: string }>;
};

export type AdSetSpec = {
  name: string;
  daily_budget_cents: number;
  targeting: Targeting;
  status?: "ACTIVE" | "PAUSED";
};

export type CreativeSpec = {
  name: string;
  imageHash: string;
  message: string; // copy principal
  headline: string;
  description: string;
  link: string;
  cta?: "LEARN_MORE" | "SHOP_NOW" | "SIGN_UP";
};

export type LauncherError = {
  ok: false;
  step: string;
  error: string;
  raw?: unknown;
};

export type LauncherSuccess<T> = { ok: true } & T;

// ─────────────────────────────────────────────────────────────────────
// Credentials helper
// ─────────────────────────────────────────────────────────────────────

export async function getLauncherCreds(): Promise<LauncherCreds | null> {
  // Token canonico: META_ACCESS_TOKEN (compartilhado por Marketing API,
  // CAPI e Pixel). Fallback para META_ADS_ACCESS_TOKEN (valor legado
  // salvo antes de 2026-04-11).
  const token = await getSettingWithFallback("META_ACCESS_TOKEN", "META_ADS_ACCESS_TOKEN");
  const rawAccount = await getSetting("META_ADS_ACCOUNT_ID");
  const pixelId = await getSetting("NEXT_PUBLIC_META_PIXEL_ID");
  const pageId = await getSetting("META_PAGE_ID");
  if (!token || !rawAccount || !pixelId) return null;
  return {
    token,
    accountId: rawAccount.replace(/^act_/, ""),
    pixelId,
    pageId: pageId || undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────────────────────────────

async function postGraph<T>(
  path: string,
  token: string,
  body: Record<string, unknown>
): Promise<T | { error: { message: string; code?: number; type?: string } }> {
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
  return (await res.json()) as T | { error: { message: string; code?: number; type?: string } };
}

async function getGraph<T>(
  path: string,
  token: string,
  query: Record<string, string> = {}
): Promise<T | { error: { message: string; code?: number } }> {
  const params = new URLSearchParams({ access_token: token, ...query });
  const res = await fetch(`${BASE}/${path}?${params}`, { cache: "no-store" });
  return (await res.json()) as T | { error: { message: string; code?: number } };
}

function isError(
  data: unknown
): data is { error: { message: string; code?: number; type?: string } } {
  return typeof data === "object" && data !== null && "error" in data;
}

// ─────────────────────────────────────────────────────────────────────
// Idempotent helpers (lookup by name)
// ─────────────────────────────────────────────────────────────────────

type ListResponse = { data: Array<{ id: string; name: string }> };

function findInList(
  data: ListResponse | { error: { message: string } },
  name: string
): string | null {
  if ("error" in data) return null;
  return data.data.find((item) => item.name === name)?.id ?? null;
}

export async function findCampaignByName(
  creds: LauncherCreds,
  name: string
): Promise<string | null> {
  const data = await getGraph<ListResponse>(
    `act_${creds.accountId}/campaigns`,
    creds.token,
    { fields: "id,name", limit: "200" }
  );
  return findInList(data, name);
}

export async function findAdSetByName(
  creds: LauncherCreds,
  campaignId: string,
  name: string
): Promise<string | null> {
  const data = await getGraph<ListResponse>(`${campaignId}/adsets`, creds.token, {
    fields: "id,name",
    limit: "200",
  });
  return findInList(data, name);
}

export async function findCustomAudienceByName(
  creds: LauncherCreds,
  name: string
): Promise<string | null> {
  const data = await getGraph<ListResponse>(
    `act_${creds.accountId}/customaudiences`,
    creds.token,
    { fields: "id,name", limit: "200" }
  );
  return findInList(data, name);
}

// ─────────────────────────────────────────────────────────────────────
// Image upload
// ─────────────────────────────────────────────────────────────────────

// Recebe base64 (sem prefixo data:image/...) e faz upload via POST
// /act_{ID}/adimages. Retorna o hash que sera usado em adcreatives.
export async function uploadAdImage(
  creds: LauncherCreds,
  base64: string,
  filename: string
): Promise<{ ok: true; hash: string } | LauncherError> {
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");

  const data = await postGraph<{
    images?: Record<string, { hash: string; url: string }>;
  }>(`act_${creds.accountId}/adimages`, creds.token, {
    [`bytes_${filename}`]: cleanBase64,
  });

  if (isError(data) || !("images" in data) || !data.images) {
    const errMsg = isError(data) ? data.error.message : "Sem imagens retornadas";
    return { ok: false, step: "uploadAdImage", error: errMsg, raw: data };
  }

  const firstImage = Object.values(data.images)[0];
  if (!firstImage?.hash) {
    return { ok: false, step: "uploadAdImage", error: "Hash ausente na resposta" };
  }
  return { ok: true, hash: firstImage.hash };
}

// ─────────────────────────────────────────────────────────────────────
// Custom Audience
// ─────────────────────────────────────────────────────────────────────

export async function createWebsiteCustomAudience(
  creds: LauncherCreds,
  name: string,
  retentionDays: number,
  description: string
): Promise<{ ok: true; id: string; existed: boolean } | LauncherError> {
  const existing = await findCustomAudienceByName(creds, name);
  if (existing) return { ok: true, id: existing, existed: true };

  // Subtype WEBSITE com pixel — captura todos os visitantes do dominio
  const rule = {
    inclusions: {
      operator: "or",
      rules: [
        {
          event_sources: [{ id: creds.pixelId, type: "pixel" }],
          retention_seconds: retentionDays * 24 * 60 * 60,
        },
      ],
    },
  };

  const data = await postGraph<{ id: string }>(
    `act_${creds.accountId}/customaudiences`,
    creds.token,
    {
      name,
      subtype: "WEBSITE",
      description,
      rule,
      pixel_id: creds.pixelId,
    }
  );

  if (isError(data) || !("id" in data)) {
    return {
      ok: false,
      step: "createWebsiteCustomAudience",
      error: isError(data) ? data.error.message : "Sem ID retornado",
      raw: data,
    };
  }
  return { ok: true, id: data.id, existed: false };
}

// ─────────────────────────────────────────────────────────────────────
// Campaign
// ─────────────────────────────────────────────────────────────────────

export async function createCampaign(
  creds: LauncherCreds,
  name: string,
  objective: "OUTCOME_SALES" | "OUTCOME_TRAFFIC" | "OUTCOME_LEADS",
  status: "PAUSED" | "ACTIVE" = "PAUSED"
): Promise<{ ok: true; id: string; existed: boolean } | LauncherError> {
  const existing = await findCampaignByName(creds, name);
  if (existing) return { ok: true, id: existing, existed: true };

  const data = await postGraph<{ id: string }>(
    `act_${creds.accountId}/campaigns`,
    creds.token,
    {
      name,
      objective,
      status,
      special_ad_categories: [],
      buying_type: "AUCTION",
    }
  );

  if (isError(data) || !("id" in data)) {
    return {
      ok: false,
      step: "createCampaign",
      error: isError(data) ? data.error.message : "Sem ID retornado",
      raw: data,
    };
  }
  return { ok: true, id: data.id, existed: false };
}

// ─────────────────────────────────────────────────────────────────────
// Ad Set
// ─────────────────────────────────────────────────────────────────────

export async function createAdSet(
  creds: LauncherCreds,
  campaignId: string,
  spec: AdSetSpec
): Promise<{ ok: true; id: string; existed: boolean } | LauncherError> {
  const existing = await findAdSetByName(creds, campaignId, spec.name);
  if (existing) return { ok: true, id: existing, existed: true };

  // Inicia em 1 hora pra dar tempo de revisar
  const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const data = await postGraph<{ id: string }>(
    `act_${creds.accountId}/adsets`,
    creds.token,
    {
      name: spec.name,
      campaign_id: campaignId,
      daily_budget: spec.daily_budget_cents,
      billing_event: "IMPRESSIONS",
      optimization_goal: "OFFSITE_CONVERSIONS",
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      promoted_object: {
        pixel_id: creds.pixelId,
        custom_event_type: "PURCHASE",
      },
      targeting: spec.targeting,
      status: spec.status ?? "PAUSED",
      start_time: startTime,
    }
  );

  if (isError(data) || !("id" in data)) {
    return {
      ok: false,
      step: `createAdSet(${spec.name})`,
      error: isError(data) ? data.error.message : "Sem ID retornado",
      raw: data,
    };
  }
  return { ok: true, id: data.id, existed: false };
}

// ─────────────────────────────────────────────────────────────────────
// Ad Creative + Ad
// ─────────────────────────────────────────────────────────────────────

export async function createAdCreative(
  creds: LauncherCreds,
  spec: CreativeSpec
): Promise<{ ok: true; id: string } | LauncherError> {
  if (!creds.pageId) {
    return {
      ok: false,
      step: "createAdCreative",
      error: "META_PAGE_ID nao configurado em /admin/configuracoes — necessario para criar ads.",
    };
  }

  const data = await postGraph<{ id: string }>(
    `act_${creds.accountId}/adcreatives`,
    creds.token,
    {
      name: spec.name,
      object_story_spec: {
        page_id: creds.pageId,
        link_data: {
          image_hash: spec.imageHash,
          link: spec.link,
          message: spec.message,
          name: spec.headline,
          description: spec.description,
          call_to_action: {
            type: spec.cta ?? "LEARN_MORE",
            value: { link: spec.link },
          },
        },
      },
    }
  );

  if (isError(data) || !("id" in data)) {
    return {
      ok: false,
      step: "createAdCreative",
      error: isError(data) ? data.error.message : "Sem ID retornado",
      raw: data,
    };
  }
  return { ok: true, id: data.id };
}

export async function createAd(
  creds: LauncherCreds,
  adSetId: string,
  name: string,
  creativeId: string,
  status: "PAUSED" | "ACTIVE" = "PAUSED"
): Promise<{ ok: true; id: string } | LauncherError> {
  const data = await postGraph<{ id: string }>(
    `act_${creds.accountId}/ads`,
    creds.token,
    {
      name,
      adset_id: adSetId,
      creative: { creative_id: creativeId },
      status,
    }
  );

  if (isError(data) || !("id" in data)) {
    return {
      ok: false,
      step: `createAd(${name})`,
      error: isError(data) ? data.error.message : "Sem ID retornado",
      raw: data,
    };
  }
  return { ok: true, id: data.id };
}
