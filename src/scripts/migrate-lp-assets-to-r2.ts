// src/scripts/migrate-lp-assets-to-r2.ts
// Migra as imagens atuais de /public/images/ pro R2 e popula a tabela LpAsset.
//
// USAGE (importante: tsx NÃO carrega .env.local por default):
//   npx tsx --env-file=.env.local src/scripts/migrate-lp-assets-to-r2.ts
//   npx tsx --env-file=.env.local src/scripts/migrate-lp-assets-to-r2.ts --force  (força re-upload)
//
// Idempotente: se LpAsset já existe pra aquela (lpSlug, key), pula (a menos que --force).
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "../lib/prisma";
import { processImage, makeAssetKey } from "../lib/image-pipeline";
import { uploadToR2 } from "../lib/r2";
import { SLOTS_EMAGRECA } from "../data/lp-asset-slots";

const LP_SLUG = "emagreca-sem-dieta";
const FORCE = process.argv.includes("--force");

async function main() {
  console.log(`\n[migrate] LP=${LP_SLUG} · force=${FORCE}\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const slot of SLOTS_EMAGRECA) {
    const existing = await prisma.lpAsset.findUnique({
      where: { lpSlug_key: { lpSlug: LP_SLUG, key: slot.key } },
    });
    if (existing && !FORCE) {
      console.log(`  ⊘ ${slot.key.padEnd(20)} — já existe (${existing.imageUrl.slice(-60)})`);
      skipped++;
      continue;
    }

    try {
      const publicPath = resolve(process.cwd(), "public", slot.fallback.replace(/^\//, ""));
      const rawBuffer = await readFile(publicPath);
      console.log(`  ⇧ ${slot.key.padEnd(20)} — lendo ${publicPath} (${(rawBuffer.length / 1024).toFixed(0)}KB)`);

      // Passa targetWidth/targetHeight do slot pra pipeline aplicar crop cover consistente.
      const processed = await processImage(rawBuffer, {
        targetWidth: slot.targetWidth,
        targetHeight: slot.targetHeight,
      });
      const r2Key = makeAssetKey("lp-assets", `${LP_SLUG}-${slot.key.replace(/\./g, "-")}`);
      const url = await uploadToR2({
        key: r2Key,
        body: processed.buffer,
        contentType: processed.contentType,
      });

      await prisma.lpAsset.upsert({
        where: { lpSlug_key: { lpSlug: LP_SLUG, key: slot.key } },
        create: {
          lpSlug: LP_SLUG,
          key: slot.key,
          imageUrl: url,
          alt: slot.label,
          width: processed.width,
          height: processed.height,
        },
        update: {
          imageUrl: url,
          alt: slot.label,
          width: processed.width,
          height: processed.height,
        },
      });

      console.log(
        `    ✓ WebP ${processed.width}×${processed.height} · ${(processed.bytes / 1024).toFixed(0)}KB · ${url.slice(-60)}`
      );
      created++;
    } catch (err) {
      console.error(`    ✗ FALHOU: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`\n[migrate] done — created=${created} skipped=${skipped} failed=${failed}\n`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
