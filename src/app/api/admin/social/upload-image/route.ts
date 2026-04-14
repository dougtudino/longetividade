import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/social/upload-image
// Body: { postId: string, slides: Array<{ slideIndex: number, dataUrl: string, width?, height? }> }
//
// Recebe PNGs (base64 dataUrl) renderizados no cliente via html-to-image.
// Salva em SocialPostImage e atualiza imageUrl do post com a URL publica do
// slide 0 (cover).

function extractBase64(dataUrl: string): { mime: string; buffer: Uint8Array<ArrayBuffer> } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const nodeBuf = Buffer.from(match[2], "base64");
  // Copia pra ArrayBuffer puro (Prisma Bytes espera Uint8Array<ArrayBuffer>)
  const ab = new ArrayBuffer(nodeBuf.length);
  new Uint8Array(ab).set(nodeBuf);
  return {
    mime: match[1],
    buffer: new Uint8Array(ab),
  };
}

export async function POST(req: NextRequest) {
  let body: {
    postId?: string;
    slides?: Array<{ slideIndex: number; dataUrl: string; width?: number; height?: number }>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const postId = body.postId;
  const slides = body.slides;
  if (!postId || !Array.isArray(slides) || slides.length === 0) {
    return NextResponse.json(
      { ok: false, error: "postId e slides obrigatorios" },
      { status: 400 }
    );
  }

  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ ok: false, error: "Post nao encontrado" }, { status: 404 });
  }

  // Limpa slides antigos antes de salvar novos
  await prisma.socialPostImage.deleteMany({ where: { postId } });

  for (const slide of slides) {
    const decoded = extractBase64(slide.dataUrl);
    if (!decoded) continue;

    await prisma.socialPostImage.create({
      data: {
        postId,
        slideIndex: slide.slideIndex,
        mimeType: decoded.mime,
        data: decoded.buffer,
        width: slide.width ?? null,
        height: slide.height ?? null,
      },
    });
  }

  // imageUrl aponta pro slide 0 (publico)
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://longetividade.com.br";
  const publicUrl = `${baseUrl}/api/public/social-image/${postId}/0`;

  await prisma.socialPost.update({
    where: { id: postId },
    data: { imageUrl: publicUrl },
  });

  return NextResponse.json({
    ok: true,
    postId,
    slidesSaved: slides.length,
    imageUrl: publicUrl,
  });
}
