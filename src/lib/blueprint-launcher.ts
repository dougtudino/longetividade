// Blueprint launcher — le LaunchBlueprint do banco e orquestra criacao
// no Meta (audiences + lookalike + campanha + ad sets).
//
// Contraste com lib/blueprints/launch-001.ts (DEPRECATED): aqui a fonte
// de verdade eh o banco, editavel via /admin/campanhas/launch-blueprint.

import { prisma } from "./prisma";
import {
  createCampaign,
  createAdSet,
  createEventCustomAudience,
  createLookalikeAudience,
  type LauncherCreds,
  type Targeting,
} from "./meta-launcher";

type LaunchAudience = Awaited<
  ReturnType<typeof prisma.launchAudience.findMany>
>[number];
type LaunchAdSet = Awaited<ReturnType<typeof prisma.launchAdSet.findMany>>[number];

type LaunchResult =
  | { ok: true; id: string; existed: boolean }
  | { ok: false; step: string; error: string; raw?: unknown };

export type LaunchStepLog = {
  step: string;
  status: "ok" | "skip" | "error";
  detail?: string;
  id?: string;
};

export type LaunchSummary = {
  success: boolean;
  launchedAt: string;
  metaCampaignId: string | null;
  audiencesCreated: number;
  lookalikeStatus: "operational" | "processing" | "skipped" | "failed";
  adSetsCreated: number;
  warnings: string[];
  log: LaunchStepLog[];
};

// Converte BRL em centavos (Meta Graph API usa menor unidade monetaria)
function brlToCents(brl: number): number {
  return Math.round(brl * 100);
}

// Mapeia genero schema → Meta API (Meta: 1=male, 2=female)
function gendersToMeta(genders: string[]): number[] {
  const out: number[] = [];
  for (const g of genders) {
    if (g === "female") out.push(2);
    else if (g === "male") out.push(1);
  }
  return out.length > 0 ? out : [1, 2]; // default all
}

type RunOptions = {
  dryRun?: boolean;
};

