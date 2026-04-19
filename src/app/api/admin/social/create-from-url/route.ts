import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  resolveSource,
  waitForSourceResolution,
  type BlotatoSourceType,
} from "@/lib/blotato-client";

// POST /api/admin/social/create-from-url
// Workflow Submit→Poll→Result do Blotato pra criar SocialPost a partir
// de URL viral (TikTok, YouTube, Article, PDF).
//
// 1. source-resolutions-v3 extrai conteudo
// 2. Claude adapta pro Longetividade (sem copiar)
// 3. Cria SocialPost(draft) com slot/pillar escolhidos
// 4. Admin aprova → cron blotato-generate-media gera arte com pipeline rica
//
// Body: {
//   sourceType: "youtube"|"tiktok"|"article"|"pdf"|"audio"|"twitter",
//   url: string,
//   slot: "FEED_AM"|"REEL"|"STORY",
//   pillar: "s"|"e"|"m"|"promo"
// }

const VALID_SOURCE_TYPES = ["youtube", "tiktok", "article", "pdf", "audio", "twitter"];

async function adaptForLongetividade(
  sourceContent: string,
  sourceTitle: string | undefined,
  slot: string,
  pillar: string
): Promise<{ title: string; content: string; hashtags: string; imageBriefing: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Sem Claude — devolve passthrough cru
    return {
      title: sourceTitle?.slice(0, 80) ?? "Conteúdo de URL externa",
      content: sourceContent.slice(0, 1500),
      hashtags: "#metodosem #longetividade",
      imageBriefing: "Adaptado de URL externa — revisar e ajustar.",
    };
  }

  const prompt = `Voce eh Luna, agente editorial do Longetividade (ebook emagrecimento feminino, mulheres 30-55 BR, Metodo S.E.M).

Adapte o conteudo abaixo (extraido de ${sourceTitle ?? "URL externa"}) pra um post Longetividade no slot ${slot}, pilar ${pillar}.

NUNCA copie o conteudo original. Use como inspiracao pra:
1. Identificar a INSIGHT central
2. Reescrever com voz Longetividade (acolhedora, sem culpa, direto)
3. Adaptar pro publico mulher 30-55 BR

Meta Ad Policy: nada de antes/depois corpo, sem claim quantitativo, sem "cure/elimine".

CONTEUDO ORIGINAL:
${sourceContent.slice(0, 3000)}

Responda APENAS JSON:
{
  "title": "string (max 80 chars)",
  "content": "string (300-800 chars, copy do post)",
  "hashtags": "string (#tag1 #tag2 #metodosem #longetividade)",
  "imageBriefing": "string (briefing visual em portugues, 100-200 chars)"
}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Claude ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = (await r.json()) as { content?: Array<{ type: string; text?: string }> };
  const raw =
    data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n") ?? "";
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(jsonStr) as {
    title: string;
    content: string;
    hashtags: string;
    imageBriefing: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      sourceType?: string;
      url?: string;
      slot?: string;
      pillar?: string;
    };
    if (!body.sourceType || !body.url) {
      return NextResponse.json(
        { ok: false, error: "sourceType e url obrigatorios" },
        { status: 400 }
      );
    }
    if (!VALID_SOURCE_TYPES.includes(body.sourceType)) {
      return NextResponse.json(
        { ok: false, error: `sourceType invalido. Use: ${VALID_SOURCE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
    const slot = body.slot ?? "FEED_AM";
    const pillar = body.pillar ?? "s";
    const startedAt = Date.now();

    // 1. Submit source resolution
    console.log(`[create-from-url] resolveSource ${body.sourceType} ${body.url}`);
    const started = await resolveSource({
      sourceType: body.sourceType as BlotatoSourceType,
      url: body.url,
    });

    // 2. Poll ate completed
    const completed = await waitForSourceResolution(started.id, {
      timeoutMs: 3 * 60_000,
      intervalMs: 3000,
    });
    const sourceContent = completed.content ?? "";
    if (!sourceContent) {
      return NextResponse.json(
        { ok: false, error: "Source completou mas retornou conteudo vazio" },
        { status: 500 }
      );
    }

    // 3. Claude adapta pro Longetividade
    const adapted = await adaptForLongetividade(sourceContent, completed.title, slot, pillar);

    // 4. Cria SocialPost(draft)
    const formatBySlot = slot === "REEL" ? "reels" : slot === "STORY" ? "stories" : "imagem";
    const post = await prisma.socialPost.create({
      data: {
        title: adapted.title,
        content: adapted.content,
        platform: "instagram",
        format: formatBySlot,
        pillar,
        slot,
        hashtags: adapted.hashtags,
        imageBriefing: `${adapted.imageBriefing}\n\n[fonte: ${body.sourceType}:${body.url.slice(0, 80)}]`,
        status: "draft",
        createdBy: "create-from-url",
      },
    });

    return NextResponse.json({
      ok: true,
      postId: post.id,
      sourceTitle: completed.title,
      contentExcerpt: sourceContent.slice(0, 200),
      adapted: {
        title: adapted.title,
        contentLength: adapted.content.length,
      },
      elapsedMs: Date.now() - startedAt,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
