import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminWorkspace, DEFAULT_WORKSPACE_ID } from "@/lib/workspace";

// GET /api/admin/orders?page=0&per_page=20&plan=vip&status=approved&days=30
// Escopo por workspace ativo: cada produto vê só suas vendas.
export async function GET(req: NextRequest) {
  const auth = await requireAdminWorkspace(req);
  if (!auth.ok) return auth.response;
  const { workspaceId } = auth;
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "0", 10);
    const perPage = Math.min(parseInt(url.searchParams.get("per_page") ?? "20", 10), 100);
    const plan = url.searchParams.get("plan") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const days = parseInt(url.searchParams.get("days") ?? "0", 10);

    const where: Record<string, unknown> = {};
    // Longetividade também abrange linhas legadas (workspaceId nulo) caso o
    // backfill não tenha rodado; demais workspaces são estritos.
    if (workspaceId === DEFAULT_WORKSPACE_ID) {
      where.OR = [{ workspaceId: DEFAULT_WORKSPACE_ID }, { workspaceId: null }];
    } else {
      where.workspaceId = workspaceId;
    }
    if (plan && plan !== "all") where.plan = plan;
    if (status && status !== "all") where.status = status;
    if (days > 0) {
      where.createdAt = { gte: new Date(Date.now() - days * 86_400_000) };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: { id: true, name: true, email: true, plan: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: page * perPage,
        take: perPage,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      orders,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
