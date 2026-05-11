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
          background: "linear-gradient(135deg, #FAF8F5 0%, #7A9E7E 70%, #3D5A3E 100%)",
          padding: "48px 64px",
          color: "#2D2D2D",
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
                background: "#7A9E7E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: "#fff",
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
              color: "#fff",
            }}
          >
            Emagreça{" "}
            <span style={{ color: "#D4A94B" }}>Sem Dieta</span>
          </h1>
          <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.7)", margin: 0, maxWidth: "400px" }}>
            3 pilares científicos para perder peso de forma permanente
          </p>
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            background: "rgba(61,90,62,0.4)",
            borderRadius: "24px",
            padding: "32px 40px",
            border: "1px solid rgba(212,169,75,0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "20px", textDecoration: "line-through", color: "rgba(255,255,255,0.4)" }}>R$147</span>
            <span style={{ fontSize: "56px", fontWeight: 900, color: "#fff" }}>R$67</span>
          </div>
          <div
            style={{
              display: "flex",
              background: "#D4A94B",
              borderRadius: "16px",
              padding: "16px 36px",
              fontSize: "20px",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            Saiba Mais →
          </div>
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>Garantia 7 dias</span>
        </div>
      </div>
    ),
    { width: 1200, height: 628 }
  );
}
