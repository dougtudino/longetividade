import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_COLLECTIONS } from "@/lib/creatives-seed";
import { CREATIVES_REGISTRY } from "@/components/creatives/registry";

// POST /api/admin/creatives/seed
// Popula as colecoes iniciais definidas em lib/creatives-seed.ts
// Idempotente: se colecao ja existe, reusa. Skip creatives ja cadastrados
// (match por collectionId+slug unico).
export async function POST() {
  let collectionsCreated = 0;
  let collectionsSkipped = 0;
  let creativesCreated = 0;
  let creativesSkipped = 0;
  const errors: string[] = [];

  try {
    for (const seed of INITIAL_COLLECTIONS) {
      // Upsert colecao por slug
      let collection = await prisma.creativeCollection.findUnique({
        where: { slug: seed.slug },
      });

      if (!collection) {
        collection = await prisma.creativeCollection.create({
          data: {
            slug: seed.slug,
            name: seed.name,
            description: seed.description,
            icon: seed.icon,
          },
        });
        collectionsCreated += 1;
      } else {
        collectionsSkipped += 1;
      }

      // Upsert criativos
      for (const c of seed.creatives) {
        const registryEntry = CREATIVES_REGISTRY[c.componentKey];
        if (!registryEntry) {
          errors.push(`Registry key ausente: ${c.componentKey}`);
          continue;
        }

        const existing = await prisma.creative.findUnique({
          where: {
            collectionId_slug: {
              collectionId: collection.id,
              slug: c.slug,
            },
          },
        });

        if (existing) {
          creativesSkipped += 1;
          continue;
        }

        try {
          await prisma.creative.create({
            data: {
              collectionId: collection.id,
              slug: c.slug,
              componentKey: c.componentKey,
              name: c.name ?? registryEntry.defaultName,
              format: registryEntry.format,
              width: registryEntry.width,
              height: registryEntry.height,
              description: c.description ?? registryEntry.description,
              tags: c.tags ?? [...registryEntry.defaultTags],
            },
          });
          creativesCreated += 1;
        } catch (e) {
          errors.push(`${c.slug}: ${(e as Error).message}`);
        }
      }
    }

    return NextResponse.json({
      ok: errors.length === 0,
      collectionsCreated,
      collectionsSkipped,
      creativesCreated,
      creativesSkipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: `Falha global: ${(e as Error).message}. Se e logo apos deploy, aguarde 1-2min.`,
    });
  }
}

export async function GET() {
  return POST();
}
