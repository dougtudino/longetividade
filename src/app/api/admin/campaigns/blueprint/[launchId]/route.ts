import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

// GET /api/admin/campaigns/blueprint/[launchId]
// Retorna blueprint completo com audiences + adSets ordenados.
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ launchId: string }> }
) {
  const { launchId } = await ctx.params;
  try {
    const blueprint = await prisma.launchBlueprint.findUnique({
      where: { launchId },
      include: {
        audiences: { orderBy: { orderIndex: "asc" } },
        adSets: { orderBy: { orderIndex: "asc" } },
      },
    });
    if (!blueprint) {
      return NextResponse.json(
        { ok: false, error: `Blueprint ${launchId} nao encontrado. Rode o seed primeiro.` },
        { status: 404 }
      );
    }

    // Puxa CreativeCollections referenciadas + seus creatives + copies
    // pra UI mostrar o mapa completo campaign → ad sets → ads previstos.
    const collectionSlugs = Array.from(
      new Set(blueprint.adSets.map((a) => a.creativesCollectionId).filter((s): s is string => !!s))
    );
    const collections = collectionSlugs.length > 0
      ? await prisma.creativeCollection.findMany({
          where: { slug: { in: collectionSlugs } },
          include: {
            creatives: {
              where: { archived: false },
              include: { copies: { where: { active: true } } },
            },
          },
        })
      : [];

    return NextResponse.json({ ok: true, blueprint, collections });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/campaigns/blueprint/[launchId]
// Atualiza campos do blueprint. Whitelist: apenas campos seguros.
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ launchId: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { launchId } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const allowedKeys = [
    "name",
    "status",
    "productName",
    "productPriceBrl",
    "productHotmartId",
    "landingUrl",
    "pixelId",
    "datasetName",
    "adAccountId",
    "businessManagerId",
    "campaignName",
    "budgetTotalBrl",
    "advantageBudget",
  ];
  const data: Record<string, unknown> = {};
  for (const k of allowedKeys) {
    if (k in body) data[k] = body[k];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { ok: false, error: "Nenhum campo editavel enviado" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.launchBlueprint.update({
      where: { launchId },
      data,
    });
    return NextResponse.json({ ok: true, blueprint: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
