import { prisma } from "./prisma";
import { getUpcomingDates, type CommemorativeDate } from "./social-calendar-dates";
import { CONTENT_BANK } from "./social-content-bank";
import {
  WEEKLY_SCHEDULE,
  computeSlotDate,
  dateKey,
  type Slot,
  type Pillar,
} from "./social-week-schedule";

export type TrendItem = {
  topic: string;
  angle: string;
  suggestedPillar: Pillar;
  sourceUrl?: string;
};

export type GeneratedPost = {
  day: string;
  slot: Slot;
  pillar: Pillar;
  title: string;
  source: "commemorative" | "trend" | "bank";
};

export type SkippedSlot = { day: string; slot: Slot; reason: string };

export type WeeklyGenerationResult = {
  created: GeneratedPost[];
  skipped: SkippedSlot[];
  breakdown: { fromCommemorative: number; fromTrend: number; fromBank: number };
};

async function getUnusedTrendsByPillar(): Promise<Map<Pillar, TrendItem[]>> {
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

  const byPillar = new Map<Pillar, TrendItem[]>();
  if (!latest?.metadata) return byPillar;

  const meta = latest.metadata as { trends?: TrendItem[] };
  const trends = meta.trends ?? [];

  const recentPosts = await prisma.socialPost.findMany({
    where: { createdAt: { gte: tenDaysAgo } },
    select: { title: true, content: true },
  });
  const usedTopics = new Set(
    trends
      .filter((t) => recentPosts.some((p) => p.title.includes(t.topic) || p.content.includes(t.topic)))
      .map((t) => t.topic),
  );

  for (const t of trends) {
    if (usedTopics.has(t.topic)) continue;
    const list = byPillar.get(t.suggestedPillar) ?? [];
    list.push(t);
    byPillar.set(t.suggestedPillar, list);
  }
  return byPillar;
}

function hashtagsForPillar(pillar: Pillar): string {
  const base = "#metodosem #longetividade";
  switch (pillar) {
    case "s": return `#nutricao #reeducacaoalimentar ${base}`;
    case "e": return `#saudemental #amorproprio ${base}`;
    case "m": return `#movimento #bemestar ${base}`;
    case "promo": return `#metodosem #oferta ${base}`;
  }
}

type BuiltContent = {
  title: string;
  content: string;
  hashtags: string;
  imageBriefing: string;
  source: "commemorative" | "trend" | "bank";
};

function slotLabel(slot: Slot): string {
  return slot === "STORY" ? "Story vertical 1080x1920" : slot === "REEL" ? "Reel vertical 9:16" : "Card quadrado 1080x1080";
}

function buildFromCommemorative(c: CommemorativeDate, dKey: string, slot: Slot): BuiltContent {
  return {
    title: `${c.name} — ${dKey}`,
    content: c.postIdea,
    hashtags: `${c.hashtags} #metodosem #longetividade`,
    imageBriefing: `${slotLabel(slot)} pra ${c.name}. Paleta verde-oliva. Tom acolhedor.`,
    source: "commemorative",
  };
}

function buildFromTrend(t: TrendItem, dKey: string, slot: Slot, pillar: Pillar): BuiltContent {
  const content =
    slot === "REEL"
      ? `${t.topic}\n\n${t.angle}\n\n💬 Comenta se faz sentido pra você.`
      : `${t.topic}\n\n${t.angle}\n\n#MétodoSEM #Longetividade`;

  return {
    title: `${t.topic} — ${dKey}`,
    content,
    hashtags: `#tendencias ${hashtagsForPillar(pillar)}`,
    imageBriefing: `${slotLabel(slot)} sobre "${t.topic}". Paleta verde-oliva. Tom acolhedor, informativo.`,
    source: "trend",
  };
}

function buildFromBank(pillar: Pillar, dKey: string, format: string): BuiltContent | null {
  const templates = CONTENT_BANK.filter((t) => t.pillar === pillar);
  const template = templates[Math.floor(Math.random() * templates.length)];
  if (!template) return null;
  return {
    title: `${template.title} — ${dKey}`,
    content: template.content,
    hashtags: template.hashtags,
    imageBriefing: template.imageBriefing + (format === "stories" ? " [Adaptar pra vertical 1080x1920]" : ""),
    source: "bank",
  };
}

