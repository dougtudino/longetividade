import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pageviews = await prisma.pageView.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "desc" },
    });

    // Group by page
    const pageMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const sourceMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();

    let todayCount = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    for (const pv of pageviews) {
      // By page
      pageMap.set(pv.page, (pageMap.get(pv.page) || 0) + 1);

      // By device
      const device = pv.device || "unknown";
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);

      // By source
      const source = pv.utm_source || "direct";
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);

      // By day
      const dayStr = pv.createdAt.toISOString().split("T")[0];
      dailyMap.set(dayStr, (dailyMap.get(dayStr) || 0) + 1);

      if (dayStr === todayStr) todayCount++;
    }

    const toSorted = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);

    // Fill daily gaps
    const daily: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      daily.push({ date: ds, count: dailyMap.get(ds) || 0 });
    }

    return NextResponse.json({
      total: pageviews.length,
      todayCount,
      byPage: toSorted(pageMap).map((e) => ({ page: e.key, count: e.count })),
      byDevice: toSorted(deviceMap).map((e) => ({ device: e.key, count: e.count })),
      bySource: toSorted(sourceMap).map((e) => ({ utm_source: e.key, count: e.count })),
      daily,
    });
  } catch (error) {
    console.error("Pageviews API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
