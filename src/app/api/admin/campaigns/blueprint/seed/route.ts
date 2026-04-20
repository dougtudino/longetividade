import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/campaigns/blueprint/seed
// Popula LAUNCH-001 no banco (blueprint + audiences + ad sets).
// Idempotente: se ja existe, nao duplica — apenas retorna estado atual.

const LAUNCH_001_SEED = {
  blueprint: {
    launchId: "LAUNCH-001",
    name: "LAUNCH-001-Pioneer",
    status: "draft",
    productName: "Longetividade - Emagreca Sem Dieta",
    productPriceBrl: 37,
    productHotmartId: "7474328",
    landingUrl: "https://www.longetividade.com.br/emagreca-sem-dieta",
    pixelId: "953736244279938",
    datasetName: "Dados de Longetividade",
    adAccountId: "act_837047967961012",
    businessManagerId: "1892655711045175",
    campaignName: "LONG-AQ-01-Conversao-Pioneer-Mar2026",
    campaignObjective: "OUTCOME_SALES",
    budgetTotalBrl: 95,
    advantageBudget: false,
  },
  audiences: [
    {
      audienceKey: "ca_compradores",
      audienceType: "website_event",
      eventName: "Purchase",
      retentionDays: 180,
    },
    {
      audienceKey: "ca_pageview_7d",
      audienceType: "website_event",
      eventName: "PageView",
      retentionDays: 7,
    },
    {
      audienceKey: "ca_pageview_30d",
      audienceType: "website_event",
      eventName: "PageView",
      retentionDays: 30,
    },
    {
      audienceKey: "ca_inicheck_30d",
      audienceType: "website_event",
      eventName: "InitiateCheckout",
      retentionDays: 30,
    },
    {
      audienceKey: "ca_leads_30d",
      audienceType: "website_event",
      eventName: "Lead",
      retentionDays: 30,
    },
    {
      audienceKey: "lal_1pct_pageview_30d",
      audienceType: "lookalike",
      lookalikeSourceKey: "ca_pageview_30d",
      lookalikeCountry: "BR",
      lookalikeRatio: 0.01,
    },
  ],
  adSets: [
    {
      adSetKey: "ASET-01-Cold-Interesses-3050",
      layer: "cold",
      activateOn: "day_1",
      budgetDailyBrl: 25,
      ageMin: 30,
      ageMax: 50,
      genders: ["female"],
      countries: ["BR"],
      interests: [
        { id: "6003107902433", name: "Emagrecimento" },
        { id: "6003522953372", name: "Dieta" },
        { id: "6003348604581", name: "Saude e bem-estar" },
        { id: "6003370116564", name: "Perda de peso" },
      ],
      customAudienceKeys: [],
      excludedAudienceKeys: ["ca_compradores"],
      creativesCollectionId: "launch-001-pioneer",
      creativesAngles: ["dor", "prova", "objecao", "promessa", "cta"],
      numAds: 5,
    },
    {
      adSetKey: "ASET-02-Cold-Broad-3050",
      layer: "cold",
      activateOn: "day_1",
      budgetDailyBrl: 15,
      ageMin: 30,
      ageMax: 50,
      genders: ["female"],
      countries: ["BR"],
      customAudienceKeys: [],
      excludedAudienceKeys: ["ca_compradores"],
      creativesCollectionId: "launch-001-pioneer",
      creativesAngles: ["dor", "prova", "cta"],
      numAds: 3,
    },
    {
      adSetKey: "ASET-03-Cold-Maes-Pos-Parto",
      layer: "cold",
      activateOn: "day_1",
      budgetDailyBrl: 25,
      ageMin: 28,
      ageMax: 42,
      genders: ["female"],
      countries: ["BR"],
      interests: [
        { id: "6003052490537", name: "Maternidade" },
        { id: "6003020834693", name: "Bebes" },
        { id: "6003254079675", name: "Amamentacao" },
      ],
      customAudienceKeys: [],
      excludedAudienceKeys: ["ca_compradores"],
      creativesCollectionId: "launch-001-pioneer",
      creativesAngles: ["dor", "prova", "objecao", "cta"],
      numAds: 4,
    },
    {
      adSetKey: "ASET-04-LAL-1pct-Pageview",
      layer: "warm",
      activateOn: "day_5",
      budgetDailyBrl: 15,
      ageMin: 25,
      ageMax: 55,
      genders: ["female"],
      countries: ["BR"],
      customAudienceKeys: ["lal_1pct_pageview_30d"],
      excludedAudienceKeys: ["ca_compradores"],
      creativesCollectionId: "launch-001-pioneer",
      creativesAngles: ["prova", "cta"],
      numAds: 2,
    },
    {
      adSetKey: "ASET-05-RT-Pageview-7d",
      layer: "hot",
      activateOn: "day_5",
      budgetDailyBrl: 15,
      ageMin: 25,
      ageMax: 55,
      genders: ["female"],
      countries: ["BR"],
      customAudienceKeys: ["ca_pageview_7d"],
      excludedAudienceKeys: ["ca_compradores", "ca_inicheck_30d"],
      creativesCollectionId: "launch-001-pioneer",
      creativesAngles: ["cta", "objecao"],
      numAds: 2,
    },
  ],
};

export async function POST() {
  try {
    const existing = await prisma.launchBlueprint.findUnique({
      where: { launchId: LAUNCH_001_SEED.blueprint.launchId },
      include: { audiences: true, adSets: true },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        created: false,
        blueprint: existing,
        message: "Blueprint LAUNCH-001 ja existia — nada a fazer.",
      });
    }

    const blueprint = await prisma.launchBlueprint.create({
      data: {
        ...LAUNCH_001_SEED.blueprint,
        audiences: {
          create: LAUNCH_001_SEED.audiences.map((a, i) => ({
            orderIndex: i,
            ...a,
          })),
        },
        adSets: {
          create: LAUNCH_001_SEED.adSets.map((a, i) => ({
            orderIndex: i,
            ...a,
          })),
        },
      },
      include: { audiences: true, adSets: true },
    });

    return NextResponse.json({
      ok: true,
      created: true,
      blueprint,
      message: `Blueprint ${blueprint.launchId} criado com ${blueprint.audiences.length} audiencias e ${blueprint.adSets.length} ad sets.`,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
