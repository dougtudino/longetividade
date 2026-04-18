import { NextRequest, NextResponse } from "next/server";
import { generateVideoForPost } from "@/lib/blotato-media";
import { BlotatoError } from "@/lib/blotato-client";

// POST /api/admin/blotato/generate-reel
// Body: { postId: string }
// Gera AI reel pelo Blotato a partir do content+imageBriefing do SocialPost
// slot=REEL. Retorna URL publica (salva em post.imageUrl).
// ATENCAO: custa ~55+ creditos por reel, timeout de ate 10min.

export async function POST(req: NextRequest) {
  try {
    const { postId } = (await req.json()) as { postId?: string };
    if (!postId) {
      return NextResponse.json({ ok: false, error: "postId obrigatorio" }, { status: 400 });
    }
    const result = await generateVideoForPost(postId);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const status = e instanceof BlotatoError ? e.status : 500;
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status },
    );
  }
}
