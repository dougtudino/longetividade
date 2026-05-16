// GET /api/social-proof?lpSlug=<slug>
// Rota pública — retorna só items ativos, ordenados por (row, orderIndex, createdAt).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lpSlug = searchParams.get("lpSlug") ?? "emagreca-sem-dieta";

  const items = await prisma.socialProofItem.findMany({
    where: { lpSlug, active: true },
    orderBy: [{ row: "asc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      row: true,
      imageUrl: true,
      alt: true,
      name: true,
      caption: true,
      kind: true,
      orderIndex: true,
    },
  });

  return NextResponse.json(
    { lpSlug, items },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}
