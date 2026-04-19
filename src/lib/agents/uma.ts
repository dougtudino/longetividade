// Uma — UX/UI Designer & Design System Architect (Empathizer ♋)
// Persona original: aiox-core-main/.aiox-core/development/agents/ux-design-expert.md
//
// Papel no Longetividade: diretora visual do conteudo social. Antes do Blotato
// renderizar, Uma le playbook + seed knowledge + video-intel + learnings
// e compõe um brief rico + escolhe o template certo pro slot.
//
// Grava AgentDecision(agentId="uma", action="VISUAL_BRIEF") pra audit trail.

import { prisma } from "../prisma";
import { getCachedTemplates } from "../blotato-templates-sync";
import { callClaudeWithTool } from "./llm-json";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

// Fallback hardcoded (usado se cache DB vazio E Blotato API falha).
// Lista minima de IDs historicamente validados em producao.
const TEMPLATE_FALLBACK: Array<{ id: string; description: string; suits: string[] }> = [
  // ─── FEED_AM (1:1 estatico) ──────────────────────
  { id: "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0", description: "Single Centered Text Quote", suits: ["FEED_AM", "AD_FEED", "quote", "acolhedor"] },
  { id: "ae868019-820d-434c-8fe1-74c9da99129a", description: "Whiteboard Infographic", suits: ["STORY", "FEED_AM", "AD_STORY", "educativo"] },
  { id: "53cfec04-2500-41cf-8cc1-ba670d2c341a", description: "Instagram Carousel Slideshow", suits: ["FEED_AM", "AD_FEED", "carrossel"] },
  { id: "d9495026-3945-44f6-8b44-07c28c492e6d", description: "Classroom Chalkboard Infographic", suits: ["FEED_AM", "educativo"] },
  { id: "b88c8273-6406-48c6-85e7-096119aefe30", description: "Book Page Infographic", suits: ["FEED_AM", "literario"] },
  { id: "76b3b959-bdbe-440d-8428-984219353f18", description: "Billboard Infographic", suits: ["FEED_AM", "AD_FEED", "impacto"] },
  { id: "07a5b5c5-387c-49e3-86b1-de822cd2dfc7", description: "Newspaper Infographic", suits: ["FEED_AM", "jornalistico"] },
  { id: "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1", description: "Quote Card Carousel with Paper Background and Highlight", suits: ["FEED_AM", "AD_FEED", "quote"] },
  { id: "/base/v2/tutorial-carousel/2491f97b-1b47-4efa-8b96-8c651fa7b3d5/v1", description: "Tutorial Carousel Minimalist Flat", suits: ["FEED_AM", "AD_FEED", "tutorial"] },
  { id: "/base/v2/tutorial-carousel/e095104b-e6c5-4a81-a89d-b0df3d7c5baf/v1", description: "Tutorial Carousel Monocolor", suits: ["FEED_AM", "tutorial"] },

  // ─── STORY / FEED hibrido (9:16) ──────────────────────
  { id: "/base/v2/images-with-text/3ed4bb92-dbfe-45e6-9dc8-605b77f70506/v1", description: "Video of Images and Text Minimal Style", suits: ["FEED_AM", "STORY", "AD_STORY", "visual"] },
  { id: "/base/v2/images-with-text/c9892c3b-fa75-4ade-821a-a50ff8456230/v1", description: "When X then Y Text Slideshow", suits: ["STORY", "AD_STORY", "reflexivo"] },

  // ─── REEL (video vertical) ──────────────────────
  { id: "/base/v2/ai-story-video/5903fe43-514d-40ee-a060-0d6628c5f8fd/v1", description: "AI Video with AI Voice", suits: ["REEL", "narrativo"] },
  { id: "/base/v2/ai-selfie-video/57f5a565-fd17-458b-be43-4a2d8ccaca75/v1", description: "AI Selfie Talking Video Consistent Character", suits: ["REEL", "selfie", "talking-head"] },
  { id: "/base/v2/ai-avatar-broll/7c26a1cd-d5b3-42da-9c73-2413333873b3/v1", description: "AI Avatar with AI Generated B-roll", suits: ["REEL", "avatar"] },
  { id: "/base/v2/image-slideshow/5903b592-1255-43b4-b9ac-f8ed7cbf6a5f/v1", description: "Image Slideshow with Text Overlays", suits: ["REEL", "slideshow"] },
];

// Classifica template pelo tipo/nome pra inferir pra qual slot serve.
// Blotato retorna type (image|video) + name/category, a gente deduz.
async function getTemplateCatalog(): Promise<
  Array<{ id: string; description: string; suits: string[] }>
