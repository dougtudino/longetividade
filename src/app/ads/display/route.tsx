// GET /ads/display — Google Display banner (1200x628)
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #080808 0%, #064e3b 70%, #080808 100%)",
          padding: "48px 64px",
          color: "white",
          fontFamily: "sans-serif",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
              }}
            >
              L
            </div>
            <span style={{ fontSize: "16px", fontWeight: 600, opacity: 0.5 }}>Longetividade</span>
          </div>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Emagreca{" "}
            <span style={{ color: "#6ee7b7" }}>Sem Dieta</span>
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.5, margin: 0, maxWidth: "400px" }}>
            3 pilares cientificos para perder peso de forma permanente
          </p>
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            background: "rgba(0,0,0,0.4)",
            borderRadius: "24px",
            padding: "32px 40px",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "20px", textDecoration: "line-through", opacity: 0.3 }}>R$97</span>
            <span style={{ fontSize: "56px", fontWeight: 900 }}>R$27</span>
          </div>
          <div
            style={{
              display: "flex",
              background: "#10b981",
              borderRadius: "16px",
              padding: "16px 36px",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Saiba Mais &rarr;
          </div>
          <span style={{ fontSize: "14px", opacity: 0.3 }}>Garantia 7 dias</span>
        </div>
      </div>
    ),
    { width: 1200, height: 628 }
  );
}
