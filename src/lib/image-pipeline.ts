// src/lib/image-pipeline.ts — otimização de imagens antes do upload.
// Converte pra WebP + resize. Suporta crop por aspecto quando o slot define dimensões
// target (ex: avatar 400x400, hero 840x1120). Usa "attention" pra cortar priorizando
// áreas de interesse (rosto, etc) em vez do centro geométrico.
import sharp from "sharp";

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  width: number;
  height: number;
  bytes: number;
};

export type ProcessOptions = {
  // Se ambos informados, faz resize + crop cover pro aspecto exato.
  targetWidth?: number;
  targetHeight?: number;
  // Estratégia de posicionamento do crop (padrão: attention — detecta áreas de interesse).
  position?: "attention" | "entropy" | "centre" | "top" | "bottom";
};

const DEFAULT_MAX_WIDTH = 1600;
const QUALITY = 82;

export async function processImage(
  input: Buffer | ArrayBuffer,
  options: ProcessOptions = {}
): Promise<ProcessedImage> {
  const inputBuffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const img = sharp(inputBuffer, { failOn: "error" }).rotate(); // auto-orient via EXIF

  const { targetWidth, targetHeight, position = "attention" } = options;

  let pipeline: sharp.Sharp;

  if (targetWidth && targetHeight) {
    // Modo slot-aware: crop cover pro aspect exato (preserva foco em rosto/atenção).
    pipeline = img.resize({
      width: targetWidth,
      height: targetHeight,
      fit: "cover",
      position,
      withoutEnlargement: false, // permite upscale se a imagem for menor
    });
  } else {
    // Modo livre: só limita largura máxima preservando aspecto original.
    const meta = await img.metadata();
    const srcWidth = meta.width ?? 0;
    pipeline = srcWidth > DEFAULT_MAX_WIDTH
      ? img.resize({ width: DEFAULT_MAX_WIDTH, withoutEnlargement: true })
      : img;
  }

  const webpBuffer = await pipeline
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer({ resolveWithObject: true });

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
