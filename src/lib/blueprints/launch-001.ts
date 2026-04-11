// Blueprint LAUNCH-001 — Campanha Meta Pioneira
// Desenhada por @growth Gaia (council 2026-04-11)
// Filosofia: start small, test aggressive, scale what works

import type { AdSetSpec, CreativeSpec, Targeting } from "../meta-launcher";

const SITE = "https://www.longetividade.com.br";
const BASE_LINK = `${SITE}/c/instagram?utm_source=meta&utm_medium=cpc&utm_campaign=long-aq-01`;

export const LAUNCH_001 = {
  id: "LAUNCH-001",
  campaign: {
    name: "LONG-AQ-01-Conversao-Pioneer-Mar2026",
    objective: "OUTCOME_SALES" as const,
    status: "PAUSED" as const,
  },
  customAudiences: [
    {
      key: "ca_compradores",
      name: "LONG-CA-Compradores",
      retentionDays: 180,
      description: "Pessoas que dispararam o evento Purchase nos ultimos 180 dias",
    },
    {
      key: "ca_pageview_7d",
      name: "LONG-CA-PageView-7d",
      retentionDays: 7,
      description: "Visitantes do site nos ultimos 7 dias (source para retargeting)",
    },
    {
      key: "ca_pageview_30d",
      name: "LONG-CA-PageView-30d",
      retentionDays: 30,
      description: "Visitantes do site nos ultimos 30 dias (source para lookalike futuro)",
    },
  ],
  // Ad sets: 3 cold ativos + 2 reservados (lookalike + retarget) ativados Day 5
  adSets: [
    {
      key: "aset_01",
      name: "ASET-01-Interesse-Emagrecimento-Amplo",
      daily_budget_cents: 3000, // R$ 30/dia
      utmContent: "interesse-amplo",
      copyKeys: ["copy_a", "copy_b", "copy_c"],
      creativeKeys: ["feed_dor", "feed_objecao"],
      targeting: {
        age_min: 30,
        age_max: 50,
        genders: [2],
        geo_locations: { countries: ["BR"] },
        // Sem flexible_spec — Meta otimiza por conversao via promoted_object
      } as Targeting,
      excludeAudienceKey: "ca_compradores",
    },
    {
      key: "aset_02",
      name: "ASET-02-Interesse-Reeducacao",
      daily_budget_cents: 3000,
      utmContent: "reeducacao",
      copyKeys: ["copy_a", "copy_c"],
      creativeKeys: ["feed_dor", "feed_prova"],
      targeting: {
        age_min: 30,
        age_max: 50,
        genders: [2],
        geo_locations: { countries: ["BR"] },
      } as Targeting,
      excludeAudienceKey: "ca_compradores",
    },
    {
      key: "aset_03",
      name: "ASET-03-Maes-Pos-parto",
      daily_budget_cents: 3000,
      utmContent: "maes-pos-parto",
      copyKeys: ["copy_a", "copy_b"],
      creativeKeys: ["feed_dor", "feed_objecao"],
      targeting: {
        age_min: 28,
        age_max: 42,
        genders: [2],
        geo_locations: { countries: ["BR"] },
      } as Targeting,
      excludeAudienceKey: "ca_compradores",
    },
  ],
  copies: {
    copy_a: {
      id: "COPY-A",
      name: "Identificacao",
      headline: "Metodo S.E.M — Emagreca sem dieta",
      description: "A partir de R$ 37 · Reeducacao alimentar real",
      message: `Voce nao precisa passar fome pra emagrecer.

Voce precisa entender por que TUDO que voce tentou ate hoje te trouxe de volta pro mesmo lugar.

O Metodo S.E.M e diferente:
✓ Sem dieta restritiva
✓ Sem cortar carboidrato
✓ Sem balanca no banheiro

E reeducacao alimentar real, pro seu corpo de mulher de verdade.

👉 Conheca o metodo aqui`,
    },
    copy_b: {
      id: "COPY-B",
      name: "Prova Social",
      headline: "Metodo S.E.M — Emagreca sem dieta",
      description: "A partir de R$ 37 · Reeducacao alimentar real",
      message: `+1.000 mulheres ja descobriram o Metodo S.E.M esse mes.

Barbara, 38 anos, perdeu 4kg em 30 dias sem academia e sem cortar pao do cafe.

"Achei que ia ser mais um metodo. Era diferente. Eu como, to feliz, e to emagrecendo."

Quer ser a proxima?
👉 Comece hoje a partir de R$ 37`,
    },
    copy_c: {
      id: "COPY-C",
      name: "Quebra de Objecao",
      headline: "Metodo S.E.M — Emagreca sem dieta",
      description: "A partir de R$ 37 · Reeducacao alimentar real",
      message: `"Eu ja tentei TUDO."

Eu sei. Cetogenica, jejum, low carb, shake. Funcionou? Por quanto tempo?

O problema nao e voce. E o metodo.

Reeducacao alimentar nao e dieta — e aprender a comer com prazer sem culpa, sem fome e sem voltar pro mesmo lugar daqui 3 meses.

Conheca o S.E.M 👉`,
    },
  },
  // Os 6 criativos componentes do CREATIVE-001 (chave usada como filename)
  creatives: [
    { key: "feed_dor", componentName: "creative-feed-dor", width: 1080, height: 1080 },
    { key: "feed_prova", componentName: "creative-feed-prova", width: 1080, height: 1080 },
    { key: "feed_objecao", componentName: "creative-feed-objecao", width: 1080, height: 1080 },
    { key: "story_stat", componentName: "creative-story-stat", width: 1080, height: 1920 },
    { key: "story_cta", componentName: "creative-story-cta", width: 1080, height: 1920 },
    { key: "banner_display", componentName: "creative-banner-display", width: 1200, height: 628 },
  ],
} as const;

export type Blueprint = typeof LAUNCH_001;

// Helper: dado um adSet, monta o link com utm_content correto
export function adSetLink(utmContent: string): string {
  return `${BASE_LINK}&utm_content=${utmContent}`;
}

// Helper: copy spec completo para criar adcreative
export function buildCreativeSpec(
  blueprint: Blueprint,
  copyKey: string,
  imageHash: string,
  link: string,
  adSetName: string
): CreativeSpec {
  const copy = (blueprint.copies as Record<string, { headline: string; description: string; message: string; id: string; name: string }>)[copyKey];
  if (!copy) {
    throw new Error(`Copy ${copyKey} nao encontrada no blueprint`);
  }
  return {
    name: `${adSetName}__${copy.id}`,
    imageHash,
    message: copy.message,
    headline: copy.headline,
    description: copy.description,
    link,
    cta: "LEARN_MORE",
  };
}
