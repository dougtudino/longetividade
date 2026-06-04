import type { Metadata } from "next";
import LtLanding from "@/components/lt/lt-landing";
import { getLtLandingBySlug } from "@/lib/lt-landing-data";
import { DEFAULT_LT_CONTENT } from "@/lib/landing-content";
import type { WorkspacePlanView } from "@/lib/workspace-plans";

// LP do LT "Corretor Blindado" — agora renderizada pelo template genérico
// LtLanding, alimentado por dados do workspace (conteúdo + planos + foto).
// Fallback pro DEFAULT garante render mesmo antes da migração / sem DB.

export const metadata: Metadata = {
  title: "Corretor Blindado — a papelada que ninguém te ensinou",
  description:
    "O curso não ensinou, o estágio te abandonou. O mapa da documentação imobiliária que blinda sua próxima venda — e vira seu diferencial.",
};

const SLUG = "corretor-blindado";

const FALLBACK_PLANS: WorkspacePlanView[] = [
  { planKey: "lt", label: "Corretor Blindado", priceCents: 2700, checkoutUrl: "#", orderIndex: 0 },
  { planKey: "bump", label: "Pack de Contratos", priceCents: 1700, checkoutUrl: "#", orderIndex: 1 },
  { planKey: "upsell", label: "Casos Difíceis", priceCents: 19700, checkoutUrl: "#", orderIndex: 2 },
];

export default async function CorretorBlindadoPage() {
  const data = await getLtLandingBySlug(SLUG);
  return (
    <LtLanding
      content={data?.content ?? DEFAULT_LT_CONTENT}
      plans={data && data.plans.length > 0 ? data.plans : FALLBACK_PLANS}
      heroImg={data?.heroImg ?? null}
      brandName={data?.brandName ?? "Corretor Blindado"}
    />
  );
}
