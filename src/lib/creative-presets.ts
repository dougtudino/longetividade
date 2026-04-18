// Presets alinhados ao Blotato Playbook.
//
// CADA preset ja especifica:
//   - templateId exato (UUID do playbook)
//   - slides[] ou quotes[] pre-definidos em PT/EN correto
//   - imagePrompts brasileiros especificos
//
// Quando o preset tem templateId + slides/quotes, o pipeline pula a Uma
// (economiza ~2k tokens Anthropic + elimina inconsistencia + evita 429).
//
// Se admin escrever briefing custom (nao-preset), Uma entra em cena.

export type CreativePreset = {
  id: string;
  label: string;
  icon: string;
  angle: "dor" | "prova" | "objecao" | "promessa" | "cta";
  headline: string;
  briefing: string;
  style:
    | "auto"
    | "talking-head"
    | "slideshow"
    | "quote-card"
    | "infographic"
    | "carousel";
  name: string;
  slug: string;
  funnel?: "cold" | "warm" | "hot";

  // Configuracao DIRECT (pula Uma) — playbook-aligned
  templateId?: string; // UUID Blotato oficial
  slides?: Array<{ imagePrompt: string; textOverlay: string }>; // pra Image Slideshow
  quotes?: string[]; // pra Quote Card / Tweet Card
  // Pra AI Selfie Talking
  scenes?: Array<{ description: string; narration: string }>;
  characterDescription?: string;
};

// Templates oficiais do playbook — Blotato EXIGE path completo, nao UUID puro
// (descoberto empiricamente: UUID puro retorna 404; path retorna 200)
const TPL_IMAGE_SLIDESHOW = "/base/v2/image-slideshow/5903b592-1255-43b4-b9ac-f8ed7cbf6a5f/v1";
const TPL_QUOTE_PAPER = "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1";
const TPL_TWEET = "/base/v2/tweet-card/ba413be6-a840-4e60-8fd6-0066d3b427df/v1";
const TPL_AI_VIDEO = "/base/v2/ai-story-video/5903fe43-514d-40ee-a060-0d6628c5f8fd/v1";
const TPL_AI_SELFIE = "/base/v2/ai-selfie-video/57f5a565-fd17-458b-be43-4a2d8ccaca75/v1";

// Paleta brand — usada em todos imagePrompts
const BRAND = "olive green and off-white color palette, warm natural lighting, Brazilian setting";

