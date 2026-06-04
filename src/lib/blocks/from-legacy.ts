// Ponte legado → blocos. Converte o LtContent (8 seções fixas do template
// antigo) no array de blocos tipados do motor novo. Função PURA, escrita uma
// vez só e usada por:
//   - o backfill da Fase 1 (src/scripts/backfill-landing-pages.ts)
//   - o seed do template "Padrão atual" (Fase 2)
//   - fallback de render quando uma LP ainda não tem blocos próprios
//
// A ordem dos blocos aqui = a ordem em que o LtLanding antigo renderizava:
// hero → dores → reframe → módulos → oferta → garantia.

import type { LtContent } from "../landing-content";
import type { Blocks } from "./schema";

// IDs estáveis e determinísticos (sem Date.now/random) pra o backfill ser
// idempotente e reexecutável sem duplicar/renumerar blocos.
export function blocksFromLegacy(c: LtContent): Blocks {
  let order = 0;
  const next = () => order++;

  return [
    {
      id: "legacy-hero",
      type: "hero",
      order: next(),
      props: {
        badge: c.heroBadge,
        title: c.heroTitle,
        highlight: c.heroHighlight,
        subtitle: c.heroSubtitle,
        ctaLabel: c.heroCtaPrefix,
        note: c.heroNote,
        accent: c.accent,
        bg: c.bg,
      },
    },
    {
      id: "legacy-pains",
      type: "bullets",
      order: next(),
      props: {
        title: c.doresTitle,
        variant: "pains",
        items: c.dores.map((d) => ({ title: d.t, text: d.d })),
      },
    },
    {
      id: "legacy-reframe",
      type: "reframe",
      order: next(),
      props: {
        title: c.reframeTitle,
        highlight: c.reframeHighlight,
        body: c.reframeBody,
      },
    },
    {
      id: "legacy-modules",
      type: "bullets",
      order: next(),
      props: {
        title: c.modulesTitle,
        variant: "checklist",
        items: c.modules.map((m) => ({ text: m })),
      },
    },
    {
      id: "legacy-offer",
      type: "offer",
      order: next(),
      props: {
        title: c.pricingTitle,
        subtitle: c.pricingSubtitle,
        planKey: "lt",
      },
    },
    {
      id: "legacy-guarantee",
      type: "guarantee",
      order: next(),
      props: { text: c.guarantee },
    },
  ];
}
