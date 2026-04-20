import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { getLauncherCreds, uploadAdImage } from "@/lib/meta-launcher";
import { seedCopiesForCollection } from "@/lib/creative-copies-seed";

// POST /api/admin/campaigns/blueprint/[launchId]/prepare
//
// Verifica pre-requisitos do launch e faz o que der no server:
// 1. CreativeCollection existe? (check-only — nao cria do zero,
//    precisa ter sido seedada via /admin/criativos)
// 2. Creatives com metaImageHash populado? (upload automatico dos
//    AI-generated via imageUrl; React-based precisam upload via UI)
// 3. CreativeCopies existem pra cada creative? (chama seed-copies
//    interno se vazio)
//
// Retorna checklist com status de cada item. Frontend usa pra guiar
// proximos passos manuais (se houver).

type CheckItem = {
  key: string;
  label: string;
  status: "ok" | "fixed" | "warning" | "error";
  detail?: string;
  actionUrl?: string;
  actionLabel?: string;
};

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ launchId: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { launchId } = await ctx.params;
  const blueprint = await prisma.launchBlueprint.findUnique({
    where: { launchId },
    include: {
      audiences: true,
      adSets: true,
    },
  });
  if (!blueprint) {
    return NextResponse.json({ ok: false, error: "Blueprint nao encontrado" }, { status: 404 });
  }

  const checklist: CheckItem[] = [];
  const creds = await getLauncherCreds();

  // ─── 1. Collections ──────────────────────────────────────────
  const requiredSlugs = Array.from(
    new Set(
      blueprint.adSets
        .map((a) => a.creativesCollectionId)
        .filter((s): s is string => !!s)
    )
  );

  for (const slug of requiredSlugs) {
    const collection = await prisma.creativeCollection.findUnique({
      where: { slug },
      include: {
        creatives: {
          where: { archived: false },
          include: { copies: true },
        },
      },
    });
    if (!collection) {
      checklist.push({
        key: `collection:${slug}`,
        label: `Collection "${slug}"`,
        status: "error",
        detail: "Nao existe. Crie em /admin/criativos (botao Seed LAUNCH-001 ou Nova colecao).",
        actionUrl: "/admin/criativos",
        actionLabel: "Abrir Criativos",
      });
      continue;
    }
    if (collection.creatives.length === 0) {
      checklist.push({
        key: `collection:${slug}`,
        label: `Collection "${slug}"`,
        status: "error",
        detail: "Vazia — adicione criativos via /admin/criativos.",
        actionUrl: `/admin/criativos`,
        actionLabel: "Abrir Criativos",
      });
      continue;
    }
    checklist.push({
      key: `collection:${slug}`,
      label: `Collection "${slug}"`,
      status: "ok",
      detail: `${collection.creatives.length} criativo(s)`,
    });

    // ─── 2. metaImageHash ────────────────────────────────────
    const withoutHash = collection.creatives.filter((c) => !c.metaImageHash);
    if (withoutHash.length === 0) {
      checklist.push({
        key: `hashes:${slug}`,
        label: `Meta Image Hash (${slug})`,
        status: "ok",
        detail: `${collection.creatives.length}/${collection.creatives.length} uploadados`,
      });
    } else {
      // Upload automatico dos AI-generated (tem imageUrl CDN)
      let fixed = 0;
      let stillMissing = 0;
      if (creds) {
        for (const cr of withoutHash) {
          if (!cr.imageUrl) {
            stillMissing += 1;
            continue;
          }
          try {
            const res = await fetch(cr.imageUrl);
            if (!res.ok) {
              stillMissing += 1;
              continue;
            }
            const buf = Buffer.from(await res.arrayBuffer());
            const base64 = `data:image/png;base64,${buf.toString("base64")}`;
            const up = await uploadAdImage(
              creds,
              base64,
              `${cr.slug}-${cr.width}x${cr.height}.png`
            );
            if (up.ok) {
              await prisma.creative.update({
                where: { id: cr.id },
                data: { metaImageHash: up.hash },
              });
              fixed += 1;
            } else {
              stillMissing += 1;
            }
          } catch {
            stillMissing += 1;
          }
        }
      } else {
        stillMissing = withoutHash.length;
      }

      if (stillMissing === 0) {
        checklist.push({
          key: `hashes:${slug}`,
          label: `Meta Image Hash (${slug})`,
          status: "fixed",
          detail: `${fixed} uploadado(s) automaticamente`,
        });
      } else {
        checklist.push({
          key: `hashes:${slug}`,
          label: `Meta Image Hash (${slug})`,
          status: "warning",
          detail: `${stillMissing} criativo(s) React-based precisam upload manual via UI (gera PNG no browser)`,
          actionUrl: `/admin/criativos`,
          actionLabel: "Upload pra Meta",
        });
      }
    }

    // ─── 3. Copies ──────────────────────────────────────────
    const reloaded = await prisma.creativeCollection.findUnique({
      where: { slug },
      include: {
        creatives: {
          where: { archived: false },
          include: { copies: true },
        },
      },
    });
    const withoutCopy = reloaded!.creatives.filter((c) => c.copies.length === 0);
    if (withoutCopy.length === 0) {
      checklist.push({
        key: `copies:${slug}`,
        label: `Copies (${slug})`,
        status: "ok",
        detail: `Todos criativos tem pelo menos 1 copy`,
      });
    } else {
      // Chama logica direto (sem fetch loopback — nao funciona em serverless)
      const seedResult = await seedCopiesForCollection(slug);
      checklist.push({
        key: `copies:${slug}`,
        label: `Copies (${slug})`,
        status: seedResult.ok ? "fixed" : "error",
        detail: seedResult.ok
          ? `${seedResult.count} copy(ies) seedadas`
          : `Falha: ${seedResult.error}`,
      });
    }
  }

  // ─── 4. META_PAGE_ID (pre-req de criar ads) ─────────────
  if (creds?.pageId) {
    checklist.push({
      key: "page_id",
      label: "Meta Page ID (pre-req dos ads)",
      status: "ok",
      detail: creds.pageId,
    });
  } else {
    checklist.push({
      key: "page_id",
      label: "Meta Page ID",
      status: "error",
      detail: "META_PAGE_ID nao configurado. Ads nao serao criados. Set em /admin/configuracoes.",
      actionUrl: "/admin/configuracoes",
      actionLabel: "Configurar",
    });
  }

  const hasBlockers = checklist.some((c) => c.status === "error");
  const hasWarnings = checklist.some((c) => c.status === "warning");

  return NextResponse.json({
    ok: !hasBlockers,
    ready: !hasBlockers && !hasWarnings,
    checklist,
  });
}
