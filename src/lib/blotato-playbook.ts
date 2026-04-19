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
  // ─── MODERNOS adicionais ───────────────────────────────
  {
    id: "0ddb8655-c3da-43da-9f7d-be1915ca7818",
    name: "Image Slideshow Prominent Text",
    category: "images-with-text",
    output: "slideshow",
    inputsShape:
      "{ slides: [{ imageSource: 'URL ou prompt', textOverlay (max 200) }] (1-50), textPosition, textColor, textStyle: 'minimal'|'elegant'|'modern'|'bold', aspectRatio, slideDuration }",
    creditsEstimate: 3,
    bestFor: "Variante do Image Slideshow com TEXTO em destaque (fonte grande). Bom pra hooks fortes.",
    limits: { "slides.length": "1-50", "slides[i].textOverlay": "200" },
  },
  {
    id: "c9892c3b-fa75-4ade-821a-a50ff8456230",
    name: "When X Then Y (causa-efeito)",
    category: "images-with-text",
    output: "slideshow",
    inputsShape:
      "{ slides: [{ imageSource, conditionText (max 80), resultText (max 80) }] (1-30), aspectRatio }",
    creditsEstimate: 3,
    bestFor:
      "Estrutura 'Quando X → Entao Y' por slide. Otimo pra educacao (Quando come acucar antes de dormir → Entao desregula leptina).",
    limits: { "slides[i].conditionText": "80", "slides[i].resultText": "80" },
  },
  {
    id: "3ed4bb92-dbfe-45e6-9dc8-605b77f70506",
    name: "Video with Images and Text",
    category: "images-with-text",
    output: "video",
    inputsShape:
      "{ slides: [{ imageSource, textOverlay (max 200) }] (1-30), backgroundMusic, transitionStyle, aspectRatio }",
    creditsEstimate: 8,
    bestFor: "VIDEO mp4 (nao slideshow) com imagens AI + texto + musica. Reel narrativo sem voice.",
    limits: { "slides.length": "1-30", "slides[i].textOverlay": "200" },
  },
  {
    id: "9714ae5c-7e6b-4878-be4a-4b1ba5d0cd66",
    name: "Tweet Card Photo Background",
    category: "tweet-card",
    output: "slideshow",
    inputsShape:
      "{ quotes: string[1-100] (10-280), authorName (60), handle (50), profileImage?, backgroundImage: 'URL ou prompt', verified, theme, aspectRatio }",
    creditsEstimate: 2,
    bestFor: "Tweet sobreposto a foto de fundo (ex: foto da Barbara) — gera autoridade visual maior.",
    limits: { "quotes[i]": "10-280", authorName: "60", handle: "50" },
  },
  {
    id: "e095104b-e6c5-4a81-a89d-b0df3d7c5baf",
    name: "Tutorial Carousel Modern",
    category: "tutorial-carousel",
    output: "slideshow",
    inputsShape:
      "{ mainTitle (50), authorName (60), ctaButtonText (50), contentItems: string[] (max 300), accentColor, profileImage, aspectRatio }",
    creditsEstimate: 2,
    bestFor: "Variante moderna do Tutorial Carousel — visual mais minimalista/limpo.",
    limits: { mainTitle: "50", "contentItems[i]": "300" },
  },
  // ─── LEGACY INFOGRAPHICS (shape simples {description, footerText}) ─
  // Todos os 21 Legacy aceitam o mesmo shape: 1 frase principal + rodape opcional.
  // Usar pra single-image post (FEED 1:1 ou STORY 9:16) com visual tematico forte.
  {
    id: "9f4e66cd-b784-4c02-b2ce-e6d0765fd4c0",
    name: "Single Centered Quote (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description (max 480), footerText? (max 120), aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Frase isolada fundo neutro tipografico. Simples e direto.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "07a5b5c5-387c-49e3-86b1-de822cd2dfc7",
    name: "Newspaper (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor:
      "★ Headline estilo jornal — passa AUTORIDADE. Use pra estatistica/descoberta cientifica ('Estudo revela...').",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "8800be71-52df-4ac7-ac94-df9d8a494d0f",
    name: "Breaking News (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor:
      "★ TV news ticker — passa URGENCIA. Use pra alerta ('Mulheres acima de 35 perdem X% de massa muscular por ano').",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "76b3b959-bdbe-440d-8428-984219353f18",
    name: "Billboard (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor:
      "★ Outdoor publicitario — passa IMPACTO/grandeza. Use pra promessa central do Metodo S.E.M.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "ae868019-820d-434c-8fe1-74c9da99129a",
    name: "Whiteboard (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor:
      "★ Quadro branco com letra de marcador — passa EDUCATIVO/aula. Use pra micro-licao do Metodo.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "b88c8273-6406-48c6-85e7-096119aefe30",
    name: "Book Page (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor:
      "★ Pagina de livro vintage — passa SABEDORIA/profundidade. Use pra reflexao filosofica/citacao.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "29ebb2bd-02b7-4317-8bb8-c30eb938e47c",
    name: "Trail Marker (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor:
      "★ Placa de trilha — passa JORNADA/caminho. Use pra etapas do Metodo ('Voce esta aqui →').",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "fcd64907-b103-46f8-9f75-51b9d1a522f5",
    name: "Chalkboard (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Lousa preta com giz — vintage/escola. Alternativa ao Whiteboard com tom mais nostalgico.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "d9495026-3945-44f6-8b44-07c28c492e6d",
    name: "Classroom Chalkboard (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Lousa em sala de aula completa — contexto pedagogico explicito.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "013904bf-6b3b-43f4-bb1f-f1964a38c29b",
    name: "TV Wall (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Parede de TVs estilo loja eletronicos — visual repetitivo amplifica mensagem.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "f8f1ebe4-a9f5-4ec8-be63-21214656cd4b",
    name: "Movie Theater (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Marquise cinema com letras luminosas — anuncio dramatico/cinematico.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "3598483b-c148-4276-a800-eede85c1c62f",
    name: "Graffiti (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Grafite urbano — atitude/rebeldia. Evitar pra publico 35-55 conservador.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "f9c0e470-9288-4958-8cdd-64772ed93c05",
    name: "Bus Ad (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Anuncio em onibus — vibe urbana/transito. Bom pra mensagem cotidiana.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "5307053e-046b-4c9b-b1ca-38725d2ddcdd",
    name: "Constellation (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Estrelas/constelacao ceu noturno — etereo, espiritual. Bom pra reflexao.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "49c61370-a706-4b82-98f7-62d557d1c66d",
    name: "Manga (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Estilo manga/quadrinho — geek. Evitar pra publico Longetividade.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "476f8920-8749-4ff7-9c91-470d54c3c03e",
    name: "T-Shirt (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Frase em camiseta — manifesto/atitude.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "8fa8545e-8955-4a89-a868-cf45023d6cc5",
    name: "Futuristic Flyer (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Flyer cyberpunk neon — alta tecnologia. Evitar pra Longetividade.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "7b7104f1-d277-4993-ad3a-e5883c4b776d",
    name: "Steampunk (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Engrenagens vapor estetica vitoriana — nicho. Evitar pra Longetividade.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "b8707b58-a106-44af-bb12-e30507e561af",
    name: "Top Secret (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Documento confidencial carimbado — passa SEGREDO/exclusividade. Bom pra revelacao Metodo.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "a7b0d128-8478-4b34-9647-a0778b6517d0",
    name: "Egyptian (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Hieroglifos pirâmides — antigo/misterioso. Evitar pra Longetividade.",
    limits: { description: "480", footerText: "120" },
  },
  {
    id: "82ee75b6-597b-43a8-86bc-e4395e7c9c44",
    name: "Cave Painting (Legacy)",
    category: "legacy-infographic",
    output: "slideshow",
    inputsShape: "{ description, footerText?, aspectRatio }",
    creditsEstimate: 1,
    bestFor: "Pintura rupestre primitiva — ancestral. Evitar pra Longetividade.",
    limits: { description: "480", footerText: "120" },
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

CARROSSEL/SLIDESHOW (multi-slide):
1. "Quote isolada papel texturizado" → Quote Card Paper (f941e306)
2. "N quotes em cards" → Quote Card Monocolor (77f65d2b)
3. "Depoimento estilo tweet" → Tweet Card Minimal (ba413be6) | Tweet Photo BG (9714ae5c)
4. "Carrossel narrativo com imagem POR slide" → Image Slideshow (5903b592) ★ DEFAULT
5. "Hook com texto BEM grande" → Image Slideshow Prominent (0ddb8655)
6. "Estrutura Quando X → Entao Y" → When X Then Y (c9892c3b)
7. "Carrossel 100% imagem AI" → Instagram Carousel (53cfec04)
8. "Tutorial com perfil + CTA" → Tutorial Carousel (2491f97b) | Modern (e095104b)

VIDEO (mp4 narrativo):
9. "Reel narrado com voz AI" → AI Video AI Voice (5903fe43)
10. "Reel com imagens + texto + musica (sem voz)" → Video Images Text (3ed4bb92)
11. "Talking head consistente" → AI Selfie Talking (57f5a565) — PRECISA characterDescription
12. "B-roll em video pronto" → AI Avatar B-roll (7c26a1cd) — PRECISA avatarVideoUrl
13. "Juntar clips" → Combine Clips (c306ae43)

LEGACY INFOGRAPHIC (single-image, shape simples {description, footerText}):
14. "Headline jornalistico (autoridade)" → Newspaper (07a5b5c5) ★
15. "Alerta urgente TV news" → Breaking News (8800be71) ★
16. "Promessa central tipo outdoor" → Billboard (76b3b959) ★
17. "Micro-licao educativa" → Whiteboard (ae868019) ★ | Chalkboard (fcd64907)
18. "Sabedoria livro vintage" → Book Page (b88c8273) ★
19. "Etapa de jornada" → Trail Marker (29ebb2bd) ★
20. "Revelacao secreta/exclusiva" → Top Secret (b8707b58)
21. "Frase isolada simples" → Single Centered Quote (9f4e66cd)

★ = mais versatil. Default carrossel = Image Slideshow (5903b592).
Default Meta Ads imagem unica = Newspaper/Billboard/Whiteboard (Legacy).
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
