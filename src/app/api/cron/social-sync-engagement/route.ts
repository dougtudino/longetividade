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

    // ═══════════════════════════════════════════════════════════════════
    // Auto-learning da Uma: pega os top performers, recupera AgentDecision
    // com template escolhido, e consolida "template X + pilar Y + slot Z =
    // engagement medio N". Uma usa isso no proximo buildVisualBrief().
    // ═══════════════════════════════════════════════════════════════════
    try {
      const postedPostIds = topPerformers.map((p) => p.title); // fallback: pelo titulo se id nao disponivel aqui
      void postedPostIds;

      // Reabre: procuramos decisions da Uma pros posts recém-analisados.
      const postIdsTop = posts.slice(0, topPerformers.length).map((p) => p.id);
      const umaDecisions = await prisma.agentDecision.findMany({
        where: {
          agentId: "uma",
          action: "VISUAL_BRIEF",
          targetId: { in: postIdsTop },
        },
        select: {
          targetId: true,
          params: true,
          executionResult: true,
        },
      });

      // Agrega templateId → { totalEngagement, count, pillars, slots }
      type TemplateStat = {
        templateId: string;
        totalEngagement: number;
        count: number;
        pillars: Set<string>;
        slots: Set<string>;
        moodSamples: string[];
      };
      const stats = new Map<string, TemplateStat>();

      for (const post of posts) {
        const dec = umaDecisions.find((d) => d.targetId === post.id);
        if (!dec) continue;
        const params = (dec.params ?? {}) as {
          templateId?: string;
          mood?: string;
          pillar?: string;
          slot?: string;
        };
        const tplId = params.templateId;
        if (!tplId) continue;

        const engagement = topPerformers.find((t) => t.title === post.title)?.engagement ?? 0;
        const existing = stats.get(tplId) ?? {
          templateId: tplId,
          totalEngagement: 0,
          count: 0,
          pillars: new Set<string>(),
          slots: new Set<string>(),
          moodSamples: [],
        };
        existing.totalEngagement += engagement;
        existing.count += 1;
        if (params.pillar) existing.pillars.add(params.pillar);
        if (params.slot) existing.slots.add(params.slot);
        if (params.mood && existing.moodSamples.length < 3)
          existing.moodSamples.push(params.mood);
        stats.set(tplId, existing);
      }

      if (stats.size > 0) {
        const ranked = Array.from(stats.values())
          .map((s) => ({
            ...s,
            avgEngagement: s.count > 0 ? s.totalEngagement / s.count : 0,
          }))
          .sort((a, b) => b.avgEngagement - a.avgEngagement);

        const body = ranked
          .map(
            (s, i) =>
              `${i + 1}. templateId=${s.templateId.slice(0, 80)}
   pilares=${Array.from(s.pillars).join(",") || "?"} · slots=${Array.from(s.slots).join(",") || "?"}
   amostras=${s.count} · engagement medio=${s.avgEngagement.toFixed(1)}
   moods amostrados=${s.moodSamples.join(" | ") || "(sem)"}`
          )
          .join("\n\n");

        await prisma.agentKnowledge.create({
          data: {
            agentId: "uma",
            kind: "learning",
            title: `Template performance (${now.toISOString().slice(0, 10)}) — ${ranked.length} templates rankeados`,
            body: `Aprendizado proprio: templates que geraram engagement mais alto nas ultimas 14 dias.

${body}

---
Regra de ouro: quando escolher template, priorizar os top 3 acima SE o slot/pilar do post atual casar.`,
            source: "uma-learnings",
            metadata: {
              ranked: ranked.map((s) => ({
                templateId: s.templateId,
                avgEngagement: s.avgEngagement,
                count: s.count,
                pillars: Array.from(s.pillars),
                slots: Array.from(s.slots),
              })),
              analyzedPosts: posts.length,
            },
          },
        });
      }
    } catch (err) {
      console.warn(
        "[uma-auto-learning] falha:",
        err instanceof Error ? err.message : String(err)
      );
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
