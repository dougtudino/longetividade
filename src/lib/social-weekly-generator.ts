import { prisma } from "./prisma";
import { getUpcomingDates, type CommemorativeDate } from "./social-calendar-dates";
import { CONTENT_BANK } from "./social-content-bank";
import {
  WEEKLY_SCHEDULE,
  dateKey,
  expandScheduleAhead,
  virtualSlotsForOffDay,
  type Slot,
  type Pillar,
  type WeeklySlotEntry,
} from "./social-week-schedule";
import {
  STORY_POLL_TEMPLATES,
  STORY_QUESTION_TEMPLATES,
  STORY_SEQUENCE_TEMPLATES,
  pickRandom,
} from "./social-story-templates";

export type TrendItem = {
  topic: string;
  angle: string;
  suggestedPillar: Pillar;
  sourceUrl?: string;
  hook?: string;
  keyPoints?: string[];
  dataPoint?: string;
  body?: string;
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

  // Enriquece com analises de Reels virais (ultimos 7 dias) — Video Intelligence.
  // Cada VideoAnalysis espelhada em AgentKnowledge vira um TrendItem que a Luna
  // pode consumir nos slots de REEL (preferencialmente pilar "m" — Movimento).
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const videoRefs = await prisma.agentKnowledge.findMany({
    where: {
      agentId: "luna",
      kind: "reference",
      source: { startsWith: "video-intelligence:" },
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  for (const ref of videoRefs) {
    const meta = ref.metadata as {
      username?: string;
      views?: number;
      hook?: string;
      concept?: string;
    } | null;
    if (!meta?.hook) continue;
    const trendItem: TrendItem = {
      topic: meta.concept?.slice(0, 60) || ref.title,
      angle: meta.hook,
      suggestedPillar: "m", // Reels virais vao preferencialmente pro pilar M
      hook: meta.hook,
      body: ref.body,
      sourceUrl: undefined,
    };
    const list = byPillar.get("m") ?? [];
    list.push(trendItem);
    byPillar.set("m", list);
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

function buildFromCommemorative(c: CommemorativeDate, _dKey: string, slot: Slot, format: string): BuiltContent {
  const hook = c.hook?.trim();
  const body = c.body?.trim();
  const points = (c.keyPoints ?? []).filter((p) => p && p.trim().length > 0);

  // Story estruturado com template dedicado: usa content em formato "---" pros parsers
  if (c.storyTemplate) {
    if (c.storyTemplate.type === "poll") {
      const t = c.storyTemplate;
      return {
        title: c.name,
        content: `${t.question}\n---\n${t.optionA}\n---\n${t.optionB}`,
        hashtags: `${c.hashtags} #metodosem #longetividade`,
        imageBriefing: `Story enquete 1080x1920 pra ${c.name}. Paleta verde-oliva. Pergunta em destaque.`,
        source: "commemorative",
      };
    }
    if (c.storyTemplate.type === "question") {
      const t = c.storyTemplate;
      return {
        title: c.name,
        content: `${t.question}${t.subtitle ? `\n---\n${t.subtitle}` : ""}`,
        hashtags: `${c.hashtags} #metodosem #longetividade`,
        imageBriefing: `Story caixa de pergunta 1080x1920 pra ${c.name}. Paleta verde-oliva.`,
        source: "commemorative",
      };
    }
    if (c.storyTemplate.type === "sequence") {
      const t = c.storyTemplate;
      const content = t.slides.map((s) => `${s.text}${s.emoji ? ` ${s.emoji}` : ""}`).join("\n---\n");
      return {
        title: c.name,
        content,
        hashtags: `${c.hashtags} #metodosem #longetividade`,
        imageBriefing: `Sequencia de ${t.slides.length} stories 1080x1920 pra ${c.name}. Paleta verde-oliva.`,
        source: "commemorative",
      };
    }
  }

  // Content rico por slot quando a commem tem hook/keyPoints/body
  let content: string;
  if (slot === "REEL" || format === "reels") {
    const beats = points.length ? points.slice(0, 3) : [c.postIdea];
    content = [
      hook || c.postIdea,
      points.length ? "" : null,
      ...beats.map((b) => `— ${b}`),
    ].filter((x) => x !== null && x !== undefined).join("\n").trim();
  } else if (slot === "STORY") {
    content = [
      hook || c.postIdea,
      points[0] ? `\n${points[0]}` : "",
    ].filter(Boolean).join("\n").trim();
  } else {
    // FEED_AM (carrossel ou imagem): prefere body completo; senao, hook+bullets
    if (body) {
      content = body;
    } else if (hook || points.length) {
      const parts: string[] = [];
      if (hook) parts.push(hook);
      if (points.length) parts.push(points.map((p) => `• ${p}`).join("\n"));
      content = parts.join("\n\n");
    } else {
      content = c.postIdea;
    }
  }

  return {
    title: c.name,
    content,
    hashtags: `${c.hashtags} #metodosem #longetividade`,
    imageBriefing: `${slotLabel(slot)} pra ${c.name}. Paleta verde-oliva. Tom acolhedor${c.preferredFormat ? `, formato preferido: ${c.preferredFormat}` : ""}.`,
    source: "commemorative",
  };
}

function buildFromTrend(t: TrendItem, _dKey: string, slot: Slot, pillar: Pillar): BuiltContent {
  const hook = t.hook?.trim() || t.angle.trim();
  const body = t.body?.trim();
  const points = (t.keyPoints ?? []).filter((p) => p && p.trim().length > 0);
  const data = t.dataPoint?.trim();

  let content: string;
  if (slot === "REEL") {
    const beats = points.length ? points.slice(0, 3) : [t.angle];
    content = [
      hook,
      "",
      ...beats.map((b) => `— ${b}`),
      "",
      data ? data : "",
    ].filter(Boolean).join("\n").trim();
  } else if (slot === "STORY") {
    content = [
      hook,
      "",
      points[0] || t.angle,
      data ? `\n${data}` : "",
    ].filter(Boolean).join("\n").trim();
  } else {
    // FEED_AM: carrossel ou imagem — usa body completo quando houver
    const main = body || [hook, points.map((p) => `• ${p}`).join("\n"), data].filter(Boolean).join("\n\n");
    content = main.trim();
  }

  return {
    title: t.topic,
    content,
    hashtags: `#tendencias ${hashtagsForPillar(pillar)}`,
    imageBriefing: `${slotLabel(slot)} sobre "${t.topic}". Paleta verde-oliva. Tom jornalistico acolhedor. ${data ? `Destaque o dado: ${data}` : ""}`.trim(),
    source: "trend",
  };
}

function buildFromBank(pillar: Pillar, _dKey: string, format: string): BuiltContent | null {
  // Stories tipados usam templates proprios (poll/question/sequence)
  if (format === "stories-poll") {
    const t = pickRandom(STORY_POLL_TEMPLATES[pillar] ?? []);
    if (!t) return null;
    return {
      title: t.title,
      content: t.content,
      hashtags: t.hashtags,
      imageBriefing: `Story enquete 1080x1920, pilar ${pillar}, paleta verde-oliva.`,
      source: "bank",
    };
  }
  if (format === "stories-question") {
    const t = pickRandom(STORY_QUESTION_TEMPLATES[pillar] ?? []);
    if (!t) return null;
    return {
      title: t.title,
      content: t.content,
      hashtags: t.hashtags,
      imageBriefing: `Story caixa de pergunta 1080x1920, pilar ${pillar}, paleta verde-oliva.`,
      source: "bank",
    };
  }
  if (format === "stories-sequence") {
    const t = pickRandom(STORY_SEQUENCE_TEMPLATES[pillar] ?? []);
    if (!t) return null;
    return {
      title: t.title,
      content: t.content,
      hashtags: t.hashtags,
      imageBriefing: `Sequencia de 4-5 stories 1080x1920, pilar ${pillar}, paleta verde-oliva. Cada slide texto punch + emoji.`,
      source: "bank",
    };
  }

  // Feed/Reel/Imagem usam content bank normal
  const templates = CONTENT_BANK.filter((t) => t.pillar === pillar);
  const template = templates[Math.floor(Math.random() * templates.length)];
  if (!template) return null;
  return {
    title: template.title,
    content: template.content,
    hashtags: template.hashtags,
    imageBriefing: template.imageBriefing + (format === "stories" ? " [Adaptar pra vertical 1080x1920]" : ""),
    source: "bank",
  };
}

// Monta o content de um slot escolhendo a melhor fonte disponivel.
// Muta trendsByPillar (consome trend via shift).
//
// Regras de priorizacao:
// 1) Stories estruturados (poll/question/sequence):
//    - Se commem do dia tem storyTemplate compativel → usa commem
//    - Senao → bank template random
// 2) Slots normais:
//    - Commem priority="high" SEMPRE entra (ignora pilar mismatch)
//    - Commem priority normal: entra se pilar bate OU se pilar = "geral"
//    - Commem priority="low": so entra no fallback (nao vence trend)
//    - Senao: preferTrend → trend, senao trend, senao bank
function pickContentForSlot(
  entry: WeeklySlotEntry,
  dKey: string,
  commemorativeMap: Map<string, CommemorativeDate>,
  trendsByPillar: Map<Pillar, TrendItem[]>,
): { built: BuiltContent; source: "commemorative" | "trend" | "bank" } | null {
  const { slot, pillar, format } = entry;
  const isStructuredStory =
    format === "stories-poll" ||
    format === "stories-question" ||
    format === "stories-sequence";

  const commem = commemorativeMap.get(dKey);
  const commemType = commem?.storyTemplate?.type;
  const commemMatchesStoryFormat =
    (format === "stories-poll" && commemType === "poll") ||
    (format === "stories-question" && commemType === "question") ||
    (format === "stories-sequence" && commemType === "sequence");

  // 1) Stories estruturados
  if (isStructuredStory) {
    if (commem && commemMatchesStoryFormat) {
      return { built: buildFromCommemorative(commem, dKey, slot, format), source: "commemorative" };
    }
    const b = buildFromBank(pillar, dKey, format);
    return b ? { built: b, source: "bank" } : null;
  }

  // 2) Slots normais — avaliacao de prioridade da commem
  const commemPriority = commem?.priority ?? "normal";
  const pilarBate = commem && (commem.pillar === pillar || commem.pillar === "geral");

  const commemWins =
    commem &&
    (commemPriority === "high" || (commemPriority === "normal" && pilarBate));

  if (commemWins && commem) {
    return { built: buildFromCommemorative(commem, dKey, slot, format), source: "commemorative" };
  }

  // Trend tem preferencia em slots marcados
  if (entry.preferTrend) {
    const trends = trendsByPillar.get(pillar) ?? [];
    const trend = trends.shift();
    if (trend) {
      return { built: buildFromTrend(trend, dKey, slot, pillar), source: "trend" };
    }
  }

  // Fallback: trend → commem low → bank
  const trends = trendsByPillar.get(pillar) ?? [];
  const trend = trends.shift();
  if (trend) {
    return { built: buildFromTrend(trend, dKey, slot, pillar), source: "trend" };
  }
  if (commem && commemPriority === "low") {
    return { built: buildFromCommemorative(commem, dKey, slot, format), source: "commemorative" };
  }
  const bank = buildFromBank(pillar, dKey, format);
  return bank ? { built: bank, source: "bank" } : null;
}

async function fetchOccupiedSlots(from: Date, daysAhead: number): Promise<Set<string>> {
  const endRange = new Date(from.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  // Drafts NAO bloqueiam — so approved/review/posted contam como "ocupado".
  const existing = await prisma.socialPost.findMany({
    where: {
      scheduledAt: { gte: from, lte: endRange },
      status: { in: ["approved", "review", "posted"] },
    },
    select: { slot: true, scheduledAt: true },
  });
  const occupied = new Set<string>();
  for (const p of existing) {
    if (!p.scheduledAt) continue;
    occupied.add(`${p.scheduledAt.toISOString().slice(0, 10)}::${p.slot}`);
  }
  return occupied;
}

// Gera posts pros proximos 7 dias (1 ocorrencia de cada entry da WEEKLY_SCHEDULE).
// status: "approved" (generate-now manual + cron auto) ou "draft" (plan-week).
// Agora eh wrapper de fillGapsAhead({ daysAhead: 7 }) — herda slot virtual
// pra commem high em dias OFF (domingo — Maes, Pais, Pascoa, etc).
export async function generateWeeklyPosts(opts: { status: "approved" | "draft"; createdBy: string }): Promise<WeeklyGenerationResult> {
  return fillGapsAhead({ daysAhead: 7, status: opts.status, createdBy: opts.createdBy });
}

// Escaneia proximos N dias e preenche TODOS os slots vazios da WEEKLY_SCHEDULE.
// Usado pelo botao "Preencher gaps" do admin e pelo auto-fill pos-delete.
// Tambem cria slot virtual pra commem high priority que cai em dia OFF (dom).
export async function fillGapsAhead(opts: {
  daysAhead: number;
  status: "approved" | "draft";
  createdBy: string;
}): Promise<WeeklyGenerationResult> {
  const now = new Date();
  const upcoming = getUpcomingDates(opts.daysAhead);
  const commemorativeMap = new Map(upcoming.map((d) => [d.fullDate, d]));
  const trendsByPillar = await getUnusedTrendsByPillar();
  const occupiedSlots = await fetchOccupiedSlots(now, opts.daysAhead + 1);

  const created: GeneratedPost[] = [];
  const skipped: SkippedSlot[] = [];
  let fromCommemorative = 0;
  let fromTrend = 0;
  let fromBank = 0;

  const expanded = expandScheduleAhead(now, opts.daysAhead);

  // Slots virtuais pra commem high priority em dias OFF (domingo).
  // Sem isso, Dia das Maes, Pais, Pascoa, Dia da Mulher etc. (que caem em domingo)
  // nunca gerariam post. Cria FEED_AM 10h + STORY 19h.
  for (const commem of upcoming) {
    if (commem.priority !== "high") continue;
    const commemDate = new Date(commem.fullDate + "T12:00:00");
    const dow = commemDate.getDay();
    const hasMatrixSlot = WEEKLY_SCHEDULE.some((e) => e.dayOfWeek === dow);
    if (!hasMatrixSlot && commemDate.getTime() > now.getTime()) {
      const commemPillar = (commem.pillar === "geral" ? "s" : commem.pillar) as Pillar;
      const virtuals = virtualSlotsForOffDay(commemDate, commemPillar, {
        preferredFormat: commem.preferredFormat,
        storyTemplateType: commem.storyTemplate?.type,
      });
      expanded.push(...virtuals);
    }
  }

  for (const { entry, date } of expanded) {
    const dKey = dateKey(date);
    const { slot, pillar } = entry;

    if (occupiedSlots.has(`${dKey}::${slot}`)) continue; // gap ja preenchido, silent skip

    const picked = pickContentForSlot(entry, dKey, commemorativeMap, trendsByPillar);
    if (!picked) {
      skipped.push({ day: dKey, slot, reason: `sem conteudo pro pilar ${pillar}` });
      continue;
    }
    if (picked.source === "commemorative") fromCommemorative++;
    else if (picked.source === "trend") fromTrend++;
    else fromBank++;

    try {
      await prisma.socialPost.create({
        data: {
          title: picked.built.title,
          content: picked.built.content,
          platform: "instagram",
          format: entry.format,
          pillar,
          slot,
          hashtags: picked.built.hashtags,
          imageBriefing: picked.built.imageBriefing,
          status: opts.status,
          scheduledAt: date,
          createdBy: opts.createdBy,
        },
      });
      occupiedSlots.add(`${dKey}::${slot}`);
      created.push({ day: dKey, slot, pillar, title: picked.built.title, source: picked.source });
    } catch (e) {
      skipped.push({ day: dKey, slot, reason: `erro ao salvar: ${(e as Error).message.slice(0, 80)}` });
    }
  }

  return { created, skipped, breakdown: { fromCommemorative, fromTrend, fromBank } };
}

// Gera UM substituto pro slot que acabou de ser liberado (delete de post futuro).
// Procura a entry da WEEKLY_SCHEDULE que case com o dayOfWeek + slot + hora do deletado.
export async function fillSingleSlot(opts: {
  scheduledAt: Date;
  slot: Slot;
  createdBy: string;
  status: "approved" | "draft";
}): Promise<{ ok: boolean; title?: string; source?: string; reason?: string }> {
  const { scheduledAt, slot } = opts;
  if (scheduledAt.getTime() <= Date.now()) {
    return { ok: false, reason: "data ja passou" };
  }

  const dow = scheduledAt.getDay();
  const entry = WEEKLY_SCHEDULE.find((e) => e.dayOfWeek === dow && e.slot === slot);
  if (!entry) return { ok: false, reason: "sem entry na matriz pra esse dia/slot" };

  const dKey = dateKey(scheduledAt);
  const occupied = await fetchOccupiedSlots(new Date(), 40);
  if (occupied.has(`${dKey}::${slot}`)) return { ok: false, reason: "slot ja ocupado por outro post" };

  const commemorativeMap = new Map(getUpcomingDates(30).map((d) => [d.fullDate, d]));
  const trendsByPillar = await getUnusedTrendsByPillar();
  const picked = pickContentForSlot(entry, dKey, commemorativeMap, trendsByPillar);
  if (!picked) return { ok: false, reason: `sem conteudo pro pilar ${entry.pillar}` };

  try {
    await prisma.socialPost.create({
      data: {
        title: picked.built.title,
        content: picked.built.content,
        platform: "instagram",
        format: entry.format,
        pillar: entry.pillar,
        slot,
        hashtags: picked.built.hashtags,
        imageBriefing: picked.built.imageBriefing,
        status: opts.status,
        scheduledAt,
        createdBy: opts.createdBy,
      },
    });
    return { ok: true, title: picked.built.title, source: picked.source };
  } catch (e) {
    return { ok: false, reason: (e as Error).message.slice(0, 80) };
  }
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
