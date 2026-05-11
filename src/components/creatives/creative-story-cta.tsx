"use client";
import { forwardRef } from "react";
import { BRAND } from "./brand";

const W = 1080;
const H = 1920;

const CreativeStoryCta = forwardRef<HTMLDivElement>(function CreativeStoryCta(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        background: `linear-gradient(180deg, ${BRAND.greenDark} 0%, ${BRAND.greenMid} 50%, ${BRAND.greenLight} 100%)`,
        fontFamily: BRAND.fontFamily,
        padding: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        color: "#fff",
        textAlign: "center",
      }}
    >
      {/* Top logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 900,
          }}
        >
          L
        </div>
        <div style={{ fontSize: 36, fontWeight: 900 }}>{BRAND.logoText}</div>
      </div>

      {/* Center mega CTA */}
      <div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            marginBottom: 36,
            opacity: 0.9,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Sua transformação
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 50,
            letterSpacing: "-0.02em",
          }}
        >
          Comece hoje
        </div>

        <div
          style={{
            background: "#fff",
            color: BRAND.greenDark,
            padding: "60px 50px",
            borderRadius: 36,
            boxShadow: "0 16px 50px rgba(0,0,0,0.25)",
            display: "inline-block",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 700, color: BRAND.inkMuted, marginBottom: 8 }}>
            a partir de
          </div>
          <div style={{ fontSize: 200, fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            R$67
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: BRAND.greenMid, marginTop: 14 }}>
            ou 6x R$ 11,17
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div>
        <div
          style={{
            background: BRAND.accent,
            color: BRAND.greenDark,
            padding: "30px 40px",
            borderRadius: 24,
            fontSize: 42,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Arraste pra cima ↑
        </div>
        <div style={{ fontSize: 26, marginTop: 22, opacity: 0.85, fontWeight: 600 }}>
          Método S.E.M · longetividade.com.br
        </div>
      </div>
    </div>
  );
});

export default CreativeStoryCta;
