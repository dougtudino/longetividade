import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  fetchFacebookInsights,
  fetchInstagramInsights,
  type PostInsights,
} from "@/lib/social-poster";

// GET /api/cron/social-sync-engagement
// Cron DIARIO (21h BRT = 0h UTC): sincroniza engagement real dos posts
// publicados entre 24h e 14 dias atras. Atualiza engagementData com
// metricas reais do Meta Graph API (likes, comments, shares, reach).
// Tambem salva learning com top performers da semana.
//
// Schedule: 0 0 * * * (21h BRT)

type StoredPostResult = {
  ok: boolean;
  platform: string;
  postId?: string;
  error?: string;
};

function extractPostIds(engagementData: unknown): StoredPostResult[] {
  if (!Array.isArray(engagementData)) return [];
  return engagementData.filter(
    (r): r is StoredPostResult =>
      typeof r === "object" && r !== null && "platform" in r
  );
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET nao configurado" },
      { status: 503 }
    );
  }
  const provided =
    req.headers.get("x-cron-secret") ??
    new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Posts publicados entre 24h e 14 dias atras
  const posts = await prisma.socialPost.findMany({
    where: {
      status: "posted",
      postedAt: { gte: fourteenDaysAgo, lte: oneDayAgo },
    },
    orderBy: { postedAt: "desc" },
    take: 50,
  });

  let synced = 0;
  let failed = 0;
  type TopItem = {
    title: string;
    pillar: string;
    format: string;
    engagement: number;
    reach?: number;
  };
  const topPerformers: TopItem[] = [];

  for (const post of posts) {
    const stored = extractPostIds(post.engagementData);
    const insights: PostInsights[] = [];

    for (const entry of stored) {
      if (!entry.ok || !entry.postId) continue;
      if (entry.platform === "facebook") {
        insights.push(await fetchFacebookInsights(entry.postId));
      } else if (entry.platform === "instagram") {
        insights.push(await fetchInstagramInsights(entry.postId));
      }
    }

    if (insights.length === 0) {
      failed += 1;
      continue;
    }

    const totalEngagement = insights.reduce(
      (sum, i) => sum + (i.engagement ?? 0),
      0
    );
    const totalReach = insights.reduce((sum, i) => sum + (i.reach ?? 0), 0);

    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        engagementData: JSON.parse(
          JSON.stringify({
            syncedAt: now.toISOString(),
            platforms: insights,
            totalEngagement,
            totalReach,
          })
        ),
      },
    });

    synced += 1;
    topPerformers.push({
      title: post.title,
      pillar: post.pillar,
      format: post.format,
      engagement: totalEngagement,
      reach: totalReach > 0 ? totalReach : undefined,
    });
  }

  // Auto-save learning: top 3 posts da semana
  if (topPerformers.length >= 3) {
    topPerformers.sort((a, b) => b.engagement - a.engagement);
    const top3 = topPerformers.slice(0, 3);
    const avgEngagement =
      topPerformers.reduce((sum, p) => sum + p.engagement, 0) /
      topPerformers.length;

    try {
      await prisma.agentKnowledge.create({
        data: {
          agentId: "luna",
          kind: "learning",
          title: `Top performers (${now.toISOString().slice(0, 10)}) — media ${avgEngagement.toFixed(1)}`,
          body: top3
            .map(
              (p, i) =>
                `${i + 1}. [${p.pillar}/${p.format}] ${p.title} — engagement ${p.engagement}${p.reach ? `, reach ${p.reach}` : ""}`
            )
            .join("\n"),
          source: "luna-sync-engagement",
          metadata: {
            avgEngagement,
            top: top3,
            totalAnalyzed: topPerformers.length,
          },
        },
      });
    } catch {
      /* silent */
    }
  }

  return NextResponse.json({
    ok: true,
    runAt: now.toISOString(),
    analyzed: posts.length,
    synced,
    failed,
    topPerformers: topPerformers.slice(0, 5),
  });
}
