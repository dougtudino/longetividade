// Uma — variante pra Meta Ads Creative (nao depende de SocialPost).
// Recebe um briefing livre do admin e retorna template+prompt enriquecido.

import { prisma } from "../prisma";
import { getCachedTemplates } from "../blotato-templates-sync";
import { callClaudeWithTool } from "./llm-json";

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

// Legacy Infographics do Blotato — templates antigos com validacao strict
// (description max 500, inputs obrigatorios). Tendem a falhar server-side
// quando a gente manda so prompt livre. Excluidos do default pra evitar 400.
// Doc oficial categoriza ~20 como "Legacy Infographics".
const LEGACY_KEYWORDS =
  /whiteboard|chalkboard|book page|newspaper|billboard infographic|classroom/i;

// Le catalog cachado (synced do Blotato), classifica por slot AD_*.
// Exclui Legacy Infographics pra reduzir taxa de falha.
async function getAdTemplateCatalog(): Promise<
  Array<{ id: string; description: string; slots: string[] }>
> {
  try {
    const cached = await getCachedTemplates({ autoSyncIfEmpty: true });
    if (cached.length > 0) {
      return cached
        .filter((t) => t.type !== "video")
        .filter((t) => {
          // Exclui Legacy Infographics
          const text = ((t.name ?? "") + " " + (t.description ?? "")).toLowerCase();
          return !LEGACY_KEYWORDS.test(text);
        })
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
  style?:
    | "auto"
    | "talking-head"
    | "slideshow"
    | "quote-card"
    | "infographic"
    | "carousel";
}

// Filtra catalog por estilo de video/imagem. Heuristica baseada em
// nome/description do template (Blotato nao tem campo `style`).
//
// IMPORTANTE: talking-head exclui "AI Selfie Talking" (57f5a565) porque
// esse template precisa de avatar pre-configurado no dashboard Blotato.
// Usa "AI Avatar B-roll" que auto-gera avatar a partir do prompt.
function filterByStyle(
  templates: Array<{ id: string; description: string; slots: string[] }>,
  style?: CreativeBriefingInput["style"]
): Array<{ id: string; description: string; slots: string[] }> {
  if (!style || style === "auto") return templates;
  const patterns: Record<string, RegExp> = {
    // So "avatar" + "b-roll" — NAO selfie (precisa avatar pre-setup)
    "talking-head": /avatar.*b-?roll|ai avatar/i,
    slideshow: /slideshow|image.*text|images.*text/i,
    "quote-card": /quote|centered text|quote card/i,
    infographic: /infographic|whiteboard|chalkboard|billboard|newspaper|book page/i,
    carousel: /carousel|tutorial|nano banana/i,
  };
  const re = patterns[style];
  if (!re) return templates;
  const filtered = templates.filter((t) => re.test(t.description));
  return filtered.length > 0 ? filtered : templates;
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

const SYSTEM_PROMPT = `Voce e Uma — Design Director de DIRECT RESPONSE pro Longetividade.

Seu papel NAO e fazer arte bonita. E fazer creative que CONVERTE.
Criativo que converte tem:
1. HOOK visual que para o scroll em 3 segundos (nao editorial polido demais)
2. IDENTIFICACAO rapida (a pessoa sente "e pra mim")
3. DIFERENCIAL CLARO (nao generico)
4. CTA especifico e visivel

Marca Longetividade (ebook emagrecimento feminino, Metodo S.E.M):
- Paleta: verde-oliva (#5C6B4D) + off-white (#F4EFE4) + toques terrosos
- Tom: acolhedor mas DIRETO — sem culpa, sem vitimizar, sem abstrair
- Publico: mulheres 30-55 BR que ja tentaram dietas

Meta Ad Policy (BLOCK se violar):
- NAO antes/depois de corpo
- NAO promessa quantitativa ("perca X kg")
- NAO "cure", "elimine celulite", "dieta milagrosa"
- Headline <= 40 chars (corta em mobile)
- Texto na imagem <= 20% area (Meta penaliza)

PRINCIPIOS DE ESCOLHA DE TEMPLATE:
- Single image = OK pra hot audience (oferta direta)
- Carousel = MELHOR pra cold (storytelling educacional)
- Talking head = prova social, UGC-style
- Infographic = educar diferencial
- **EVITE** "Quote Card Simples / Single Centered Text" (fundo branco + frase) —
  visualmente fraco, CTR baixo. Use so se o brief exige 1 frase isolada.
- **PREFIRA** "Image Slideshow with Text", "Tutorial Carousel", "Quote Card
  with Paper Background" (visuais ricos)

EVITE (creatives que NAO convertem):
- Frases abstratas ("voce merece leveza") — vago demais
- Estetica editorial polida demais — parece marca corporativa
- CTA "Saiba mais" — generico, Meta penaliza
- Briefing que descreve SENTIMENTO sem cena — Blotato gera fundo vazio
- **NUNCA** use notacao "S1:", "S2:", "Slide 1:" dentro do enrichedBriefing.
  Blotato le isso como TEXTO LITERAL no creative final. Em vez disso,
  descreva UMA cena visual unica que representa o conceito inteiro,
  mesmo que o brief original mencione multiplos slides.

FACA (creatives que CONVERTEM):
- Cena concreta (mulher + ambiente + objeto)
- Headline com pergunta OU numero OU negacao especifica
- CTA tangivel ("Baixe o ebook + 30 receitas")
- Prova especifica ("1.247 mulheres em 2025")

enrichedBriefing DEVE ser CURTO (<250 chars). Seja direta.

Chame submit_visual_brief.`;

export async function buildVisualBriefForBriefing(
  input: CreativeBriefingInput
): Promise<UmaCreativeBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nao configurada");

  const catalog = await getAdTemplateCatalog();
  const catalogByStyle = filterByStyle(catalog, input.style);
  const eligible = catalogByStyle.filter((t) => t.slots.includes(input.slot));
  // CAP 12 templates pra manter o prompt enxuto (~1.5k tokens).
  // Rate limit Anthropic: 30k input tokens/min; com 40+ templates mandamos 5-8k so na lista.
  const templatesForPrompt = (eligible.length ? eligible : catalogByStyle.length ? catalogByStyle : catalog).slice(0, 12);

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

Chame submit_visual_brief.`;

  const schemaToolCall = async () =>
    callClaudeWithTool<UmaCreativeBrief>({
      apiKey,
      model: MODEL,
      maxTokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      userPrompt,
      toolName: "submit_visual_brief",
      toolDescription:
        "Submete brief visual + template Blotato pra gerar creative Meta Ad",
      schema: {
        type: "object",
        properties: {
          enrichedBriefing: {
            type: "string",
            description: "Briefing visual CURTO (max 250 chars, 3-4 linhas). Nao escrever paragrafo longo — templates validam tamanho.",
          },
          templateId: { type: "string" },
          templateRationale: { type: "string" },
          colorPalette: { type: "string" },
          mood: { type: "string" },
          textOverlay: { type: "string", description: "Texto curto pra aparecer no visual, <= 6 palavras" },
          reasoning: { type: "string" },
        },
        required: ["enrichedBriefing", "templateId", "templateRationale", "colorPalette", "mood", "reasoning"],
      },
    });

  let brief: UmaCreativeBrief;
  try {
    brief = await schemaToolCall();
  } catch (err) {
    const e = err as Error & { status?: number };
    // Retry 1x em 429 apos 30s
    if (e.status === 429) {
      await new Promise((r) => setTimeout(r, 30_000));
      brief = await schemaToolCall();
    } else {
      throw err;
    }
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
