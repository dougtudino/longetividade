// Script one-off pra recortar a sprite "mascote.png" em 9 PNGs (3x3 grid).
// Rodar com: npx tsx src/scripts/extract-broto.ts
//
// Origem: C:/Users/dougt/Downloads/mascote.png (1536x1024)
// Destino: public/broto/slot-0.png ... slot-8.png
//
// Mapeamento de slots->stages depois eh feito em lib/broto.ts (STAGE_TO_SLOT).
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const SRC = "C:/Users/dougt/Downloads/mascote.png";
const OUT_DIR = path.join(process.cwd(), "public", "broto");
const W = 1536;
const H = 1024;
const COLS = 3;
const ROWS = 3;
const cellW = Math.floor(W / COLS);
const cellH = Math.floor(H / ROWS);

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const slot = r * COLS + c;
      const left = c * cellW;
      const top = r * cellH;
      const width = c === COLS - 1 ? W - left : cellW;
      const height = r === ROWS - 1 ? H - top : cellH;

      const outPath = path.join(OUT_DIR, `slot-${slot}.png`);
      await sharp(SRC)
        .extract({ left, top, width, height })
        .png({ quality: 92, compressionLevel: 9 })
        .toFile(outPath);
      console.log(
        `slot-${slot} (r${r}c${c}): ${width}x${height} from (${left},${top}) → ${outPath}`,
      );
    }
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
