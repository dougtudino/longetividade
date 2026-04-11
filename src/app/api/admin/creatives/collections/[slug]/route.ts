import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/creatives/collections/[slug]
// Retorna uma colecao com todos os criativos dentro
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

  try {
    const collection = await prisma.creativeCollection.findUnique({
      where: { slug },
      include: {
        creatives: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!collection) {
      return NextResponse.json(
        { ok: false, error: `Colecao "${slug}" nao encontrada` },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, collection });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: `Falha ao carregar colecao: ${(e as Error).message}`,
    });
  }
}

// DELETE /api/admin/creatives/collections/[slug]
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

  try {
    await prisma.creativeCollection.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
