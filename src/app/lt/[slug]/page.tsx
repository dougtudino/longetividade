import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LtLanding from "@/components/lt/lt-landing";
import { getLtLandingBySlug } from "@/lib/lt-landing-data";

// Rota dinâmica de LP de Low Ticket. Replicação sem código: cria workspace +
// plano 'lt' + preenche conteúdo no admin → /lt/<slug> entra no ar.
// Só serve workspaces que tenham um plano 'lt' (= produto LT de verdade).

type Ctx = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLtLandingBySlug(slug);
  if (!data) return {};
  return { title: `${data.content.heroTitle} — ${data.brandName}`, description: data.content.heroSubtitle };
}

export default async function LtSlugPage({ params }: Ctx) {
  const { slug } = await params;
  const data = await getLtLandingBySlug(slug);
  if (!data || !data.plans.some((p) => p.planKey === "lt")) notFound();
  return <LtLanding content={data.content} plans={data.plans} heroImg={data.heroImg} brandName={data.brandName} />;
}
