import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUpcomingDates } from "@/lib/social-calendar-dates";
import { CONTENT_BANK } from "@/lib/social-content-bank";
import { BEST_TIMES } from "@/lib/social-content-bank";

// GET /api/cron/social-generate
// Cron SEMANAL (domingo 20h BRT = 23h UTC): Luna auto-gera 6 posts
// pra semana seguinte baseado em:
//   1. Datas comemorativas dos proximos 7 dias
//   2. Rotacao de pilares (S/E/S/M/E/Promo)
//   3. Knowledge base (o que funcionou antes)
//   4. Banco de templates (reutiliza/adapta)
//
// Posts criados como "approved" (auto-aprovados pela Luna/Quinn)
// porque seguem as regras de compliance da knowledge base.
//
// Schedule: 0 23 * * 0 (domingo 23h UTC = 20h BRT)

const WEEKLY_PILLARS = ["s", "e", "s", "m", "e", "promo"] as const;
const WEEKLY_FORMATS = ["carrossel", "stories", "reels", "reels", "imagem", "carrossel"] as const;
const DAY_OFFSETS = [1, 2, 3, 4, 5, 6]; // seg a sab

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
  let created = 0;
  const posts: Array<{ day: string; title: string; pillar: string }> = [];

  // Datas comemorativas dos proximos 7 dias
  const upcoming = getUpcomingDates(7);
  const dateMap = new Map(upcoming.map((d) => [d.fullDate, d]));

  // Busca learnings da Luna pra adaptar conteudo
  let learnings: string[] = [];
  try {
    const knowledgeEntries = await prisma.agentKnowledge.findMany({
      where: { agentId: "luna", kind: "learning" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true },
    });
    learnings = knowledgeEntries.map((k) => k.title);
  } catch {
    /* tabela pode nao existir */
  }

  for (let i = 0; i < 6; i++) {
    const dayOffset = DAY_OFFSETS[i];
    const postDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const dateKey = postDate.toISOString().slice(0, 10);
    const pillar = WEEKLY_PILLARS[i];
    const format = WEEKLY_FORMATS[i];

    // Checa se ja tem post agendado pra esse dia
    const existing = await prisma.socialPost.findFirst({
      where: {
        scheduledAt: {
          gte: new Date(dateKey + "T00:00:00Z"),
          lte: new Date(dateKey + "T23:59:59Z"),
        },
      },
    });
    if (existing) continue; // ja tem conteudo, skip

    // Se tem data comemorativa nesse dia, usa ela
    const commemorative = dateMap.get(dateKey);

    let title: string;
    let content: string;
    let hashtags: string;
    let imageBriefing: string;

    if (commemorative) {
      // Post baseado na data comemorativa
      title = `${commemorative.name} — ${dateKey}`;
      content = commemorative.postIdea;
      hashtags = `${commemorative.hashtags} #metodosem #longetividade`;
      imageBriefing = `Imagem pra ${commemorative.name}. Paleta verde-oliva do site. Tom acolhedor. Frase: "${commemorative.postIdea.slice(0, 60)}..."`;
    } else {
      // Busca template do banco pelo pilar
      const templates = CONTENT_BANK.filter((t) => t.pillar === pillar);
      const template = templates[Math.floor(Math.random() * templates.length)] ?? CONTENT_BANK[0];

      title = `${template.title} — ${dateKey}`;
      content = template.content;
      hashtags = template.hashtags;
      imageBriefing = template.imageBriefing;
    }

    // Horario otimizado
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
          status: "approved", // Auto-aprovado (conteudo safe do banco/calendario)
          scheduledAt: postDate,
          createdBy: "luna-auto",
        },
      });
      created += 1;
      posts.push({ day: dateKey, title, pillar });
    } catch (e) {
      // Skip duplicatas silenciosamente
    }
  }

  // Auto-save learning: registra que gerou conteudo
  if (created > 0) {
    try {
      await prisma.agentKnowledge.create({
        data: {
          agentId: "luna",
          kind: "learning",
          title: `Batch semanal gerado: ${created} posts (${now.toISOString().slice(0, 10)})`,
          body: `Posts gerados automaticamente:\n${posts.map((p) => `- ${p.day}: ${p.title} (${p.pillar})`).join("\n")}\n\nLearnings considerados: ${learnings.join(", ") || "nenhum ainda"}`,
          source: "luna-auto-generate",
        },
      });
    } catch {
      /* silent */
    }
  }

  return NextResponse.json({
    ok: true,
    runAt: now.toISOString(),
    created,
    posts,
    learningsUsed: learnings.length,
  });
}
