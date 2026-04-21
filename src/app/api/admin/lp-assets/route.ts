// GET /api/admin/lp-assets?lpSlug=<slug>   — lista todos os assets daquela LP
// PUT /api/admin/lp-assets                 — upsert { lpSlug, key, imageUrl, alt, width?, height? }
// DELETE /api/admin/lp-assets?id=<id>      — remove (mas mantém fallback estático)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFromR2, keyFromPublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lpSlug = searchParams.get("lpSlug") ?? "emagreca-sem-dieta";
  const items = await prisma.lpAsset.findMany({
    where: { lpSlug },
    orderBy: { key: "asc" },
  });
  return NextResponse.json({ items });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { lpSlug, key, imageUrl, alt, width, height } = body ?? {};
  if (!lpSlug || !key || !imageUrl) {
    return NextResponse.json({ error: "lpSlug, key, imageUrl são obrigatórios" }, { status: 400 });
  }

  // Se tem registro anterior e imageUrl mudou, apaga a imagem antiga do R2 (cleanup).
  const existing = await prisma.lpAsset.findUnique({ where: { lpSlug_key: { lpSlug, key } } });
  if (existing && existing.imageUrl !== imageUrl) {
    const oldKey = keyFromPublicUrl(existing.imageUrl);
    if (oldKey) {
      try {
        await deleteFromR2(oldKey);
      } catch (err) {
        console.warn("[lp-assets] falha ao limpar R2 antigo:", err);
      }
    }
  }

  const saved = await prisma.lpAsset.upsert({
    where: { lpSlug_key: { lpSlug, key } },
    update: { imageUrl, alt: alt ?? "", width: width ?? null, height: height ?? null },
    create: { lpSlug, key, imageUrl, alt: alt ?? "", width: width ?? null, height: height ?? null },
  });
  return NextResponse.json({ item: saved });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const existing = await prisma.lpAsset.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "não encontrado" }, { status: 404 });

  const oldKey = keyFromPublicUrl(existing.imageUrl);
  if (oldKey) {
    try {
      await deleteFromR2(oldKey);
    } catch (err) {
      console.warn("[lp-assets] falha ao deletar R2:", err);
    }
  }
  await prisma.lpAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
