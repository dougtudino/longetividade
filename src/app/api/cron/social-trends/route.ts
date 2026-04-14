import { NextRequest, NextResponse } from "next/server";

// GET /api/cron/social-trends
// Cron SEMANAL (sab 19h BRT = 22h UTC): atualiza trends da semana pra que o
// cron social-generate de domingo (20h BRT) ja use essas trends.
//
// Schedule: 0 22 * * 6 (sab 22h UTC = 19h BRT)

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

  // Chama a funcao POST do endpoint de trends diretamente (sem HTTP)
  const { POST: trendsPost } = await import("@/app/api/admin/social/trends/route");
  const response = await trendsPost();
  const data = await response.json();

  return NextResponse.json({
    ok: data.ok ?? false,
    ranAt: new Date().toISOString(),
    ...data,
  });
}
