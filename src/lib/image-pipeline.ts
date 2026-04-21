// src/lib/image-pipeline.ts — otimização de imagens antes do upload.
// Converte pra WebP + resize (mantém aspecto) pra reduzir tamanho sem perder qualidade perceptível.
import sharp from "sharp";

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  width: number;
  height: number;
  bytes: number;
};

const MAX_WIDTH = 1600;
const QUALITY = 82;

export async function processImage(input: Buffer | ArrayBuffer): Promise<ProcessedImage> {
  const inputBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const img = sharp(inputBuffer, { failOn: "error" }).rotate(); // auto-orient via EXIF

  const meta = await img.metadata();
  const srcWidth = meta.width ?? 0;

  const pipeline = srcWidth > MAX_WIDTH ? img.resize({ width: MAX_WIDTH, withoutEnlargement: true }) : img;

  const webpBuffer = await pipeline.webp({ quality: QUALITY, effort: 4 }).toBuffer({ resolveWithObject: true });

  return {
    buffer: webpBuffer.data,
    contentType: "image/webp",
    width: webpBuffer.info.width,
    height: webpBuffer.info.height,
    bytes: webpBuffer.info.size,
  };
}

// Gera key estável-mas-única pro R2 evitando cache stale (novo upload = nova URL).
export function makeAssetKey(folder: "lp-assets" | "social-proof", slug: string): string {
  const ts = Date.now();
  const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return `${folder}/${safeSlug}-${ts}.webp`;
}
