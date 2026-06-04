// Loader server-side dos dados do template de LT por workspace slug.
// Junta: Workspace (marca/conteúdo) + WorkspacePlan (preços) + LpAsset (hero).
// Usado por /corretor-blindado e pela rota dinâmica /lt/[slug].

import { prisma } from "./prisma";
import { getWorkspacePlans, type WorkspacePlanView } from "./workspace-plans";
import { resolveLtContent, type LtContent } from "./landing-content";

export type LtLandingData = {
  workspaceId: string;
  slug: string;
  brandName: string;
  content: LtContent;
  plans: WorkspacePlanView[];
  heroImg: string | null;
};

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
