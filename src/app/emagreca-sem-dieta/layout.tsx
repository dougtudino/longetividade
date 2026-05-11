import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emagreça Sem Dieta — Método SEM",
  description:
    "Perca peso de forma permanente sem passar fome. O Método SEM transforma sua relação com a comida com 3 pilares científicos. De R$147 por R$67.",
  openGraph: {
    title: "Emagreça Sem Dieta — Método SEM | De R$147 por R$67",
    description:
      "Perca peso sem dietas restritivas. 12.400+ alunas transformadas. Garantia de 7 dias.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emagreça Sem Dieta — Método SEM",
    description:
      "Perca peso sem dietas restritivas. De R$147 por R$67. Garantia de 7 dias.",
  },
};

export default function EmagrecaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
