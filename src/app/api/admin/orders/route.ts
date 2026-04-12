import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/orders?page=0&per_page=20&plan=vip&status=approved&days=30
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "0", 10);
    const perPage = Math.min(parseInt(url.searchParams.get("per_page") ?? "20", 10), 100);
    const plan = url.searchParams.get("plan") ?? undefined;
    const status = url.searchParams.get("status") ?? undefined;
    const days = parseInt(url.searchParams.get("days") ?? "0", 10);

    const where: Record<string, unknown> = {};
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
