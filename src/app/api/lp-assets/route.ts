// GET /api/lp-assets?lpSlug=<slug>
// Rota pública — retorna map { key: { imageUrl, alt, width, height } }
// pra LP consumir sem precisar listar registros um a um.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 60; // Next cache 60s

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lpSlug = searchParams.get("lpSlug") ?? "emagreca-sem-dieta";

  const items = await prisma.lpAsset.findMany({ where: { lpSlug } });
  const map: Record<string, { imageUrl: string; alt: string; width: number | null; height: number | null }> = {};
  for (const a of items) {
    map[a.key] = { imageUrl: a.imageUrl, alt: a.alt, width: a.width, height: a.height };
  }

  return NextResponse.json(
    { lpSlug, assets: map },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
