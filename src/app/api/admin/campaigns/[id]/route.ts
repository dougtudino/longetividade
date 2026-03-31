import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        metrics: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Campaign GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, platform, objective, status, budget, startDate, endDate, notes } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (platform !== undefined) data.platform = platform;
    if (objective !== undefined) data.objective = objective;
    if (status !== undefined) data.status = status;
    if (budget !== undefined) data.budget = budget;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) data.notes = notes;

    const campaign = await prisma.campaign.update({
      where: { id },
      data,
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Campaign PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete metrics first, then campaign
    await prisma.campaignMetric.deleteMany({ where: { campaignId: id } });
    await prisma.campaign.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Campaign DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
