import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

// PATCH /api/admin/campaigns/blueprint/[launchId]/ad-sets/[adSetId]
// Atualiza campos editaveis do ad set. Whitelist: budget, idade,
// interests, activateOn, numAds, creativesAngles.
// NAO editaveis: adSetKey, layer, customAudienceKeys, excludedAudienceKeys,
// optimizationGoal, promotedObjectEvent (controlados via schema/seed).
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ launchId: string; adSetId: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { launchId, adSetId } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  // Valida que o ad set pertence ao blueprint do launchId
  const adSet = await prisma.launchAdSet.findUnique({
    where: { id: adSetId },
    include: { blueprint: true },
  });
  if (!adSet || adSet.blueprint.launchId !== launchId) {
    return NextResponse.json(
      { ok: false, error: "Ad set nao encontrado ou nao pertence a essa launch" },
      { status: 404 }
    );
  }

  const allowedKeys = [
    "budgetDailyBrl",
    "ageMin",
    "ageMax",
    "genders",
    "countries",
    "interests",
    "behaviors",
    "activateOn",
    "numAds",
    "creativesAngles",
    "creativesCollectionId",
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

  // Validacoes basicas
  if (typeof data.ageMin === "number" && typeof data.ageMax === "number") {
    if ((data.ageMin as number) > (data.ageMax as number)) {
      return NextResponse.json(
        { ok: false, error: "ageMin nao pode ser maior que ageMax" },
        { status: 400 }
      );
    }
  }
  if (typeof data.budgetDailyBrl === "number" && (data.budgetDailyBrl as number) < 1) {
    return NextResponse.json(
      { ok: false, error: "budgetDailyBrl minimo eh R$1" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.launchAdSet.update({
      where: { id: adSetId },
      data,
    });
    return NextResponse.json({ ok: true, adSet: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
