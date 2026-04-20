import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchCampaignsWithInsights,
  clearMetaAdsCache,
} from "@/lib/meta-ads";

function mapStatus(metaStatus: string): "active" | "paused" | "finished" {
  switch (metaStatus) {
    case "ACTIVE":
      return "active";
    case "PAUSED":
      return "paused";
    case "ARCHIVED":
    case "DELETED":
      return "finished";
    default:
      return "paused";
  }
}

function mapObjective(metaObjective: string): "conversao" | "trafego" | "awareness" {
  const o = metaObjective.toUpperCase();
  if (o.includes("CONVERSION") || o.includes("SALES") || o.includes("LEAD")) return "conversao";
  if (o.includes("TRAFFIC") || o.includes("LINK_CLICKS")) return "trafego";
  return "awareness";
}

export async function POST() {
  clearMetaAdsCache();

  const result = await fetchCampaignsWithInsights("today");
  if (result.ok === false) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let upsertedCampaigns = 0;
  let upsertedMetrics = 0;

  // Resolve mapping metaCampaignId → launchId pra promover sources
  // corretamente. Se a campanha vinda do Meta tem LaunchBlueprint
  // correspondente, marca source='blueprint' (nao 'synced'). Senao,
  // 'synced' (campanha criada manualmente no Ads Manager fora do sistema).
  const blueprints = await prisma.launchBlueprint.findMany({
    where: { metaCampaignId: { in: result.campaigns.map((c) => c.id) } },
    select: { metaCampaignId: true, launchId: true },
  });
  const blueprintByMetaId = new Map(
    blueprints.map((b) => [b.metaCampaignId!, b.launchId])
  );

  for (const c of result.campaigns) {
    const launchId = blueprintByMetaId.get(c.id) ?? null;
    const source = launchId ? "blueprint" : "synced";

    const local = await prisma.campaign.upsert({
      where: { metaCampaignId: c.id },
      update: {
        name: c.name,
        status: mapStatus(c.status),
        objective: mapObjective(c.objective),
        platform: "meta",
        lastSyncedAt: new Date(),
        // Se tem launch correspondente, promove pra blueprint. Se nao,
        // NAO sobrescreve source (preserva 'legacy' caso ja tenha sido
        // criada via "+ Nova campanha" antiga e tambem aparece no Meta).
        ...(launchId ? { source: "blueprint", launchId } : {}),
      },
      create: {
        name: c.name,
        platform: "meta",
        objective: mapObjective(c.objective),
        status: mapStatus(c.status),
        budget: 0,
        startDate: new Date(),
        metaCampaignId: c.id,
        lastSyncedAt: new Date(),
        source,
        launchId,
      },
    });
    upsertedCampaigns += 1;

    await prisma.campaignMetric.upsert({
      where: {
        campaignId_date: {
          campaignId: local.id,
          date: today,
        },
      },
      update: {
        impressions: c.insights.impressions,
        clicks: c.insights.clicks,
        spend: c.insights.spend,
        conversions: Math.round(c.insights.purchases),
        revenue: c.insights.purchaseValue,
      },
      create: {
        campaignId: local.id,
        date: today,
        impressions: c.insights.impressions,
        clicks: c.insights.clicks,
        spend: c.insights.spend,
        conversions: Math.round(c.insights.purchases),
        revenue: c.insights.purchaseValue,
      },
    });
    upsertedMetrics += 1;
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    upsertedCampaigns,
    upsertedMetrics,
  });
}
