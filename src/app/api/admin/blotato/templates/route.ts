import { NextRequest, NextResponse } from "next/server";
import {
  syncBlotatoTemplates,
  getCachedTemplates,
} from "@/lib/blotato-templates-sync";

// GET  /api/admin/blotato/templates      → lista cacheada (auto-sync se vazia)
// POST /api/admin/blotato/templates/sync → força sync com API Blotato

export async function GET() {
  try {
    const templates = await getCachedTemplates({ autoSyncIfEmpty: true });
    return NextResponse.json({ ok: true, count: templates.length, templates });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(_req: NextRequest) {
  try {
    const res = await syncBlotatoTemplates();
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
