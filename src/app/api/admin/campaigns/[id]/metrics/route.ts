import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { date, impressions, clicks, spend, conversions, revenue } = body;

    if (!date || impressions == null || clicks == null || spend == null || conversions == null || revenue == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const metricDate = new Date(date);

    const metric = await prisma.campaignMetric.upsert({
      where: {
        campaignId_date: {
          campaignId,
          date: metricDate,
        },
      },
      update: {
        impressions,
        clicks,
        spend,
        conversions,
        revenue,
      },
      create: {
        campaignId,
        date: metricDate,
        impressions,
        clicks,
        spend,
        conversions,
        revenue,
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error("Campaign metrics POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
