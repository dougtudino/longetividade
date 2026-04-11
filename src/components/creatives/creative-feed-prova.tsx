"use client";
import { forwardRef } from "react";
import { BRAND } from "./brand";

const SIZE = 1080;

const CreativeFeedProva = forwardRef<HTMLDivElement>(function CreativeFeedProva(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: SIZE,
        height: SIZE,
        background: `linear-gradient(135deg, ${BRAND.greenDark} 0%, ${BRAND.greenMid} 100%)`,
        fontFamily: BRAND.fontFamily,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circle */}
      <div
        style={{
          position: "absolute",
          right: -200,
          top: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}
      />

      {/* Top */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 900,
          }}
        >
          L
        </div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{BRAND.logoText}</div>
      </div>

      {/* Big stat */}
      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            lineHeight: 1,
            color: BRAND.accent,
            letterSpacing: "-0.03em",
          }}
        >
          +1.000
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            marginTop: 16,
            opacity: 0.95,
            lineHeight: 1.3,
          }}
        >
          mulheres descobriram
          <br />o <span style={{ color: BRAND.accent }}>Método S.E.M</span> esse mês
        </div>
      </div>

      {/* Quote */}
      <div
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.12)",
          borderRadius: 18,
          padding: 32,
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontSize: 32, fontStyle: "italic", lineHeight: 1.4, marginBottom: 14 }}>
          &ldquo;Em 30 dias eu emagreci 4kg sem passar fome.&rdquo;
        </div>
        <div style={{ fontSize: 22, opacity: 0.85, fontWeight: 600 }}>
          — Bárbara, 38 anos
        </div>
      </div>
    </div>
  );
});

export default CreativeFeedProva;
