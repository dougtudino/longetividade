import { NextResponse } from "next/server";
import { getSetting, getSettingWithFallback } from "@/lib/settings";
import {
  getLauncherCreds,
  createAdCreative,
  createAd,
  type CreativeSpec,
} from "@/lib/meta-launcher";
import { LAUNCH_001, adSetLink, buildCreativeSpec } from "@/lib/blueprints/launch-001";

// POST /api/admin/campaigns/recreate-ads
// Deleta todos os ads e creatives existentes da campanha LAUNCH-001,
// depois recria com as copies atuais (safe/compliance).
//
// Motivo: ads foram criados com copies antigas antes do rewrite Meta
// Ad Policy. Um deles foi rejeitado. Precisa recriar todos com copies
// novas do blueprint atualizado.
//
// Fluxo: list ads → delete → list creatives → delete → create new

const GRAPH = "https://graph.facebook.com/v21.0";

type LogEntry = { step: string; ok: boolean; detail?: string };

async function graphDelete(id: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${GRAPH}/${id}?access_token=${encodeURIComponent(token)}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function graphGet<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(
      `${GRAPH}/${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function POST() {
  const creds = await getLauncherCreds();
  if (!creds) {
    return NextResponse.json({
      ok: false,
      error: "Credenciais Meta nao configuradas",
    });
  }

  const log: LogEntry[] = [];
  const blueprint = LAUNCH_001;

  // 1. Busca IDs dos ad sets da campanha (salvos em AppSetting ou via API)
  // Usa a API direto: lista ad sets da campanha por nome
  const campaignName = blueprint.campaign.name;
  const campaignsData = await graphGet<{ data: Array<{ id: string; name: string }> }>(
    `act_${creds.accountId}/campaigns?fields=id,name&limit=50`,
    creds.token
  );

  const campaign = campaignsData?.data?.find((c) => c.name === campaignName);
  if (!campaign) {
    return NextResponse.json({
      ok: false,
      error: `Campanha "${campaignName}" nao encontrada na Meta`,
    });
  }

  log.push({ step: `campaign found: ${campaign.id}`, ok: true });

  // 2. Lista ad sets da campanha
  const adSetsData = await graphGet<{ data: Array<{ id: string; name: string }> }>(
    `${campaign.id}/adsets?fields=id,name&limit=50`,
    creds.token
  );
  const adSets = adSetsData?.data ?? [];
  log.push({ step: `found ${adSets.length} ad sets`, ok: true });

  // 3. Para cada ad set: lista ads → deleta
  let adsDeleted = 0;
  for (const adSet of adSets) {
    const adsData = await graphGet<{ data: Array<{ id: string; name: string }> }>(
      `${adSet.id}/ads?fields=id,name&limit=50`,
      creds.token
    );
    for (const ad of adsData?.data ?? []) {
      const ok = await graphDelete(ad.id, creds.token);
      log.push({ step: `delete ad ${ad.name} (${ad.id})`, ok, detail: ok ? "deleted" : "failed" });
      if (ok) adsDeleted += 1;
    }
  }

  log.push({ step: `total ads deleted: ${adsDeleted}`, ok: true });

  // 4. Recriar ads com copies atuais do blueprint
  if (!creds.pageId) {
    log.push({
      step: "recreate",
      ok: false,
      detail: "META_PAGE_ID nao configurado — nao posso criar novos ads",
    });
    return NextResponse.json({ ok: false, log, error: "META_PAGE_ID ausente" });
  }

  let adsCreated = 0;
  for (const aset of blueprint.adSets) {
    // Encontra o ad set pelo nome
    const adSet = adSets.find((a) => a.name === aset.name);
    if (!adSet) {
      log.push({ step: `adset ${aset.name}`, ok: false, detail: "nao encontrado" });
      continue;
    }

    const link = adSetLink(aset.utmContent);

    for (const creativeKey of aset.creativeKeys) {
      const hashSetting = await getSetting(`meta_creative_hash_${creativeKey}`);
      if (!hashSetting) {
        log.push({
          step: `creative ${aset.name}/${creativeKey}`,
          ok: false,
          detail: `hash ausente — faca upload primeiro em /admin/campanhas/launch-plan`,
        });
        continue;
      }

      const copyKey = aset.copyKeys[0];
      try {
        const creativeSpec = buildCreativeSpec(blueprint, copyKey, hashSetting, link, aset.name);
        // Muda o nome pra evitar conflito com creative antigo
        creativeSpec.name = `${aset.name}__${creativeKey}__v2`;

        const cr = await createAdCreative(creds, creativeSpec);
        if (cr.ok === false) {
          log.push({ step: `creative ${aset.name}/${creativeKey}`, ok: false, detail: cr.error });
          continue;
        }
        log.push({ step: `creative ${aset.name}/${creativeKey} v2`, ok: true, detail: cr.id });

        const adName = `AD__${aset.name}__${creativeKey}__v2`;
        const adResult = await createAd(creds, adSet.id, adName, cr.id, "PAUSED");
        if (adResult.ok === false) {
          log.push({ step: `ad ${adName}`, ok: false, detail: adResult.error });
          continue;
        }
        log.push({ step: `ad ${adName}`, ok: true, detail: adResult.id });
        adsCreated += 1;
      } catch (e) {
        log.push({
          step: `ad ${aset.name}/${creativeKey}`,
          ok: false,
          detail: (e as Error).message,
        });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    adsDeleted,
    adsCreated,
    log,
  });
}
