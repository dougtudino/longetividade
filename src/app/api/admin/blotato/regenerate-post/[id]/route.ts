import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImageForPost, generateVideoForPost } from "@/lib/blotato-media";

// POST /api/admin/blotato/regenerate-post/[id]
// Apaga imageUrl atual e regenera com pipeline nova (Uma + slides estruturados).
// Pra validar 1 post antes de soltar cron geral.
//
// Retorna: { ok, before: {...}, after: {...} }

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    const post = await prisma.socialPost.findUnique({
      where: { id },
      select: { id: true, title: true, slot: true, format: true, imageUrl: true },
    });
    if (!post) {
      return NextResponse.json({ ok: false, error: "Post nao encontrado" }, { status: 404 });
    }

    const before = {
      imageUrl: post.imageUrl,
      slot: post.slot,
      format: post.format,
    };

    // Limpa imageUrl atual + qualquer imagem renderizada antiga
    await prisma.socialPost.update({
      where: { id: post.id },
      data: { imageUrl: null },
    });
    await prisma.socialPostImage.deleteMany({
      where: { postId: post.id },
    });

    // Decide qual generator usar baseado no FORMAT (carrossel/imagem/reels/stories)
    // NAO baseado no slot — slot eh hora do dia, format eh o tipo de midia.
    // - reels → video (mp4)
    // - carrossel | imagem | stories | texto → imagem (Image Slideshow ou Quote Card)
    let result;
    const startedAt = Date.now();
    const isVideoFormat = post.format === "reels";
    if (isVideoFormat) {
      result = await generateVideoForPost(post.id);
    } else {
      result = await generateImageForPost(post.id);
    }
    const elapsedMs = Date.now() - startedAt;

    // Pega o estado atualizado pra retornar
    const after = await prisma.socialPost.findUnique({
      where: { id: post.id },
      select: { imageUrl: true, slot: true },
    });

    return NextResponse.json({
      ok: true,
      postId: post.id,
      title: post.title,
      slot: post.slot,
      before,
      after,
      elapsedMs,
      creationId: result && "creationId" in result ? result.creationId : undefined,
      outputUrl: result && "outputUrl" in result ? result.outputUrl :
                 result && "videoUrl" in result ? result.videoUrl : undefined,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: (e as Error).message,
        stack: (e as Error).stack?.slice(0, 500),
      },
      { status: 500 }
    );
  }
}
