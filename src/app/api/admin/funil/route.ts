import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/funil
// Agrega cliques em CTA dos ultimos 7 dias pra painel /admin/funil.
// Tambem traz PageView count pra calcular taxa LPV->Click.
export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [clicks, pageviews] = await Promise.all([
      prisma.ctaClick.findMany({
        where: { timestamp: { gte: sevenDaysAgo } },
        orderBy: { timestamp: "desc" },
      }),
      prisma.pageView.count({
        where: {
          createdAt: { gte: sevenDaysAgo },
          page: { in: ["/emagreca-sem-dieta", "/emagreca-sem-dieta-v2", "/"] },
        },
      }),
    ]);

    const byCtaId = new Map<string, number>();
    const byPlanId = new Map<string, number>();
    const byCampaign = new Map<string, number>();
    const byPathname = new Map<string, number>();
    const dailyMap = new Map<string, number>();

    for (const c of clicks) {
      byCtaId.set(c.ctaId, (byCtaId.get(c.ctaId) ?? 0) + 1);
      const plan = c.planId ?? "(sem plano)";
      byPlanId.set(plan, (byPlanId.get(plan) ?? 0) + 1);
      const campaign = c.utmCampaign ?? "(direto)";
      byCampaign.set(campaign, (byCampaign.get(campaign) ?? 0) + 1);
      const path = c.pathname ?? "(?)";
      byPathname.set(path, (byPathname.get(path) ?? 0) + 1);
      const day = c.timestamp.toISOString().split("T")[0];
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }

    // Fill daily gaps pros ultimos 7 dias
    const daily: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      daily.push({ date: ds, count: dailyMap.get(ds) ?? 0 });
    }

    const toSorted = <K extends string>(map: Map<string, number>, keyName: K) =>
      Array.from(map.entries())
        .map(([k, count]) => ({ [keyName]: k, count }) as Record<K | "count", string | number>)
        .sort((a, b) => (b.count as number) - (a.count as number));

    const total = clicks.length;
    const convRate = pageviews > 0 ? (total / pageviews) * 100 : 0;

    return NextResponse.json({
      total,
      pageviews,
      convRatePct: Number(convRate.toFixed(2)),
      daily,
      byCtaId: toSorted(byCtaId, "ctaId"),
      byPlanId: toSorted(byPlanId, "planId"),
      byCampaign: toSorted(byCampaign, "campaign"),
      byPathname: toSorted(byPathname, "pathname"),
    });
  } catch (error) {
    console.error("Funil API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
