import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/social-image/[postId]/[slide]
// Rota PUBLICA (nao precisa auth) pra servir as imagens renderizadas
// pros posts da Luna. Usada pelo Meta Graph API pra puxar image_url.

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ postId: string; slide: string }> }
) {
  const { postId, slide } = await ctx.params;
  const slideIndex = parseInt(slide.replace(/\..+$/, ""), 10) || 0;

  const image = await prisma.socialPostImage.findUnique({
    where: { postId_slideIndex: { postId, slideIndex } },
  });

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.data), {
    status: 200,
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Content-Length": String(image.data.length),
    },
  });
}
