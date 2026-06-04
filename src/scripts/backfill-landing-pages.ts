// Backfill da Fase 1 (refactor LP): cria uma LandingPage por workspace LT a
// partir do conteúdo legado (Workspace.landingContent → blocos) e religa os
// assets/prova social pela FK nova.
//
// NÃO DESTRUTIVO e IDEMPOTENTE:
//   - não apaga nada;
//   - LandingPage criada via upsert por slug (rerun não duplica);
//   - relink só preenche landingPageId onde está NULL (não sobrescreve);
//   - não mexe em Workspace.landingContent (continua servindo o site antigo).
//
// Rodar (tsx não carrega .env.local — passa DATABASE_URL inline):
//   DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/longetividade" \
//     npx tsx src/scripts/backfill-landing-pages.ts
//
// Critério de inclusão: workspace que TEM plano 'lt' (= produto servido por
// /lt/[slug]) OU que já tem landingContent preenchido. Assim corretor-blindado
// (landingContent null, mas com plano lt) ganha sua LandingPage a partir do
// DEFAULT_LT_CONTENT, e qualquer workspace com conteúdo custom também.

import { prisma } from "../lib/prisma";
import { resolveLtContent } from "../lib/landing-content";
import { blocksFromLegacy } from "../lib/blocks/from-legacy";

async function main() {
  const workspaces = await prisma.workspace.findMany({
    include: { plans: { select: { planKey: true } } },
  });

  let pagesCreated = 0;
  let pagesExisting = 0;
  let assetsLinked = 0;
  let proofLinked = 0;

  for (const ws of workspaces) {
    const hasLtPlan = ws.plans.some((p) => p.planKey === "lt");
    const hasContent =
      ws.landingContent != null &&
      typeof ws.landingContent === "object" &&
      Object.keys(ws.landingContent as object).length > 0;

    if (!hasLtPlan && !hasContent) {
      console.log(`· skip ${ws.slug} (sem plano lt e sem landingContent)`);
      continue;
    }

    const content = resolveLtContent(ws.landingContent);
    const blocks = blocksFromLegacy(content);

    // upsert por slug (idempotente). Se já existe, não sobrescreve os blocos
    // (pode já ter sido editado no admin).
    const existing = await prisma.landingPage.findUnique({
      where: { slug: ws.slug },
      select: { id: true },
    });

    let pageId: string;
    if (existing) {
      pageId = existing.id;
      pagesExisting++;
      console.log(`= ${ws.slug}: LandingPage já existe (${pageId})`);
    } else {
      const page = await prisma.landingPage.create({
        data: {
          workspaceId: ws.id,
          slug: ws.slug,
          title: ws.brandName || ws.name,
          blocks: blocks as object,
          status: "published",
        },
        select: { id: true },
      });
      pageId = page.id;
      pagesCreated++;
      console.log(`+ ${ws.slug}: LandingPage criada (${pageId}, ${blocks.length} blocos)`);
    }

    // Relink assets e prova social por lpSlug == workspace.slug, só onde a FK
    // ainda está nula (não sobrescreve vínculos já feitos).
    const a = await prisma.lpAsset.updateMany({
      where: { lpSlug: ws.slug, landingPageId: null },
      data: { landingPageId: pageId },
    });
    assetsLinked += a.count;

    const s = await prisma.socialProofItem.updateMany({
      where: { lpSlug: ws.slug, landingPageId: null },
      data: { landingPageId: pageId },
    });
    proofLinked += s.count;

    if (a.count || s.count) {
      console.log(`  ↳ religados: ${a.count} assets, ${s.count} prova social`);
    }
  }

  // Diagnóstico: assets órfãos (lpSlug que não bate com nenhum workspace).
  const orphanAssets = await prisma.lpAsset.count({ where: { landingPageId: null } });
  const orphanProof = await prisma.socialProofItem.count({ where: { landingPageId: null } });

  console.log("\n── Resumo ──────────────────────────────");
  console.log(`LandingPages criadas:   ${pagesCreated}`);
  console.log(`LandingPages já existiam: ${pagesExisting}`);
  console.log(`Assets religados:        ${assetsLinked}`);
  console.log(`Prova social religada:   ${proofLinked}`);
  console.log(`Assets ainda órfãos:     ${orphanAssets} (lpSlug sem workspace correspondente)`);
  console.log(`Prova social órfã:       ${orphanProof}`);
  console.log("─────────────────────────────────────────");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Backfill falhou:", e);
    process.exit(1);
  });
