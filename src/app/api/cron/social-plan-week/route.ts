import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyPosts, logGenerationToKnowledge } from "@/lib/social-weekly-generator";

// GET /api/cron/social-plan-week
// Cron SEMANAL (domingo 19h BRT = 22h UTC): Luna gera agenda da semana
// em status="draft" pra Barbara revisar antes de aprovar.
//
// Diferenca do social-generate: status="draft" em vez de "approved".
//
// Schedule sugerido: 0 22 * * 0 (domingo 22h UTC = 19h BRT)

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET nao configurado" }, { status: 503 });
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await generateWeeklyPosts({ status: "draft", createdBy: "luna-plan-week" });
  await logGenerationToKnowledge(result, "Plano semanal (draft)", "luna-plan-week");

  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    created: result.created.length,
    skipped: result.skipped.length,
    breakdown: result.breakdown,
    posts: result.created,
  });
}
