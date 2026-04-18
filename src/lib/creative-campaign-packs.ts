// Campaign Pack: gera bateria completa de criativos em multiplos formatos
// pra uma campanha Meta Ads (Feed + Stories + Reels) numa tacada.
//
// Diferenca do creative-packs.ts:
//   - creative-packs: 5 slides do MESMO formato (pra virar Carousel Ad manual)
//   - campaign-packs: N angulos × M formatos (feed+story+reel) pronto pra AdSet

import type { CreativePreset } from "./creative-presets";

export type CampaignVariation = {
  format: "feed" | "story" | "banner";
  styleOverride?: CreativePreset["style"];
  slugSuffix: string; // sufixo no slug (ex: "-feed", "-story")
  nameSuffix: string;
};

export type CampaignPack = {
  id: string;
  label: string;
  icon: string;
  description: string;
  // Angulos a gerar (cada um vira 1 criativo por formato)
  angles: Array<{
    angleId: string; // referencia a CREATIVE_PRESETS
    label: string;
  }>;
  // Formatos a gerar pra cada angulo
  variations: CampaignVariation[];
};

export const CAMPAIGN_PACKS: CampaignPack[] = [
  {
    id: "cp-launch-full",
    label: "🚀 Launch Completo (9 criativos)",
    icon: "🚀",
    description: "3 ângulos × 3 formatos (Feed + Story + Reel). Ideal pra lançamento cold + warm.",
    angles: [
      { angleId: "cold-hook-identificacao", label: "Hook identificação" },
      { angleId: "warm-depoimento-video", label: "Depoimento (reel)" },
      { angleId: "hot-oferta-ebook", label: "Oferta direta" },
    ],
    variations: [
      { format: "feed", slugSuffix: "-feed", nameSuffix: "feed 1:1" },
      { format: "story", slugSuffix: "-story", nameSuffix: "story 9:16" },
      { format: "feed", slugSuffix: "-feed-v2", nameSuffix: "feed v2", styleOverride: "slideshow" },
    ],
  },
  {
    id: "cp-cold-test",
    label: "🧊 Cold Test (4 criativos)",
    icon: "🧊",
    description: "2 ângulos × 2 formatos. Pra testar hook com público frio.",
    angles: [
      { angleId: "cold-hook-identificacao", label: "Hook" },
      { angleId: "cold-diferencial", label: "Diferencial" },
    ],
    variations: [
      { format: "feed", slugSuffix: "-feed", nameSuffix: "feed" },
      { format: "story", slugSuffix: "-story", nameSuffix: "story" },
    ],
  },
  {
    id: "cp-retarget-hot",
    label: "🎯 Retargeting Hot (4 criativos)",
    icon: "🎯",
    description: "Oferta + prova × feed + story. Pra público que já viu organic/landing.",
    angles: [
      { angleId: "hot-oferta-ebook", label: "Oferta" },
      { angleId: "hot-prova-numero", label: "Prova social" },
    ],
    variations: [
      { format: "feed", slugSuffix: "-feed", nameSuffix: "feed" },
      { format: "story", slugSuffix: "-story", nameSuffix: "story" },
    ],
  },
];
