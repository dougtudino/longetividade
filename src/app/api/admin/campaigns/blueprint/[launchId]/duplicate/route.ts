import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

// POST /api/admin/campaigns/blueprint/[launchId]/duplicate
// Body: { newLaunchId: "LAUNCH-002", newName?: "LAUNCH-002 Sono", newProductName?: "..." }
//
// Cria copia do blueprint + audiences + ad sets como base pra novo
// produto. Reseta metaIds (vai ter que lancar do zero) e status=draft.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ launchId: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { launchId } = await ctx.params;
  let body: { newLaunchId?: string; newName?: string; newProductName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const newLaunchId = body.newLaunchId?.trim();
  if (!newLaunchId || !/^LAUNCH-\d+/.test(newLaunchId)) {
    return NextResponse.json(
      { ok: false, error: "newLaunchId obrigatorio (formato LAUNCH-XXX)" },
      { status: 400 }
    );
  }

  const source = await prisma.launchBlueprint.findUnique({
    where: { launchId },
    include: {
      audiences: { orderBy: { orderIndex: "asc" } },
      adSets: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!source) {
    return NextResponse.json({ ok: false, error: "Blueprint origem nao encontrado" }, { status: 404 });
  }

  const existing = await prisma.launchBlueprint.findUnique({ where: { launchId: newLaunchId } });
  if (existing) {
    return NextResponse.json(
      { ok: false, error: `Ja existe blueprint com launchId ${newLaunchId}` },
      { status: 409 }
    );
  }

  const created = await prisma.launchBlueprint.create({
    data: {
      launchId: newLaunchId,
      name: body.newName ?? `${newLaunchId}-Pioneer`,
      status: "draft",
      productName: body.newProductName ?? source.productName,
      productPriceBrl: source.productPriceBrl,
      productHotmartId: null, // Hotmart ID nao copia — produto novo
      landingUrl: source.landingUrl,
      pixelId: source.pixelId,
      datasetName: source.datasetName,
      adAccountId: source.adAccountId,
      businessManagerId: source.businessManagerId,
      campaignName: `${newLaunchId}-Conversao-${new Date().toISOString().slice(0, 7)}`,
      campaignObjective: source.campaignObjective,
      budgetTotalBrl: source.budgetTotalBrl,
      advantageBudget: source.advantageBudget,
      metaCampaignId: null,
      launchedAt: null,
      audiences: {
        create: source.audiences.map((a) => ({
          orderIndex: a.orderIndex,
          audienceKey: a.audienceKey,
          audienceType: a.audienceType,
          eventName: a.eventName,
          retentionDays: a.retentionDays,
          lookalikeSourceKey: a.lookalikeSourceKey,
          lookalikeCountry: a.lookalikeCountry,
          lookalikeRatio: a.lookalikeRatio,
          metaAudienceId: null,
          status: "pending",
        })),
      },
      adSets: {
        create: source.adSets.map((a) => ({
          orderIndex: a.orderIndex,
          adSetKey: a.adSetKey.replace(source.launchId.replace("LAUNCH-", "ASET-"), newLaunchId.replace("LAUNCH-", "ASET-")),
          layer: a.layer,
          activateOn: a.activateOn,
          budgetDailyBrl: a.budgetDailyBrl,
          ageMin: a.ageMin,
          ageMax: a.ageMax,
          genders: a.genders,
          countries: a.countries,
          interests: a.interests ?? undefined,
          behaviors: a.behaviors ?? undefined,
          customAudienceKeys: a.customAudienceKeys,
          excludedAudienceKeys: a.excludedAudienceKeys,
          optimizationGoal: a.optimizationGoal,
          promotedObjectEvent: a.promotedObjectEvent,
          creativesCollectionId: null, // novo produto precisa nova collection
          creativesAngles: a.creativesAngles,
          numAds: a.numAds,
          metaAdSetId: null,
          status: "pending",
        })),
      },
    },
    include: { audiences: true, adSets: true },
  });

  return NextResponse.json({ ok: true, blueprint: created });
}
