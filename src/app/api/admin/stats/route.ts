import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all approved orders once
    const approvedOrders = await prisma.order.findMany({
      where: { status: "approved" },
      select: { id: true, amount: true, plan: true, createdAt: true },
    });

    const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.amount, 0) / 100;
    const totalOrders = approvedOrders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const todayOrders = approvedOrders.filter((o) => o.createdAt >= todayStart);
    const revenueToday = todayOrders.reduce((sum, o) => sum + o.amount, 0) / 100;
    const ordersToday = todayOrders.length;

    const monthOrders = approvedOrders.filter((o) => o.createdAt >= monthStart);
    const revenueThisMonth = monthOrders.reduce((sum, o) => sum + o.amount, 0) / 100;
    const ordersThisMonth = monthOrders.length;

    const lastMonthOrders = approvedOrders.filter(
      (o) => o.createdAt >= lastMonthStart && o.createdAt <= lastMonthEnd
    );
    const revenueLastMonth = lastMonthOrders.reduce((sum, o) => sum + o.amount, 0) / 100;

    // By plan
    const plans = ["basico", "completo", "vip"] as const;
    const byPlan = {} as Record<string, { count: number; revenue: number }>;
    for (const plan of plans) {
      const planOrders = approvedOrders.filter((o) => o.plan === plan);
      byPlan[plan] = {
        count: planOrders.length,
        revenue: planOrders.reduce((sum, o) => sum + o.amount, 0) / 100,
      };
    }

    // Abandoned checkouts
    const [abandonedTotal, abandonedToday] = await Promise.all([
      prisma.abandonedCheckout.count(),
      prisma.abandonedCheckout.count({
        where: { createdAt: { gte: todayStart } },
      }),
    ]);

    // Conversion rate: approved orders / (approved orders + abandoned)
    const conversionRate =
      totalOrders + abandonedTotal > 0
        ? (totalOrders / (totalOrders + abandonedTotal)) * 100
        : 0;

    // Recent orders — capped at 50 for dashboard preview
    // Full paginated list is at /api/admin/orders
    const recentOrders = await prisma.order.findMany({
      select: { id: true, name: true, email: true, plan: true, amount: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // App VIP stats — self-heal: recomputa AppVipSlot.usedSlots a partir
    // do count real de AppUsers VIP. Garante que se o webhook/grant-vip
    // criou AppUser sem incrementar o slot (bug historico), a UI sempre
    // mostra o numero correto e o singleton fica em sync.
    let appStats = { users: 0, activeToday: 0, totalCheckins: 0, slotsUsed: 0, slotsTotal: 100 };
    try {
      const [appUsers, vipUsers, activeToday, totalCheckins, vipSlot] = await Promise.all([
        prisma.appUser.count(),
        prisma.appUser.count({ where: { plan: "vip" } }),
        prisma.appCheckin.groupBy({ by: ["userId"], where: { date: { gte: todayStart } } }).then((r) => r.length),
        prisma.appCheckin.count(),
        prisma.appVipSlot.findUnique({ where: { id: "singleton" } }),
      ]);
      const totalSlots = vipSlot?.totalSlots ?? 100;
      // Sync se divergiu (sem await em background poderia ser melhor,
      // mas a query eh barata o suficiente pra ficar sincrono)
      if (!vipSlot || vipSlot.usedSlots !== vipUsers) {
        await prisma.appVipSlot.upsert({
          where: { id: "singleton" },
          create: { id: "singleton", totalSlots, usedSlots: vipUsers },
          update: { usedSlots: vipUsers },
        });
      }
      appStats = {
        users: appUsers,
        activeToday,
        totalCheckins,
        slotsUsed: vipUsers,
        slotsTotal: totalSlots,
      };
    } catch {
      // Tabelas podem nao existir ainda
    }

    // Daily revenue for last 30 days
    const last30Orders = approvedOrders.filter((o) => o.createdAt >= thirtyDaysAgo);
    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    // Initialize all 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { revenue: 0, orders: 0 });
    }

    for (const o of last30Orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.revenue += o.amount / 100;
        entry.orders += 1;
      }
    }

    const dailyRevenue = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    return NextResponse.json({
      totalRevenue,
      revenueToday,
      revenueThisMonth,
      revenueLastMonth,
      totalOrders,
      ordersToday,
      ordersThisMonth,
      avgTicket,
      byPlan,
      abandonedTotal,
      abandonedToday,
      conversionRate,
      recentOrders,
      dailyRevenue,
      appStats,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
