import { NextResponse } from "next/server";
import {
  fetchAccountInsights,
  fetchCampaignsWithInsights,
  type InsightsPreset,
} from "@/lib/meta-ads";

const ALLOWED: InsightsPreset[] = ["today", "yesterday", "last_7d", "last_30d", "lifetime"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const presetParam = (searchParams.get("preset") ?? "last_7d") as InsightsPreset;
  const preset: InsightsPreset = ALLOWED.includes(presetParam) ? presetParam : "last_7d";
  const includeCampaigns = searchParams.get("campaigns") === "1";

  const account = await fetchAccountInsights(preset);
  if (account.ok === false) {
    return NextResponse.json({ ok: false, error: account.error, code: account.code });
  }

  if (!includeCampaigns) {
    return NextResponse.json({ ok: true, preset, account });
  }

  const campaigns = await fetchCampaignsWithInsights(preset);
  if (campaigns.ok === false) {
    return NextResponse.json({
      ok: true,
      preset,
      account,
      campaigns: [],
      campaignsError: campaigns.error,
    });
  }

  return NextResponse.json({
    ok: true,
    preset,
    account,
    campaigns: campaigns.campaigns,
  });
}
