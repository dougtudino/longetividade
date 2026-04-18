import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVideoForPost } from "@/lib/blotato-media";

// GET /api/cron/blotato-generate-reels
// Cron de geracao de AI reels. Pega SocialPost approved + slot=REEL + sem
// midia (imageUrl vazio E sem SocialPostImage). BATCH BAIXO pq custa muitos
// creditos (~55+/reel) e cada render leva 1-3min.
//
// Schedule sugerido: 0 11 * * * (uma vez por dia, 8h BRT), rodar antes do
// /api/cron/blotato-auto-post.

const BATCH = 3;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET nao configurado" }, { status: 503 });
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const pending = await prisma.socialPost.findMany({
    where: {
      status: "approved",
      slot: "REEL",
      imageUrl: null,
      images: { none: {} },
    },
    orderBy: { scheduledAt: "asc" },
    take: BATCH,
    select: { id: true, title: true },
  });

  const done: Array<{ postId: string; creationId: string; videoUrl: string }> = [];
  const failed: Array<{ postId: string; error: string }> = [];

  for (const p of pending) {
    try {
      const r = await generateVideoForPost(p.id);
      done.push({ postId: r.postId, creationId: r.creationId, videoUrl: r.videoUrl });
    } catch (e) {
      failed.push({ postId: p.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    picked: pending.length,
    done,
    failed,
  });
}
