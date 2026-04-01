// GET /ads/feed?v=1|2|3 — Feed creative (1080x1080)
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const VARIANTS = [
  {
    headline: "Cansada de\ndietas que\nnão funcionam?",
    sub: "Descubra o Método SEM",
    accent: "#7A9E7E",
  },
  {
    headline: "Emagreça\nsem passar\nfome",
    sub: "3 pilares científicos",
    accent: "#3D5A3E",
  },
  {
    headline: "-8kg em\n6 semanas\nsem dieta",
    sub: "Resultado real de alunas",
    accent: "#D4A94B",
  },
];

export async function GET(req: NextRequest) {
  const v = Math.min(Math.max(Number(req.nextUrl.searchParams.get("v") || "1"), 1), 3) - 1;
  const variant = VARIANTS[v];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "linear-gradient(160deg, #FAF8F5 0%, #7A9E7E 60%, #3D5A3E 100%)",
          padding: "80px",
          color: "#2D2D2D",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: variant.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            L
          </div>
          <span style={{ fontSize: "22px", fontWeight: 600, color: "#2D2D2D", opacity: 0.5 }}>Longetividade</span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 900,
              lineHeight: 1.05,
              margin: 0,
              whiteSpace: "pre-wrap",
              color: "#fff",
            }}
          >
            {variant.headline}
          </h1>
          <p style={{ fontSize: "28px", color: variant.accent === "#3D5A3E" ? "#D4A94B" : "#3D5A3E", fontWeight: 600, margin: 0 }}>
            {variant.sub}
          </p>
        </div>

        {/* CTA + Price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              background: "#D4A94B",
              borderRadius: "20px",
              padding: "20px 44px",
              fontSize: "28px",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            Quero Emagrecer Agora
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "24px", textDecoration: "line-through", color: "rgba(255,255,255,0.4)" }}>R$97</span>
            <span style={{ fontSize: "56px", fontWeight: 900, color: "#fff" }}>R$37</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
