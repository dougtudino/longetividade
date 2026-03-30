import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Emagreca Sem Dieta — Metodo SEM | De R$97 por R$27";
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
          background: "linear-gradient(135deg, #064e3b 0%, #0f172a 50%, #080808 100%)",
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
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            L
          </div>
          <span style={{ fontSize: "20px", opacity: 0.6 }}>Longetividade</span>
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
          Emagreca{" "}
          <span style={{ color: "#6ee7b7" }}>Sem Dieta</span>
        </h1>

        <p
          style={{
            fontSize: "28px",
            opacity: 0.6,
            textAlign: "center",
            margin: "0 0 40px 0",
            maxWidth: "700px",
          }}
        >
          O Metodo SEM — 3 pilares para emagrecer sem passar fome
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              fontSize: "28px",
              textDecoration: "line-through",
              opacity: 0.3,
            }}
          >
            R$97
          </span>
          <span style={{ fontSize: "72px", fontWeight: 900 }}>R$27</span>
        </div>

        <div
          style={{
            display: "flex",
            background: "#10b981",
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
