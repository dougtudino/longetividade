import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { metrics: true },
      orderBy: { createdAt: "desc" },
    });

    const result = campaigns.map((campaign) => {
      const totals = campaign.metrics.reduce(
        (acc, m) => ({
          impressions: acc.impressions + m.impressions,
          clicks: acc.clicks + m.clicks,
          spend: acc.spend + m.spend,
          conversions: acc.conversions + m.conversions,
          revenue: acc.revenue + m.revenue,
        }),
        { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 }
      );

      const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;
      const cpv = totals.conversions > 0 ? totals.spend / totals.conversions : 0;

      const { metrics: _metrics, ...campaignData } = campaign;

      return {
        ...campaignData,
        totalImpressions: totals.impressions,
        totalClicks: totals.clicks,
        totalSpend: totals.spend,
        totalConversions: totals.conversions,
        totalRevenue: totals.revenue,
        roas,
        cpv,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Campaigns GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, platform, objective, budget, startDate, endDate, notes } = body;

    if (!name || !platform || !objective || budget == null || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        platform,
        objective,
        status: "active",
        budget,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Campaigns POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
