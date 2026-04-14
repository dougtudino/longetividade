import { NextResponse } from "next/server";
import { generateWeeklyPosts, logGenerationToKnowledge } from "@/lib/social-weekly-generator";

// POST /api/admin/social/generate-now
// Gera posts da semana em multi-slot (FEED_AM + REEL + STORY por dia).
// Slot-aware: so skip se ja existir post NESSE slot especifico do dia.
//
// Hierarquia de fontes: commemorative > trend (preferTrend slots) > bank.

export async function POST() {
  const result = await generateWeeklyPosts({ status: "approved", createdBy: "luna-manual" });
  await logGenerationToKnowledge(result, "Gerar semana (manual)", "luna-generate-now");

  return NextResponse.json({
    ok: true,
    created: result.created.length,
    skipped: result.skipped.length,
    breakdown: result.breakdown,
    posts: result.created,
    skippedDetails: result.skipped,
  });
}
