import { NextRequest, NextResponse } from "next/server";
import { publishPostViaBlotato } from "@/lib/blotato-poster";
import { BlotatoError } from "@/lib/blotato-client";

// POST /api/admin/blotato/publish-post
// Body: { postId: string }
// Agenda (ou publica imediato) um SocialPost em IG+FB via Blotato.

export async function POST(req: NextRequest) {
  try {
    const { postId } = (await req.json()) as { postId?: string };
    if (!postId) {
      return NextResponse.json({ ok: false, error: "postId obrigatorio" }, { status: 400 });
    }
    const results = await publishPostViaBlotato(postId);
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    const status = e instanceof BlotatoError ? e.status : 500;
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status },
    );
  }
}
