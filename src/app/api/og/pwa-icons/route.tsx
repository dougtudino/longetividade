import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

// GET /api/og/pwa-icons?size=192 (ou 512, 384, 256, 144, 96, 72, 48, 180)
//
// Comportamento:
//  1. Se existir LpAsset(lpSlug="app", key="icon") no banco — busca a imagem
//     do R2, redimensiona pro size pedido e devolve PNG (PNG porque iOS
//     apple-touch-icon e Android Play Store exigem PNG, e o pipeline atual
//     salva o asset como WebP).
//  2. Se NÃO existir — fallback pro design hardcoded: quadrado verde com
//     letra "L" branca (next/og — edge no fallback).
//
// Runtime node por causa do sharp + prisma.

export const runtime = "nodejs";

const VALID_SIZES = [48, 72, 96, 144, 180, 192, 256, 384, 512];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const size = parseInt(url.searchParams.get("size") ?? "512", 10);
  const validSize = VALID_SIZES.includes(size) ? size : 512;

  // Tenta servir do banco primeiro
  try {
    const asset = await prisma.lpAsset.findUnique({
      where: { lpSlug_key: { lpSlug: "app", key: "icon" } },
    });
    if (asset?.imageUrl) {
      const remote = await fetch(asset.imageUrl, { cache: "no-store" });
      if (remote.ok) {
        const buf = Buffer.from(await remote.arrayBuffer());
        const png = await sharp(buf)
          .resize(validSize, validSize, { fit: "cover", position: "centre" })
          .png({ quality: 90, compressionLevel: 9 })
          .toBuffer();
        return new NextResponse(new Uint8Array(png), {
          status: 200,
          headers: {
            "Content-Type": "image/png",
            // Cache curto na borda mas longo no browser — admin pode trocar
            // a imagem e ver em ~60s sem precisar limpar cache do device.
            "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
          },
        });
      }
    }
  } catch (e) {
    console.warn("[pwa-icons] falha ao carregar do banco, usando fallback:", e);
  }

  // Fallback: design hardcoded (quadrado verde com "L")
  const radius = Math.round(validSize * 0.22);
  const fontSize = Math.round(validSize * 0.55);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#639922",
          borderRadius: radius,
        }}
      >
        <div
          style={{
            fontSize,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1,
            display: "flex",
          }}
        >
          L
        </div>
      </div>
    ),
    { width: validSize, height: validSize }
  );
}
