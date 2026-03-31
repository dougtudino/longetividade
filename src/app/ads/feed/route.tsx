// GET /ads/feed?v=1|2|3 — Feed creative (1080x1080)
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const VARIANTS = [
  {
    headline: "Cansada de\ndietas que\nnao funcionam?",
    sub: "Descubra o Metodo SEM",
    accent: "#10b981",
  },
  {
    headline: "Emagreca\nsem passar\nfome",
    sub: "3 pilares cientificos",
    accent: "#6ee7b7",
  },
  {
    headline: "-8kg em\n6 semanas\nsem dieta",
    sub: "Resultado real de alunas",
    accent: "#14b8a6",
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
          background: "linear-gradient(160deg, #080808 0%, #064e3b 60%, #080808 100%)",
          padding: "80px",
          color: "white",
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
            }}
          >
            L
          </div>
          <span style={{ fontSize: "22px", fontWeight: 600, opacity: 0.5 }}>Longetividade</span>
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
            }}
          >
            {variant.headline}
          </h1>
          <p style={{ fontSize: "28px", color: variant.accent, fontWeight: 600, margin: 0 }}>
            {variant.sub}
          </p>
        </div>

        {/* CTA + Price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              background: variant.accent,
              borderRadius: "20px",
              padding: "20px 44px",
              fontSize: "28px",
              fontWeight: 800,
            }}
          >
            Quero Emagrecer Agora
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "24px", textDecoration: "line-through", opacity: 0.3 }}>R$97</span>
            <span style={{ fontSize: "56px", fontWeight: 900 }}>R$37</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
