// Uma — variante pra Meta Ads Creative (nao depende de SocialPost).
// Recebe um briefing livre do admin e retorna template+prompt enriquecido.

import { prisma } from "../prisma";
import { getCachedTemplates } from "../blotato-templates-sync";
import { parseLlmJson } from "./llm-json";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

// Fallback hardcoded pra quando cache DB estiver vazio.
const AD_TEMPLATE_FALLBACK = [
  { id: "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0", description: "Single Centered Text Quote (impacto, frase forte)", slots: ["AD_FEED"] },
  { id: "ae868019-820d-434c-8fe1-74c9da99129a", description: "Whiteboard Infographic (educativo, lista)", slots: ["AD_STORY", "AD_FEED"] },
  { id: "53cfec04-2500-41cf-8cc1-ba670d2c341a", description: "Instagram Carousel Slideshow (multi-card, conta historia)", slots: ["AD_FEED"] },
  { id: "76b3b959-bdbe-440d-8428-984219353f18", description: "Billboard Infographic (frase enorme, impacto visual)", slots: ["AD_FEED"] },
  { id: "07a5b5c5-387c-49e3-86b1-de822cd2dfc7", description: "Newspaper Infographic (jornalistico, tom autoridade)", slots: ["AD_FEED"] },
  { id: "b88c8273-6406-48c6-85e7-096119aefe30", description: "Book Page Infographic (literario, aspiracional)", slots: ["AD_FEED"] },
  { id: "d9495026-3945-44f6-8b44-07c28c492e6d", description: "Classroom Chalkboard Infographic (didatico, blackboard look)", slots: ["AD_FEED"] },
  { id: "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1", description: "Quote Card Carousel with Paper Background and Highlight", slots: ["AD_FEED"] },
  { id: "/base/v2/tutorial-carousel/2491f97b-1b47-4efa-8b96-8c651fa7b3d5/v1", description: "Tutorial Carousel Minimalist Flat (passo-a-passo)", slots: ["AD_FEED"] },
  { id: "/base/v2/tutorial-carousel/e095104b-e6c5-4a81-a89d-b0df3d7c5baf/v1", description: "Tutorial Carousel Monocolor (minimal)", slots: ["AD_FEED"] },
  { id: "/base/v2/images-with-text/3ed4bb92-dbfe-45e6-9dc8-605b77f70506/v1", description: "Video of Images and Text Minimal (vertical visual)", slots: ["AD_STORY", "AD_FEED"] },
  { id: "/base/v2/images-with-text/c9892c3b-fa75-4ade-821a-a50ff8456230/v1", description: "When X then Y Text Slideshow (reflexivo, before/after de HABITO)", slots: ["AD_STORY"] },
];

// Le catalog cachado (synced do Blotato), classifica por slot AD_*.
async function getAdTemplateCatalog(): Promise<
  Array<{ id: string; description: string; slots: string[] }>
> {
  try {
    const cached = await getCachedTemplates({ autoSyncIfEmpty: true });
    if (cached.length > 0) {
      // Filtra so imagens (ads normalmente usam estatico; video ads sao opcionais)
      return cached
        .filter((t) => t.type !== "video")
        .map((t) => {
          const descLower = (t.description ?? "").toLowerCase();
          const nameLower = (t.name ?? "").toLowerCase();
          const isVertical =
            t.aspectRatio === "9:16" ||
            /story|vertical|9:16/.test(nameLower + descLower);
          return {
            id: t.id,
            description: t.name + (t.description ? ` — ${t.description.slice(0, 140)}` : ""),
            slots: isVertical ? ["AD_STORY"] : ["AD_FEED"],
          };
        });
    }
  } catch (err) {
    console.warn("[uma-creative] fallback pro catalog hardcoded:", (err as Error).message);
  }
  return AD_TEMPLATE_FALLBACK;
}

export interface UmaCreativeBrief {
  enrichedBriefing: string;
  templateId: string;
  templateRationale: string;
  colorPalette: string;
  mood: string;
  textOverlay?: string;
  reasoning: string;
}

interface CreativeBriefingInput {
  collectionName: string;
  briefing: string;
  angle?: "dor" | "prova" | "objecao" | "promessa" | "cta";
  headline?: string;
  cta?: string;
  slot: "AD_FEED" | "AD_STORY" | "AD_BANNER";
}

