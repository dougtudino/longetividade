// POST /api/admin/upload — upload genérico de imagem pro R2.
// Recebe multipart/form-data com campo "file" + "folder" ("lp-assets" | "social-proof") + "slug".
// Pipeline: sharp (WebP + resize) → R2 → retorna { url, width, height, bytes }.
// Protegido pelo middleware global de /api/admin/*.
import { NextResponse } from "next/server";
import { processImage } from "@/lib/image-pipeline";
import { uploadToR2 } from "@/lib/r2";
import { makeAssetKey } from "@/lib/image-pipeline";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024; // 10MB pre-processing
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const folder = (form.get("folder") ?? "") as string;
  const slug = (form.get("slug") ?? "") as string;
  // Slot-aware crop: se o admin enviar targetWidth + targetHeight, sharp aplica
  // resize + crop cover pro aspect exato (prioriza área de interesse / rosto).
  const targetWidthRaw = Number(form.get("targetWidth") ?? 0);
  const targetHeightRaw = Number(form.get("targetHeight") ?? 0);
  const targetWidth = targetWidthRaw > 0 ? targetWidthRaw : undefined;
  const targetHeight = targetHeightRaw > 0 ? targetHeightRaw : undefined;

  // Posição do crop (foco). Aceita: attention (default — detecta rosto/interesse),
  // entropy, centre, top, bottom, left, right, "left top", "right top", etc.
  const positionRaw = (form.get("position") ?? "attention") as string;
  const ALLOWED_POSITIONS = new Set([
    "attention", "entropy", "centre",
    "top", "bottom", "left", "right",
    "left top", "right top", "left bottom", "right bottom",
  ]);
  const position = ALLOWED_POSITIONS.has(positionRaw)
    ? (positionRaw as "attention" | "entropy" | "centre" | "top" | "bottom" | "left" | "right")
    : "attention";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "campo 'file' ausente" }, { status: 400 });
  }
  if (folder !== "lp-assets" && folder !== "social-proof") {
    return NextResponse.json({ error: "folder inválido" }, { status: 400 });
  }
  if (!slug.trim()) {
    return NextResponse.json({ error: "slug obrigatório" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `arquivo >10MB (${Math.round(file.size / 1024)}KB)` }, { status: 413 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: `tipo não suportado: ${file.type}` }, { status: 415 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const processed = await processImage(arrayBuffer, { targetWidth, targetHeight, position });
    const key = makeAssetKey(folder, slug);
    const url = await uploadToR2({
      key,
      body: processed.buffer,
      contentType: processed.contentType,
    });
    return NextResponse.json({
      url,
      key,
      width: processed.width,
      height: processed.height,
      bytes: processed.bytes,
    });
  } catch (err) {
    console.error("[upload] fail", err);
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
