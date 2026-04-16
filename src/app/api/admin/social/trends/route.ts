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
  hook?: string;
  keyPoints?: string[];
  dataPoint?: string;
  body?: string;
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
      max_tokens: 6000,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 8,
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

async function buildPrompt(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);

  // Puxa o playbook core (regras do algoritmo) pra Luna priorizar trends
  // que funcionam em cada formato (reel/carrossel/story).
  const playbookRules = await prisma.agentKnowledge.findMany({
    where: { agentId: "luna", source: "luna-playbook", kind: "rule" },
    select: { title: true, body: true },
    take: 8,
  });
  const playbookBlock = playbookRules.length
    ? `\n\nBIBLIA DA LUNA (consultar SEMPRE antes de sugerir trend):\n${playbookRules.map((r) => `## ${r.title}\n${r.body}`).join("\n\n")}\n\n`
    : "";

  return `Você é uma redatora editorial experiente (não uma IA genérica). Escreve pra marca
Longetividade — emagrecimento feminino sem dieta, método S.E.M (Simplicidade, Equilíbrio,
Movimento). Publico: mulheres 30-55 anos, Brasil. Tom: acolhedor, jornalístico, sem frases
de IA tipo "Em conclusão" ou "É importante notar". Evita emojis demais e exclamação.
${playbookBlock}
Hoje é ${today}. Pesquise NA WEB (use o web_search várias vezes) as principais tendências
DESTA SEMANA em saúde feminina, nutrição, reeducação alimentar, saúde mental, movimento,
e notícias de saúde que mulheres brasileiras estão comentando agora.

Priorize fontes confiáveis (G1 Saúde, Veja Saúde, Folha, Exame, VivaBem, Instagram de
nutricionistas e psicólogas reconhecidas). Evite clickbait e "7 segredos pra emagrecer".

Pra cada trend, escreva MATERIAL EDITORIAL RICO que sirva de base pra um post. Não me
dê só "topic+angle" genérico — me dê dados, contexto, estatística quando houver. Pense
que eu vou publicar esse conteúdo no Instagram.

Retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem texto antes/depois):
{
  "trends": [
    {
      "topic": "<tema curto e específico, max 60 chars, sem clickbait>",
      "angle": "<como a Longetividade aborda isso (1 frase)>",
      "suggestedPillar": "s|e|m|promo",
      "hook": "<primeira frase do post, pega a atenção, sem 'Você sabia que'>",
      "keyPoints": ["<ponto 1 com dado/fato>", "<ponto 2>", "<ponto 3>"],
      "dataPoint": "<uma estatística/dado concreto com fonte quando possível>",
      "body": "<2-3 parágrafos de texto corrido que podem virar copy de carrossel/feed. Linguagem humana, exemplos reais, zero jargão>",
      "sourceUrl": "<url da fonte principal>"
    }
  ],
  "rawSummary": "<resumo 2-3 frases do que você aprendeu essa semana>"
}

Pilares:
- s = nutrição/alimentação
- e = emocional/saúde mental
- m = movimento/exercício
- promo = produto/lançamento

Retorne 5-8 trends, priorizando as mais acionáveis e com dado concreto.`;
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
    const raw = await callClaudeWithWebSearch(await buildPrompt());
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
