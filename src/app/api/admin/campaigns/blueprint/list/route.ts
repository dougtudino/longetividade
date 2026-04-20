import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/campaigns/blueprint/list
// Lista todos blueprints com contadores basicos (audiences, adSets).
export async function GET() {
  try {
    const blueprints = await prisma.launchBlueprint.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { audiences: true, adSets: true } },
      },
    });
    return NextResponse.json({ ok: true, blueprints });
  } catch (e) {
    return NextResponse.json({ ok: true, blueprints: [], warning: (e as Error).message });
  }
}
