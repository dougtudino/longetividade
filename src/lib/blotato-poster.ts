// Posting pra IG+FB via Blotato.
//
// Pega o SocialPost, monta payload e chama POST /v2/posts do Blotato.
// Se scheduledAt no passado → publish imediato; futuro → schedule.
//
// Settings lidos:
//   BLOTATO_IG_ACCOUNT_ID — accountId do IG no Blotato (ex: 41847)
//   BLOTATO_FB_ACCOUNT_ID — accountId do FB no Blotato (ex: 27557)
//   META_PAGE_ID          — pageId da Page FB (obrigatorio no target FB)

import { prisma } from "./prisma";
import { getSetting } from "./settings";
import { publishPost, BlotatoError } from "./blotato-client";
import { getPostImageUrls } from "./social-post-images";
import { reviewPostCompliance } from "./agents/quinn";

export interface BlotatoPostResult {
  platform: "instagram" | "facebook";
  ok: boolean;
  postSubmissionId?: string;
  error?: string;
  skipped?: "no-account";
}

export async function publishPostViaBlotato(socialPostId: string): Promise<BlotatoPostResult[]> {
  const post = await prisma.socialPost.findUnique({
    where: { id: socialPostId },
    select: {
      id: true,
      content: true,
      hashtags: true,
      imageUrl: true,
      scheduledAt: true,
    },
  });
  if (!post) throw new BlotatoError(`SocialPost ${socialPostId} nao encontrado`, 404);

  // Quinn (QA/compliance) — gate obrigatorio antes de qualquer publish.
  // Se bloquear, aborta e deixa o post em status=review.
  try {
    const verdict = await reviewPostCompliance(socialPostId);
    if (verdict.severity === "block") {
      throw new BlotatoError(`Quinn bloqueou: ${verdict.issues.join(" · ")}`, 412, verdict);
    }
  } catch (err) {
    if (err instanceof BlotatoError) throw err;
    // Quinn falhou por outro motivo (LLM down, etc): loga mas segue pra
    // nao travar publicacao por dependencia externa. Alternativa seria
    // fail-closed — discutir com o user se preferir.
    console.warn(`[quinn] skip (nao foi block):`, (err as Error).message);
  }

  const text = post.content + (post.hashtags ? "\n\n" + post.hashtags : "");

  // URLs publicas das imagens (servidas via /api/public/social-image/...).
  const imageUrls = await getPostImageUrls(socialPostId);
  if (imageUrls.length === 0 && post.imageUrl) imageUrls.push(post.imageUrl);

  if (imageUrls.length === 0) {
    throw new BlotatoError(`post ${socialPostId} sem imagem — rode gen-image antes`, 400);
  }

  const scheduledTime = post.scheduledAt && post.scheduledAt > new Date()
    ? post.scheduledAt.toISOString()
    : undefined;

  const [igAccountId, fbAccountId, fbPageId] = await Promise.all([
    getSetting("BLOTATO_IG_ACCOUNT_ID"),
    getSetting("BLOTATO_FB_ACCOUNT_ID"),
    getSetting("META_PAGE_ID"),
  ]);

  const results: BlotatoPostResult[] = [];

  if (igAccountId) {
    try {
      const r = await publishPost({
        accountId: igAccountId,
        platform: "instagram",
        text,
        mediaUrls: imageUrls,
        scheduledTime,
      });
      results.push({ platform: "instagram", ok: true, postSubmissionId: r.postSubmissionId });
    } catch (e) {
      results.push({ platform: "instagram", ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  } else {
    results.push({ platform: "instagram", ok: false, skipped: "no-account" });
  }

  if (fbAccountId && fbPageId) {
    try {
      const r = await publishPost({
        accountId: fbAccountId,
        platform: "facebook",
        text,
        mediaUrls: imageUrls,
        pageId: fbPageId,
        scheduledTime,
      });
      results.push({ platform: "facebook", ok: true, postSubmissionId: r.postSubmissionId });
    } catch (e) {
      results.push({ platform: "facebook", ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  } else {
    results.push({ platform: "facebook", ok: false, skipped: "no-account" });
  }

  return results;
}
