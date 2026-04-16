import type { Plan } from "@/types/order";

const HOTMART_PRODUCT = "H105141835Q";

export const PLANS: Plan[] = [
  {
    id: "basico",
    name: "Basico",
    price: 37,
    priceInCents: 3700,
    installments: "6x de R$ 6,17",
    checkoutUrl: `https://pay.hotmart.com/${HOTMART_PRODUCT}?off=zxq5tgew&src=site-basico`,
    features: [
      "Ebook completo Metodo S.E.M",
      "Plano de 7 dias + cardapio",
      "Lista de compras",
      "Checklist diario",
      "Tabela de substituicoes",
      "10 atalhos de aceleracao",
    ],
    highlighted: false,
    ctaLabel: "QUERO ESSE",
  },
  {
    id: "completo",
    name: "Completo",
    price: 67,
    priceInCents: 6700,
    installments: "6x de R$ 11,17",
    checkoutUrl: `https://pay.hotmart.com/${HOTMART_PRODUCT}?off=uzvdkzkf&src=site-completo`,
    features: [
      "Ebook completo Metodo S.E.M",
      "Plano de 7 dias + cardapio",
      "Lista de compras",
      "Checklist diario",
      "Tabela de substituicoes",
      "10 atalhos de aceleracao",
      "Guia de controle emocional avancado",
      "Planner mensal imprimivel",
      "Acesso grupo WhatsApp (30 dias)",
    ],
    highlighted: true,
    ctaLabel: "MAIS ESCOLHIDO",
  },
  {
    id: "vip",
    name: "VIP",
    price: 97,
    priceInCents: 9700,
    installments: "6x de R$ 16,17",
    checkoutUrl: `https://pay.hotmart.com/${HOTMART_PRODUCT}?off=h84hak4e&src=site-vip`,
    features: [
      "Ebook completo Metodo S.E.M",
      "Plano de 7 dias + cardapio",
      "Lista de compras",
      "Checklist diario",
      "Tabela de substituicoes",
      "10 atalhos de aceleracao",
      "Guia de controle emocional avancado",
      "Planner mensal imprimivel",
      "Acesso grupo WhatsApp (30 dias)",
      "Guia de Receitas S.E.M — 30 receitas praticas (PDF)",
      "Desafio 21 Dias — programa diario por email",
      "Diario de Autoconhecimento imprimivel (PDF)",
      "APP de acompanhamento vitalicio",
    ],
    highlighted: false,
    ctaLabel: "QUERO ESSE",
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
