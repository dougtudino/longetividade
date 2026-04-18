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
  // Pra templates de slideshow multi-cena, Uma pode retornar slides estruturados.
  // Cada slide vira 1 cena no carrossel com imagem AI + texto overlay.
  slides?: Array<{ imagePrompt: string; textOverlay: string }>;
  // Pra Quote Carousel, Uma retorna array de quotes.
  quotes?: string[];
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
  // MINIMO viavel — rate limit Anthropic 30k tokens/min exige prompt leve.
  // Total alvo: ~600 chars (persona+compliance+learning); playbook completo fica
  // apenas em knowledge (Uma pode consultar nos IDs/shapes que estao no prompt
  // reduzido logo abaixo).
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
  if (persona) parts.push(`## Persona\n${persona.body.slice(0, 300)}`);
  if (compliance) parts.push(`## Compliance\n${compliance.body.slice(0, 200)}`);
  if (learnings.length) {
    parts.push(
      `## Aprendizado\n${learnings[0].title}: ${learnings[0].body.slice(0, 150)}`
    );
  }
  return parts.join("\n\n");
}

const SYSTEM_PROMPT = `Voce e Uma — Design Director de Direct Response do Longetividade (ebook emagrecimento feminino, Metodo S.E.M).

Marca: verde-oliva + off-white + terroso. Tom acolhedor mas direto. Publico: mulheres 30-55 BR.

Meta Ad Policy BLOCK: antes/depois de corpo, claim quantitativo ("perca 10kg"), "cure/elimine celulite/dieta milagrosa". Headline <=40 chars.

⚠️ QUALIDADE DE PROMPT (CRITICO):
Toda imagePrompt DEVE ser:
- EM INGLES (Blotato/AI model usa ingles): "Brazilian woman in her 40s, warm natural kitchen..."
- ESPECIFICA: idade exata, etnia brasileira, ambiente real, iluminacao, objetos concretos
- FIEL AO BRIEFING: nao invente temas (nada de animais, paisagens genericas). Cada slide deve ter clara relacao com o angulo do briefing.
- ESTILO: editorial photography, warm natural lighting, authentic Brazilian setting

textOverlay DEVE ser:
- EM PORTUGUES SEMPRE ("Não conto caloria." não "I don't count calories")
- CURTO: <= 5 palavras ideal, <= 40 chars maximo
- DIRETO, sem abstracao

TEMPLATES PRIORITARIOS:
- Image Slideshow (5903b592) → slides:[{imagePrompt, textOverlay}]. Default carrossel.
- Quote Card Paper (f941e306) → quotes:[] (10-500 chars, em portugues).
- Tweet Card (ba413be6) → quotes:[] (10-280 chars, em portugues).
- Tutorial Carousel (2491f97b) → passo-a-passo com CTA.
- AI Video AI Voice (5903fe43) → reel narrado.

EVITE: Single Centered Text (9f4e66cd), Whiteboard legacy, AI Selfie sem avatar.

NUNCA "S1:", "Slide 1:" no enrichedBriefing. Descreva UMA cena concreta (<200 chars).

Chame submit_visual_brief.`;

export async function buildVisualBriefForBriefing(
  input: CreativeBriefingInput
): Promise<UmaCreativeBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nao configurada");

  const catalog = await getAdTemplateCatalog();
  const catalogByStyle = filterByStyle(catalog, input.style);
  const eligible = catalogByStyle.filter((t) => t.slots.includes(input.slot));
  // CAP 8 templates pra manter o prompt leve — rate limit Anthropic 30k/min.
  // System prompt ja tem os UUIDs dos templates prioritarios; lista aqui so
  // enriquece com nomes curtos pra contexto.
  const templatesForPrompt = (eligible.length ? eligible : catalogByStyle.length ? catalogByStyle : catalog).slice(0, 8);

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

## Templates adicionais disponiveis (alem dos prioritarios do system)
${templatesForPrompt.map((t) => `- ${t.id.slice(0, 50)}: ${t.description.slice(0, 80)}`).join("\n")}

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
            description: "Briefing visual CURTO (max 250 chars). Nao escrever paragrafo longo.",
          },
          templateId: { type: "string" },
          templateRationale: { type: "string" },
          colorPalette: { type: "string" },
          mood: { type: "string" },
          textOverlay: { type: "string", description: "Texto curto no visual, <= 6 palavras" },
          reasoning: { type: "string" },
          slides: {
            type: "array",
            description:
              "Se escolher Image Slideshow (5903b592), retorne 4-5 slides. imagePrompt EM INGLES descrevendo cena BRASILEIRA especifica (ex: 'Brazilian woman in her 40s in warm natural kitchen, holding fresh fruit, editorial photography, soft morning light, olive green and off-white color palette'). textOverlay EM PORTUGUES <=40 chars (ex: 'Sem contar caloria'). Prompts devem ser FIEIS ao briefing — nao invente temas aleatorios.",
            items: {
              type: "object",
              properties: {
                imagePrompt: {
                  type: "string",
                  description: "EM INGLES. Cena brasileira especifica: pessoa + idade + ambiente + iluminacao + paleta.",
                },
                textOverlay: {
                  type: "string",
                  description: "EM PORTUGUES. Curto <=40 chars.",
                },
              },
              required: ["imagePrompt", "textOverlay"],
            },
          },
          quotes: {
            type: "array",
            description:
              "Se escolher Quote Card (77f65d2b/f941e306) ou Tweet Card (ba413be6), retorne 3-5 quotes EM PORTUGUES. Tweet: 10-280 chars. Quote: 10-500.",
            items: { type: "string" },
          },
        },
        required: ["enrichedBriefing", "templateId", "templateRationale", "colorPalette", "mood", "reasoning"],
      },
    });

  let brief: UmaCreativeBrief;
  try {
    brief = await schemaToolCall();
  } catch (err) {
    const e = err as Error & { status?: number };
    // Retry em 429: 2 tentativas com 65s e 130s de espera (rate limit
    // Anthropic usa janela rolante de 1min).
    if (e.status === 429) {
      console.log("[uma-creative] 429, aguardando 65s");
      await new Promise((r) => setTimeout(r, 65_000));
      try {
        brief = await schemaToolCall();
      } catch (err2) {
        const e2 = err2 as Error & { status?: number };
        if (e2.status === 429) {
          console.log("[uma-creative] 429 again, aguardando 130s");
          await new Promise((r) => setTimeout(r, 130_000));
          brief = await schemaToolCall();
        } else {
          throw err2;
        }
      }
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
