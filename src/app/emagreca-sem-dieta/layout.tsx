import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emagreca Sem Dieta — Metodo SEM",
  description:
    "Perca peso de forma permanente sem passar fome. O Metodo SEM transforma sua relacao com a comida com 3 pilares cientificos. De R$97 por R$27.",
  openGraph: {
    title: "Emagreca Sem Dieta — Metodo SEM | De R$97 por R$27",
    description:
      "Perca peso sem dietas restritivas. 12.400+ alunos transformados. Garantia de 7 dias.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emagreca Sem Dieta — Metodo SEM",
    description:
      "Perca peso sem dietas restritivas. De R$97 por R$27. Garantia de 7 dias.",
  },
};

export default function EmagrecaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
