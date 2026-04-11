"use client";
import { forwardRef } from "react";
import { BRAND } from "./brand";

const W = 1080;
const H = 1920;

const CreativeStoryStat = forwardRef<HTMLDivElement>(function CreativeStoryStat(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        background: `linear-gradient(180deg, ${BRAND.cream} 0%, ${BRAND.greenLight}40 100%)`,
        fontFamily: BRAND.fontFamily,
        padding: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        color: BRAND.ink,
      }}
    >
      {/* Top */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: BRAND.greenDark,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 36,
            fontWeight: 900,
          }}
        >
          L
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 900, color: BRAND.greenDark, lineHeight: 1 }}>
            {BRAND.logoText}
          </div>
          <div style={{ fontSize: 20, color: BRAND.inkMuted, marginTop: 4, fontWeight: 600 }}>
            {BRAND.brandTag}
          </div>
        </div>
      </div>

      {/* Big center */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: BRAND.greenMid, marginBottom: 24 }}>
          Uma nova jornada
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.7)",
            borderRadius: 32,
            padding: "60px 40px",
            backdropFilter: "blur(10px)",
            border: `2px solid ${BRAND.greenLight}`,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 82,
              fontWeight: 900,
              lineHeight: 1.1,
              color: BRAND.greenDark,
              letterSpacing: "-0.02em",
            }}
          >
            Sem dieta.
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 900,
              lineHeight: 1.1,
              color: BRAND.greenDark,
              letterSpacing: "-0.02em",
              marginTop: 8,
            }}
          >
            Sem culpa.
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              color: BRAND.greenMid,
              marginTop: 28,
            }}
          >
            Sem peso emocional.
          </div>
        </div>

        <div style={{ fontSize: 42, fontWeight: 900, color: BRAND.ink, lineHeight: 1.2 }}>
          Método S.E.M
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: BRAND.inkMuted, marginTop: 14 }}>
          Reeducação alimentar real
        </div>
      </div>

      {/* Bottom CTA */}
      <div>
        <div
          style={{
            background: BRAND.greenDark,
            color: "#fff",
            padding: "32px 40px",
            borderRadius: 24,
            textAlign: "center",
            fontSize: 42,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Arraste pra cima ↑
        </div>
        <div style={{ fontSize: 26, textAlign: "center", marginTop: 18, color: BRAND.inkMuted, fontWeight: 600 }}>
          Método S.E.M · longetividade.com.br
        </div>
      </div>
    </div>
  );
});

export default CreativeStoryStat;
