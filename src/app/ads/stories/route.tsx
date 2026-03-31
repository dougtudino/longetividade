// GET /ads/stories?v=1|2 — Stories creative (1080x1920)
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const VARIANTS = [
  {
    top: "Cansada de dietas?",
    headline: "Emagreca\nSem Dieta",
    sub: "Metodo SEM — 3 pilares cientificos que funcionam",
    cta: "Saiba Mais",
  },
  {
    top: "Resultado de aluna real",
    headline: "-8kg em\n6 semanas",
    sub: "Sem cortar alimentos, sem academia, sem culpa",
    cta: "Eu Quero",
  },
];

export async function GET(req: NextRequest) {
  const v = Math.min(Math.max(Number(req.nextUrl.searchParams.get("v") || "1"), 1), 2) - 1;
  const variant = VARIANTS[v];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #080808 0%, #064e3b 50%, #080808 100%)",
          padding: "100px 64px",
          color: "white",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: "flex",
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "40px",
            padding: "14px 32px",
            fontSize: "22px",
            fontWeight: 600,
            color: "#6ee7b7",
          }}
        >
          {variant.top}
        </div>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
          <h1
            style={{
              fontSize: "96px",
              fontWeight: 900,
              lineHeight: 1.05,
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {variant.headline}
          </h1>
          <p style={{ fontSize: "28px", color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: "800px", lineHeight: 1.4 }}>
            {variant.sub}
          </p>
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
            <span style={{ fontSize: "28px", textDecoration: "line-through", opacity: 0.3 }}>R$97</span>
            <span style={{ fontSize: "72px", fontWeight: 900 }}>R$37</span>
          </div>
          <div
            style={{
              display: "flex",
              background: "#10b981",
              borderRadius: "24px",
              padding: "24px 64px",
              fontSize: "32px",
              fontWeight: 800,
            }}
          >
            {variant.cta} &rarr;
          </div>
          <span style={{ fontSize: "18px", opacity: 0.3 }}>Garantia de 7 dias</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
