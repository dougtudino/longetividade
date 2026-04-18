// Presets de briefing pro painel "Gerar com IA" em /admin/criativos.
// Cada preset e um ponto de partida comum do negocio — user clica
// "Usar este" e o form preenche slug/nome/angulo/headline/briefing.
// User revisa, edita se quiser, e gera.

export type CreativePreset = {
  id: string;
  label: string; // texto do botao
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
  name: string; // nome sugerido pro creative
  slug: string; // slug base (sera sufixado auto se colidir)
};

export const CREATIVE_PRESETS: CreativePreset[] = [
  {
    id: "dor-dieta",
    label: "Dor · Cansada de dietas",
    icon: "💔",
    angle: "dor",
    headline: "Você merece uma relação leve com a comida",
    briefing:
      "Cena: mulher 35-55 em cozinha luminosa, expressão serena, segurando " +
      "uma fruta. Visual acolhedor com elementos naturais (madeira, verde). " +
      "Headline no canto sobrepondo a imagem. Evoca abordagem educativa, " +
      "sem restrição. Paleta quente: verde-oliva + terracota + off-white.",
    style: "slideshow",
    name: "Dor · cansada de dietas",
    slug: "dor-dieta",
  },
  {
    id: "dor-balanca",
    label: "Dor · Bem-estar além do número",
    icon: "🪷",
    angle: "dor",
    headline: "Bem-estar é mais que um número",
    briefing:
      "Cena: mulher em ambiente zen (yoga, janela, luz natural da manhã). " +
      "Olhar calmo, postura relaxada. Headline sobreposta com tipografia " +
      "elegante. Propõe olhar holístico pro cuidado. Paleta suave: bege, " +
      "off-white, verde-salva.",
    style: "slideshow",
    name: "Dor · bem-estar além do número",
    slug: "dor-balanca",
  },
  {
    id: "prova-metodo",
    label: "Prova · 3 pilares S.E.M",
    icon: "🌿",
    angle: "prova",
    headline: "Simplicidade, Equilíbrio, Movimento",
    briefing:
      "Infográfico educativo apresentando o conceito do Método S.E.M. " +
      "3 pilares lado a lado: Simplicidade alimentar, Equilíbrio emocional, " +
      "Movimento diário. Resultados individuais variam. " +
      "Visual elegante, paleta verde-oliva.",
    style: "infographic",
    name: "Prova · método S.E.M",
    slug: "prova-metodo",
  },
  {
    id: "objecao-academia",
    label: "Objeção · Movimento natural",
    icon: "🚶",
    angle: "objecao",
    headline: "Movimento natural, todo dia",
    briefing:
      "Infográfico educativo sobre movimento integrado ao cotidiano: " +
      "caminhar, subir escada, alongar. Ebook ensina princípios pra " +
      "tornar movimento um hábito sustentável. Visual acolhedor.",
    style: "infographic",
    name: "Objeção · academia",
    slug: "objecao-academia",
  },
  {
    id: "objecao-tempo",
    label: "Objeção · Simplicidade na cozinha",
    icon: "⏰",
    angle: "objecao",
    headline: "Comida boa, simples de montar",
    briefing:
      "Visual educativo sobre simplicidade alimentar. Receitas práticas, " +
      "montagem rápida, aproveitamento de ingredientes. Ebook traz 30 " +
      "receitas testadas. Tom prático, paleta quente.",
    style: "infographic",
    name: "Objeção · tempo",
    slug: "objecao-tempo",
  },
  {
    id: "promessa-leveza",
    label: "Promessa · Relação leve com comida",
    icon: "🍃",
    angle: "promessa",
    headline: "Relação leve com a comida",
    briefing:
      "Mesa posta com comida real (salada, pão caseiro, fruta, chá). " +
      "Fotografia editorial estilo revista de bem-estar. Headline em canto " +
      "com tipografia serifada delicada. Aspiracional sem ser idealizado. " +
      "Paleta quente, iluminação natural, respiro.",
    style: "slideshow",
    name: "Promessa · leveza",
    slug: "promessa-leveza",
  },
  {
    id: "cta-direto",
    label: "CTA · Baixe o ebook",
    icon: "📖",
    angle: "cta",
    headline: "Conheça o Método S.E.M no ebook",
    briefing:
      "Slideshow apresentando o ebook Emagreça Sem Dieta. Mostrar capa + " +
      "3 pontos educativos: (1) abordagem sem contagem rigorosa, (2) receitas " +
      "práticas, (3) acesso à comunidade. Visual profissional, paleta de marca.",
    style: "slideshow",
    name: "CTA · baixe ebook",
    slug: "cta-baixe-ebook",
  },
  {
    id: "prova-jornada",
    label: "Prova · Jornada de bem-estar (talking head)",
    icon: "🎤",
    angle: "prova",
    headline: "Uma jornada de bem-estar sustentável",
    briefing:
      "Mulher 40+ brasileira falando pra câmera com tom calmo. " +
      "Compartilha interesse em abordagem educativa de bem-estar alimentar. " +
      "Apresenta o Método S.E.M como proposta educacional. " +
      "Menciona que resultados individuais variam. " +
      "Fundo casa aconchegante, luz natural.",
    style: "talking-head",
    name: "Prova · jornada bem-estar",
    slug: "prova-jornada-th",
  },
];
