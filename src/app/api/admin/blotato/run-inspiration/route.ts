import { NextResponse } from "next/server";
import { runInspiration } from "@/lib/blotato-inspiration";

// POST /api/admin/blotato/run-inspiration
// Dispara manual a inspiration via admin (sem precisar esperar cron).

export async function POST() {
  try {
    const r = await runInspiration();
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
