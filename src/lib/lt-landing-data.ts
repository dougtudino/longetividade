// Loader server-side dos dados do template de LT por workspace slug.
// Junta: Workspace (marca/conteúdo) + WorkspacePlan (preços) + LpAsset (hero).
// Usado por /corretor-blindado e pela rota dinâmica /lt/[slug].

import { prisma } from "./prisma";
import { getWorkspacePlans, type WorkspacePlanView } from "./workspace-plans";
import { resolveLtContent, type LtContent } from "./landing-content";
import { blocksFromLegacy } from "./blocks/from-legacy";
import { parseBlocksLenient, type Blocks } from "./blocks/schema";
import type { SocialProofView } from "@/components/lt/block-renderer";

export type LtLandingData = {
  workspaceId: string;
  slug: string;
  brandName: string;
  content: LtContent;
  plans: WorkspacePlanView[];
  heroImg: string | null;
};

export type LtBlocksData = {
  workspaceId: string;
  slug: string;
  brandName: string;
  blocks: Blocks;
  plans: WorkspacePlanView[];
  heroImg: string | null;
  socialProof: SocialProofView[];
};

// Loader block-based de /lt/[slug]. Prefere LandingPage.blocks (motor novo);
// se a LP ainda não existe no banco (pré-backfill), cai pro legado
// (landingContent → blocksFromLegacy) — strangler, nada quebra. Retorna null se
// o workspace não existe ou não é um produto LT (sem plano 'lt').
export async function getLtBlocksBySlug(slug: string): Promise<LtBlocksData | null> {
  try {
    const page = await prisma.landingPage.findUnique({
      where: { slug },
      select: { id: true, workspaceId: true, blocks: true, status: true },
    });

    // Caminho novo: LandingPage existe e está publicada.
    if (page && page.status === "published") {
      const ws = await prisma.workspace.findUnique({
        where: { id: page.workspaceId },
        select: { brandName: true, status: true },
      });
      if (!ws || ws.status === "archived") return null;

      const [plans, heroAsset, proof] = await Promise.all([
        getWorkspacePlans(page.workspaceId),
        prisma.lpAsset.findFirst({
          where: { OR: [{ landingPageId: page.id }, { lpSlug: slug }], key: "hero.professional" },
          select: { imageUrl: true },
        }),
        prisma.socialProofItem.findMany({
          where: { OR: [{ landingPageId: page.id }, { lpSlug: slug }], active: true },
          orderBy: { orderIndex: "asc" },
          select: { imageUrl: true, alt: true, name: true, caption: true },
        }),
      ]);
      if (!plans.some((p) => p.planKey === "lt")) return null;

      return {
        workspaceId: page.workspaceId,
        slug,
        brandName: ws.brandName,
        blocks: parseBlocksLenient(page.blocks),
        plans,
        heroImg: heroAsset?.imageUrl ?? null,
        socialProof: proof,
      };
    }

    // Fallback legado: deriva blocos do landingContent/DEFAULT do workspace.
    const legacy = await getLtLandingBySlug(slug);
    if (!legacy || !legacy.plans.some((p) => p.planKey === "lt")) return null;
    return {
      workspaceId: legacy.workspaceId,
      slug: legacy.slug,
      brandName: legacy.brandName,
      blocks: blocksFromLegacy(legacy.content),
      plans: legacy.plans,
      heroImg: legacy.heroImg,
      socialProof: [],
    };
  } catch {
    return null;
  }
}

export async function getLtLandingBySlug(slug: string): Promise<LtLandingData | null> {
  try {
    const ws = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true, slug: true, brandName: true, landingContent: true, status: true },
    });
    if (!ws || ws.status === "archived") return null;

    const [plans, heroAsset] = await Promise.all([
      getWorkspacePlans(ws.id),
      prisma.lpAsset.findFirst({
        where: { lpSlug: slug, key: "hero.professional" },
        select: { imageUrl: true },
      }),
    ]);

    return {
      workspaceId: ws.id,
      slug: ws.slug,
      brandName: ws.brandName,
      content: resolveLtContent(ws.landingContent),
      plans,
      heroImg: heroAsset?.imageUrl ?? null,
    };
  } catch {
    return null;
  }
}
