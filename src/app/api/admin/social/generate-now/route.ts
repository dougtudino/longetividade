import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUpcomingDates } from "@/lib/social-calendar-dates";
import { CONTENT_BANK, BEST_TIMES } from "@/lib/social-content-bank";

// POST /api/admin/social/generate-now
// Gera posts pra proxima semana:
// 1. Prioridade 1: data comemorativa no dia (se houver)
// 2. Prioridade 2: trend da semana (se Luna rodou websearch recente)
// 3. Fallback: template random do pilar (content bank)
//
// Rotacao semanal: S/E/S/M/E/Promo (carrossel/stories/reels/reels/imagem/carrossel)

const WEEKLY_PILLARS = ["s", "e", "s", "m", "e", "promo"] as const;
const WEEKLY_FORMATS = ["carrossel", "stories", "reels", "reels", "imagem", "carrossel"] as const;
const DAY_OFFSETS = [1, 2, 3, 4, 5, 6];

type TrendItem = {
  topic: string;
  angle: string;
  suggestedPillar: "s" | "e" | "m" | "promo";
  sourceUrl?: string;
};

// Busca trends frescas (ultimas 10 dias) ainda nao usadas em posts
async function getUnusedTrendsByPillar(): Promise<Map<string, TrendItem[]>> {
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const latest = await prisma.agentKnowledge.findFirst({
    where: {
      agentId: "luna",
      kind: "reference",
      source: "luna-trends-websearch",
      createdAt: { gte: tenDaysAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  const byPillar = new Map<string, TrendItem[]>();
  if (!latest?.metadata) return byPillar;

  const meta = latest.metadata as { trends?: TrendItem[] };
  const trends = meta.trends ?? [];

  // Checa quais ja foram usadas (titulo inclui topic)
  const recentPosts = await prisma.socialPost.findMany({
    where: { createdAt: { gte: tenDaysAgo } },
    select: { title: true, content: true },
  });
  const usedTopics = new Set(
    trends
      .filter((t) => recentPosts.some((p) => p.title.includes(t.topic) || p.content.includes(t.topic)))
      .map((t) => t.topic)
  );

  for (const t of trends) {
    if (usedTopics.has(t.topic)) continue;
    const list = byPillar.get(t.suggestedPillar) ?? [];
    list.push(t);
    byPillar.set(t.suggestedPillar, list);
  }
  return byPillar;
}

export async function POST() {
  const now = new Date();
  let created = 0;
  let fromTrend = 0;
  let fromCommemorative = 0;
  let fromBank = 0;
  const posts: Array<{ day: string; title: string; pillar: string; source: string }> = [];

  const upcoming = getUpcomingDates(7);
  const dateMap = new Map(upcoming.map((d) => [d.fullDate, d]));
  const trendsByPillar = await getUnusedTrendsByPillar();

  for (let i = 0; i < 6; i++) {
    const dayOffset = DAY_OFFSETS[i];
    const postDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const dateKey = postDate.toISOString().slice(0, 10);
    const pillar = WEEKLY_PILLARS[i];
    const format = WEEKLY_FORMATS[i];

    const existing = await prisma.socialPost.findFirst({
      where: {
        scheduledAt: {
          gte: new Date(dateKey + "T00:00:00Z"),
          lte: new Date(dateKey + "T23:59:59Z"),
        },
      },
    });
    if (existing) continue;

    const commemorative = dateMap.get(dateKey);

    let title: string;
    let content: string;
    let hashtags: string;
    let imageBriefing: string;
    let source: string;

    if (commemorative) {
      title = `${commemorative.name} — ${dateKey}`;
      content = commemorative.postIdea;
      hashtags = `${commemorative.hashtags} #metodosem #longetividade`;
      imageBriefing = `Imagem pra ${commemorative.name}. Paleta verde-oliva. Tom acolhedor.`;
      source = "commemorative";
      fromCommemorative++;
    } else {
      // Tenta usar uma trend fresca do pilar
      const trendsForPillar = trendsByPillar.get(pillar) ?? [];
      const trend = trendsForPillar.shift();

      if (trend) {
        title = `${trend.topic} — ${dateKey}`;
        content = `${trend.angle}\n\n(Tendência da semana via Luna Research)`;
        hashtags = `#tendencias #metodosem #longetividade #${pillar === "s" ? "nutricao" : pillar === "e" ? "saudemental" : pillar === "m" ? "movimento" : "oferta"}`;
        imageBriefing = `Card sobre "${trend.topic}". Paleta verde-oliva. Tom acolhedor, informativo.`;
        source = "trend";
        fromTrend++;
      } else {
        const templates = CONTENT_BANK.filter((t) => t.pillar === pillar);
        const template = templates[Math.floor(Math.random() * templates.length)] ?? CONTENT_BANK[0];
        title = `${template.title} — ${dateKey}`;
        content = template.content;
        hashtags = template.hashtags;
        imageBriefing = template.imageBriefing;
        source = "bank";
        fromBank++;
      }
    }

    const times = BEST_TIMES.instagram_feed;
    const bestTime = times[Math.floor(Math.random() * times.length)];
    const [h, m] = bestTime.split(":").map(Number);
    postDate.setHours(h, m, 0, 0);

    try {
      await prisma.socialPost.create({
        data: {
          title,
          content,
          platform: "instagram",
          format,
          pillar,
          hashtags,
          imageBriefing,
          status: "approved",
          scheduledAt: postDate,
          createdBy: "luna-manual",
        },
      });
      created++;
      posts.push({ day: dateKey, title, pillar, source });
    } catch {
      // skip duplicates
    }
  }

  return NextResponse.json({
    ok: true,
    created,
    breakdown: { fromCommemorative, fromTrend, fromBank },
    posts,
  });
}
