// Seed inicial de coleções de criativos.
// Quando Doug/Barbara clicar "Seed inicial" em /admin/criativos, isso
// popula a colecao LAUNCH-001 Pioneer com os 6 criativos ja existentes
// no registry.

import { CREATIVES_REGISTRY } from "@/components/creatives/registry";

export type SeedCollection = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  creatives: Array<{
    slug: string;
    componentKey: keyof typeof CREATIVES_REGISTRY;
    name?: string; // opcional — usa defaultName do registry se ausente
    tags?: string[]; // opcional — usa defaultTags do registry se ausente
    description?: string;
  }>;
};

export const INITIAL_COLLECTIONS: SeedCollection[] = [
  {
    slug: "launch-001-pioneer",
    name: "LAUNCH-001 · Pioneer",
    description:
      "6 criativos iniciais da primeira campanha Meta Ads do Longetividade. Desenhados pela Uma no council 2026-04-11 e reescritos para Meta Ad Policy compliance (sem números de peso, sem timeframes, foco no método e experiência emocional).",
    icon: "🌱",
    creatives: [
      { slug: "feed-dor", componentKey: "creative-feed-dor" },
      { slug: "feed-prova", componentKey: "creative-feed-prova" },
      { slug: "feed-objecao", componentKey: "creative-feed-objecao" },
      { slug: "story-stat", componentKey: "creative-story-stat" },
      { slug: "story-cta", componentKey: "creative-story-cta" },
      { slug: "banner-display", componentKey: "creative-banner-display" },
    ],
  },
];
