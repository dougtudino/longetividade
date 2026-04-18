// Blotato Playbook — knowledge estruturado pra Uma consultar antes de
// decidir template + inputs corretos.
//
// Baseado em research exaustivo de help.blotato.com em 2026-04-18.
// Cobre endpoints, UUIDs, schemas, limites e best practices oficiais.

export const BLOTATO_PLAYBOOK_VERSION = "2026-04-18";

// ─── CATALOG DE TEMPLATES REAIS ──────────────────────────
// UUIDs confirmados na doc oficial /api/visuals/<uuid>
// Inputs listados EXATOS — shape + limites hard.

export interface BlotatoTemplateSchema {
  id: string; // UUID bare OU path completo (ambos aceitos)
  name: string;
  category:
    | "quote-card"
    | "tweet-card"
    | "image-slideshow"
    | "tutorial-carousel"
    | "images-with-text"
    | "video-editor"
    | "ai-video"
    | "ai-avatar"
    | "legacy-infographic";
  output: "image" | "slideshow" | "video";
  inputsShape: string; // descricao humana do shape JSON
  requiresPrep?: string; // se precisa setup manual (avatar, voice, etc)
  creditsEstimate: number; // custo aproximado em creditos
  bestFor: string; // quando usar
  limits: Record<string, string>; // limites por campo
}

export const BLOTATO_TEMPLATES: BlotatoTemplateSchema[] = [
  {
    id: "77f65d2b-48cc-4adb-bfbb-5bc86f8c01bd",
    name: "Quote Card Monocolor",
    category: "quote-card",
    output: "slideshow",
    inputsShape: "{ font, title (max 50), quotes: string[1-100] (10-500 chars each), aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Carrossel estatico de frases isoladas (motivacional, insight)",
    limits: { title: "50", "quotes[i]": "10-500", "quotes.length": "1-100" },
  },
  {
    id: "f941e306-76f7-45da-b3d9-7463af630e91",
    name: "Quote Card Paper + Highlight",
    category: "quote-card",
    output: "slideshow",
    inputsShape:
      "{ font, title (max 50), quotes: string[1-100] (10-500), highlighterColor, paperBackground: 'White paper'|'Yellow paper'|'Light paper', aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Quote carrossel editorial — papel texturizado, mais charmoso",
    limits: { title: "50", "quotes[i]": "10-500" },
  },
  {
    id: "ba413be6-a840-4e60-8fd6-0066d3b427df",
    name: "Tweet Card Minimal",
    category: "tweet-card",
    output: "slideshow",
    inputsShape:
      "{ quotes: string[1-100] (10-280 chars), authorName (max 60), handle (max 50), profileImage?, verified, theme: 'dark'|'light', aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Quote que simula tweet de autoridade — ideal pra prova social",
    limits: { "quotes[i]": "10-280", authorName: "60", handle: "50" },
  },
  {
    id: "5903b592-1255-43b4-b9ac-f8ed7cbf6a5f",
    name: "Image Slideshow with Text Overlays",
    category: "image-slideshow",
    output: "slideshow",
    inputsShape:
      "{ slides: [{ imageSource: 'URL ou prompt', textOverlay (max 300) }] (1-50), aiImageModel, textPosition: 'top'|'center'|'bottom', textColor, aspectRatio, slideDuration (1-10s), transition }",
    creditsEstimate: 3,
    bestFor:
      "**TEMPLATE PREMIADO** — multi-cena com imagem AI + texto por slide. Ideal pra carrossel narrativo (hook→problema→metodo→prova→CTA).",
    limits: { "slides.length": "1-50", "slides[i].textOverlay": "300", slideDuration: "1-10" },
  },
  {
    id: "53cfec04-2500-41cf-8cc1-ba670d2c341a",
    name: "Instagram Carousel",
    category: "image-slideshow",
    output: "slideshow",
    inputsShape:
      "{ slidePrompts: string[1-10] (5-1000 chars each), model: 'nano-banana-pro'|'nano-banana-2'|'bytedance/seedream/v4.5/text-to-image', aspectRatio }",
    creditsEstimate: 5,
    bestFor: "Carrossel IG 100% gerado por IA a partir de prompts textuais (texto imagetico, nao overlay)",
    limits: { "slidePrompts.length": "1-10", "slidePrompts[i]": "5-1000" },
  },
  {
    id: "2491f97b-1b47-4efa-8b96-8c651fa7b3d5",
    name: "Tutorial Carousel Minimalist Flat",
    category: "tutorial-carousel",
    output: "slideshow",
    inputsShape:
      "{ mainTitle (50), authorName (60), ctaButtonText (50), contentItems: string[1-N] (max 300), backgroundColor, borderColor, textColor, ctaTitle (150), ctaActions: string[1-100] (50 each), profileName (60), profileTitle (80), profileDescription (10-250), profileCta (50), profileImage, aspectRatio }",
    creditsEstimate: 2,
    bestFor: "Passo-a-passo com perfil do autor + CTA destacado. Otimo pra tutorial/educativo.",
    limits: { mainTitle: "50", "contentItems[i]": "300", profileDescription: "10-250" },
  },
  {
    id: "5903fe43-514d-40ee-a060-0d6628c5f8fd",
    name: "AI Video with AI Voice",
    category: "ai-video",
    output: "video",
    inputsShape:
      "{ scenes: [{ mediaSource: 'URL ou prompt', script }] (1-20), voiceName: 20 opcoes (Alice|Brian|Charlotte|Sarah|etc), aiImageModel, animateAiImages, captionPosition, highlightColor, aspectRatio, trimToVoiceover }",
    creditsEstimate: 40,
    bestFor: "Reel narrativo com voz AI + imagens/videos por cena. Alto impacto, custo alto.",
    limits: { "scenes.length": "1-20", voiceName: "enum fixo" },
  },
  {
    id: "57f5a565-fd17-458b-be43-4a2d8ccaca75",
    name: "AI Selfie Talking (consistent character)",
    category: "ai-avatar",
    output: "video",
    inputsShape:
      "{ scenes: [{ description, narration }] (1-100), characterDescription: string ou URL (REQUIRED), style: 9 opcoes, aspectRatio }",
    requiresPrep:
      "characterDescription obrigatorio — texto ou URL de imagem referencia. Sem isso, creation para em script-ready.",
    creditsEstimate: 55,
    bestFor: "Talking head consistente — mesma personagem em todas as cenas. Precisa descricao/URL de avatar.",
    limits: { "scenes.length": "1-100", style: "realistic|cartoon|anime|watercolor|oil-painting|sketch|cyberpunk|fantasy|minimalist" },
  },
  {
    id: "7c26a1cd-d5b3-42da-9c73-2413333873b3",
    name: "AI Avatar with B-roll",
    category: "ai-avatar",
    output: "video",
    inputsShape: "{ avatarVideoUrl: 'https://...' (REQUIRED) }",
    requiresPrep:
      "Requer video de avatar ja gravado (ex: HeyGen externo). Blotato SO adiciona B-roll, NAO gera avatar.",
    creditsEstimate: 30,
    bestFor: "Quando voce ja tem video de avatar falando e quer Blotato so adicionar B-roll visual",
    limits: { avatarVideoUrl: "URL publica" },
  },
  {
    id: "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0",
    name: "Single Centered Quote",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ title, quotes: string[1-100] (10-500), aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Frase isolada fundo neutro. Visual SIMPLES — evite pra creative Meta Ad.",
    limits: { title: "50", "quotes[i]": "10-500" },
  },
  {
    id: "c306ae43-1dcc-4f45-ac2b-88e75430ffd8",
    name: "Combine Clips",
    category: "video-editor",
    output: "video",
    inputsShape:
      "{ videoClips: [{ url }] (1-20), trimSilence, titleConfig, captionsConfig, musicConfig, transitionConfig, maxDuration (0-600s), aspectRatio }",
    creditsEstimate: 5,
    bestFor: "Juntar N clips existentes (nao gera novo — precisa URLs dos clips prontos)",
    limits: { "videoClips.length": "1-20", maxDuration: "0-600" },
  },
];

