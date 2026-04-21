import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emagreça Sem Dieta — Método SEM (v2 teste)",
  description:
    "Versão de teste do hero. Perca peso sem dietas restritivas. Método SEM: 3 pilares simples, plano de 7 dias pronto.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Emagreça Sem Dieta — Método SEM",
    description: "Perca peso sem dietas restritivas. 12.400+ alunas. Garantia 7 dias.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function EmagrecaV2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
