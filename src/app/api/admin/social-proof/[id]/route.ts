// PATCH  /api/admin/social-proof/:id — atualiza campos
// DELETE /api/admin/social-proof/:id — remove item + imagem do R2
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFromR2, keyFromPublicUrl } from "@/lib/r2";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const allowed = ["row", "imageUrl", "alt", "caption", "kind", "orderIndex", "active"] as const;
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "nenhum campo válido pra atualizar" }, { status: 400 });
  }

  // Se trocou imageUrl, apaga a antiga do R2.
  if (typeof data.imageUrl === "string") {
    const existing = await prisma.socialProofItem.findUnique({ where: { id } });
    if (existing && existing.imageUrl !== data.imageUrl) {
      const oldKey = keyFromPublicUrl(existing.imageUrl);
      if (oldKey) {
        try {
          await deleteFromR2(oldKey);
        } catch (err) {
          console.warn("[social-proof] falha ao limpar R2 antigo:", err);
        }
      }
    }
  }

  const item = await prisma.socialProofItem.update({ where: { id }, data });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const existing = await prisma.socialProofItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "não encontrado" }, { status: 404 });

  const oldKey = keyFromPublicUrl(existing.imageUrl);
  if (oldKey) {
    try {
      await deleteFromR2(oldKey);
    } catch (err) {
      console.warn("[social-proof] falha ao deletar R2:", err);
    }
  }
  await prisma.socialProofItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
