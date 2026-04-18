import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/creatives/[id]/copies/[copyId] → atualiza (active, texto)
// DELETE /api/admin/creatives/[id]/copies/[copyId]

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; copyId: string }> }
) {
  try {
    const { copyId } = await ctx.params;
    const body = (await req.json()) as {
      label?: string;
      headline?: string;
      description?: string | null;
      cta?: string | null;
      primaryText?: string | null;
      active?: boolean;
    };
    const copy = await prisma.creativeCopy.update({
      where: { id: copyId },
      data: {
        ...(body.label !== undefined && { label: body.label }),
        ...(body.headline !== undefined && { headline: body.headline }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.cta !== undefined && { cta: body.cta }),
        ...(body.primaryText !== undefined && { primaryText: body.primaryText }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });
    return NextResponse.json({ ok: true, copy });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; copyId: string }> }
) {
  try {
    const { copyId } = await ctx.params;
    await prisma.creativeCopy.delete({ where: { id: copyId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