> {
  try {
    const cached = await getCachedTemplates({ autoSyncIfEmpty: true });
    if (cached.length > 0) {
      return cached.map((t) => {
        const nameLower = (t.name ?? "").toLowerCase();
        const descLower = (t.description ?? "").toLowerCase();
        const isVideo = t.type === "video" || /video|reel|slideshow/.test(nameLower);
        const isVertical =
          t.aspectRatio === "9:16" ||
          /story|vertical|9:16/.test(nameLower + descLower);
        const suits: string[] = [];
        if (isVideo && !isVertical) suits.push("REEL", "FEED_AM");
        else if (isVideo && isVertical) suits.push("REEL", "STORY", "AD_STORY");
        else if (isVertical) suits.push("STORY", "AD_STORY");
        else suits.push("FEED_AM", "AD_FEED");
        return {
          id: t.id,
          description: t.name + (t.description ? ` — ${t.description.slice(0, 160)}` : ""),
          suits,
        };
      });
    }
  } catch (err) {
    console.warn("[uma] fallback pro catalog hardcoded apos erro:", (err as Error).message);
  }
  return TEMPLATE_FALLBACK;
}

export interface UmaBrief {
  enrichedBriefing: string;
  templateId: string;
  templateRationale: string;
  colorPalette: string;
  mood: string;
  textOverlay?: string;
  reasoning: string;
  // Estruturados — pra Image Slideshow / Quote Card / Talking Head
  slides?: Array<{ imagePrompt: string; textOverlay: string }>;
  quotes?: string[];
  scenes?: Array<{ description: string; narration: string }>;
  characterDescription?: string;
}

interface KnowledgeBits {
  playbookRules: Array<{ title: string; body: string }>;
  persona: string | null;
  compliance: string | null;
  viralRefs: Array<{ hook: string; concept: string; views: number; username: string }>;
  recentLearnings: Array<{ title: string; body: string }>;
  umaRefs: Array<{ title: string; body: string }>;
}

