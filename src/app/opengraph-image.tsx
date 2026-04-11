import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Longetividade — Viva mais, viva melhor";
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
          background: "linear-gradient(135deg, #FAF8F5 0%, #F0EDE5 100%)",
          color: "#2D2D2D",
          fontFamily: "sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(122,158,126,0.18)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -160,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(212,169,75,0.15)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "40px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "13px",
              background: "#7A9E7E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "28px",
              fontWeight: 900,
            }}
          >
            L
          </div>
          <span style={{ fontSize: "28px", fontWeight: 800, color: "#3D5A3E" }}>
            Longetividade
          </span>
        </div>

        <h1
          style={{
            fontSize: "76px",
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.05,
            margin: "0 0 24px 0",
            color: "#3D5A3E",
            letterSpacing: "-0.02em",
            position: "relative",
          }}
        >
          Viva mais.
          <br />
          <span style={{ color: "#7A9E7E" }}>Viva melhor.</span>
        </h1>

        <p
          style={{
            fontSize: "26px",
            color: "rgba(45,45,45,0.65)",
            textAlign: "center",
            margin: "0 0 36px 0",
            maxWidth: "780px",
            lineHeight: 1.4,
            fontWeight: 600,
            position: "relative",
          }}
        >
          Métodos práticos para emagrecimento, sono, jejum inteligente e bem-estar feminino.
        </p>

        <div
          style={{
            display: "flex",
            background: "#3D5A3E",
            color: "#fff",
            borderRadius: "14px",
            padding: "16px 36px",
            fontSize: "22px",
            fontWeight: 700,
            position: "relative",
            boxShadow: "0 12px 28px rgba(61,90,62,0.25)",
          }}
        >
          longetividade.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
