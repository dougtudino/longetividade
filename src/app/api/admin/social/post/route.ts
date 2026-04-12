import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToAll, postToFacebook } from "@/lib/social-poster";

// POST /api/admin/social/post
// Body: { postId: string, platforms?: ["facebook", "instagram"] }
//
// Publica um SocialPost aprovado no Facebook e/ou Instagram via Graph API.
// Atualiza status pra "posted" e salva postId retornado.
export async function POST(req: NextRequest) {
  let body: { postId?: string; platforms?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const postId = body.postId;
  if (!postId) {
    return NextResponse.json({ ok: false, error: "postId obrigatorio" }, { status: 400 });
  }

  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post nao encontrado" }, { status: 404 });
  }

  if (post.status !== "approved") {
    return NextResponse.json({
      ok: false,
      error: `Post precisa estar "approved" pra publicar (status atual: ${post.status})`,
    });
  }

  // Monta a mensagem: content + hashtags
  const message = post.content + (post.hashtags ? "\n\n" + post.hashtags : "");

  // Publica
  const imageUrl = post.imageUrl ?? undefined;
  const results = await postToAll(message, imageUrl);

  const anySuccess = results.some((r) => r.ok);

  if (anySuccess) {
    await prisma.socialPost.update({
      where: { id: postId },
      data: {
        status: "posted",
        postedAt: new Date(),
        engagementData: JSON.parse(JSON.stringify(results)),
      },
    });
  }

  return NextResponse.json({
    ok: anySuccess,
    results,
  });
}
