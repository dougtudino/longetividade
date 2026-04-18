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
    headline: "Você não precisa de mais uma dieta",
    briefing:
      "Mulher 35-55 frustrada com dietas restritivas que nunca duram. " +
      "Validar a dor: comer escondido, recomeçar toda segunda, culpa. " +
      "Método S.E.M (Simplicidade, Equilíbrio, Movimento) não exige contar calorias. " +
      "Tom: acolhedor, sem julgamento.",
    style: "quote-card",
    name: "Dor · cansada de dietas",
    slug: "dor-dieta",
  },
  {
    id: "dor-balanca",
    label: "Dor · Ansiedade na balança",
    icon: "😰",
    angle: "dor",
    headline: "A balança não devia mandar no seu humor",
    briefing:
      "Dor: mulher acorda e sobe na balança antes de qualquer coisa. " +
      "Humor da semana depende do número. Ebook mostra como romper esse ciclo " +
      "sem abandonar o cuidado com o corpo.",
    style: "quote-card",
    name: "Dor · ansiedade balança",
    slug: "dor-balanca",
  },
  {
    id: "prova-metodo",
    label: "Prova · Método S.E.M",
    icon: "🌿",
    angle: "prova",
    headline: "1.240 mulheres emagreceram sem contar caloria",
    briefing:
      "Prova social do Método S.E.M: centenas de mulheres perderam peso " +
      "com leveza, mantendo resultado por 6+ meses. 3 pilares: Simplicidade " +
      "alimentar, Equilíbrio emocional, Movimento diário. Visual elegante, " +
      "paleta verde-oliva.",
    style: "infographic",
    name: "Prova · método S.E.M",
    slug: "prova-metodo",
  },
  {
    id: "objecao-academia",
    label: "Objeção · Sem academia",
    icon: "🚫",
    angle: "objecao",
    headline: "Emagrecer sem pisar em academia",
    briefing:
      "Quebra a objeção 'preciso de academia'. Movimento vital: caminhar, " +
      "subir escada, alongar. 15min/dia já muda metabolismo. Ebook ensina " +
      "como tornar movimento natural do dia-a-dia.",
    style: "infographic",
    name: "Objeção · academia",
    slug: "objecao-academia",
  },
  {
    id: "objecao-tempo",
    label: "Objeção · Sem tempo pra cozinhar",
    icon: "⏰",
    angle: "objecao",
    headline: "Comida boa não precisa ser complicada",
    briefing:
      "Quebra objeção 'não tenho tempo pra cozinhar'. Simplicidade alimentar: " +
      "receitas de 10min, montagem prática, aproveitar sobras. Ebook tem " +
      "30 receitas rápidas validadas.",
    style: "infographic",
    name: "Objeção · tempo",
    slug: "objecao-tempo",
  },
  {
    id: "promessa-leveza",
    label: "Promessa · Leveza sem culpa",
    icon: "🍃",
    angle: "promessa",
    headline: "Comer com prazer e emagrecer",
    briefing:
      "Promessa: leveza real, sem neurose com comida. Come pão, chocolate, " +
      "sobremesa no fim de semana. O corpo responde ao PADRÃO, não ao " +
      "detalhe isolado. Tom aspiracional, calmo.",
    style: "quote-card",
    name: "Promessa · leveza",
    slug: "promessa-leveza",
  },
  {
    id: "cta-direto",
    label: "CTA · Conheça o ebook",
    icon: "📖",
    angle: "cta",
    headline: "Descubra o Método S.E.M",
    briefing:
      "CTA direto: conhecer ebook Emagreça Sem Dieta. Mostrar capa + 3 benefícios: " +
      "(1) sem contagem de calorias, (2) receitas práticas, (3) comunidade VIP. " +
      "Urgência moderada — oferta atual.",
    style: "slideshow",
    name: "CTA · conheça ebook",
    slug: "cta-direto",
  },
  {
    id: "prova-depoimento",
    label: "Prova · Depoimento (talking head)",
    icon: "🎤",
    angle: "prova",
    headline: "Eu voltei a me sentir bem",
    briefing:
      "Mulher brasileira 40+ falando pra camera com tom calmo e acolhedor. " +
      "Conta que tentou N dietas e sempre voltava pior. Descobriu método S.E.M " +
      "e em 3 meses perdeu peso sem culpa. Termina convidando pra conhecer o ebook. " +
      "Fundo casa aconchegante, luz natural.",
    style: "talking-head",
    name: "Prova · depoimento talking head",
    slug: "prova-depoimento-th",
  },
];
