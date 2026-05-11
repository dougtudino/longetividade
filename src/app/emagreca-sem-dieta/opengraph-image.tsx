import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Emagreça Sem Dieta — Método S.E.M | a partir de R$67";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #7A9E7E 0%, #3D5A3E 50%, #2D2D2D 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#D4A94B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            L
          </div>
          <span style={{ fontSize: "20px", opacity: 0.7 }}>Longetividade</span>
        </div>

        <h1
          style={{
            fontSize: "64px",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.1,
            margin: "0 0 20px 0",
          }}
        >
          Emagreça{" "}
          <span style={{ color: "#D4A94B" }}>Sem Dieta</span>
        </h1>

        <p
          style={{
            fontSize: "28px",
            opacity: 0.7,
            textAlign: "center",
            margin: "0 0 40px 0",
            maxWidth: "700px",
          }}
        >
          O Método SEM — 3 pilares para emagrecer sem passar fome
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          <span style={{ fontSize: "28px", opacity: 0.6 }}>a partir de</span>
          <span style={{ fontSize: "84px", fontWeight: 900, color: "#D4A94B" }}>R$67</span>
        </div>

        <div
          style={{
            display: "flex",
            background: "#D4A94B",
            borderRadius: "16px",
            padding: "16px 48px",
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          Quero Emagrecer Agora
        </div>
      </div>
    ),
    { ...size }
  );
}