export async function runBlueprintLaunch(
  launchId: string,
  creds: LauncherCreds,
  opts: RunOptions = {}
): Promise<LaunchSummary> {
  const log: LaunchStepLog[] = [];
  const warnings: string[] = [];
  const dryRun = opts.dryRun ?? false;

  const blueprint = await prisma.launchBlueprint.findUnique({
    where: { launchId },
    include: {
      audiences: { orderBy: { orderIndex: "asc" } },
      adSets: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!blueprint) {
    return {
      success: false,
      launchedAt: new Date().toISOString(),
      metaCampaignId: null,
      audiencesCreated: 0,
      lookalikeStatus: "skipped",
      adSetsCreated: 0,
      warnings: [`Blueprint ${launchId} nao encontrado`],
      log,
    };
  }

  // ─── Validacoes ─────────────────────────────────────────────
  const audienceByKey = new Map(blueprint.audiences.map((a) => [a.audienceKey, a]));
  for (const aset of blueprint.adSets) {
    for (const ck of aset.customAudienceKeys) {
      if (!audienceByKey.has(ck)) warnings.push(`Ad set ${aset.adSetKey} referencia audience inexistente: ${ck}`);
    }
    for (const ek of aset.excludedAudienceKeys) {
      if (!audienceByKey.has(ek)) warnings.push(`Ad set ${aset.adSetKey} exclui audience inexistente: ${ek}`);
    }
  }
  const totalBudget = blueprint.adSets.reduce((s, a) => s + a.budgetDailyBrl, 0);
  if (totalBudget > blueprint.budgetTotalBrl) {
    warnings.push(
      `Soma de budgets (R$${totalBudget}) excede total da campanha (R$${blueprint.budgetTotalBrl})`
    );
  }

  // ─── 1. Audiences de evento (criar primeiro pra ter ID pro lookalike) ──
  const audienceIdMap = new Map<string, string>();
  const eventAudiences = blueprint.audiences.filter((a) => a.audienceType === "website_event");
  for (const aud of eventAudiences) {
    if (aud.metaAudienceId) {
      audienceIdMap.set(aud.audienceKey, aud.metaAudienceId);
      log.push({ step: `audience(${aud.audienceKey})`, status: "skip", detail: "ja criada", id: aud.metaAudienceId });
      continue;
    }
    if (dryRun) {
      log.push({ step: `audience(${aud.audienceKey})`, status: "skip", detail: "dry-run" });
      continue;
    }
    const res = await createEventCustomAudience(
      creds,
      aud.audienceKey,
      aud.eventName ?? "PageView",
      aud.retentionDays ?? 30,
      `${blueprint.launchId} — ${aud.audienceKey} (${aud.eventName}, ${aud.retentionDays}d)`
    );
    if (!res.ok) {
      await prisma.launchAudience.update({
        where: { id: aud.id },
        data: { status: "failed", statusMessage: res.error },
      });
      log.push({ step: `audience(${aud.audienceKey})`, status: "error", detail: res.error });
      continue;
    }
    await prisma.launchAudience.update({
      where: { id: aud.id },
      data: { metaAudienceId: res.id, status: "operational", statusMessage: null },
    });
    audienceIdMap.set(aud.audienceKey, res.id);
    log.push({ step: `audience(${aud.audienceKey})`, status: "ok", id: res.id });
  }

  // ─── 2. Lookalikes (precisam do source ID criado acima) ──
  let lookalikeStatus: LaunchSummary["lookalikeStatus"] = "skipped";
  const lookalikes = blueprint.audiences.filter((a) => a.audienceType === "lookalike");
  for (const lal of lookalikes) {
    if (lal.metaAudienceId) {
      audienceIdMap.set(lal.audienceKey, lal.metaAudienceId);
      log.push({ step: `lookalike(${lal.audienceKey})`, status: "skip", detail: "ja criada", id: lal.metaAudienceId });
      continue;
    }
    if (dryRun) {
      log.push({ step: `lookalike(${lal.audienceKey})`, status: "skip", detail: "dry-run" });
      continue;
    }
    const sourceKey = lal.lookalikeSourceKey;
    if (!sourceKey) {
      log.push({ step: `lookalike(${lal.audienceKey})`, status: "error", detail: "lookalikeSourceKey ausente" });
      continue;
    }
    const sourceId = audienceIdMap.get(sourceKey);
    if (!sourceId) {
      log.push({
        step: `lookalike(${lal.audienceKey})`,
        status: "error",
        detail: `source ${sourceKey} nao esta criada ou falhou`,
      });
      await prisma.launchAudience.update({
        where: { id: lal.id },
        data: { status: "failed", statusMessage: `source ${sourceKey} indisponivel` },
      });
      continue;
    }
    const res = await createLookalikeAudience(
      creds,
      lal.audienceKey,
      sourceId,
      lal.lookalikeCountry ?? "BR",
      lal.lookalikeRatio ?? 0.01,
      `${blueprint.launchId} — lookalike ${lal.lookalikeRatio ?? 0.01} ${lal.lookalikeCountry ?? "BR"}`
    );
    if (!res.ok) {
      await prisma.launchAudience.update({
        where: { id: lal.id },
        data: { status: "failed", statusMessage: res.error },
      });
      log.push({ step: `lookalike(${lal.audienceKey})`, status: "error", detail: res.error });
      lookalikeStatus = "failed";
      continue;
    }
    // Lookalike criado mas fica "processing" no Meta — nao bloqueia aqui.
    await prisma.launchAudience.update({
      where: { id: lal.id },
      data: { metaAudienceId: res.id, status: "processing", statusMessage: "Meta gerando similaridades" },
    });
    audienceIdMap.set(lal.audienceKey, res.id);
    log.push({ step: `lookalike(${lal.audienceKey})`, status: "ok", id: res.id, detail: "processing no Meta" });
    lookalikeStatus = "processing";
  }

  // ─── 3. Campanha ──
  let metaCampaignId: string | null = blueprint.metaCampaignId;
  if (dryRun) {
    log.push({
      step: `campaign(${blueprint.campaignName})`,
      status: "skip",
      detail: `dry-run — objective=${blueprint.campaignObjective}, budget=R$${blueprint.budgetTotalBrl}/dia`,
    });
  } else if (!metaCampaignId) {
    const campRes: LaunchResult = await createCampaign(
      creds,
      blueprint.campaignName,
      blueprint.campaignObjective as "OUTCOME_SALES" | "OUTCOME_TRAFFIC" | "OUTCOME_LEADS",
      "PAUSED"
    );
    if (!campRes.ok) {
      log.push({ step: `campaign`, status: "error", detail: campRes.error });
      return {
        success: false,
        launchedAt: new Date().toISOString(),
        metaCampaignId: null,
        audiencesCreated: audienceIdMap.size,
        lookalikeStatus,
        adSetsCreated: 0,
        warnings,
        log,
      };
    }
    metaCampaignId = campRes.id;
    await prisma.launchBlueprint.update({
      where: { id: blueprint.id },
      data: { metaCampaignId, status: "launched", launchedAt: new Date() },
    });
    log.push({ step: `campaign(${blueprint.campaignName})`, status: "ok", id: campRes.id });
  } else {
    log.push({ step: `campaign(${blueprint.campaignName})`, status: "skip", detail: "ja criada", id: metaCampaignId });
  }

  // ─── 4. Ad sets ──
  let adSetsCreated = 0;
  for (const aset of blueprint.adSets) {
    if (aset.metaAdSetId) {
      log.push({ step: `adset(${aset.adSetKey})`, status: "skip", detail: "ja criada", id: aset.metaAdSetId });
      continue;
    }

    const targeting = buildAdSetTargeting(aset, audienceIdMap);
    if (dryRun) {
      log.push({
        step: `adset(${aset.adSetKey})`,
        status: "skip",
        detail: `dry-run — budget R$${aset.budgetDailyBrl}/dia, targeting=${JSON.stringify(targeting).slice(0, 200)}`,
      });
      continue;
    }
    if (!metaCampaignId) {
      log.push({ step: `adset(${aset.adSetKey})`, status: "error", detail: "campanha nao foi criada" });
      continue;
    }
    const res = await createAdSet(creds, metaCampaignId, {
      name: aset.adSetKey,
      daily_budget_cents: brlToCents(aset.budgetDailyBrl),
      targeting,
      status: "PAUSED",
    });
    if (!res.ok) {
      await prisma.launchAdSet.update({
        where: { id: aset.id },
        data: { status: "failed", statusMessage: res.error },
      });
      log.push({ step: `adset(${aset.adSetKey})`, status: "error", detail: res.error });
      continue;
    }
    await prisma.launchAdSet.update({
      where: { id: aset.id },
      data: { metaAdSetId: res.id, status: "created", statusMessage: null },
    });
    log.push({ step: `adset(${aset.adSetKey})`, status: "ok", id: res.id });
    adSetsCreated += 1;
  }

  return {
    success: true,
    launchedAt: new Date().toISOString(),
    metaCampaignId,
    audiencesCreated: audienceIdMap.size,
    lookalikeStatus,
    adSetsCreated,
    warnings,
    log,
  };
}

function buildAdSetTargeting(
  aset: LaunchAdSet,
  audienceIdMap: Map<string, string>
): Targeting {
  const targeting: Targeting = {
    age_min: aset.ageMin,
    age_max: aset.ageMax,
    genders: gendersToMeta(aset.genders),
    geo_locations: { countries: aset.countries.length > 0 ? aset.countries : ["BR"] },
  };

  // Interesses via flexible_spec
  const interests = aset.interests as Array<{ id: string; name: string }> | null;
  if (interests && interests.length > 0) {
    targeting.flexible_spec = [{ interests: interests.map((i) => ({ id: i.id, name: i.name })) }];
  }

  // Custom audiences (inclusao)
  const includeIds = aset.customAudienceKeys
    .map((k) => audienceIdMap.get(k))
    .filter((id): id is string => !!id)
    .map((id) => ({ id }));
  if (includeIds.length > 0) {
    (targeting as Record<string, unknown>).custom_audiences = includeIds;
  }

  // Exclusoes
  const excludeIds = aset.excludedAudienceKeys
    .map((k) => audienceIdMap.get(k))
    .filter((id): id is string => !!id)
    .map((id) => ({ id }));
  if (excludeIds.length > 0) {
    targeting.excluded_custom_audiences = excludeIds;
  }

  return targeting;
}

// Expose helper pra dry-run retornar payloads sem chamar Meta
export function buildPayloadsPreview(
  launchId: string,
  blueprint: Awaited<ReturnType<typeof prisma.launchBlueprint.findUnique>>
): {
  audiences: Array<{ audienceKey: string; payload: Record<string, unknown> }>;
  lookalikes: Array<{ audienceKey: string; payload: Record<string, unknown> }>;
  campaign: Record<string, unknown>;
  adSets: Array<{ adSetKey: string; payload: Record<string, unknown> }>;
} | null {
  if (!blueprint) return null;
  void launchId;
  // Placeholder: so mostra os specs pensados pra cada etapa.
  // Nao chama Meta.
  const audiences = (blueprint as unknown as { audiences: LaunchAudience[] }).audiences
    .filter((a) => a.audienceType === "website_event")
    .map((a) => ({
      audienceKey: a.audienceKey,
      payload: {
        subtype: "WEBSITE",
        event: a.eventName,
        retentionDays: a.retentionDays,
      },
    }));
  const lookalikes = (blueprint as unknown as { audiences: LaunchAudience[] }).audiences
    .filter((a) => a.audienceType === "lookalike")
    .map((a) => ({
      audienceKey: a.audienceKey,
      payload: {
        subtype: "LOOKALIKE",
        source: a.lookalikeSourceKey,
        ratio: a.lookalikeRatio,
        country: a.lookalikeCountry,
      },
    }));
  const campaign = {
    name: blueprint.campaignName,
    objective: blueprint.campaignObjective,
    budgetTotalBrl: blueprint.budgetTotalBrl,
    status: "PAUSED",
  };
  const adSets = (blueprint as unknown as { adSets: LaunchAdSet[] }).adSets.map((a) => ({
    adSetKey: a.adSetKey,
    payload: {
      layer: a.layer,
      activateOn: a.activateOn,
      budgetDailyBrl: a.budgetDailyBrl,
      age: `${a.ageMin}-${a.ageMax}`,
      genders: a.genders,
      countries: a.countries,
      interests: a.interests,
      customAudiences: a.customAudienceKeys,
      excluded: a.excludedAudienceKeys,
      numAds: a.numAds,
      creativesAngles: a.creativesAngles,
    },
  }));
  return { audiences, lookalikes, campaign, adSets };
}
