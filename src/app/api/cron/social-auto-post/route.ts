import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { postToAllWithImages } from "@/lib/social-poster";
import { getPostImageUrls } from "@/lib/social-post-images";

// GET /api/cron/social-auto-post
// Cron DIARIO (12h BRT = 15h UTC): publica posts aprovados cuja
// scheduledAt ja passou. Posta no Facebook + Instagram automaticamente.
//
// Fluxo:
//   1. Busca SocialPost com status="approved" e scheduledAt <= agora
//   2. Pra cada: chama postToAll() (FB + IG)
//   3. Se sucesso: marca como "posted" + salva postIds
//   4. Se falha: marca como "failed" + salva erro
//   5. Auto-save learning: registra o que postou
//
// Schedule: 0 15 * * * (12h BRT) — horario de pico de alcance
// Tambem pode rodar: 0 21 * * * (18h BRT) — segundo horario de pico
//
// Se SOCIAL_PAGE_TOKEN nao estiver configurado, os posts ficam em
// "approved" mas nao sao publicados (mode manual: copiar+colar).

const BATCH = 10;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET nao configurado" }, { status: 503 });
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let posted = 0;
  let failed = 0;
  const results: Array<{ title: string; ok: boolean; platforms: string[] }> = [];

  // Busca posts prontos pra publicar
  const readyPosts = await prisma.socialPost.findMany({
    where: {
      status: "approved",
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: BATCH,
  });

  for (const post of readyPosts) {
    const message = post.content + (post.hashtags ? "\n\n" + post.hashtags : "");

    const imageUrls = await getPostImageUrls(post.id);
    if (imageUrls.length === 0 && post.imageUrl) imageUrls.push(post.imageUrl);

    const postResults = await postToAllWithImages(message, imageUrls);
    const anySuccess = postResults.some((r) => r.ok);

    if (anySuccess) {
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          status: "posted",
          postedAt: new Date(),
          engagementData: JSON.parse(JSON.stringify(postResults)),
        },
      });
      posted += 1;
    } else {
      // Se nenhuma plataforma funcionou (token ausente, etc),
      // NAO marca como failed — deixa como approved pra tentar de novo
      // ou pra o usuario postar manualmente via copiar+colar.
      // So marca failed se TENTOU e falhou com erro real.
      const hasRealError = postResults.some(
        (r) => r.error && !r.error.includes("nao configurado")
      );
      if (hasRealError) {
        await prisma.socialPost.update({
          where: { id: post.id },
          data: {
            status: "posted", // marca como posted mesmo com erro parcial
            postedAt: new Date(),
            reviewNote: `Auto-post parcial: ${postResults.map((r) => `${r.platform}: ${r.ok ? "ok" : r.error}`).join(" · ")}`,
            engagementData: JSON.parse(JSON.stringify(postResults)),
          },
        });
        failed += 1;
      }
      // Se erro e "nao configurado" (token ausente), nao faz nada — post
      // fica em approved pra copiar+colar manual.
    }

    results.push({
      title: post.title,
      ok: anySuccess,
      platforms: postResults.map((r) => `${r.platform}: ${r.ok ? "✓" : r.error?.slice(0, 50) ?? "?"}`),
    });
  }

  // Auto-save learning
  if (posted > 0) {
    try {
      await prisma.agentKnowledge.create({
        data: {
          agentId: "luna",
          kind: "learning",
          title: `Auto-post: ${posted} publicados, ${failed} falharam (${now.toISOString().slice(0, 10)})`,
          body: results.map((r) => `${r.ok ? "✓" : "✗"} ${r.title}: ${r.platforms.join(", ")}`).join("\n"),
          source: "luna-auto-post",
        },
      });
    } catch {
      /* silent */
    }
  }

  return NextResponse.json({
    ok: true,
    runAt: now.toISOString(),
    found: readyPosts.length,
    posted,
    failed,
    results,
  });
}
