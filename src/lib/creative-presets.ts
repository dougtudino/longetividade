// Presets de briefing pro painel "Gerar com IA" em /admin/criativos.
//
// Estrutura de CONVERSAO REAL (direct response):
//   1. HOOK — pergunta/frase que para o scroll (primeiros 3s)
//   2. IDENTIFICACAO — "se voce ja tentou X, Y, Z..."
//   3. DIFERENCIAL — "nao e mais uma dieta, e [algo unico]"
//   4. PROVA — numero, regra, metodo especifico (nao vago)
//   5. CTA — especifico + beneficio ("baixe o ebook + 30 receitas")
//
// Cada preset mapeia pra um FUNIL STAGE especifico:
//   COLD     → educacao (carrossel, video historia)
//   WARM     → prova social (depoimento, carrossel prova)
//   HOT/RTG  → oferta direta (single image + CTA)

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
};

export const CREATIVE_PRESETS: CreativePreset[] = [
  // ─── COLD: EDUCAR PUBLICO NOVO ──────────────────────────
  {
    id: "cold-carrossel-metodo",
    label: "🧊 COLD · Método S.E.M educativo",
    icon: "🧊",
    angle: "prova",
    headline: "Não é dieta. É um método",
    briefing:
      "Mesa de madeira clara com comida real (pão caseiro, fruta cortada, " +
      "xícara de café, caderno aberto). Cena aconchegante, luz natural " +
      "de manhã. Headline 'Não é dieta. É um método' em canto sobre a cena. " +
      "Paleta verde-oliva + off-white + terracota. Tom editorial mas caloroso.",
    style: "slideshow",
    name: "COLD · método S.E.M educativo",
    slug: "cold-metodo",
    funnel: "cold",
  },
  {
    id: "cold-hook-identificacao",
    label: "🧊 COLD · Hook identificação",
    icon: "🎯",
    angle: "dor",
    headline: "Quantas segundas você já começou?",
    briefing:
      "Hook visual forte: calendário de segunda-feira marcado com X's vermelhos, " +
      "headline grande sobrepondo. Tom direto mas empático. Mulher 35-55 em ambiente real " +
      "(cozinha com comida normal, não acadêmico). Evoca identificação imediata com " +
      "ciclo de tentar/falhar/recomeçar. CTA rodapé 'Abordagem diferente no ebook'.",
    style: "slideshow",
    name: "COLD · hook identificação",
    slug: "cold-hook-segunda",
    funnel: "cold",
  },

  // ─── WARM: PROVA SOCIAL ──────────────────────────────────
  {
    id: "warm-depoimento-video",
    label: "🔥 WARM · Depoimento em vídeo",
    icon: "🎤",
    angle: "prova",
    headline: "Uma jornada de bem-estar real",
    briefing:
      "Mulher 40+ brasileira, ambiente doméstico real (não estúdio), luz natural. " +
      "Fala direto pra câmera sobre interesse em abordagem educativa que não exige " +
      "restrição rigorosa. Cita o Método S.E.M como proposta que estuda há meses. " +
      "Tom genuíno, sem performar. Resultados individuais variam. 15-20s. " +
      "CTA verbal final: 'Baixei o ebook, vale pelo menos conhecer'.",
    style: "talking-head",
    name: "WARM · depoimento vídeo",
    slug: "warm-depo-video",
    funnel: "warm",
  },
  {
    id: "warm-carrossel-prova",
    label: "🔥 WARM · Citação prova social",
    icon: "💬",
    angle: "prova",
    headline: "Não conto caloria. Me sinto em paz.",
    briefing:
      "Cena: xícara de chá sobre livro aberto em mesa de madeira, " +
      "luz natural de janela ao fundo (fora de foco). Headline em " +
      "tipografia serifada delicada no canto superior. Aparência " +
      "de citação literária. Paleta quente (bege, verde-oliva). " +
      "Resultados individuais variam.",
    style: "slideshow",
    name: "WARM · citação prova",
    slug: "warm-citacao-prova",
    funnel: "warm",
  },

  // ─── WARM: QUEBRA DE OBJEÇÃO ─────────────────────────────
  {
    id: "warm-objecoes",
    label: "🔥 WARM · Sem academia, sem contar",
    icon: "🚧",
    angle: "objecao",
    headline: "Sem academia. Sem contar caloria.",
    briefing:
      "Cena: mulher 40+ caminhando em calçada com árvores, luz " +
      "da tarde, roupa casual (nao atletica academica). Atitude " +
      "relaxada, sorriso leve. Headline sobrepondo no canto com " +
      "tipografia direta. Comunica movimento natural acessível. " +
      "Paleta verde, amarelo suave, off-white.",
    style: "slideshow",
    name: "WARM · quebra objeções",
    slug: "warm-objecoes",
    funnel: "warm",
  },

  // ─── HOT: OFERTA DIRETA / RETARGETING ───────────────────
  {
    id: "hot-oferta-ebook",
    label: "🎯 HOT · Oferta direta (mockup + CTA)",
    icon: "📖",
    angle: "cta",
    headline: "Ebook + 30 receitas + comunidade",
    briefing:
      "Mockup ebook 'Emagreça Sem Dieta' centralizado sobre mesa de madeira. " +
      "Lado direito lista 3 entregas visuais: 📖 Método S.E.M completo, " +
      "🥗 30 receitas de 10min, 💬 Acesso comunidade VIP. CTA 'Baixar agora' " +
      "em botão destacado. Paleta de marca, fotografia profissional. " +
      "Ideal pra público que ja viu posts orgânicos ou visitou landing.",
    style: "slideshow",
    name: "HOT · oferta direta ebook",
    slug: "hot-oferta-ebook",
    funnel: "hot",
  },
  {
    id: "hot-prova-numero",
    label: "🎯 HOT · Prova + preço",
    icon: "💎",
    angle: "cta",
    headline: "Ebook + 30 receitas · R$ 27",
    briefing:
      "Split screen vertical. Esquerda: mulher 40+ em cozinha com comida real. " +
      "Direita: badge R$ 27, mockup ebook, 3 bullets (Método + Receitas + Comunidade). " +
      "CTA inferior 'Acesso imediato' cor destaque. Preço visível é gatilho " +
      "de ancoragem pra retargeting. Resultados individuais variam.",
    style: "slideshow",
    name: "HOT · prova + preço",
    slug: "hot-prova-preco",
    funnel: "hot",
  },

  // ─── COLD COMPLEMENTAR: DIFERENCIAL ÚNICO ───────────────
  {
    id: "cold-diferencial",
    label: "🧊 COLD · Diferencial único",
    icon: "🌿",
    angle: "promessa",
    headline: "O que 73% das dietas não tem",
    briefing:
      "Infográfico: círculo com 3 setores coloridos (Simplicidade verde-oliva, " +
      "Equilíbrio dourado, Movimento terracota). Centro: logo S.E.M. " +
      "Abaixo headline questionando o que falta em dietas tradicionais. " +
      "Rodapé CTA 'Entenda os 3 pilares no ebook'. Visual editorial elegante " +
      "mas direto, NÃO abstrato.",
    style: "infographic",
    name: "COLD · diferencial",
    slug: "cold-diferencial",
    funnel: "cold",
  },
];
