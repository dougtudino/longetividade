import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPayloadsPreview } from "@/lib/blueprint-launcher";

// POST /api/admin/campaigns/blueprint/[launchId]/dry-run
// Retorna os payloads que SERIAM enviados pro Meta — sem chamar.
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ launchId: string }> }
) {
  const { launchId } = await ctx.params;
  const blueprint = await prisma.launchBlueprint.findUnique({
    where: { launchId },
    include: {
      audiences: { orderBy: { orderIndex: "asc" } },
      adSets: { orderBy: { orderIndex: "asc" } },
    },
  });
  if (!blueprint) {
    return NextResponse.json({ ok: false, error: "Blueprint nao encontrado" }, { status: 404 });
  }
  const preview = buildPayloadsPreview(launchId, blueprint);
  return NextResponse.json({ ok: true, preview, blueprint });
}
