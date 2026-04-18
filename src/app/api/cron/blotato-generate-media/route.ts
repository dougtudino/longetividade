import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateImageForPost } from "@/lib/blotato-media";

// GET /api/cron/blotato-generate-media
// Roda N vezes ao dia (ex: diario 10h BRT) e gera AI image pros SocialPost
// em status=approved cujo slot != REEL e que ainda nao tem SocialPostImage.
// Cap de BATCH pra nao estourar quota/credits num unico run.
//
// Secret header: x-cron-secret (ou ?secret=), contra CRON_SECRET.

const BATCH = 8;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET nao configurado" }, { status: 503 });
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Posts approved + slot != REEL + sem imagem renderizada.
  const pending = await prisma.socialPost.findMany({
    where: {
      status: "approved",
      slot: { in: ["FEED_AM", "STORY"] },
      images: { none: {} },
    },
    orderBy: { scheduledAt: "asc" },
    take: BATCH,
    select: { id: true, slot: true, title: true },
  });

  const done: Array<{ postId: string; creationId: string; outputUrl: string }> = [];
  const failed: Array<{ postId: string; error: string }> = [];

  for (const post of pending) {
    try {
      const r = await generateImageForPost(post.id);
      done.push({ postId: r.postId, creationId: r.creationId, outputUrl: r.outputUrl });
    } catch (e) {
      failed.push({ postId: post.id, error: e instanceof Error ? e.message : String(e) });
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
