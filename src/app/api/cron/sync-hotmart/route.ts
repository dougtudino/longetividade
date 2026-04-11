import { NextRequest, NextResponse } from "next/server";
import { runHotmartSync } from "@/app/api/admin/sync-hotmart/route";

// Cron publico protegido por CRON_SECRET.
// Schedule sugerido: 0 3 * * * (3h BRT) = pouca concorrencia, dados estabilizados
// Config: CRON_SECRET no Railway + cron externo (cron-job.org)

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

  // Sincroniza ultimos 7 dias — o webhook captura ao vivo, API reconcilia
  const result = await runHotmartSync({ days: 7 });
  return NextResponse.json(result);
}