// ─── REGRAS DE NEGOCIO ──────────────────────────────────

export const BLOTATO_RULES = [
  "templateId: aceita UUID bare OU path completo /base/v2/.../UUID/v1. Ambos funcionam.",
  "isDraft: false + render: true OBRIGATORIO no body pra criar e renderizar imediato.",
  "inputs eh OBRIGATORIO (mesmo que {}). Se omitir, falha.",
  "Preferir passar inputs estruturados quando o template tem schema conhecido — eh mais confiavel que prompt livre.",
  "Se passar apenas prompt sem inputs, Blotato tenta inferir. Funciona pra AI Video simples, falha pra carrossel.",
  "Status 'done' = mediaUrl|imageUrls populado. Qualquer status com 'fail' = terminal, sem retry.",
  "Pipeline: queueing → generating-script → script-ready → generating-media → media-ready → exporting → done.",
  "Tempos: imagem simples ~30s, quote carousel ~1min, image slideshow com AI ~2-3min, AI video ~5-15min, AI selfie talking ~10-20min.",
  "Rate limit: 30 renders/min. Alem disso 429.",
];

// ─── GUIA DE ESCOLHA (decision tree) ────────────────────

export const BLOTATO_TEMPLATE_DECISION = `
Escolha de template por intencao:

1. "Quero 1 frase isolada em fundo texturizado" → Quote Card Paper (f941e306)
2. "Quero N frases em cards (carrossel de insights)" → Quote Card Monocolor (77f65d2b)
3. "Quero simular depoimento estilo tweet" → Tweet Card (ba413be6)
4. "Quero carrossel narrativo com imagem POR slide" → Image Slideshow with Text Overlays (5903b592) ★
5. "Quero carrossel 100% imagem AI (sem overlay de texto)" → Instagram Carousel (53cfec04)
6. "Quero tutorial com perfil + CTA estruturado" → Tutorial Carousel (2491f97b)
7. "Quero reel narrado com voz AI + imagens" → AI Video with AI Voice (5903fe43)
8. "Quero personagem falando (talking head)" → AI Selfie Talking (57f5a565) — PRECISA characterDescription
9. "Ja tenho avatar video, quero so adicionar b-roll" → AI Avatar with B-roll (7c26a1cd)
10. "Juntar clips existentes" → Combine Clips (c306ae43)

★ = mais versatil. Default pra creative Meta Ads.
`;

