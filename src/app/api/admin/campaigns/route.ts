import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/campaigns?scope=blueprint|all|legacy|synced
// scope default = "blueprint" — admin oficial mostra apenas campanhas
// criadas pelo sistema novo (LaunchBlueprint). Use scope=legacy pra
// pagina /admin/campanhas/legacy oculta. scope=all pra debug.
export async function GET(req: NextRequest) {
  try {
    const scope = req.nextUrl.searchParams.get("scope") ?? "blueprint";
    const where =
      scope === "all"
        ? {}
        : scope === "legacy"
        ? { source: "legacy" }
        : scope === "synced"
        ? { source: "synced" }
        : { OR: [{ source: "blueprint" }, { launchId: { not: null } }] };

    const campaigns = await prisma.campaign.findMany({
      where,
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

/**
 * @deprecated Sprint 8 (2026-04-20) — fluxo legado de criar campanha avulsa.
 * Use POST /api/admin/campaigns/blueprint/seed (ou duplicate) + lancar via UI.
 * Mantido pra retrocompat de eventuais consumidores externos. Campanhas
 * criadas por aqui ficam source='legacy' e NAO aparecem em /admin/campanhas.
 */
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
        source: "legacy",
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Campaigns POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