export const CREATIVE_PRESETS: CreativePreset[] = [
  // ─── 🧊 COLD — EDUCAR PUBLICO NOVO ─────────────────────
  {
    id: "cold-carrossel-metodo",
    label: "🧊 COLD · Método S.E.M (carrossel)",
    icon: "🌿",
    angle: "prova",
    headline: "Não é dieta. É um método",
    briefing: "Carrossel educativo apresentando os 3 pilares do Método S.E.M.",
    style: "slideshow",
    name: "COLD · método S.E.M",
    slug: "cold-metodo",
    funnel: "cold",
    templateId: TPL_IMAGE_SLIDESHOW,
    slides: [
      {
        imagePrompt: `Brazilian woman in her 40s holding a warm mug of tea in cozy wooden kitchen, soft morning light through window, editorial photography, ${BRAND}`,
        textOverlay: "Não é dieta.",
      },
      {
        imagePrompt: `Fresh homemade bread and fruit on wooden cutting board, natural kitchen setting, overhead shot, ${BRAND}`,
        textOverlay: "Simplicidade.",
      },
      {
        imagePrompt: `Brazilian woman sitting calmly by window with journal and tea, soft afternoon light, ${BRAND}`,
        textOverlay: "Equilíbrio.",
      },
      {
        imagePrompt: `Comfortable walking shoes on wooden floor next to yoga mat, warm sunlight, ${BRAND}`,
        textOverlay: "Movimento.",
      },
      {
        imagePrompt: `Open ebook on wooden table with coffee cup and plant, editorial magazine style, ${BRAND}`,
        textOverlay: "Conheça o ebook",
      },
    ],
  },
  {
    id: "cold-hook-identificacao",
    label: "🧊 COLD · Hook segundas",
    icon: "🎯",
    angle: "dor",
    headline: "Quantas segundas você já começou?",
    briefing: "Hook visual que identifica o ciclo de começar/falhar dietas.",
    style: "slideshow",
    name: "COLD · hook segundas",
    slug: "cold-hook-segunda",
    funnel: "cold",
    templateId: TPL_IMAGE_SLIDESHOW,
    slides: [
      {
        imagePrompt: `Vintage wall calendar with several Mondays marked with red X's, on textured wall, warm morning light, editorial photography, ${BRAND}`,
        textOverlay: "Quantas segundas?",
      },
      {
        imagePrompt: `Brazilian woman in her 40s looking thoughtfully out kitchen window, coffee mug in hand, soft natural light, ${BRAND}`,
        textOverlay: "Já tentou quantas dietas?",
      },
      {
        imagePrompt: `Close-up of fresh colorful fruit arranged on wooden cutting board, abundant and inviting, ${BRAND}`,
        textOverlay: "Existe outro caminho",
      },
      {
        imagePrompt: `Open ebook cover titled Emagreça Sem Dieta on wooden table with plant, warm natural light, ${BRAND}`,
        textOverlay: "Conheça o método",
      },
    ],
  },
  {
    id: "cold-diferencial",
    label: "🧊 COLD · Diferencial S.E.M",
    icon: "🌿",
    angle: "promessa",
    headline: "3 pilares: S.E.M",
    briefing: "Infográfico aspiracional dos 3 pilares do método.",
    style: "slideshow",
    name: "COLD · diferencial 3 pilares",
    slug: "cold-diferencial",
    funnel: "cold",
    templateId: TPL_IMAGE_SLIDESHOW,
    slides: [
      {
        imagePrompt: `Minimalist flatlay: plate with simple real food, cup of tea, walking shoes arranged on wooden table, overhead view, ${BRAND}`,
        textOverlay: "3 pilares",
      },
      {
        imagePrompt: `Simple plate with homemade bread, avocado, and fruit on ceramic dish, natural overhead light, ${BRAND}`,
        textOverlay: "S — Simplicidade",
      },
      {
        imagePrompt: `Brazilian woman journaling at wooden table with cup of tea, peaceful mood, soft window light, ${BRAND}`,
        textOverlay: "E — Equilíbrio",
      },
      {
        imagePrompt: `Walking shoes on path in park, morning sunlight filtering through trees, editorial lifestyle photography, ${BRAND}`,
        textOverlay: "M — Movimento",
      },
    ],
  },

  // ─── 🔥 WARM — PROVA SOCIAL ───────────────────────────
  {
    id: "warm-depoimento-video",
    label: "🔥 WARM · Depoimento narrado (voiceover)",
    icon: "🎤",
    angle: "prova",
    headline: "Uma jornada de bem-estar real",
    briefing:
      "Reel narrado por voz feminina BR + imagens (cenas, mulheres, caderno).",
    style: "auto",
    name: "WARM · depoimento narrado",
    slug: "warm-depo-reel",
    funnel: "warm",
    templateId: TPL_AI_VIDEO, // AI Video with AI Voice — narração + imagens
  },
  {
    id: "warm-talking-head",
    label: "🔥 WARM · Talking head (mulher falando)",
    icon: "👩",
    angle: "prova",
    headline: "Conversa real sobre o método",
    briefing:
      "Personagem AI consistente — mulher brasileira 40+ falando direto pra câmera.",
    style: "talking-head",
    name: "WARM · talking head",
    slug: "warm-talking-head",
    funnel: "warm",
    templateId: TPL_AI_SELFIE,
    characterDescription:
      "Brazilian woman in her early 40s, warm friendly smile, natural makeup, shoulder-length dark wavy hair, kind brown eyes, casual cream blouse, sitting in a cozy home environment with soft natural light, photorealistic style",
    scenes: [
      {
        description:
          "Brazilian woman 40s sitting comfortably at home kitchen table with warm morning light, mug of tea in hand, looking directly at camera with kind expression",
        narration:
          "Sabe quando você tenta começar uma dieta toda segunda?",
      },
      {
        description:
          "Same Brazilian woman now thoughtful, gesturing softly with hand, soft window light",
        narration:
          "Eu já passei por isso. E descobri que o problema não era força de vontade.",
      },
      {
        description:
          "Brazilian woman smiling, holding a small open book, calm warm setting",
        narration:
          "É um método educacional simples — três pilares só. Comer, equilibrar, mover.",
      },
      {
        description:
          "Brazilian woman with reassuring expression, hand near heart, warm afternoon light",
        narration:
          "Vale conhecer. O ebook tá no link aqui embaixo.",
      },
    ],
  },
  {
    id: "warm-citacao-prova",
    label: "🔥 WARM · Citações prova social",
    icon: "💬",
    angle: "prova",
    headline: "Não conto caloria. Me sinto em paz.",
    briefing: "Quote carrossel com depoimentos de mulheres.",
    style: "quote-card",
    name: "WARM · citações",
    slug: "warm-citacao",
    funnel: "warm",
    templateId: TPL_QUOTE_PAPER,
    quotes: [
      "Não conto caloria há 3 meses e me sinto em paz.",
      "Comi pão no café hoje. Sem culpa.",
      "Foi o primeiro método que fez sentido.",
      "A balança deixou de mandar no meu humor.",
      "Resultados individuais variam, mas a leveza é real.",
    ],
  },
  {
    id: "warm-objecoes",
    label: "🔥 WARM · Sem academia, sem contar",
    icon: "🚧",
    angle: "objecao",
    headline: "Sem academia. Sem contar caloria.",
    briefing: "Slideshow quebrando 4 objeções principais com cenas reais.",
    style: "slideshow",
    name: "WARM · objeções",
    slug: "warm-objecoes",
    funnel: "warm",
    templateId: TPL_IMAGE_SLIDESHOW,
    slides: [
      {
        imagePrompt: `Brazilian woman in her 40s walking casually on tree-lined sidewalk, comfortable clothing not sports gear, afternoon light, ${BRAND}`,
        textOverlay: "Sem academia",
      },
      {
        imagePrompt: `Plate with colorful real food: salad, bread, egg viewed from above, no scale or calculator, ${BRAND}`,
        textOverlay: "Sem contar caloria",
      },
      {
        imagePrompt: `Fresh homemade bread sliced on wooden board next to coffee cup, warm cozy lighting, ${BRAND}`,
        textOverlay: "Sem cortar pão",
      },
      {
        imagePrompt: `Clock on kitchen counter next to simple ingredients ready for 10-min recipe (egg, avocado, bread), ${BRAND}`,
        textOverlay: "Sem precisar de tempo",
      },
      {
        imagePrompt: `Open ebook on wooden table with list of 30 recipes highlighted, editorial magazine style, ${BRAND}`,
        textOverlay: "Tudo no ebook",
      },
    ],
  },

  // ─── 🎯 HOT — OFERTA / RETARGETING ────────────────────
  {
    id: "hot-oferta-ebook",
    label: "🎯 HOT · Oferta ebook",
    icon: "📖",
    angle: "cta",
    headline: "Ebook + 30 receitas + comunidade",
    briefing: "Mockup de oferta com entregas visuais.",
    style: "slideshow",
    name: "HOT · oferta ebook",
    slug: "hot-oferta",
    funnel: "hot",
    templateId: TPL_IMAGE_SLIDESHOW,
    slides: [
      {
        imagePrompt: `Ebook mockup titled "Emagreça Sem Dieta" on wooden table, coffee cup and plant nearby, editorial product photography, ${BRAND}`,
        textOverlay: "Ebook completo",
      },
      {
        imagePrompt: `Overhead shot of cookbook with colorful recipe photos, fresh ingredients around, ${BRAND}`,
        textOverlay: "30 receitas práticas",
      },
      {
        imagePrompt: `Three Brazilian women 35-55 laughing and talking over coffee in bright cafe, warm authentic lifestyle moment, ${BRAND}`,
        textOverlay: "Comunidade VIP",
      },
      {
        imagePrompt: `Ebook cover prominent with download button graphic, clean modern design, ${BRAND}`,
        textOverlay: "Baixar agora",
      },
    ],
  },
  {
    id: "hot-prova-numero",
    label: "🎯 HOT · Quote depoimento",
    icon: "💎",
    angle: "cta",
    headline: "Quote ancoragem",
    briefing: "Carrossel de quotes pra retargeting hot.",
    style: "quote-card",
    name: "HOT · quotes oferta",
    slug: "hot-quotes",
    funnel: "hot",
    templateId: TPL_TWEET,
    quotes: [
      "Aprendi a comer de verdade.",
      "Tirei dietas da minha vida.",
      "Não sabia que dava pra ser tão simples.",
      "Senti a diferença já na primeira semana.",
      "Vale cada minuto de leitura.",
    ],
  },
];
