import { NextRequest, NextResponse } from "next/server";
import { generateImageForPost } from "@/lib/blotato-media";
import { BlotatoError } from "@/lib/blotato-client";

// POST /api/admin/blotato/generate-image
// Body: { postId: string }
// Gera AI image pelo Blotato a partir do imageBriefing+title do SocialPost
// e salva em SocialPostImage[0]. Ideal pra slots FEED_AM e STORY.

export async function POST(req: NextRequest) {
  try {
    const { postId } = (await req.json()) as { postId?: string };
    if (!postId) {
      return NextResponse.json({ ok: false, error: "postId obrigatorio" }, { status: 400 });
    }
    const result = await generateImageForPost(postId);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const status = e instanceof BlotatoError ? e.status : 500;
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status },
    );
  }
}
