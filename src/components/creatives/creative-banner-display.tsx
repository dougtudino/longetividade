"use client";
import { forwardRef } from "react";
import { BRAND } from "./brand";

const W = 1200;
const H = 628;

const CreativeBannerDisplay = forwardRef<HTMLDivElement>(function CreativeBannerDisplay(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        background: BRAND.cream,
        fontFamily: BRAND.fontFamily,
        display: "flex",
        boxSizing: "border-box",
        color: BRAND.ink,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left side: text */}
      <div
        style={{
          flex: 1.4,
          padding: 60,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: BRAND.greenMid,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 26,
              fontWeight: 900,
            }}
          >
            L
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.greenDark, lineHeight: 1 }}>
              {BRAND.logoText}
            </div>
            <div style={{ fontSize: 13, color: BRAND.inkMuted, marginTop: 3, fontWeight: 600 }}>
              {BRAND.brandTag}
            </div>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h1
            style={{
              fontSize: 60,
              fontWeight: 900,
              lineHeight: 1.05,
              color: BRAND.greenDark,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Emagreça
            <br />
            <span style={{ color: BRAND.greenMid }}>Sem Dieta</span>
          </h1>
          <p
            style={{
              fontSize: 22,
              color: BRAND.inkMuted,
              marginTop: 14,
              lineHeight: 1.4,
              fontWeight: 600,
            }}
          >
            O Método S.E.M para mulheres reais
          </p>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              background: BRAND.greenDark,
              color: "#fff",
              padding: "16px 32px",
              borderRadius: 12,
              fontSize: 22,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              boxShadow: "0 8px 20px rgba(61,90,62,0.3)",
            }}
          >
            Quero conhecer →
          </div>
          <div style={{ fontSize: 16, color: BRAND.inkMuted, fontWeight: 600 }}>
            a partir de <strong style={{ color: BRAND.greenDark, fontSize: 22 }}>R$ 37</strong>
          </div>
        </div>
      </div>

      {/* Right side: visual block */}
      <div
        style={{
          flex: 1,
          background: `linear-gradient(135deg, ${BRAND.greenDark} 0%, ${BRAND.greenMid} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
          padding: 40,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div style={{ position: "relative", fontSize: 30, fontWeight: 700, opacity: 0.92, marginBottom: 10, textAlign: "center", lineHeight: 1.2 }}>
          Reeducação<br />alimentar real
        </div>
        <div
          style={{
            position: "relative",
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            color: BRAND.accent,
            letterSpacing: "-0.02em",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          S.E.M
        </div>
        <div style={{ position: "relative", fontSize: 18, marginTop: 20, opacity: 0.9, fontWeight: 600, textAlign: "center" }}>
          sem restrição · sem culpa
        </div>
      </div>
    </div>
  );
});

export default CreativeBannerDisplay;
