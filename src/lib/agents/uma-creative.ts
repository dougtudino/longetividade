// Uma — variante pra Meta Ads Creative (nao depende de SocialPost).
// Recebe um briefing livre do admin e retorna template+prompt enriquecido.

import { prisma } from "../prisma";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

// Catalogo reduzido — apenas templates aptos pra AD_*.
// Sincronizado com uma.ts TEMPLATE_CATALOG (filtrado por suits AD_*).
const AD_TEMPLATE_CATALOG = [
  { id: "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0", description: "Single Centered Text Quote", slots: ["AD_FEED"] },
  { id: "ae868019-820d-434c-8fe1-74c9da99129a", description: "Whiteboard Infographic", slots: ["AD_STORY"] },
  { id: "53cfec04-2500-41cf-8cc1-ba670d2c341a", description: "Instagram Carousel Slideshow", slots: ["AD_FEED"] },
  { id: "76b3b959-bdbe-440d-8428-984219353f18", description: "Billboard Infographic (impacto)", slots: ["AD_FEED"] },
  { id: "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1", description: "Quote Card Carousel with Paper Background", slots: ["AD_FEED"] },
  { id: "/base/v2/tutorial-carousel/2491f97b-1b47-4efa-8b96-8c651fa7b3d5/v1", description: "Tutorial Carousel Minimalist Flat", slots: ["AD_FEED"] },
  { id: "/base/v2/nano-banana-carousel/nb2-premium-v1/v1", description: "Nano Banana 2 Premium Carousel (editorial)", slots: ["AD_FEED"] },
  { id: "/base/v2/nano-banana-carousel/nb2-soft-pastel/v1", description: "Nano Banana 2 Soft Pastel (feminino)", slots: ["AD_FEED"] },
  { id: "/base/v2/images-with-text/3ed4bb92-dbfe-45e6-9dc8-605b77f70506/v1", description: "Video of Images and Text Minimal", slots: ["AD_FEED", "AD_STORY"] },
  { id: "/base/v2/story-cta/stcta-01-v1/v1", description: "Story CTA Vertical with Swipe-up", slots: ["AD_STORY"] },
  { id: "/base/v2/ad-single/adf-pain-v1/v1", description: "Ad Single Pain-Point (dor + micro-beneficio + CTA)", slots: ["AD_FEED"] },
  { id: "/base/v2/ad-single/adf-prova-v1/v1", description: "Ad Single Social Proof (depoimento + numero)", slots: ["AD_FEED"] },
  { id: "/base/v2/ad-single/adf-objecao-v1/v1", description: "Ad Single Quebra Objecao (mito vs verdade)", slots: ["AD_FEED"] },
];

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
  const [persona, compliance, learnings, umaRefs] = await Promise.all([
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
      take: 2,
    }),
    prisma.agentKnowledge.findMany({
      where: { agentId: "uma" },
      select: { title: true, body: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const parts: string[] = [];
  if (persona) parts.push(`## Persona da audiencia\n${persona.body.slice(0, 700)}`);
  if (compliance) parts.push(`## Compliance bordas\n${compliance.body.slice(0, 400)}`);
  if (learnings.length) {
    parts.push(
      `## Aprendizados de templates (por engagement real)\n` +
        learnings.map((l) => `${l.title}\n${l.body.slice(0, 400)}`).join("\n\n")
    );
  }
  if (umaRefs.length) {
    parts.push(
      `## Minhas referencias\n` +
        umaRefs.map((r) => `- ${r.title}\n${r.body.slice(0, 300)}`).join("\n\n")
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

  const eligible = AD_TEMPLATE_CATALOG.filter((t) => t.slots.includes(input.slot));
  const templatesForPrompt = eligible.length ? eligible : AD_TEMPLATE_CATALOG;

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
    throw new Error(`Uma (creative) Claude ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const raw =
    data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim() ?? "";
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  let brief: UmaCreativeBrief;
  try {
    brief = JSON.parse(jsonStr) as UmaCreativeBrief;
  } catch (err) {
    throw new Error(`Uma retornou JSON invalido: ${jsonStr.slice(0, 300)} (${(err as Error).message})`);
  }
  if (!brief.templateId || !brief.enrichedBriefing) {
    throw new Error(`Uma retornou brief incompleto: ${JSON.stringify(brief).slice(0, 300)}`);
  }
  const templateOk = AD_TEMPLATE_CATALOG.some((t) => t.id === brief.templateId);
  if (!templateOk) {
    brief.templateId = (eligible[0] ?? AD_TEMPLATE_CATALOG[0]).id;
    brief.templateRationale = `[fallback] ${brief.templateRationale ?? ""}`;
  }
  return brief;
}