// status: "approved" (generate-now manual + cron auto) ou "draft" (plan-week)
export async function generateWeeklyPosts(opts: { status: "approved" | "draft"; createdBy: string }): Promise<WeeklyGenerationResult> {
  const now = new Date();
  const upcoming = getUpcomingDates(7);
  const commemorativeMap = new Map(upcoming.map((d) => [d.fullDate, d]));
  const trendsByPillar = await getUnusedTrendsByPillar();

  // Pega TODOS os posts agendados pros proximos 8 dias em 1 query so
  const startRange = new Date(now.getTime());
  const endRange = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
  const existingPosts = await prisma.socialPost.findMany({
    where: { scheduledAt: { gte: startRange, lte: endRange } },
    select: { slot: true, scheduledAt: true },
  });
  const occupiedSlots = new Set<string>();
  for (const p of existingPosts) {
    if (!p.scheduledAt) continue;
    const k = `${p.scheduledAt.toISOString().slice(0, 10)}::${p.slot}`;
    occupiedSlots.add(k);
  }

  const created: GeneratedPost[] = [];
  const skipped: SkippedSlot[] = [];
  let fromCommemorative = 0;
  let fromTrend = 0;
  let fromBank = 0;

  for (const entry of WEEKLY_SCHEDULE) {
    const postDate = computeSlotDate(now, entry);
    const dKey = dateKey(postDate);
    const { slot, pillar, format } = entry;

    if (occupiedSlots.has(`${dKey}::${slot}`)) {
      skipped.push({ day: dKey, slot, reason: "slot ja ocupado" });
      continue;
    }

    let built: BuiltContent | null = null;
    const commem = commemorativeMap.get(dKey);

    if (commem) {
      built = buildFromCommemorative(commem, dKey, slot);
      fromCommemorative++;
    } else if (entry.preferTrend) {
      const trends = trendsByPillar.get(pillar) ?? [];
      const trend = trends.shift();
      if (trend) {
        built = buildFromTrend(trend, dKey, slot, pillar);
        fromTrend++;
      }
    }

    if (!built) {
      const trends = trendsByPillar.get(pillar) ?? [];
      const trend = trends.shift();
      if (trend) {
        built = buildFromTrend(trend, dKey, slot, pillar);
        fromTrend++;
      } else {
        built = buildFromBank(pillar, dKey, format);
        if (built) fromBank++;
      }
    }

    if (!built) {
      skipped.push({ day: dKey, slot, reason: `sem conteudo pro pilar ${pillar}` });
      continue;
    }

    try {
      await prisma.socialPost.create({
        data: {
          title: built.title,
          content: built.content,
          platform: "instagram",
          format,
          pillar,
          slot,
          hashtags: built.hashtags,
          imageBriefing: built.imageBriefing,
          status: opts.status,
          scheduledAt: postDate,
          createdBy: opts.createdBy,
        },
      });
      created.push({ day: dKey, slot, pillar, title: built.title, source: built.source });
    } catch (e) {
      skipped.push({ day: dKey, slot, reason: `erro ao salvar: ${(e as Error).message.slice(0, 80)}` });
    }
  }

  return { created, skipped, breakdown: { fromCommemorative, fromTrend, fromBank } };
}

export async function logGenerationToKnowledge(
  result: WeeklyGenerationResult,
  titlePrefix: string,
  source: string,
): Promise<void> {
  const { created, skipped, breakdown } = result;
  if (created.length === 0 && skipped.length === 0) return;
  try {
    await prisma.agentKnowledge.create({
      data: {
        agentId: "luna",
        kind: "learning",
        title: `${titlePrefix} — ${created.length} criados, ${skipped.length} skipped`,
        body: [
          `Criados:`,
          ...created.map((p) => `  ${p.day} [${p.slot}/${p.pillar}] ${p.title} (${p.source})`),
          ``,
          `Skipped:`,
          ...skipped.map((s) => `  ${s.day} [${s.slot}] — ${s.reason}`),
        ].join("\n"),
        source,
        metadata: { created, skipped, breakdown },
      },
    });
  } catch {
    /* silent */
  }
}
