// Templates default seedados em /api/admin/templates/seed.
//   1. "Padrão Longetividade" = o mapeamento das 8 seções legadas (idêntico ao
//      que /lt servia), pronto pra usar.
//   2. "12 Dobras" = esqueleto de LP de alta conversão com slots ROTULADOS e
//      VAZIOS. NÃO contém conteúdo de nenhum curso — Doug preenche cada dobra.

import { DEFAULT_LT_CONTENT } from "../landing-content";
import { blocksFromLegacy } from "./from-legacy";
import type { Blocks } from "./schema";

export const TEMPLATE_PADRAO: { name: string; niche: string; blocks: Blocks } = {
  name: "Padrão Longetividade",
  niche: "info-produto",
  blocks: blocksFromLegacy(DEFAULT_LT_CONTENT),
};

// Esqueleto "12 dobras". Cada bloco tem um título-rótulo indicando a dobra e
// props vazias pra preencher. Ordem = fluxo clássico de copy.
export const TEMPLATE_12_DOBRAS: { name: string; niche: string; blocks: Blocks } = {
  name: "12 Dobras",
  niche: "info-produto",
  blocks: [
    { id: "d1", type: "hero", order: 0, props: { badge: "", title: "Dobra 1 — Promessa principal", highlight: "", subtitle: "", ctaLabel: "Quero agora — ", note: "" } },
    { id: "d2", type: "reframe", order: 1, props: { title: "Dobra 2 — Identificação do problema", highlight: "", body: "" } },
    { id: "d3", type: "bullets", order: 2, props: { title: "Dobra 3 — Dores / agitação", variant: "pains", items: [] } },
    { id: "d4", type: "reframe", order: 3, props: { title: "Dobra 4 — Apresentação da solução", highlight: "", body: "" } },
    { id: "d5", type: "bullets", order: 4, props: { title: "Dobra 5 — O que tem dentro", variant: "checklist", items: [] } },
    { id: "d6", type: "videoSales", order: 5, props: { title: "Dobra 6 — Vídeo de vendas (opcional)", videoUrl: "" } },
    { id: "d7", type: "testimonials", order: 6, props: { title: "Dobra 7 — Depoimentos", items: [] } },
    { id: "d8", type: "priceComparison", order: 7, props: { title: "Dobra 8 — Comparativo de planos", columns: [] } },
    { id: "d9", type: "offer", order: 8, props: { title: "Dobra 9 — Oferta", subtitle: "", planKey: "lt" } },
    { id: "d10", type: "guarantee", order: 9, props: { text: "Dobra 10 — Garantia (preencher)" } },
    { id: "d11", type: "faq", order: 10, props: { title: "Dobra 11 — Quebra de objeções (FAQ)", items: [] } },
    { id: "d12", type: "cta", order: 11, props: { label: "Dobra 12 — Chamada final", planKey: "lt", note: "" } },
  ],
};

export const DEFAULT_TEMPLATES = [TEMPLATE_PADRAO, TEMPLATE_12_DOBRAS];
