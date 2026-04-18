import { NextResponse } from "next/server";
import { listAccounts, BlotatoError } from "@/lib/blotato-client";

// GET /api/admin/blotato/accounts
// Lista contas sociais conectadas no Blotato. Usar pra descobrir accountId
// + pageId (FB) a salvar em AppSetting (BLOTATO_IG_ACCOUNT_ID, BLOTATO_FB_ACCOUNT_ID, BLOTATO_FB_PAGE_ID).

export async function GET() {
  try {
    const accounts = await listAccounts();
    return NextResponse.json({ ok: true, accounts });
  } catch (e) {
    const status = e instanceof BlotatoError ? e.status : 500;
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status },
    );
  }
}
