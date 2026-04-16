import { NextRequest, NextResponse } from "next/server";
import { fillGapsAhead, logGenerationToKnowledge } from "@/lib/social-weekly-generator";

// POST /api/admin/social/fill-gaps?days=30
// Escaneia os proximos N dias (default 30) e preenche todos os slots vazios
// da matriz semanal. Idempotente (slots ja ocupados sao ignorados em silencio).
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const days = Math.max(1, Math.min(60, Number(url.searchParams.get("days") ?? "30")));
    const status = (url.searchParams.get("status") ?? "approved") === "draft" ? "draft" : "approved";

    const result = await fillGapsAhead({ daysAhead: days, status, createdBy: "luna-fill-gaps" });
    await logGenerationToKnowledge(result, `Preencher gaps ${days}d`, "luna-fill-gaps");

    return NextResponse.json({
      ok: true,
      daysAhead: days,
      created: result.created.length,
      skipped: result.skipped.length,
      breakdown: result.breakdown,
      posts: result.created,
      skippedDetails: result.skipped,
    });
  } catch (e) {
    const err = e as Error;
    console.error("[fill-gaps] falhou:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 },
    );
  }
}
