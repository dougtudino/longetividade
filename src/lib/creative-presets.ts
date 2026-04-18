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
    label: "🧊 COLD · Carrossel educativo S.E.M",
    icon: "🧊",
    angle: "prova",
    headline: "Não é dieta. É um método",
    briefing:
      "Carrossel educativo 5 slides. S1: headline + pergunta 'Quantas dietas você já tentou?'. " +
      "S2: 'Toda dieta tem prazo. Todo prazo termina.' visual calendário. " +
      "S3: 'Método S.E.M é educacional, não restritivo'. S4: 3 pilares — " +
      "Simplicidade (comida real), Equilíbrio (emoções), Movimento (rotina). " +
      "S5: CTA 'Baixe o ebook gratuito'. Paleta verde-oliva + off-white, fotografia natural.",
    style: "carousel",
    name: "COLD · carrossel método S.E.M",
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
    label: "🔥 WARM · Carrossel prova social",
    icon: "💬",
    angle: "prova",
    headline: "O que elas dizem sobre o método",
    briefing:
      "Carrossel 4 slides com citações curtas de mulheres (15-20 palavras cada). " +
      "S1: 'Depois de anos tentando, o S.E.M foi o primeiro método que fez sentido' " +
      "S2: 'Não conto caloria há 3 meses e me sinto em paz' " +
      "S3: 'Comi pão no café hoje. Sem culpa' " +
      "S4: CTA 'Conheça o ebook'. " +
      "Visual: fundos texturizados suaves, tipografia serifada elegante. Resultados variam.",
    style: "carousel",
    name: "WARM · carrossel prova",
    slug: "warm-carrossel-prova",
    funnel: "warm",
  },

  // ─── WARM: QUEBRA DE OBJEÇÃO ─────────────────────────────
  {
    id: "warm-objecoes",
    label: "🔥 WARM · Quebra 4 objeções",
    icon: "🚧",
    angle: "objecao",
    headline: "Sem academia, sem contar, sem cortar",
    briefing:
      "Carrossel 4 slides respondendo objeções reais: " +
      "S1: 'Sem academia? Sim. Movimento diário conta.' " +
      "S2: 'Sem contar caloria? Sim. Foco em padrão.' " +
      "S3: 'Sem cortar pão/doce? Sim. Sem demonizar alimento.' " +
      "S4: 'Sem tempo? Receitas de 10min no ebook.' " +
      "Visual: ícone + frase curta por slide. Paleta verde-oliva, fundo claro.",
    style: "carousel",
    name: "WARM · 4 objeções",
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
