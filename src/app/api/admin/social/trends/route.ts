import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/social/trends
// Luna pesquisa trends da semana de saude/wellness/emagrecimento feminino
// via Claude API com web_search tool. Salva resultado em AgentKnowledge
// (agentId="luna", kind="reference") pra ser usado pelo generate-now.
//
// GET: retorna ultimas trends salvas

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

type TrendItem = {
  topic: string;
  angle: string;
  suggestedPillar: "s" | "e" | "m" | "promo";
  sourceUrl?: string;
};

type TrendsPayload = {
  generatedAt: string;
  weekOf: string;
  trends: TrendItem[];
  rawSummary: string;
};

async function callClaudeWithWebSearch(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nao configurada");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content
    ?.filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("\n")
    .trim();

  return text || "";
}

function buildPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return `Você é Luna, assistente de social media da marca Longetividade (emagrecimento
feminino sem dieta, método S.E.M — Simplicidade, Equilíbrio, Movimento).
Publico: mulheres 30-55 anos, Brasil.

Hoje é ${today}. Pesquise na web as principais tendências DESTA SEMANA em:
- Saúde feminina, bem-estar, emagrecimento saudável
- Alimentação intuitiva, reeducação alimentar
- Saúde mental (ansiedade, sono, autoestima)
- Movimento/exercícios funcionais
- Notícias relevantes de saúde que mulheres brasileiras estão comentando

Busque no Google Trends Brasil, Instagram (via web), blogs de saúde nacionais.

Retorne EXCLUSIVAMENTE um JSON válido neste formato (sem texto antes ou depois):
{
  "trends": [
    {
      "topic": "<tema curto em portugues>",
      "angle": "<angulo de conteudo que a Luna pode usar, 1-2 frases>",
      "suggestedPillar": "s|e|m|promo",
      "sourceUrl": "<url de referencia (opcional)>"
    },
    ...
  ],
  "rawSummary": "<resumo de 2-3 frases do que voce aprendeu dessa semana>"
}

Pilares:
- s = nutrição/alimentação
- e = emocional/saúde mental
- m = movimento/exercício
- promo = produto/lançamento

Retorne 5-8 trends, priorizando as mais acionáveis.`;
}

function parseTrends(raw: string): TrendItem[] {
  // Tenta extrair JSON do texto (Claude pode incluir markdown fence)
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < 0) return [];

  try {
    const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as {
      trends?: TrendItem[];
    };
    return parsed.trends ?? [];
  } catch {
    return [];
  }
}

export async function POST() {
  try {
    const raw = await callClaudeWithWebSearch(buildPrompt());
    const trends = parseTrends(raw);

    if (trends.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "Claude retornou sem JSON valido. Ver raw.",
        raw: raw.slice(0, 500),
      });
    }

    const now = new Date();
    const weekOf = now.toISOString().slice(0, 10);
    const payload: TrendsPayload = {
      generatedAt: now.toISOString(),
      weekOf,
      trends,
      rawSummary: raw.slice(0, 2000),
    };

    const bodyFormatted = trends
      .map(
        (t, i) =>
          `${i + 1}. [${t.suggestedPillar}] ${t.topic}\n   ${t.angle}${t.sourceUrl ? `\n   Fonte: ${t.sourceUrl}` : ""}`,
      )
      .join("\n\n");

    // Salva em AgentKnowledge (kind=reference) pra generate-now consumir
    await prisma.agentKnowledge.create({
      data: {
        agentId: "luna",
        kind: "reference",
        title: `Trends da semana ${weekOf}`,
        body: bodyFormatted,
        source: "luna-trends-websearch",
        metadata: JSON.parse(JSON.stringify(payload)),
      },
    });

    // Espelho em kind=learning pra aparecer em 📜 Logs (activity route le learnings)
    await prisma.agentKnowledge.create({
      data: {
        agentId: "luna",
        kind: "learning",
        title: `Pesquisa de trends — ${trends.length} topicos (${weekOf})`,
        body: bodyFormatted,
        source: "luna-trends-websearch",
        metadata: { count: trends.length, weekOf },
      },
    });

    return NextResponse.json({ ok: true, ...payload });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Retorna ultima trend salva (pra UI mostrar)
  const latest = await prisma.agentKnowledge.findFirst({
    where: { agentId: "luna", kind: "reference", source: "luna-trends-websearch" },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return NextResponse.json({ ok: false, error: "Nenhuma trend salva ainda" });
  }

  return NextResponse.json({
    ok: true,
    savedAt: latest.createdAt,
    title: latest.title,
    body: latest.body,
    payload: latest.metadata,
  });
}
