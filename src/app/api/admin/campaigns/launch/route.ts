import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import {
  getLauncherCreds,
  createCampaign,
  createAdSet,
  createWebsiteCustomAudience,
  createAdCreative,
  createAd,
} from "@/lib/meta-launcher";
import { LAUNCH_001, adSetLink, buildCreativeSpec } from "@/lib/blueprints/launch-001";

// POST /api/admin/campaigns/launch
// Body: { blueprint: "LAUNCH-001", dryRun?: boolean }
// Executa o blueprint de ponta a ponta:
//   1. Cria custom audiences (idempotente)
//   2. Cria campanha (PAUSED)
//   3. Cria 3 ad sets cold (PAUSED) com excludeAudience
//   4. Para cada ad set, cria N ad creatives (1 por copy x criativo escolhido)
//   5. Para cada creative, cria 1 ad (PAUSED)
//
// Tudo PAUSED — humano revisa no Meta Ads Manager e ativa.
// Idempotente: nomes existentes nao sao recriados.

type StepLog = {
  step: string;
  status: "ok" | "skip" | "error";
  detail?: string;
  id?: string;
};

export async function POST(req: NextRequest) {
  let body: { blueprint?: string; dryRun?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body ok */
  }

  if (body.blueprint && body.blueprint !== "LAUNCH-001") {
    return NextResponse.json({
      ok: false,
      error: `Blueprint ${body.blueprint} nao implementado. Apenas LAUNCH-001.`,
    });
  }

  const creds = await getLauncherCreds();
  if (!creds) {
    return NextResponse.json({
      ok: false,
      error: "Credenciais Meta nao configuradas em /admin/configuracoes",
    });
  }

  const log: StepLog[] = [];
  const blueprint = LAUNCH_001;

  // ─── 1. Custom Audiences ───────────────────────────────────────────
  const audienceIds: Record<string, string> = {};
  for (const aud of blueprint.customAudiences) {
    if (body.dryRun) {
      log.push({ step: `customAudience(${aud.name})`, status: "skip", detail: "dry-run" });
      continue;
    }
    const result = await createWebsiteCustomAudience(
      creds,
      aud.name,
      aud.retentionDays,
      aud.description
    );
    if (result.ok === false) {
      log.push({ step: `customAudience(${aud.name})`, status: "error", detail: result.error });
      // Audiences sao recomendadas, nao criticas — segue
      continue;
    }
    audienceIds[aud.key] = result.id;
    log.push({
      step: `customAudience(${aud.name})`,
      status: "ok",
      id: result.id,
      detail: result.existed ? "ja existia" : "criada",
    });
  }

  // ─── 2. Campanha ───────────────────────────────────────────────────
  if (body.dryRun) {
    log.push({ step: `campaign(${blueprint.campaign.name})`, status: "skip", detail: "dry-run" });
    return NextResponse.json({ ok: true, dryRun: true, log });
  }

  const campaignResult = await createCampaign(
    creds,
    blueprint.campaign.name,
    blueprint.campaign.objective,
    blueprint.campaign.status
  );
  if (campaignResult.ok === false) {
    log.push({ step: `campaign`, status: "error", detail: campaignResult.error });
    return NextResponse.json({ ok: false, error: campaignResult.error, log });
  }
  const campaignId = campaignResult.id;
  log.push({
    step: `campaign(${blueprint.campaign.name})`,
    status: "ok",
    id: campaignId,
    detail: campaignResult.existed ? "ja existia" : "criada",
  });

  // ─── 3. Ad Sets ────────────────────────────────────────────────────
  const adSetIds: Record<string, string> = {};
  for (const aset of blueprint.adSets) {
    const targeting = { ...aset.targeting };
    if (aset.excludeAudienceKey && audienceIds[aset.excludeAudienceKey]) {
      targeting.excluded_custom_audiences = [{ id: audienceIds[aset.excludeAudienceKey] }];
    }

    const result = await createAdSet(creds, campaignId, {
      name: aset.name,
      daily_budget_cents: aset.daily_budget_cents,
      targeting,
      status: "PAUSED",
    });
    if (result.ok === false) {
      log.push({ step: `adset(${aset.name})`, status: "error", detail: result.error });
      continue;
    }
    adSetIds[aset.key] = result.id;
    log.push({
      step: `adset(${aset.name})`,
      status: "ok",
      id: result.id,
      detail: result.existed ? "ja existia" : "criada",
    });
  }

  // ─── 4. Ad Creatives + Ads ────────────────────────────────────────
  if (!creds.pageId) {
    log.push({
      step: "ads",
      status: "skip",
      detail:
        "META_PAGE_ID nao configurado. Campanha + ad sets criados em PAUSED. Para criar ads automaticamente, configure META_PAGE_ID em /admin/configuracoes#meta e rode novamente.",
    });
    return NextResponse.json({
      ok: true,
      partial: true,
      campaignId,
      adSetIds,
      log,
    });
  }

  // Para cada ad set, monta link e cria 1 ad por (criativo x copy)
  for (const aset of blueprint.adSets) {
    const adSetId = adSetIds[aset.key];
    if (!adSetId) continue;

    const link = adSetLink(aset.utmContent);

    for (const creativeKey of aset.creativeKeys) {
      const hashSetting = await getSetting(`meta_creative_hash_${creativeKey}`);
      if (!hashSetting) {
        log.push({
          step: `ad(${aset.name}/${creativeKey})`,
          status: "error",
          detail: `Hash da imagem ${creativeKey} ausente. Faca upload pelo botao "Upload criativos" antes.`,
        });
        continue;
      }

      // 1 copy por criativo (primeiro da lista)
      const copyKey = aset.copyKeys[0];
      try {
        const creativeSpec = buildCreativeSpec(blueprint, copyKey, hashSetting, link, aset.name);
        const cr = await createAdCreative(creds, creativeSpec);
        if (cr.ok === false) {
          log.push({ step: `creative(${aset.name}/${creativeKey})`, status: "error", detail: cr.error });
          continue;
        }
        log.push({
          step: `creative(${aset.name}/${creativeKey})`,
          status: "ok",
          id: cr.id,
        });

        const adName = `AD__${aset.name}__${creativeKey}`;
        const adResult = await createAd(creds, adSetId, adName, cr.id, "PAUSED");
        if (adResult.ok === false) {
          log.push({ step: `ad(${adName})`, status: "error", detail: adResult.error });
          continue;
        }
        log.push({ step: `ad(${adName})`, status: "ok", id: adResult.id });
      } catch (e) {
        log.push({
          step: `ad(${aset.name}/${creativeKey})`,
          status: "error",
          detail: (e as Error).message,
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    campaignId,
    adSetIds,
    log,
  });
}
