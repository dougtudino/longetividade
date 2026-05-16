import type { Plan } from "@/types/order";

const HOTMART_PRODUCT = "H105141835Q";

// Posicionamento Calendario Detox 21 Dias: nomes e bullets em linguagem
// tangivel (calendario, checklist, planner) em vez de linguagem de curso
// (ebook, metodo). IDs basico|completo|vip permanecem — sao consumidos por
// Hotmart webhook, admin, emails de pos-compra e PlanId em types/order.ts.
export const PLANS: Plan[] = [
  {
    id: "basico",
    name: "Digital",
    price: 67,
    priceInCents: 6700,
    installments: "12x de R$ 6,49",
    checkoutUrl: `https://pay.hotmart.com/${HOTMART_PRODUCT}?off=zxq5tgew&src=site-basico`,
    features: [
      "Calendario Detox 21 Dias (PDF A4 imprimivel)",
      "Plano de 7 dias com cardapio simples",
      "Lista de compras semanal",
      "Checklist diario pra colar na geladeira",
      "Tabela de substituicoes alimentares",
      "10 atalhos que destravam a continuidade",
    ],
    highlighted: false,
    ctaLabel: "QUERO MEU CALENDARIO",
  },
  {
    id: "completo",
    name: "Kit Detox",
    price: 147,
    priceInCents: 14700,
    installments: "12x de R$ 14,24",
    checkoutUrl: `https://pay.hotmart.com/${HOTMART_PRODUCT}?off=uzvdkzkf&src=site-completo`,
    features: [
      "Tudo do plano Digital",
      "Guia de controle emocional avancado (PDF)",
      "Planner mensal pra continuar depois dos 21 dias",
      "Grupo no WhatsApp por 30 dias — tira duvidas com a comunidade",
    ],
    highlighted: true,
    ctaLabel: "QUERO MEU KIT",
  },
  {
    id: "vip",
    name: "VIP",
    price: 297,
    priceInCents: 29700,
    installments: "12x de R$ 28,76",
    checkoutUrl: `https://pay.hotmart.com/${HOTMART_PRODUCT}?off=h84hak4e&src=site-vip`,
    features: [
      "Tudo do Kit Detox",
      "30 receitas praticas pra rotina corrida (PDF)",
      "Desafio 21 Dias guiado por email — um dia de cada vez",
      "Diario de Autoconhecimento imprimivel (PDF)",
      "App de acompanhamento vitalicio",
    ],
    highlighted: false,
    ctaLabel: "QUERO O VIP",
  },
];

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

// Helpers pra reusar em admin pages (evita hardcode de precos/offers)
export const PLAN_BASICO = PLANS[0];
export const PLAN_COMPLETO = PLANS[1];
export const PLAN_VIP = PLANS[2];

export const HOTMART_CHECKOUT_URL = `https://pay.hotmart.com/${HOTMART_PRODUCT}`;

export const PLAN_SUMMARY = PLANS.map((p) => ({
  name: p.name,
  price: `R$ ${p.price},00`,
  offerId: p.checkoutUrl.split("off=")[1] ?? "",
  highlighted: p.highlighted,
}));

export function getOfferIdByPlan(planId: string): string {
  const plan = getPlanById(planId);
  if (!plan) return "";
  return plan.checkoutUrl.split("off=")[1] ?? "";
}
