import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET  /api/admin/creatives/[id]/copies  → lista variantes
// POST /api/admin/creatives/[id]/copies  → cria variante

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const copies = await prisma.creativeCopy.findMany({
      where: { creativeId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ ok: true, copies });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      label?: string;
      headline?: string;
      description?: string;
      cta?: string;
      primaryText?: string;
      active?: boolean;
    };
    if (!body.label || !body.headline) {
      return NextResponse.json(
        { ok: false, error: "label e headline sao obrigatorios" },
        { status: 400 }
      );
    }
    const creative = await prisma.creative.findUnique({ where: { id } });
    if (!creative) {
      return NextResponse.json({ ok: false, error: "Creative nao encontrado" }, { status: 404 });
    }
    const copy = await prisma.creativeCopy.create({
      data: {
        creativeId: id,
        label: body.label,
        headline: body.headline,
        description: body.description ?? null,
        cta: body.cta ?? null,
        primaryText: body.primaryText ?? null,
        active: body.active ?? true,
      },
    });
    return NextResponse.json({ ok: true, copy });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique constraint")) {
      return NextResponse.json(
        { ok: false, error: "Ja existe variante com esse label" },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
