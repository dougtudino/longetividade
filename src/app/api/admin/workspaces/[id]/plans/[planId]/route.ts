import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ id: string; planId: string }> };

// PATCH /api/admin/workspaces/:id/plans/:planId — edita um plano.
export async function PATCH(req: Request, ctx: RouteCtx) {
  const { planId } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const allowed = ["label", "priceCents", "hotmartOffer", "checkoutUrl", "orderIndex", "active"] as const;
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  if (typeof data.priceCents === "number") data.priceCents = Math.round(data.priceCents as number);
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "nenhum campo válido" }, { status: 400 });
  }

  try {
    const plan = await prisma.workspacePlan.update({ where: { id: planId }, data });
    return NextResponse.json({ ok: true, plan });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique") || msg.includes("unique")) {
      return NextResponse.json({ ok: false, error: "offer code já usado por outro plano" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/workspaces/:id/plans/:planId
export async function DELETE(_req: Request, ctx: RouteCtx) {
  const { planId } = await ctx.params;
  try {
    await prisma.workspacePlan.delete({ where: { id: planId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
