import { getSetting } from "./settings";

const GRAPH_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

const cache = new Map<string, { value: unknown; at: number }>();
const TTL_MS = 60_000;

function getCached<T>(key: string): T | null {
  const c = cache.get(key);
  if (!c) return null;
  if (Date.now() - c.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return c.value as T;
}

function setCached(key: string, value: unknown): void {
  cache.set(key, { value, at: Date.now() });
}

export function clearMetaAdsCache(): void {
  cache.clear();
}

async function getCreds(): Promise<{ token: string; accountId: string } | null> {
  const token = await getSetting("META_ADS_ACCESS_TOKEN");
  const rawId = await getSetting("META_ADS_ACCOUNT_ID");
  if (!token || !rawId) return null;
  return { token, accountId: rawId.replace(/^act_/, "") };
}

type GraphAction = { action_type: string; value: string };

type RawInsights = {
  impressions?: string;
  clicks?: string;
  spend?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  reach?: string;
  frequency?: string;
  // Rankings vem como string enum: "above_average" | "average" |
  // "below_average_offers" | "below_average_35" | "below_average_20" | "unknown"
  // Disponivel apenas em ad-level insights apos o ad ter ~500 impressions.
  quality_ranking?: string;
  engagement_rate_ranking?: string;
  conversion_rate_ranking?: string;
  actions?: GraphAction[];
  action_values?: GraphAction[];
  date_start?: string;
  date_stop?: string;
};

export type RankingValue = "above_average" | "average" | "below_average_offers" | "below_average_35" | "below_average_20" | "unknown" | null;

export type AggregatedInsights = {
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpm: number;
  reach: number;
  // frequency = impressions / reach. Indica saturacao da audiencia.
  // > 3.0 com volume >10k = audiencia cansou, FIX_AUDIENCE.
  frequency: number;
  // Rankings vem direto do Meta (ad-level). Aggregam com "pior nivel
  // observado" pra ser conservador. Null se nenhum ad teve ranking ainda.
  qualityRanking: RankingValue;
  engagementRanking: RankingValue;
  conversionRanking: RankingValue;
  purchases: number;
  purchaseValue: number;
  initiatedCheckouts: number;
  leads: number;
  roas: number;
  dateStart: string | null;
  dateStop: string | null;
};

// Pior ranking entre N valores. "below_average_*" > "average" > "above_average".
// "unknown" e null sao ignorados (nao temos dado).
const RANKING_SEVERITY: Record<string, number> = {
  above_average: 0,
  average: 1,
  below_average_35: 2,
  below_average_20: 3,
  below_average_offers: 4,
};
function worstRanking(a: RankingValue, b: string | undefined): RankingValue {
  if (!b || b === "unknown") return a;
  const sevB = RANKING_SEVERITY[b] ?? -1;
  if (sevB < 0) return a;
  if (a === null || a === "unknown") return b as RankingValue;
  const sevA = RANKING_SEVERITY[a] ?? -1;
  return sevB > sevA ? (b as RankingValue) : a;
}

function sumActionValue(arr: GraphAction[] | undefined, types: string[]): number {
  if (!arr) return 0;
  let sum = 0;
  for (const a of arr) {
    if (types.includes(a.action_type)) {
      sum += parseFloat(a.value) || 0;
    }
  }
  return sum;
}

const PURCHASE_TYPES = [
  "purchase",
  "offsite_conversion.fb_pixel_purchase",
  "omni_purchase",
  "web_in_store_purchase",
];
const CHECKOUT_TYPES = [
  "initiate_checkout",
  "offsite_conversion.fb_pixel_initiate_checkout",
  "omni_initiated_checkout",
];
const LEAD_TYPES = [
  "lead",
  "offsite_conversion.fb_pixel_lead",
  "onsite_conversion.lead_grouped",
];

function aggregate(rows: RawInsights[]): AggregatedInsights {
  const totals: AggregatedInsights = {
    impressions: 0,
    clicks: 0,
    spend: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
    reach: 0,
    frequency: 0,
    qualityRanking: null,
    engagementRanking: null,
    conversionRanking: null,
    purchases: 0,
    purchaseValue: 0,
    initiatedCheckouts: 0,
    leads: 0,
    roas: 0,
    dateStart: null,
    dateStop: null,
  };

  for (const r of rows) {
    totals.impressions += parseInt(r.impressions ?? "0", 10) || 0;
    totals.clicks += parseInt(r.clicks ?? "0", 10) || 0;
    totals.spend += parseFloat(r.spend ?? "0") || 0;
    totals.reach += parseInt(r.reach ?? "0", 10) || 0;
    totals.purchases += sumActionValue(r.actions, PURCHASE_TYPES);
    totals.purchaseValue += sumActionValue(r.action_values, PURCHASE_TYPES);
    totals.initiatedCheckouts += sumActionValue(r.actions, CHECKOUT_TYPES);
    totals.leads += sumActionValue(r.actions, LEAD_TYPES);
    totals.qualityRanking = worstRanking(totals.qualityRanking, r.quality_ranking);
    totals.engagementRanking = worstRanking(totals.engagementRanking, r.engagement_rate_ranking);
    totals.conversionRanking = worstRanking(totals.conversionRanking, r.conversion_rate_ranking);
    if (!totals.dateStart && r.date_start) totals.dateStart = r.date_start;
    if (r.date_stop) totals.dateStop = r.date_stop;
  }

  totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  totals.cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
  totals.roas = totals.spend > 0 ? totals.purchaseValue / totals.spend : 0;
  totals.frequency = totals.reach > 0 ? totals.impressions / totals.reach : 0;
  return totals;
}

export type InsightsPreset = "today" | "yesterday" | "last_7d" | "last_30d" | "lifetime";

const PRESET_MAP: Record<InsightsPreset, string> = {
  today: "today",
  yesterday: "yesterday",
  last_7d: "last_7d",
  last_30d: "last_30d",
  lifetime: "maximum",
};

// Rankings sao ad-level (nao agregam em campaign-level), mas se pedir
// ate campaign-level a Meta ignora silenciosamente — graceful degradation.
// frequency vem de qualquer level, valida se reach > 0.
const INSIGHT_FIELDS =
  "impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,quality_ranking,engagement_rate_ranking,conversion_rate_ranking,actions,action_values,date_start,date_stop";

export type MetaAdsError = {
  ok: false;
  error: string;
  code?: number;
};

export type AccountInsightsResult =
  | ({ ok: true } & AggregatedInsights)
  | MetaAdsError;

async function graphGet<T>(path: string, token: string): Promise<T | MetaAdsError> {
  try {
    const url = `${BASE}/${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as { error?: { message: string; code: number } } & T;
    if (!res.ok || data.error) {
      return {
        ok: false,
        error: data.error?.message ?? `HTTP ${res.status}`,
        code: data.error?.code,
      };
    }
    return data;
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function fetchAccountInsights(
  preset: InsightsPreset
): Promise<AccountInsightsResult> {
  const cacheKey = `account:${preset}`;
  const cached = getCached<AccountInsightsResult>(cacheKey);
  if (cached) return cached;

  const creds = await getCreds();
  if (!creds) {
    return { ok: false, error: "Credenciais Meta nao configuradas em /admin/configuracoes" };
  }

  const path = `act_${creds.accountId}/insights?fields=${INSIGHT_FIELDS}&date_preset=${PRESET_MAP[preset]}`;
  const data = await graphGet<{ data: RawInsights[] }>(path, creds.token);
  if ("ok" in data && data.ok === false) {
    return data;
  }
  const rows = (data as { data: RawInsights[] }).data ?? [];
  const result: AccountInsightsResult = { ok: true, ...aggregate(rows) };
  setCached(cacheKey, result);
  return result;
}

export type CampaignWithInsights = {
  id: string;
  name: string;
  status: string;
  objective: string;
  insights: AggregatedInsights;
};

export async function fetchCampaignsWithInsights(
  preset: InsightsPreset
): Promise<{ ok: true; campaigns: CampaignWithInsights[] } | MetaAdsError> {
  const cacheKey = `campaigns:${preset}`;
  const cached = getCached<{ ok: true; campaigns: CampaignWithInsights[] } | MetaAdsError>(cacheKey);
  if (cached) return cached;

  const creds = await getCreds();
  if (!creds) {
    return { ok: false, error: "Credenciais Meta nao configuradas" };
  }

  const path = `act_${creds.accountId}/campaigns?fields=id,name,status,objective,insights.date_preset(${PRESET_MAP[preset]}){${INSIGHT_FIELDS}}&limit=100`;
  type CampaignRow = {
    id: string;
    name: string;
    status: string;
    objective: string;
    insights?: { data: RawInsights[] };
  };
  const data = await graphGet<{ data: CampaignRow[] }>(path, creds.token);
  if ("ok" in data && data.ok === false) {
    return data;
  }

  const campaigns: CampaignWithInsights[] = ((data as { data: CampaignRow[] }).data ?? []).map(
    (c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective,
      insights: aggregate(c.insights?.data ?? []),
    })
  );

  const result = { ok: true as const, campaigns };
  setCached(cacheKey, result);
  return result;
}

// ─────────────────────────────────────────────────────────────────────
// Insights por Creative (image_hash)
//
// Meta nao agrega insights diretamente por image_hash. O padrao e:
//   1. buscar ads ativos do account com adcreatives{image_hash}
//   2. filtrar quais ads usam o hash em questao
//   3. somar insights desses ads
// Simplificacao: buscamos todos ads + creatives + insights de uma vez, e
// agregamos no cliente.
// ─────────────────────────────────────────────────────────────────────

export type CreativeInsights = {
  imageHash: string;
  adsCount: number;
  insights: AggregatedInsights;
};

export async function fetchInsightsByImageHashes(
  imageHashes: string[],
  preset: InsightsPreset
): Promise<{ ok: true; byHash: Record<string, CreativeInsights> } | MetaAdsError> {
  if (imageHashes.length === 0) return { ok: true, byHash: {} };

  const cacheKey = `by-hash:${preset}:${imageHashes.sort().join(",")}`;
  const cached = getCached<{ ok: true; byHash: Record<string, CreativeInsights> } | MetaAdsError>(cacheKey);
  if (cached) return cached;

  const creds = await getCreds();
  if (!creds) return { ok: false, error: "Credenciais Meta nao configuradas" };

  // Pega ads + creative info + insights de uma vez
  const path =
    `act_${creds.accountId}/ads?fields=id,name,status,` +
    `creative{id,image_hash,thumbnail_url},` +
    `insights.date_preset(${PRESET_MAP[preset]}){${INSIGHT_FIELDS}}&limit=200`;

  type AdRow = {
    id: string;
    name: string;
    status: string;
    creative?: { id: string; image_hash?: string; thumbnail_url?: string };
    insights?: { data: RawInsights[] };
  };
  const data = await graphGet<{ data: AdRow[] }>(path, creds.token);
  if ("ok" in data && data.ok === false) return data;

  const ads = (data as { data: AdRow[] }).data ?? [];
  const hashSet = new Set(imageHashes);
  const byHash: Record<string, { rows: RawInsights[]; count: number }> = {};
  for (const h of imageHashes) byHash[h] = { rows: [], count: 0 };

  for (const ad of ads) {
    const h = ad.creative?.image_hash;
    if (!h || !hashSet.has(h)) continue;
    byHash[h].count += 1;
    byHash[h].rows.push(...(ad.insights?.data ?? []));
  }

  const result: { ok: true; byHash: Record<string, CreativeInsights> } = {
    ok: true,
    byHash: Object.fromEntries(
      Object.entries(byHash).map(([h, v]) => [
        h,
        { imageHash: h, adsCount: v.count, insights: aggregate(v.rows) },
      ])
    ),
  };
  setCached(cacheKey, result);
  return result;
}
