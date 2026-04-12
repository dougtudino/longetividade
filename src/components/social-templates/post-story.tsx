"use client";
import { forwardRef } from "react";

// Template de Story (1080x1920) — Uma (@ux-design-expert)

type Props = {
  title: string;
  body?: string;
  pillar: "s" | "e" | "m" | "promo";
  cta?: string;
};

const COLORS = {
  s: { bg: "#7A9E7E", accent: "#3D5A3E" },
  e: { bg: "#D4A94B", accent: "#8B7332" },
  m: { bg: "#3D5A3E", accent: "#639922" },
  promo: { bg: "#639922", accent: "#D4A94B" },
};

const PostStory = forwardRef<HTMLDivElement, Props>(function PostStory(
  { title, body, pillar, cta = "Arraste pra cima" },
  ref
) {
  const c = COLORS[pillar];

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1920,
        background: `linear-gradient(180deg, ${c.bg} 0%, ${c.accent} 100%)`,
        fontFamily: "'Nunito', Arial, sans-serif",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        color: "#fff",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: -200, right: -200,
        width: 500, height: 500, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
      }} />

      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, fontWeight: 900,
        }}>L</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>Longetividade</div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
        <h1 style={{
          fontSize: title.length > 50 ? 52 : 64,
          fontWeight: 900,
          lineHeight: 1.1,
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          {title}
        </h1>
        {body && (
          <p style={{
            fontSize: 30,
            lineHeight: 1.4,
            opacity: 0.85,
            margin: 0,
            fontWeight: 500,
          }}>
            {body.slice(0, 120)}{body.length > 120 ? "..." : ""}
          </p>
        )}
      </div>

      {/* CTA */}
      <div>
        <div style={{
          padding: "24px 40px", borderRadius: 20,
          background: "rgba(255,255,255,0.2)",
          fontSize: 32, fontWeight: 800,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {cta} ↑
        </div>
        <div style={{ fontSize: 20, marginTop: 16, opacity: 0.7, fontWeight: 600 }}>
          Método S.E.M · longetividade.com.br
        </div>
      </div>
    </div>
  );
});

export default PostStory;