async function fetchKnowledgeForCreative(): Promise<string> {
  // Lean: so o essencial. blotato-templates cache NAO entra aqui (so nos templates do prompt).
  const [persona, compliance, learnings] = await Promise.all([
    prisma.agentKnowledge.findFirst({
      where: { agentId: "luna", kind: "fact", title: { contains: "persona", mode: "insensitive" } },
      select: { body: true },
    }),
    prisma.agentKnowledge.findFirst({
      where: { agentId: "luna", kind: "policy" },
      select: { body: true },
    }),
    prisma.agentKnowledge.findMany({
      where: {
        agentId: "uma",
        source: "uma-learnings",
        createdAt: { gte: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
      },
      select: { title: true, body: true },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
  ]);

  const parts: string[] = [];
  if (persona) parts.push(`## Persona\n${persona.body.slice(0, 500)}`);
  if (compliance) parts.push(`## Compliance\n${compliance.body.slice(0, 300)}`);
  if (learnings.length) {
    parts.push(
      `## Aprendizado recente\n` +
        learnings.map((l) => `${l.title}: ${l.body.slice(0, 300)}`).join("\n")
    );
  }
  return parts.join("\n\n");
}

const SYSTEM_PROMPT = `Voce e Uma — UX/UI Designer do Longetividade, agora operando em modo **Meta Ads Creative**.

Papel: transformar briefing de campanha (dor, objecao, prova, promessa, CTA) em creative Meta Ad, escolhendo template Blotato + prompt visual rico.

Marca Longetividade (ebook emagrecimento feminino sem dieta, Metodo S.E.M):
- Paleta: verde-oliva (#5C6B4D) + off-white (#F4EFE4) + toques terrosos
- Tom: acolhedor, sem culpa, sem "dieta milagrosa", sem antes/depois de corpo
- Publico: mulheres 30-55 BR

Meta Ad Policy (CRITICO — mais restritivo que post organico):
- NAO use antes/depois de corpo
- NAO prometa resultado fisico especifico
- NAO use "perca 10kg", "cure", "elimine celulite"
- Headline curta, CTA claro, visual legivel em mobile small
- Imagem NAO pode ter texto dominando (Meta penaliza >20% texto)

Retorne APENAS JSON:
{
  "enrichedBriefing": string (4-8 linhas),
  "templateId": string (um dos IDs da lista),
  "templateRationale": string (1 frase),
  "colorPalette": string,
  "mood": string (1-3 palavras),
  "textOverlay": string (curto, <= 6 palavras — idealmente headline),
  "reasoning": string (1-2 frases explicando escolha)
}`;

export async function buildVisualBriefForBriefing(
  input: CreativeBriefingInput
): Promise<UmaCreativeBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nao configurada");

  const catalog = await getAdTemplateCatalog();
  const eligible = catalog.filter((t) => t.slots.includes(input.slot));
  // CAP 12 templates pra manter o prompt enxuto (~1.5k tokens).
  // Rate limit Anthropic: 30k input tokens/min; com 40+ templates mandamos 5-8k so na lista.
  const templatesForPrompt = (eligible.length ? eligible : catalog).slice(0, 12);

  const knowledge = await fetchKnowledgeForCreative();

  const userPrompt = `# Creative Meta Ad a criar

- Colecao: ${input.collectionName}
- Slot Meta: ${input.slot}
- Angulo: ${input.angle ?? "(nao especificado)"}
- Headline proposta: ${input.headline ?? "(vazio — Uma pode sugerir em textOverlay)"}
- CTA: ${input.cta ?? "(vazio)"}

## Briefing bruto do admin
${input.briefing}

## Contexto (knowledge base)
${knowledge || "(knowledge vazia)"}

## Templates Blotato elegiveis pra ${input.slot}
${templatesForPrompt.map((t) => `- ${t.id}: ${t.description}`).join("\n")}

Responda o JSON.`;

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    // 429 rate limit: espera 30s e tenta uma vez
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 30_000));
      const retry = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });
      if (!retry.ok) {
        const rt = await retry.text().catch(() => "");
        throw new Error(`Uma (creative) Claude ${retry.status} apos retry: ${rt.slice(0, 300)}`);
      }
      const retryData = (await retry.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const retryRaw =
        retryData.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim() ?? "";
      let brief: UmaCreativeBrief;
      try {
        brief = parseLlmJson<UmaCreativeBrief>(retryRaw);
      } catch (err) {
        throw new Error(`Uma retornou JSON invalido: ${retryRaw.slice(0, 300)} (${(err as Error).message})`);
      }
      if (!brief.templateId || !brief.enrichedBriefing) {
        throw new Error(`Uma retornou brief incompleto: ${JSON.stringify(brief).slice(0, 300)}`);
      }
      const templateOk = catalog.some((t) => t.id === brief.templateId);
      if (!templateOk) {
        brief.templateId = (eligible[0] ?? catalog[0]).id;
        brief.templateRationale = `[fallback] ${brief.templateRationale ?? ""}`;
      }
      return brief;
    }
    throw new Error(`Uma (creative) Claude ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const raw =
    data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim() ?? "";

  let brief: UmaCreativeBrief;
  try {
    brief = parseLlmJson<UmaCreativeBrief>(raw);
  } catch (err) {
    throw new Error(`Uma retornou JSON invalido: ${raw.slice(0, 300)} (${(err as Error).message})`);
  }
  if (!brief.templateId || !brief.enrichedBriefing) {
    throw new Error(`Uma retornou brief incompleto: ${JSON.stringify(brief).slice(0, 300)}`);
  }
  const templateOk = AD_TEMPLATE_FALLBACK.some((t) => t.id === brief.templateId);
  if (!templateOk) {
    brief.templateId = (eligible[0] ?? AD_TEMPLATE_FALLBACK[0]).id;
    brief.templateRationale = `[fallback] ${brief.templateRationale ?? ""}`;
  }
  return brief;
}
