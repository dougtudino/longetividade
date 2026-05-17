import { NextRequest, NextResponse } from "next/server";
import { runDispatcher } from "@/lib/notifications-engine";

// GET /api/cron/notifications-dispatcher
// Cron a cada 30min. Header `x-cron-secret` ou ?secret= = CRON_SECRET.
// Itera todos AppUsers com push ativo + prefs e avalia regras
// individualmente. Manda push personalizado conforme estado dela.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET nao configurado" },
      { status: 503 }
    );
  }
  const provided =
    req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDispatcher();
    return NextResponse.json({
      ok: true,
      runAt: new Date().toISOString(),
      ...result,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
