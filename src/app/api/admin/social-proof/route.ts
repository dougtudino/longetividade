// GET    /api/admin/social-proof?lpSlug=<slug>  — lista todos (ativos + inativos)
// POST   /api/admin/social-proof                — cria item
// Body: { lpSlug, row, imageUrl, alt?, name?, caption?, kind?, orderIndex?, active? }
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lpSlug = searchParams.get("lpSlug") ?? "emagreca-sem-dieta";
  const items = await prisma.socialProofItem.findMany({
    where: { lpSlug },
    orderBy: [{ row: "asc" }, { orderIndex: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { lpSlug, row, imageUrl, alt, name, caption, kind, orderIndex, active } = body ?? {};
  if (!lpSlug || !row || !imageUrl) {
    return NextResponse.json({ error: "lpSlug, row, imageUrl obrigatórios" }, { status: 400 });
  }
  if (![1, 2, 3].includes(Number(row))) {
    return NextResponse.json({ error: "row deve ser 1, 2 ou 3" }, { status: 400 });
  }

  const item = await prisma.socialProofItem.create({
    data: {
      lpSlug,
      row: Number(row),
      imageUrl,
      alt: alt ?? "",
      name: typeof name === "string" && name.trim() ? name.trim() : null,
      caption: caption ?? null,
      kind: kind ?? "photo",
      orderIndex: orderIndex ?? 0,
      active: active ?? true,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
