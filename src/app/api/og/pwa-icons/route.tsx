import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// GET /api/og/pwa-icons?size=192 (ou 512, 384, 256, 144, 96, 72, 48)
// Gera icones PWA pro manifest.json + Play Store
// Acesse cada tamanho e salve como PNG em /public/
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const size = parseInt(url.searchParams.get("size") ?? "512", 10);
  const validSize = [48, 72, 96, 144, 192, 256, 384, 512].includes(size) ? size : 512;
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
