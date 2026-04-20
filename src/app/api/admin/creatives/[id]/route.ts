import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH  /api/admin/creatives/[id]  → toggle archived (body: { archived: bool })
// DELETE /api/admin/creatives/[id]  → hard delete (cascade pega CreativeCopy)

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as { archived?: boolean };
    if (typeof body.archived !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "archived (boolean) eh obrigatorio" },
        { status: 400 }
      );
    }
    const creative = await prisma.creative.update({
      where: { id },
      data: { archived: body.archived },
    });
    return NextResponse.json({ ok: true, creative });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    await prisma.creative.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
