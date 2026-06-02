import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ id: string }> };

// POST /api/admin/workspaces/:id/plans — cria um plano no workspace.
// Body: { planKey, label, priceCents, hotmartOffer, checkoutUrl, orderIndex?, active? }
export async function POST(req: Request, ctx: RouteCtx) {
  const { id: workspaceId } = await ctx.params;
  let body: {
    planKey?: string;
    label?: string;
    priceCents?: number;
    hotmartOffer?: string;
    checkoutUrl?: string;
    orderIndex?: number;
    active?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const planKey = (body.planKey ?? "").trim();
  const label = (body.label ?? "").trim();
  const hotmartOffer = (body.hotmartOffer ?? "").trim();
  const checkoutUrl = (body.checkoutUrl ?? "").trim();
  const priceCents = Number(body.priceCents);

  if (!planKey || !label) {
    return NextResponse.json({ ok: false, error: "planKey e label obrigatórios" }, { status: 400 });
  }
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    return NextResponse.json({ ok: false, error: "priceCents inválido" }, { status: 400 });
  }
  if (!hotmartOffer) {
    return NextResponse.json({ ok: false, error: "hotmartOffer obrigatório (offer code único)" }, { status: 400 });
  }

  try {
    const plan = await prisma.workspacePlan.create({
      data: {
        workspaceId,
        planKey,
        label,
        priceCents: Math.round(priceCents),
        hotmartOffer,
        checkoutUrl: checkoutUrl || "#",
        orderIndex: Number.isFinite(body.orderIndex) ? Number(body.orderIndex) : 0,
        active: body.active ?? true,
      },
    });
    return NextResponse.json({ ok: true, plan });
  } catch (e) {
    const msg = (e as Error).message;
    // Unique violations: (workspaceId, planKey) ou hotmartOffer global
    if (msg.includes("Unique") || msg.includes("unique")) {
      return NextResponse.json(
        { ok: false, error: "planKey duplicado no workspace ou offer code já usado" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
