import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchAccountInsights,
  fetchCampaignsWithInsights,
  fetchInsightsForCampaigns,
  type InsightsPreset,
} from "@/lib/meta-ads";

const ALLOWED: InsightsPreset[] = ["today", "yesterday", "last_7d", "last_30d", "lifetime"];

// GET /api/admin/meta-insights?preset=last_7d&scope=blueprint&campaigns=1
//
// scope:
//   - "blueprint" (default) — agrega so campanhas Meta cujo ID bate com
//     LaunchBlueprint.metaCampaignId OU Campaign.source='blueprint'.
//     Garante isolamento do admin oficial.
//   - "all" — agregado de toda conta (sem filtro). Compat com chamadas
//     antigas que dependem do total da conta.
//
// includeCampaigns=1 retorna lista detalhada (sempre filtrada conforme scope).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const presetParam = (searchParams.get("preset") ?? "last_7d") as InsightsPreset;
  const preset: InsightsPreset = ALLOWED.includes(presetParam) ? presetParam : "last_7d";
  const includeCampaigns = searchParams.get("campaigns") === "1";
  const scope = searchParams.get("scope") ?? "blueprint";

  // Resolve lista de Meta campaign IDs do escopo "blueprint".
  let blueprintMetaIds: string[] = [];
  if (scope === "blueprint") {
    const localCampaigns = await prisma.campaign.findMany({
      where: {
        OR: [{ source: "blueprint" }, { launchId: { not: null } }],
        metaCampaignId: { not: null },
      },
      select: { metaCampaignId: true },
    });
    blueprintMetaIds = localCampaigns
      .map((c) => c.metaCampaignId)
      .filter((id): id is string => !!id);
  }

  const account =
    scope === "blueprint"
      ? await fetchInsightsForCampaigns(preset, blueprintMetaIds)
      : await fetchAccountInsights(preset);
  if (account.ok === false) {
    return NextResponse.json({ ok: false, error: account.error, code: account.code });
  }

  if (!includeCampaigns) {
    return NextResponse.json({ ok: true, preset, scope, account });
  }

  const campaigns = await fetchCampaignsWithInsights(preset);
  if (campaigns.ok === false) {
    return NextResponse.json({
      ok: true,
      preset,
      scope,
      account,
      campaigns: [],
      campaignsError: campaigns.error,
    });
  }

  // Filtra lista detalhada se scope=blueprint
  const filteredCampaigns =
    scope === "blueprint"
      ? campaigns.campaigns.filter((c) => blueprintMetaIds.includes(c.id))
      : campaigns.campaigns;

  return NextResponse.json({
    ok: true,
    preset,
    scope,
    account,
    campaigns: filteredCampaigns,
  });
}
