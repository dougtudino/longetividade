import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET detalhe completo, PATCH { starred: bool } pra favoritar.

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const analysis = await prisma.videoAnalysis.findUnique({
    where: { id },
    include: { competitor: true },
  });
  if (!analysis) {
    return NextResponse.json({ ok: false, error: "nao encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, analysis });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as { starred?: boolean };
    const updated = await prisma.videoAnalysis.update({
      where: { id },
      data: { starred: body.starred ?? false },
    });
    return NextResponse.json({ ok: true, analysis: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
