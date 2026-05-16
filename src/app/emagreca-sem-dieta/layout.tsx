import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendário Detox 21 Dias — Volte ao controle sem dieta",
  description:
    "21 dias, 1 calendário, hábitos simples. Sem dieta restritiva, sem culpa, sem recomeçar segunda. A partir de R$67. Garantia de 7 dias.",
  openGraph: {
    title: "Calendário Detox 21 Dias — Volte ao controle sem dieta",
    description:
      "Pare de começar dieta na segunda-feira. +12.400 mulheres aceitaram o desafio. Garantia de 7 dias.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendário Detox 21 Dias",
    description:
      "Pare de começar dieta na segunda-feira. A partir de R$67. Garantia de 7 dias.",
  },
};

export default function EmagrecaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
