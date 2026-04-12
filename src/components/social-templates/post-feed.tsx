"use client";
import { forwardRef } from "react";

// Template de post Feed (1080x1080) — Uma (@ux-design-expert)
// Paleta Longetividade, tipografia clean, layouts por pilar

type Props = {
  title: string;
  body?: string;
  pillar: "s" | "e" | "m" | "promo";
  variant?: "quote" | "list" | "tip" | "question";
};

const PILLAR_CONFIG = {
  s: { bg: "linear-gradient(135deg, #FAF8F5 0%, #E8F5E0 100%)", accent: "#7A9E7E", label: "Simplicidade", icon: "🥗" },
  e: { bg: "linear-gradient(135deg, #FAF8F5 0%, #FFF8EC 100%)", accent: "#D4A94B", label: "Equilíbrio", icon: "💚" },
  m: { bg: "linear-gradient(135deg, #FAF8F5 0%, #E0F0E8 100%)", accent: "#3D5A3E", label: "Movimento", icon: "🏃" },
  promo: { bg: "linear-gradient(135deg, #3D5A3E 0%, #639922 100%)", accent: "#D4A94B", label: "Método S.E.M", icon: "✨" },
};

const PostFeed = forwardRef<HTMLDivElement, Props>(function PostFeed(
  { title, body, pillar, variant = "tip" },
  ref
) {
  const config = PILLAR_CONFIG[pillar];
  const isPromo = pillar === "promo";
  const textColor = isPromo ? "#fff" : "#2D2D2D";
  const mutedColor = isPromo ? "rgba(255,255,255,0.7)" : "rgba(45,45,45,0.55)";

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        background: config.bg,
        fontFamily: "'Nunito', Arial, sans-serif",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decoração circular */}
      <div style={{
        position: "absolute", top: -150, right: -150,
        width: 400, height: 400, borderRadius: "50%",
        background: isPromo ? "rgba(255,255,255,0.08)" : `${config.accent}15`,
      }} />
      <div style={{
        position: "absolute", bottom: -120, left: -120,
        width: 350, height: 350, borderRadius: "50%",
        background: isPromo ? "rgba(212,169,75,0.1)" : `${config.accent}10`,
      }} />

      {/* Header: logo + pilar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: isPromo ? "rgba(255,255,255,0.2)" : config.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 26, fontWeight: 900,
          }}>L</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: textColor, lineHeight: 1 }}>Longetividade</div>
            <div style={{ fontSize: 14, color: mutedColor, fontWeight: 600, marginTop: 2 }}>Método S.E.M</div>
          </div>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, padding: "6px 16px", borderRadius: 999,
          background: isPromo ? "rgba(212,169,75,0.3)" : `${config.accent}20`,
          color: isPromo ? "#D4A94B" : config.accent,
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {config.icon} {config.label}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", gap: 24 }}>
        {variant === "question" && (
          <div style={{ fontSize: 64, lineHeight: 1 }}>🤔</div>
        )}
        <h1 style={{
          fontSize: title.length > 60 ? 48 : title.length > 40 ? 56 : 64,
          fontWeight: 900,
          lineHeight: 1.1,
          color: textColor,
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          {title}
        </h1>
        {body && (
          <p style={{
            fontSize: 28,
            lineHeight: 1.4,
            color: mutedColor,
            margin: 0,
            fontWeight: 500,
            maxHeight: 200,
            overflow: "hidden",
          }}>
            {body.slice(0, 150)}{body.length > 150 ? "..." : ""}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div style={{ fontSize: 18, color: mutedColor, fontWeight: 600 }}>
          longetividade.com.br
        </div>
        <div style={{
          fontSize: 16, fontWeight: 700, padding: "10px 24px", borderRadius: 12,
          background: isPromo ? "#D4A94B" : config.accent,
          color: "#fff",
        }}>
          Deslize pra saber mais →
        </div>
      </div>
    </div>
  );
});

export default PostFeed;
