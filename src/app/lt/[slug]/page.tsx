import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlockRenderer from "@/components/lt/block-renderer";
import { getLtBlocksBySlug } from "@/lib/lt-landing-data";

// Rota dinâmica de LP de Low Ticket (block-based). Replicação sem código: cria
// workspace + plano 'lt' + LandingPage (blocos) no admin → /lt/<slug> entra no
// ar. Só serve workspaces com plano 'lt' (= produto LT de verdade).

type Ctx = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLtBlocksBySlug(slug);
  if (!data) return {};
  const hero = data.blocks.find((b) => b.type === "hero");
  const title = hero?.type === "hero" ? hero.props.title : data.brandName;
  const description = hero?.type === "hero" ? hero.props.subtitle : undefined;
  return { title: `${title} — ${data.brandName}`, description };
}

export default async function LtSlugPage({ params }: Ctx) {
  const { slug } = await params;
  const data = await getLtBlocksBySlug(slug);
  if (!data) notFound();
  return (
    <BlockRenderer
      blocks={data.blocks}
      plans={data.plans}
      heroImg={data.heroImg}
      brandName={data.brandName}
      socialProof={data.socialProof}
    />
  );
}