async function fetchKnowledgeBits(pillar: string): Promise<KnowledgeBits> {
  const [playbook, persona, compliance, viralRefs, learnings, umaRefs] = await Promise.all([
    prisma.agentKnowledge.findMany({
      where: { agentId: "luna", source: "luna-playbook", kind: "rule" },
      select: { title: true, body: true },
      take: 12,
    }),
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
        agentId: "luna",
        source: { startsWith: "video-intelligence:" },
        createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      },
      select: { metadata: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.agentKnowledge.findMany({
      where: {
        agentId: "luna",
        kind: "learning",
        createdAt: { gte: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
      },
      select: { title: true, body: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.agentKnowledge.findMany({
      where: { agentId: "uma" },
      select: { title: true, body: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const viralMapped = viralRefs
    .map((r) => {
      const m = r.metadata as { hook?: string; concept?: string; views?: number; username?: string } | null;
      if (!m?.hook) return null;
      return {
        hook: m.hook,
        concept: m.concept ?? "",
        views: m.views ?? 0,
        username: m.username ?? "",
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  void pillar; // Pillar poderia filtrar playbook especifico; hoje pegamos tudo.

  return {
    playbookRules: playbook,
    persona: persona?.body ?? null,
    compliance: compliance?.body ?? null,
    viralRefs: viralMapped,
    recentLearnings: learnings,
    umaRefs,
  };
}

function renderKnowledge(kb: KnowledgeBits): string {
  const parts: string[] = [];
  if (kb.persona) parts.push(`## Persona da audiencia\n${kb.persona.slice(0, 800)}`);
  if (kb.playbookRules.length) {
    parts.push(
      `## Regras do playbook Luna\n` +
        kb.playbookRules.map((r) => `- ${r.title}: ${r.body.slice(0, 160)}`).join("\n"),
    );
  }
  if (kb.compliance) parts.push(`## Compliance / bordas\n${kb.compliance.slice(0, 500)}`);
  if (kb.viralRefs.length) {
    parts.push(
      `## Hooks de reels virais recentes (inspiracao, NAO copiar)\n` +
        kb.viralRefs
          .map((v) => `- @${v.username} (${v.views.toLocaleString("pt-BR")} views): "${v.hook}" — conceito: ${v.concept.slice(0, 140)}`)
          .join("\n"),
    );
  }
  if (kb.recentLearnings.length) {
    parts.push(
      `## Aprendizados recentes (engagement + auto-post)\n` +
        kb.recentLearnings.map((l) => `- ${l.title}: ${l.body.slice(0, 160)}`).join("\n"),
    );
  }
  if (kb.umaRefs.length) {
    parts.push(
      `## Minhas referencias (Uma)\n` +
        kb.umaRefs.map((r) => `- ${r.title}\n${r.body.slice(0, 400)}`).join("\n\n"),
    );
  }
  return parts.join("\n\n");
}

const SYSTEM_PROMPT = `Voce e Uma — UX/UI Designer & Design System Architect, Empathizer ♋.
Identidade literal: "I'm your complete design partner, combining Sally's user empathy with Brad's systems thinking. I understand users deeply AND build scalable design systems."

Principios:
- USER NEEDS FIRST: toda decisao visual serve uma necessidade real da mulher 35+ que ve o post
- METRICS MATTER: se um padrao viralizou, aprenda com ele sem copiar
- VISUAL EVIDENCE: texto curto, legivel, uma ideia por card
- DELIGHT IN DETAILS: paleta coerente, respiro, hierarquia
- ACCESSIBLE: contraste alto, tipografia legivel

Marca Longetividade:
- Metodo S.E.M (Simplicidade, Equilibrio, Movimento)
- Paleta: verde-oliva (#5C6B4D) + off-white (#F4EFE4) + toques terrosos
- Tom: acolhedor, sem culpa, sem jargao, sem "antes/depois"
- Publico: mulheres 30-55, BR, frustradas com dietas, buscam leveza

Vocabulario seu: empatizar, compreender, facilitar, nutrir, cuidar, acolher, criar.

PLAYBOOK BLOTATO (escolha por slot do post):
- Slot REEL → Image Slideshow (5903b592). Retorne slides[]: 4-5 cenas.
- Slot REEL alternativo (narrado) → AI Video (5903fe43). Retorne scenes[].
- Slot FEED_AM → Image Slideshow (5903b592) OU Quote Card Paper (f941e306) com quotes[].
- Slot STORY → Image Slideshow (5903b592) aspect 9:16. Retorne slides[].

EVITE: Single Centered Text (9f4e66cd), legacy infographics, AI Selfie sem avatar.

⚠️ NARRATIVA POR SLIDE (CRITICO PRA CONVERSAO):
Cada slide TEM FUNCAO especifica. Frases NAO podem ser independentes — devem
contar UMA HISTORIA conectada. Use ESTA estrutura:

  Slide 1 = HOOK
    Pergunta provocadora OU numero impactante OU negacao especifica
    Para o scroll em 3 segundos. Ex: "Quantas vezes voce comecou na segunda?"

  Slide 2 = DOR ou CONTEXTO
    Aprofunda a identificacao OU revela um fato
    NAO repete o slide 1. Adiciona camada. Ex: "Toda dieta tem prazo"

  Slide 3 = SOLUCAO/METODO
    Apresenta o diferencial concreto (nao abstrato)
    Ex: "Metodo S.E.M: comer real, equilibrar emocional, mover diario"

  Slide 4 = PROVA ou BENEFICIO
    Numero, depoimento, resultado tangivel (sem claim quantitativo)
    Ex: "Mulheres descobriram outro caminho"

  Slide 5 = CTA ESPECIFICO (OBRIGATORIO no ultimo slide)
    Acao tangivel + beneficio. NUNCA "Saiba mais" generico.
    Ex: "Baixe o ebook + 30 receitas" / "Conheca o Metodo no link"

Pra 4 slides, junta DOR+SOLUCAO em 1.

NUNCA use "S1:", "Slide 1:" no enrichedBriefing — Blotato le literal.

PARA imagePrompt: descreva CENA BRASILEIRA especifica EM INGLES com pessoa
+ ambiente + objeto + iluminacao + paleta. Cada slide tem cena coerente
com o conceito da narrativa (nao animais aleatorios).
Ex: "Brazilian woman 40s in warm kitchen holding fresh fruit, editorial
photography, olive green palette, soft morning light".

PARA textOverlay: PORTUGUES sempre, curto (<=40 chars), DIRETO ao ponto.

Chame submit_visual_brief com:
- enrichedBriefing: briefing curto (<200 chars)
- templateId: UUID do playbook (sem path — sistema resolve)
- templateRationale: 1 frase explicando escolha
- colorPalette + mood + textOverlay + reasoning
- slides[] OU quotes[] OU scenes[] dependendo do template`;

export async function buildVisualBrief(socialPostId: string): Promise<UmaBrief> {
  const post = await prisma.socialPost.findUnique({
    where: { id: socialPostId },
    select: {
      id: true,
      title: true,
      content: true,
      hashtags: true,
      imageBriefing: true,
      pillar: true,
      slot: true,
      format: true,
    },
  });
  if (!post) throw new Error(`SocialPost ${socialPostId} nao encontrado`);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nao configurada");

  const kb = await fetchKnowledgeBits(post.pillar);
  const knowledgeBlock = renderKnowledge(kb);

  const catalog = await getTemplateCatalog();
  const eligibleTemplates = catalog.filter((t) => t.suits.includes(post.slot));
  // Cap em 15 pra manter prompt leve (Anthropic rate limit 30k tokens/min).
  const templatesForPrompt = (eligibleTemplates.length ? eligibleTemplates : catalog).slice(0, 15);

  const userPrompt = `# Post pra criar brief visual

- Slot: ${post.slot}
- Pilar: ${post.pillar} (s=Simplicidade/nutricao, e=Equilibrio/emocional, m=Movimento/corpo, promo=oferta)
- Formato: ${post.format}
- Titulo: ${post.title}
- Copy:
${post.content}

- Briefing original (da Luna, pode ser pobre — enriqueca):
${post.imageBriefing || "(vazio)"}

# Contexto (knowledge gravado na base)

${knowledgeBlock || "(knowledge base vazia)"}

# Templates Blotato disponiveis pra esse slot
${templatesForPrompt.map((t) => `- ${t.id}: ${t.description}`).join("\n")}

Chame a ferramenta.`;

  const brief = await callClaudeWithTool<UmaBrief>({
    apiKey,
    model: MODEL,
    maxTokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    userPrompt,
    toolName: "submit_visual_brief",
    toolDescription: "Submete brief visual + template escolhido pra gerar arte no Blotato",
    schema: {
      type: "object",
      properties: {
        enrichedBriefing: {
          type: "string",
          description: "Briefing visual CURTO (<200 chars). Nao escrever paragrafo longo.",
        },
        templateId: { type: "string" },
        templateRationale: { type: "string" },
        colorPalette: { type: "string" },
        mood: { type: "string" },
        textOverlay: { type: "string", description: "Texto curto no visual, EM PORTUGUES, <=40 chars" },
        reasoning: { type: "string" },
        slides: {
          type: "array",
          description:
            "Se template=Image Slideshow (5903b592), retorne 4-5 slides. imagePrompt EM INGLES com cena BR especifica. textOverlay EM PORTUGUES <=40 chars.",
          items: {
            type: "object",
            properties: {
              imagePrompt: { type: "string" },
              textOverlay: { type: "string" },
            },
            required: ["imagePrompt", "textOverlay"],
          },
        },
        quotes: {
          type: "array",
          description: "Se template=Quote Card (f941e306) ou Tweet Card (ba413be6), retorne 3-5 quotes EM PORTUGUES.",
          items: { type: "string" },
        },
        scenes: {
          type: "array",
          description:
            "Se template=AI Video (5903fe43), retorne 3-5 scenes com description (visual EN) + narration (PT).",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              narration: { type: "string" },
            },
            required: ["description", "narration"],
          },
        },
      },
      required: ["enrichedBriefing", "templateId", "templateRationale", "colorPalette", "mood", "reasoning"],
    },
  });

  // Validacao minima
  if (!brief.templateId || !brief.enrichedBriefing) {
    throw new Error(`Uma retornou brief incompleto: ${JSON.stringify(brief).slice(0, 300)}`);
  }
  const templateOk = catalog.some((t) => t.id === brief.templateId);
  if (!templateOk) {
    // Fallback gracioso: usa o primeiro elegivel do slot
    brief.templateId = (eligibleTemplates[0] ?? catalog[0]).id;
    brief.templateRationale = `[fallback] ${brief.templateRationale ?? ""}`;
  }

  // Audit trail
  await prisma.agentDecision.create({
    data: {
      agentId: "uma",
      action: "VISUAL_BRIEF",
      targetType: "socialPost",
      targetId: post.id,
      targetName: post.title,
      params: {
        slot: post.slot,
        pillar: post.pillar,
        templateId: brief.templateId,
        mood: brief.mood,
      },
      reasoning: brief.reasoning ?? brief.templateRationale ?? "(sem reasoning)",
      status: "executed",
      executedAt: new Date(),
      executionResult: JSON.parse(JSON.stringify(brief)),
    },
  });

  return brief;
}
