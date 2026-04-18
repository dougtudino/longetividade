// Uma — UX/UI Designer & Design System Architect (Empathizer ♋)
// Persona original: aiox-core-main/.aiox-core/development/agents/ux-design-expert.md
//
// Papel no Longetividade: diretora visual do conteudo social. Antes do Blotato
// renderizar, Uma le playbook + seed knowledge + video-intel + learnings
// e compõe um brief rico + escolhe o template certo pro slot.
//
// Grava AgentDecision(agentId="uma", action="VISUAL_BRIEF") pra audit trail.

import { prisma } from "../prisma";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

// Catalogo de templates Blotato disponiveis (snapshot 2026-04-18).
// Uma escolhe um desses conforme slot/pilar/mood.
const TEMPLATE_CATALOG: Array<{ id: string; description: string; suits: string[] }> = [
  { id: "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0", description: "Single Centered Text Quote", suits: ["FEED_AM", "quote", "acolhedor"] },
  { id: "ae868019-820d-434c-8fe1-74c9da99129a", description: "Whiteboard Infographic", suits: ["STORY", "FEED_AM", "educativo"] },
  { id: "53cfec04-2500-41cf-8cc1-ba670d2c341a", description: "Instagram Carousel Slideshow", suits: ["FEED_AM", "carrossel"] },
  { id: "d9495026-3945-44f6-8b44-07c28c492e6d", description: "Classroom Chalkboard Infographic", suits: ["FEED_AM", "educativo"] },
  { id: "b88c8273-6406-48c6-85e7-096119aefe30", description: "Book Page Infographic", suits: ["FEED_AM", "literario"] },
  { id: "76b3b959-bdbe-440d-8428-984219353f18", description: "Billboard Infographic", suits: ["FEED_AM", "impacto"] },
  { id: "07a5b5c5-387c-49e3-86b1-de822cd2dfc7", description: "Newspaper Infographic", suits: ["FEED_AM", "jornalistico"] },
  { id: "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1", description: "Quote Card Carousel with Paper Background and Highlight", suits: ["FEED_AM", "quote"] },
  { id: "/base/v2/tutorial-carousel/2491f97b-1b47-4efa-8b96-8c651fa7b3d5/v1", description: "Tutorial Carousel Minimalist Flat", suits: ["FEED_AM", "tutorial"] },
  { id: "/base/v2/tutorial-carousel/e095104b-e6c5-4a81-a89d-b0df3d7c5baf/v1", description: "Tutorial Carousel Monocolor", suits: ["FEED_AM", "tutorial"] },
  { id: "/base/v2/images-with-text/3ed4bb92-dbfe-45e6-9dc8-605b77f70506/v1", description: "Video of Images and Text Minimal Style", suits: ["FEED_AM", "STORY", "visual"] },
  { id: "/base/v2/images-with-text/c9892c3b-fa75-4ade-821a-a50ff8456230/v1", description: "When X then Y Text Slideshow", suits: ["STORY", "reflexivo"] },
  { id: "/base/v2/ai-story-video/5903fe43-514d-40ee-a060-0d6628c5f8fd/v1", description: "AI Video with AI Voice", suits: ["REEL", "narrativo"] },
  { id: "/base/v2/ai-selfie-video/57f5a565-fd17-458b-be43-4a2d8ccaca75/v1", description: "AI Selfie Talking Video Consistent Character", suits: ["REEL", "selfie", "talking-head"] },
  { id: "/base/v2/ai-avatar-broll/7c26a1cd-d5b3-42da-9c73-2413333873b3/v1", description: "AI Avatar with AI Generated B-roll", suits: ["REEL", "avatar"] },
  { id: "/base/v2/image-slideshow/5903b592-1255-43b4-b9ac-f8ed7cbf6a5f/v1", description: "Image Slideshow with Text Overlays", suits: ["REEL", "slideshow"] },
];

export interface UmaBrief {
  enrichedBriefing: string;
  templateId: string;
  templateRationale: string;
  colorPalette: string;
  mood: string;
  textOverlay?: string;
  reasoning: string;
}

interface KnowledgeBits {
  playbookRules: Array<{ title: string; body: string }>;
  persona: string | null;
  compliance: string | null;
  viralRefs: Array<{ hook: string; concept: string; views: number; username: string }>;
  recentLearnings: Array<{ title: string; body: string }>;
}

async function fetchKnowledgeBits(pillar: string): Promise<KnowledgeBits> {
  const [playbook, persona, compliance, viralRefs, learnings] = await Promise.all([
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

Sua tarefa: receber um SocialPost + contexto (playbook, persona, virais, aprendizados) e retornar UM objeto JSON com:
- enrichedBriefing: briefing visual rico em portugues (4-8 linhas), incluindo composicao, elementos, hierarquia, emocao alvo
- templateId: EXATAMENTE um dos IDs da lista fornecida
- templateRationale: por que esse template (1 frase)
- colorPalette: string descrevendo paleta (ex: "verde-oliva dominante, off-white como fundo, um toque de terracota no destaque")
- mood: 1-3 palavras (ex: "acolhedor, sereno")
- textOverlay: texto curto que deve aparecer no visual (se aplicavel)
- reasoning: 1-2 frases explicando escolhas principais

Retorne APENAS o JSON, sem prefacio, sem markdown fence.`;

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

  const eligibleTemplates = TEMPLATE_CATALOG.filter((t) => t.suits.includes(post.slot));
  const templatesForPrompt = eligibleTemplates.length ? eligibleTemplates : TEMPLATE_CATALOG;

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
    const text = await res.text().catch(() => "");
    throw new Error(`Uma Claude ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const raw = data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim() ?? "";

  // Claude as vezes inclui ```json ... ``` fence — remove defensive.
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  let brief: UmaBrief;
  try {
    brief = JSON.parse(jsonStr) as UmaBrief;
  } catch (err) {
    throw new Error(`Uma retornou JSON invalido: ${jsonStr.slice(0, 300)} (${(err as Error).message})`);
  }

  // Validacao minima
  if (!brief.templateId || !brief.enrichedBriefing) {
    throw new Error(`Uma retornou brief incompleto: ${JSON.stringify(brief).slice(0, 300)}`);
  }
  const templateOk = TEMPLATE_CATALOG.some((t) => t.id === brief.templateId);
  if (!templateOk) {
    // Fallback gracioso: usa o primeiro elegivel do slot
    brief.templateId = (eligibleTemplates[0] ?? TEMPLATE_CATALOG[0]).id;
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
