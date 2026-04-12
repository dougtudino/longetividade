import { NextRequest, NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";
import {
  getLauncherCreds,
  createAdCreative,
  createAd,
} from "@/lib/meta-launcher";
import { LAUNCH_001, adSetLink, buildCreativeSpec } from "@/lib/blueprints/launch-001";

// POST /api/admin/campaigns/fix-ad
// Body: { adSetName: "ASET-02-Interesse-Reeducacao", creativeKey: "feed_prova" }
//
// Deleta APENAS o ad especifico + recria com copy safe.
// Nao mexe nos outros ads que estao rodando.

const GRAPH = "https://graph.facebook.com/v21.0";

export async function POST(req: NextRequest) {
  let body: { adSetName?: string; creativeKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const adSetName = body.adSetName;
  const creativeKey = body.creativeKey;

  if (!adSetName || !creativeKey) {
    return NextResponse.json({
      ok: false,
      error: "adSetName e creativeKey obrigatorios",
    }, { status: 400 });
  }

  const creds = await getLauncherCreds();
  if (!creds) {
    return NextResponse.json({ ok: false, error: "Credenciais Meta ausentes" });
  }

  const token = creds.token;

  // 1. Encontra a campanha
  const campRes = await fetch(
    `${GRAPH}/act_${creds.accountId}/campaigns?fields=id,name&limit=50&access_token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const campData = await campRes.json();
  const campaign = campData.data?.find(
    (c: { name: string }) => c.name === LAUNCH_001.campaign.name
  );
  if (!campaign) {
    return NextResponse.json({ ok: false, error: "Campanha nao encontrada" });
  }

  // 2. Encontra o ad set pelo nome
  const asRes = await fetch(
    `${GRAPH}/${campaign.id}/adsets?fields=id,name&limit=50&access_token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const asData = await asRes.json();
  const adSet = asData.data?.find(
    (a: { name: string }) => a.name === adSetName
  );
  if (!adSet) {
    return NextResponse.json({ ok: false, error: `Ad set "${adSetName}" nao encontrado` });
  }

  // 3. Encontra e deleta o ad com nome matching
  const adsRes = await fetch(
    `${GRAPH}/${adSet.id}/ads?fields=id,name&limit=50&access_token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const adsData = await adsRes.json();

  let deletedAd: string | null = null;
  for (const ad of adsData.data ?? []) {
    // Match por creativeKey no nome do ad
    if (ad.name.includes(creativeKey)) {
      const delRes = await fetch(
        `${GRAPH}/${ad.id}?access_token=${encodeURIComponent(token)}`,
        { method: "DELETE" }
      );
      if (delRes.ok) {
        deletedAd = ad.id;
      }
    }
  }

  // 4. Busca o blueprint do ad set
  const asetSpec = LAUNCH_001.adSets.find((a) => a.name === adSetName);
  if (!asetSpec) {
    return NextResponse.json({ ok: false, error: `Blueprint ${adSetName} nao encontrado` });
  }

  // 5. Busca hash do criativo
  const hashSetting = await getSetting(`meta_creative_hash_${creativeKey}`);
  if (!hashSetting) {
    return NextResponse.json({
      ok: false,
      error: `Hash do criativo "${creativeKey}" ausente. Faca upload em /admin/campanhas/launch-plan primeiro.`,
    });
  }

  // 6. Cria novo creative + ad com copy safe
  const link = adSetLink(asetSpec.utmContent);
  const copyKey = asetSpec.copyKeys[0];
  const creativeSpec = buildCreativeSpec(LAUNCH_001, copyKey, hashSetting, link, adSetName);
  creativeSpec.name = `${adSetName}__${creativeKey}__safe`;

  const cr = await createAdCreative(creds, creativeSpec);
  if (cr.ok === false) {
    return NextResponse.json({
      ok: false,
      error: `Falha ao criar creative: ${cr.error}`,
      deletedAd,
    });
  }

  const newAdName = `AD__${adSetName}__${creativeKey}__safe`;
  const adResult = await createAd(creds, adSet.id, newAdName, cr.id, "PAUSED");
  if (adResult.ok === false) {
    return NextResponse.json({
      ok: false,
      error: `Creative criado (${cr.id}), mas ad falhou: ${adResult.error}`,
      deletedAd,
      creativeId: cr.id,
    });
  }

  return NextResponse.json({
    ok: true,
    deletedAd,
    newCreativeId: cr.id,
    newAdId: adResult.id,
    newAdName,
    copyUsed: copyKey,
  });
}
