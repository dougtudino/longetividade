"use client";
import { forwardRef } from "react";
import { BRAND } from "./brand";

const SIZE = 1080;

const CreativeFeedDor = forwardRef<HTMLDivElement>(function CreativeFeedDor(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: SIZE,
        height: SIZE,
        background: `linear-gradient(160deg, ${BRAND.cream} 0%, ${BRAND.cream} 60%, ${BRAND.greenLight}30 100%)`,
        fontFamily: BRAND.fontFamily,
        position: "relative",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        color: BRAND.ink,
      }}
    >
      {/* Logo top */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: BRAND.greenMid,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 32,
            fontWeight: 900,
          }}
        >
          L
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: BRAND.greenDark }}>
            {BRAND.logoText}
          </div>
          <div style={{ fontSize: 16, color: BRAND.inkMuted, marginTop: 4, fontWeight: 600 }}>
            {BRAND.brandTag}
          </div>
        </div>
      </div>

      {/* Headline */}
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: BRAND.red,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 28,
          }}
        >
          A verdade que ninguém te conta
        </div>
        <h1
          style={{
            fontSize: 86,
            fontWeight: 900,
            lineHeight: 1.05,
            color: BRAND.greenDark,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Você não engorda
          <br />
          porque come{" "}
          <span style={{ color: BRAND.red, fontStyle: "italic" }}>muito</span>.
        </h1>
        <p
          style={{
            fontSize: 36,
            color: BRAND.ink,
            marginTop: 28,
            lineHeight: 1.3,
            fontWeight: 500,
          }}
        >
          Engorda porque come <strong style={{ color: BRAND.greenMid }}>errado</strong>.
        </p>
      </div>

      {/* CTA bottom */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <div style={{ fontSize: 22, color: BRAND.inkMuted, fontWeight: 600 }}>
            Descubra o
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: BRAND.greenDark, lineHeight: 1.1 }}>
            Método S.E.M
          </div>
        </div>
        <div
          style={{
            background: BRAND.greenMid,
            color: "#fff",
            padding: "22px 38px",
            borderRadius: 16,
            fontSize: 28,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            boxShadow: "0 8px 24px rgba(122,158,126,0.4)",
          }}
        >
          Saiba mais →
        </div>
      </div>
    </div>
  );
});

export default CreativeFeedDor;
