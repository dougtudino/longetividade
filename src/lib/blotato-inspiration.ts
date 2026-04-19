// Inspiration via Perplexity dentro do Blotato.
// Usa source-resolutions-v3 com sourceType=perplexity-query pra trazer
// research de tendencias/hooks/posts virais do nicho. Salva resultado
// como AgentKnowledge pra Luna consumir nos posts semanais.

import { prisma } from "./prisma";
import {
  resolveSource,
  waitForSourceResolution,
} from "./blotato-client";

// Queries pre-definidas do nicho Longetividade
export const INSPIRATION_QUERIES = [
  {
    pillar: "s",
    query:
      "viral Instagram and TikTok content about intuitive eating and food freedom for women 35-55, last 14 days. List specific hooks, captions, and visual patterns. Focus on Brazilian Portuguese content if available.",
  },
  {
    pillar: "e",
    query:
      "viral content women emotional eating, body image positivity, mindfulness for weight loss without dieting, last 14 days. Hooks and patterns that resonate with women 35+.",
  },
  {
    pillar: "m",
    query:
      "viral fitness content for women 40+ about gentle daily movement, walking, low-impact exercise, last 14 days. Hooks that emphasize accessibility over extreme workouts.",
  },
];

export interface InspirationResult {
  pillar: string;
  query: string;
  ok: boolean;
  sourceId?: string;
  contentSnippet?: string;
  knowledgeId?: string;
  error?: string;
}

export async function runInspiration(): Promise<{
  total: number;
  succeeded: number;
  results: InspirationResult[];
}> {
  const results: InspirationResult[] = [];

  for (const item of INSPIRATION_QUERIES) {
    try {
      const started = await resolveSource({
        sourceType: "perplexity-query",
        text: item.query,
        customInstructions:
          "Format as actionable list. For each viral pattern: 1) hook text exato, 2) why it works, 3) suggestion to adapt for Brazilian women 35-55 audience interested in non-restrictive weight loss method.",
      });
      const completed = await waitForSourceResolution(started.id, {
        timeoutMs: 3 * 60_000,
        intervalMs: 4000,
      });

      const content = completed.content ?? "";
      if (!content) {
        results.push({
          pillar: item.pillar,
          query: item.query,
          ok: false,
          sourceId: started.id,
          error: "vazio (Perplexity nao retornou conteudo)",
        });
        continue;
      }

      // Salva como AgentKnowledge pra Luna consultar
      const knowledge = await prisma.agentKnowledge.create({
        data: {
          agentId: "luna",
          kind: "reference",
          title: `Inspiration Perplexity ${item.pillar.toUpperCase()} ${new Date().toISOString().slice(0, 10)}`,
          body: content.slice(0, 4000),
          source: "blotato-inspiration-perplexity",
          metadata: {
            pillar: item.pillar,
            query: item.query,
            sourceId: started.id,
            blotatoTitle: completed.title ?? null,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      results.push({
        pillar: item.pillar,
        query: item.query,
        ok: true,
        sourceId: started.id,
        contentSnippet: content.slice(0, 200),
        knowledgeId: knowledge.id,
      });

      // Delay 5s entre queries (rate limit)
      await new Promise((r) => setTimeout(r, 5000));
    } catch (err) {
      results.push({
        pillar: item.pillar,
        query: item.query,
        ok: false,
        error: (err as Error).message.slice(0, 300),
      });
    }
  }

  return {
    total: results.length,
    succeeded: results.filter((r) => r.ok).length,
    results,
  };
}
