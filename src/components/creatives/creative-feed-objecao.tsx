"use client";
import { forwardRef } from "react";
import { BRAND } from "./brand";

const SIZE = 1080;

const Item = ({ text, no }: { text: string; no: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      fontSize: 30,
      color: BRAND.ink,
      fontWeight: 600,
      marginBottom: 14,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: no ? "rgba(196,120,122,0.15)" : "rgba(122,158,126,0.2)",
        color: no ? BRAND.red : BRAND.greenDark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 26,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {no ? "✕" : "✓"}
    </div>
    <span style={{ textDecoration: no ? "line-through" : "none", opacity: no ? 0.6 : 1 }}>
      {text}
    </span>
  </div>
);

const CreativeFeedObjecao = forwardRef<HTMLDivElement>(function CreativeFeedObjecao(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: SIZE,
        height: SIZE,
        background: BRAND.cream,
        fontFamily: BRAND.fontFamily,
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        color: BRAND.ink,
      }}
    >
      {/* Top badge */}
      <div>
        <div
          style={{
            display: "inline-block",
            background: BRAND.greenMid,
            color: "#fff",
            padding: "10px 24px",
            borderRadius: 99,
            fontSize: 22,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Atenção, mulher real
        </div>
        <h1
          style={{
            fontSize: 78,
            fontWeight: 900,
            lineHeight: 1.05,
            color: BRAND.greenDark,
            marginTop: 28,
            marginBottom: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Não é dieta.
          <br />É <span style={{ color: BRAND.greenMid }}>reeducação</span>.
        </h1>
      </div>

      {/* Compare list */}
      <div>
        <div style={{ marginBottom: 20 }}>
          <Item text="Restrição extrema o dia todo" no />
          <Item text="Contar caloria em cada refeição" no />
          <Item text="Culpa depois do café da manhã" no />
        </div>
        <div
          style={{
            borderTop: `2px solid ${BRAND.greenLight}`,
            paddingTop: 20,
          }}
        >
          <Item text="Comer com prazer e consciência" no={false} />
          <Item text="Sem culpa, sem peso emocional" no={false} />
          <Item text="Uma nova rotina que cabe na vida" no={false} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          background: BRAND.greenDark,
          color: "#fff",
          padding: "26px 36px",
          borderRadius: 18,
          textAlign: "center",
          fontSize: 32,
          fontWeight: 800,
        }}
      >
        Comece hoje · Método S.E.M
      </div>
    </div>
  );
});

export default CreativeFeedObjecao;
