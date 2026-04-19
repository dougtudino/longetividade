import { NextRequest, NextResponse } from "next/server";
import { runInspiration } from "@/lib/blotato-inspiration";

// GET /api/cron/blotato-inspiration
// Cron WEEKLY (sugerido sab 19h BRT, antes do video-intelligence): roda
// 3 queries Perplexity pelos pilares S/E/M, salva resultado em AgentKnowledge
// pra Luna consumir nos posts.

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET nao configurado" },
      { status: 503 }
    );
  }
  const provided =
    req.headers.get("x-cron-secret") ??
    new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const r = await runInspiration();
  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    ...r,
  });
}
