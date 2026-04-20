import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { getLauncherCreds } from "@/lib/meta-launcher";
import { runBlueprintLaunch } from "@/lib/blueprint-launcher";

// POST /api/admin/campaigns/blueprint/[launchId]/launch
// Dispara launcher real no Meta. Ler blueprint do banco, criar audiences,
// lookalikes, campanha, ad sets. Tudo PAUSED. Idempotente — se ja tem
// metaIds setados, pula.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ launchId: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { launchId } = await ctx.params;
  const creds = await getLauncherCreds();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "Credenciais Meta nao configuradas em /admin/configuracoes" },
      { status: 400 }
    );
  }

  const summary = await runBlueprintLaunch(launchId, creds);
  return NextResponse.json({ ok: summary.success, summary });
}