// ─── PRATICA PROIBIDA (evitar) ──────────────────────────

export const BLOTATO_ANTIPATTERNS = [
  "NAO use notacao 'S1:', 'S2:', 'Slide 1:' em prompt — Blotato le como texto literal.",
  "NAO preencha description>500 chars — quote items tem limite 500 (Quote Card) ou 280 (Tweet Card).",
  "NAO esqueca isDraft:false — sem ele templates complexos ficam parados em script-ready.",
  "NAO use AI Selfie Talking sem characterDescription (texto descritivo ou URL) — trava em draft.",
  "NAO use AI Avatar with B-roll sem avatarVideoUrl pronto — template so adiciona broll em video existente.",
  "NAO confie so em prompt pra templates estruturados (carousel, slideshow, tutorial) — passe inputs estruturados.",
  "NAO force renderizacao de creation failed — estado terminal, sem retry possivel.",
];

// ─── HELPER: recomenda template por pedido ──────────────

export function recommendTemplate(intent: {
  hasSingleQuote?: boolean;
  hasMultipleQuotes?: boolean;
  wantsImagesPerSlide?: boolean;
  wantsTalkingHead?: boolean;
  hasAvatarVideo?: boolean;
  wantsTutorialStructure?: boolean;
  hasVoiceover?: boolean;
}): BlotatoTemplateSchema | null {
  if (intent.hasAvatarVideo) {
    return BLOTATO_TEMPLATES.find((t) => t.id === "7c26a1cd-d5b3-42da-9c73-2413333873b3") ?? null;
  }
  if (intent.wantsTalkingHead) {
    return BLOTATO_TEMPLATES.find((t) => t.id === "57f5a565-fd17-458b-be43-4a2d8ccaca75") ?? null;
  }
  if (intent.hasVoiceover) {
    return BLOTATO_TEMPLATES.find((t) => t.id === "5903fe43-514d-40ee-a060-0d6628c5f8fd") ?? null;
  }
  if (intent.wantsTutorialStructure) {
    return BLOTATO_TEMPLATES.find((t) => t.id === "2491f97b-1b47-4efa-8b96-8c651fa7b3d5") ?? null;
  }
  if (intent.wantsImagesPerSlide) {
    return BLOTATO_TEMPLATES.find((t) => t.id === "5903b592-1255-43b4-b9ac-f8ed7cbf6a5f") ?? null;
  }
  if (intent.hasMultipleQuotes) {
    return BLOTATO_TEMPLATES.find((t) => t.id === "f941e306-76f7-45da-b3d9-7463af630e91") ?? null;
  }
  if (intent.hasSingleQuote) {
    return BLOTATO_TEMPLATES.find((t) => t.id === "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0") ?? null;
  }
  return null;
}

// ─── SEED BODY (markdown pra AgentKnowledge) ────────────

export function buildPlaybookKnowledgeBody(): string {
  const lines: string[] = [];
  lines.push(`# Blotato API Playbook (v${BLOTATO_PLAYBOOK_VERSION})`);
  lines.push("");
  lines.push("## Templates disponiveis e quando usar");
  lines.push("");
  for (const t of BLOTATO_TEMPLATES) {
    lines.push(`### ${t.name} (${t.category})`);
    lines.push(`**ID:** \`${t.id}\``);
    lines.push(`**Output:** ${t.output} · **Credito:** ~${t.creditsEstimate}cr`);
    lines.push(`**Quando usar:** ${t.bestFor}`);
    lines.push(`**Inputs shape:** \`${t.inputsShape}\``);
    if (t.requiresPrep) lines.push(`⚠️ **Prep:** ${t.requiresPrep}`);
    lines.push(`**Limites:** ${Object.entries(t.limits).map(([k, v]) => `${k}=${v}`).join(", ")}`);
    lines.push("");
  }
  lines.push("## Regras duras");
  for (const r of BLOTATO_RULES) lines.push(`- ${r}`);
  lines.push("");
  lines.push("## Decisao de template");
  lines.push(BLOTATO_TEMPLATE_DECISION);
  lines.push("");
  lines.push("## Antipatterns (NUNCA faca)");
  for (const a of BLOTATO_ANTIPATTERNS) lines.push(`- ${a}`);
  return lines.join("\n");
}
