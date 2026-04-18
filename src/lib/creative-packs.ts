// Packs de carrossel: gera 5 criativos complementares pra subir como
// Carousel Ad no Meta Ads Manager (swipe de 5 imagens).
//
// Cada pack tem 5 sub-criativos com angulos especificos seguindo a
// estrutura de direct response: HOOK → PROBLEMA → METODO → PROVA → CTA.
//
// Admin gera o pack (5 × 1cr = 5cr total), baixa as 5 imagens,
// sobe manualmente no Meta Ads Manager como carousel.

export type PackSlide = {
  subSlug: string; // sufixo do slug base (ex: "-1-hook")
  name: string;
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
};

export type CreativePack = {
  id: string;
  label: string;
  icon: string;
  slidesDescription: string; // pra UI explicar
  slides: PackSlide[];
};

export const CREATIVE_PACKS: CreativePack[] = [
  {
    id: "pack-metodo-sem",
    label: "📦 Pack: Método S.E.M (5 slides)",
    icon: "🌿",
    slidesDescription: "Hook → Problema → Método → Prova → CTA",
    slides: [
      {
        subSlug: "1-hook",
        name: "Slide 1 — Hook",
        angle: "dor",
        headline: "Quantas segundas você já começou?",
        briefing:
          "Calendário sobre mesa de madeira, algumas segundas-feiras marcadas " +
          "em vermelho, outras em branco. Headline em canto com tipografia forte. " +
          "Paleta quente, luz natural. Evoca ciclo conhecido de tentar/falhar.",
        style: "slideshow",
      },
      {
        subSlug: "2-problema",
        name: "Slide 2 — Problema",
        angle: "dor",
        headline: "Toda dieta tem prazo",
        briefing:
          "Ampulheta sobre prato vazio em mesa clara. Headline sobreposta " +
          "comunicando que dieta restritiva sempre termina. Visual minimalista " +
          "editorial. Paleta bege, terracota suave.",
        style: "slideshow",
      },
      {
        subSlug: "3-metodo",
        name: "Slide 3 — Método S.E.M",
        angle: "promessa",
        headline: "3 pilares: S.E.M",
        briefing:
          "Cena aconchegante: 3 elementos agrupados representando os pilares — " +
          "prato simples com comida real (Simplicidade), xícara de chá (Equilíbrio), " +
          "tênis de caminhada (Movimento). Headline central elegante. Paleta de marca.",
        style: "slideshow",
      },
      {
        subSlug: "4-prova",
        name: "Slide 4 — Prova social",
        angle: "prova",
        headline: "Mulheres que conheceram o método",
        briefing:
          "Grupo de 3 mulheres 35-55 tomando café em ambiente aconchegante, " +
          "conversando relaxadas, luz quente de tarde. Headline inferior " +
          "comunicando comunidade. Resultados individuais variam. " +
          "Paleta quente, autenticidade UGC.",
        style: "slideshow",
      },
      {
        subSlug: "5-cta",
        name: "Slide 5 — CTA ebook",
        angle: "cta",
        headline: "Baixe o ebook + 30 receitas",
        briefing:
          "Mockup ebook 'Emagreça Sem Dieta' sobre mesa de madeira, ao lado " +
          "lista visual: 📖 Método S.E.M, 🥗 30 receitas, 💬 Comunidade. " +
          "CTA destacado inferior. Paleta de marca, fotografia profissional.",
        style: "slideshow",
      },
    ],
  },
  {
    id: "pack-objecoes",
    label: "📦 Pack: Quebra de objeções (5 slides)",
    icon: "🚧",
    slidesDescription: "5 objeções quebradas visualmente",
    slides: [
      {
        subSlug: "1-academia",
        name: "Slide 1 — Sem academia",
        angle: "objecao",
        headline: "Sem academia",
        briefing:
          "Mulher 40+ caminhando em calçada com árvores, luz da tarde, " +
          "roupa casual (não atlética). Headline em canto superior. " +
          "Paleta verde natural, amarelo suave.",
        style: "slideshow",
      },
      {
        subSlug: "2-caloria",
        name: "Slide 2 — Sem contar caloria",
        angle: "objecao",
        headline: "Sem contar caloria",
        briefing:
          "Prato com comida real (salada colorida, pão, ovo cozido) visto " +
          "de cima. Nada de balança ou calculadora. Headline elegante no canto. " +
          "Paleta quente, fotografia editorial.",
        style: "slideshow",
      },
      {
        subSlug: "3-pao",
        name: "Slide 3 — Sem cortar pão",
        angle: "objecao",
        headline: "Sem cortar pão ou doce",
        briefing:
          "Pão caseiro fatiado sobre tábua de madeira, ao lado xícara " +
          "de café. Cena calorosa, sem culpa. Headline em canto com " +
          "tipografia serifada. Paleta terracota + bege.",
        style: "slideshow",
      },
      {
        subSlug: "4-tempo",
        name: "Slide 4 — Sem tempo",
        angle: "objecao",
        headline: "Sem ter tempo pra cozinhar",
        briefing:
          "Relógio sobre bancada ao lado de ingredientes simples prontos " +
          "pra uma receita de 10min (ovo, abacate, pão). Headline no canto. " +
          "Visual pratico, luz de cozinha real.",
        style: "slideshow",
      },
      {
        subSlug: "5-cta",
        name: "Slide 5 — CTA ebook",
        angle: "cta",
        headline: "Tudo isso no ebook",
        briefing:
          "Mockup ebook com as 30 receitas em evidência, fundo mesa limpa. " +
          "CTA destacado 'Baixar agora'. Paleta de marca.",
        style: "slideshow",
      },
    ],
  },
];
