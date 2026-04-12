import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUpcomingDates } from "@/lib/social-calendar-dates";
import { CONTENT_BANK, BEST_TIMES } from "@/lib/social-content-bank";

// POST /api/admin/social/generate-now
// Gera posts pra proxima semana (mesmo algoritmo do cron, mas acionado manualmente)
const WEEKLY_PILLARS = ["s", "e", "s", "m", "e", "promo"] as const;
const WEEKLY_FORMATS = ["carrossel", "stories", "reels", "reels", "imagem", "carrossel"] as const;
const DAY_OFFSETS = [1, 2, 3, 4, 5, 6];

export async function POST() {
  const now = new Date();
  let created = 0;
  const posts: Array<{ day: string; title: string; pillar: string }> = [];

  const upcoming = getUpcomingDates(7);
  const dateMap = new Map(upcoming.map((d) => [d.fullDate, d]));

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

    if (commemorative) {
      title = `${commemorative.name} — ${dateKey}`;
      content = commemorative.postIdea;
      hashtags = `${commemorative.hashtags} #metodosem #longetividade`;
      imageBriefing = `Imagem pra ${commemorative.name}. Paleta verde-oliva. Tom acolhedor.`;
    } else {
      const templates = CONTENT_BANK.filter((t) => t.pillar === pillar);
      const template = templates[Math.floor(Math.random() * templates.length)] ?? CONTENT_BANK[0];
      title = `${template.title} — ${dateKey}`;
      content = template.content;
      hashtags = template.hashtags;
      imageBriefing = template.imageBriefing;
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
      posts.push({ day: dateKey, title, pillar });
    } catch {
      // skip duplicates
    }
  }

  return NextResponse.json({ ok: true, created, posts });
}
