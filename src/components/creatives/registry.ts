// Registry central de componentes de criativos.
// Quando criarmos criativo novo: (1) crie o component TSX em creatives/,
// (2) adiciona aqui no registry com componentKey unico, (3) cadastra na
// CreativeCollection via /api/admin/creatives/collections/[slug] ou via
// seed.
//
// O componentKey e a chave estavel — nao muda mesmo se o nome do arquivo
// ou o titulo mudar. Banco referencia por componentKey.

import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from "react";
import CreativeFeedDor from "./creative-feed-dor";
import CreativeFeedProva from "./creative-feed-prova";
import CreativeFeedObjecao from "./creative-feed-objecao";
import CreativeStoryStat from "./creative-story-stat";
import CreativeStoryCta from "./creative-story-cta";
import CreativeBannerDisplay from "./creative-banner-display";

// Tipo unificado pros components de criativo (ForwardRef com ref de div)
export type CreativeComponent = ForwardRefExoticComponent<RefAttributes<HTMLDivElement>>;

export type RegistryEntry = {
  componentKey: string;
  Component: CreativeComponent | ComponentType;
  defaultName: string;
  format: "feed" | "story" | "banner" | "custom";
  width: number;
  height: number;
  defaultTags: string[];
  description: string;
};

export const CREATIVES_REGISTRY: Record<string, RegistryEntry> = {
  "creative-feed-dor": {
    componentKey: "creative-feed-dor",
    Component: CreativeFeedDor,
    defaultName: "Feed · Dor / Identificacao",
    format: "feed",
    width: 1080,
    height: 1080,
    defaultTags: ["dor", "identificacao", "pt-BR"],
    description:
      "Headline dor: 'O problema nao e comer demais. E comer sem consciencia.' Paleta bege + verde oliva. Logo L no topo, CTA verde bottom.",
  },
  "creative-feed-prova": {
    componentKey: "creative-feed-prova",
    Component: CreativeFeedProva,
    defaultName: "Feed · Prova Social",
    format: "feed",
    width: 1080,
    height: 1080,
    defaultTags: ["prova-social", "testemunho", "pt-BR"],
    description:
      "+1.000 mulheres conheceram o metodo. Testemunho Barbara sem numeros de peso (Meta Ad Policy safe). Fundo verde oliva gradient.",
  },
  "creative-feed-objecao": {
    componentKey: "creative-feed-objecao",
    Component: CreativeFeedObjecao,
    defaultName: "Feed · Quebra de Objecao",
    format: "feed",
    width: 1080,
    height: 1080,
    defaultTags: ["objecao", "comparativo", "pt-BR"],
    description:
      "'Nao e dieta. E reeducacao.' Lista comparativa vs/com 6 items. Fundo bege, checkmarks verdes.",
  },
  "creative-story-stat": {
    componentKey: "creative-story-stat",
    Component: CreativeStoryStat,
    defaultName: "Story · Sem dieta, sem culpa",
    format: "story",
    width: 1080,
    height: 1920,
    defaultTags: ["story", "emocional", "pt-BR"],
    description:
      "'Sem dieta. Sem culpa. Sem peso emocional.' Hero emotion-driven, bege + verde. CTA arraste pra cima.",
  },
  "creative-story-cta": {
    componentKey: "creative-story-cta",
    Component: CreativeStoryCta,
    defaultName: "Story · CTA Comece Hoje",
    format: "story",
    width: 1080,
    height: 1920,
    defaultTags: ["story", "cta", "conversao", "pt-BR"],
    description:
      "Comece hoje a partir de R$37. Card branco com preco destacado, CTA dourado. Fundo gradient verde escuro.",
  },
  "creative-banner-display": {
    componentKey: "creative-banner-display",
    Component: CreativeBannerDisplay,
    defaultName: "Banner · Google Display",
    format: "banner",
    width: 1200,
    height: 628,
    defaultTags: ["banner", "google-display", "horizontal", "pt-BR"],
    description:
      "Banner horizontal 1200x628 para Google Display Network. Logo + headline + preco.",
  },
};

export function getCreativeComponent(componentKey: string): RegistryEntry | null {
  return CREATIVES_REGISTRY[componentKey] ?? null;
}

export function listRegistryKeys(): string[] {
  return Object.keys(CREATIVES_REGISTRY);
}
