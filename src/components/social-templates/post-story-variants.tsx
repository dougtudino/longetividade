"use client";
import { forwardRef } from "react";

// Variantes de Story da Luna — seguindo a "biblia do algoritmo" (playbook):
// - Poll: enquete 2 opcoes (alta conversao em relacionamento)
// - Question: caixa de pergunta aberta (gera conteudo pro proximo dia)
// - SequenceSlide: 1 slide de uma sequencia 3-5 stories (mini-carrossel)

type Pillar = "s" | "e" | "m" | "promo";

const COLORS: Record<Pillar, { bg: string; accent: string }> = {
  s: { bg: "#7A9E7E", accent: "#3D5A3E" },
  e: { bg: "#D4A94B", accent: "#8B7332" },
  m: { bg: "#3D5A3E", accent: "#639922" },
  promo: { bg: "#639922", accent: "#D4A94B" },
};

function StoryFrame({
  children,
  pillar,
  refProp,
}: {
  children: React.ReactNode;
  pillar: Pillar;
  refProp?: React.Ref<HTMLDivElement>;
}) {
  const c = COLORS[pillar];
  return (
    <div
      ref={refProp}
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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30, fontWeight: 900,
        }}>L</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>Longetividade</div>
      </div>
      {children}
      <div style={{ fontSize: 20, opacity: 0.7, fontWeight: 600 }}>
        Método S.E.M · longetividade.com.br
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// POLL — enquete 2 opcoes
// ═══════════════════════════════════════════════════════
// Content format esperado:
//   "Pergunta em destaque"
//   ""
//   "Opcao A"
//   "Opcao B"

export const PostStoryPoll = forwardRef<
  HTMLDivElement,
  { question: string; optionA: string; optionB: string; pillar: Pillar }
>(function PostStoryPoll({ question, optionA, optionB, pillar }, ref) {
  return (
    <StoryFrame pillar={pillar} refProp={ref}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
        <h1 style={{
          fontSize: question.length > 40 ? 56 : 68,
          fontWeight: 900,
          lineHeight: 1.15,
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          {question}
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
          <div style={{
            padding: "32px 40px", borderRadius: 24,
            background: "rgba(255,255,255,0.25)",
            fontSize: 40, fontWeight: 800,
            backdropFilter: "blur(8px)",
          }}>
            {optionA}
          </div>
          <div style={{
            padding: "32px 40px", borderRadius: 24,
            background: "rgba(0,0,0,0.2)",
            fontSize: 40, fontWeight: 800,
          }}>
            {optionB}
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.8, marginTop: 10 }}>
          👆 toca pra votar
        </div>
      </div>
    </StoryFrame>
  );
});

// ═══════════════════════════════════════════════════════
// QUESTION — caixa de pergunta aberta
// ═══════════════════════════════════════════════════════

export const PostStoryQuestion = forwardRef<
  HTMLDivElement,
  { question: string; subtitle?: string; pillar: Pillar }
>(function PostStoryQuestion({ question, subtitle, pillar }, ref) {
  return (
    <StoryFrame pillar={pillar} refProp={ref}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>
        <h1 style={{
          fontSize: question.length > 40 ? 56 : 68,
          fontWeight: 900,
          lineHeight: 1.15,
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          {question}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 28, lineHeight: 1.4, opacity: 0.85,
            margin: 0, fontWeight: 500,
          }}>
            {subtitle}
          </p>
        )}
        <div style={{
          marginTop: 30,
          padding: "40px 40px",
          borderRadius: 24,
          background: "rgba(255,255,255,0.2)",
          border: "2px dashed rgba(255,255,255,0.4)",
          fontSize: 32,
          opacity: 0.85,
          fontWeight: 500,
        }}>
          💬 me conta aqui...
        </div>
      </div>
    </StoryFrame>
  );
});

// ═══════════════════════════════════════════════════════
// SEQUENCE SLIDE — 1 slide da sequencia (3-5 stories encadeados)
// ═══════════════════════════════════════════════════════

export const PostStorySequenceSlide = forwardRef<
  HTMLDivElement,
  { text: string; slideIndex: number; total: number; pillar: Pillar; emoji?: string }
>(function PostStorySequenceSlide({ text, slideIndex, total, pillar, emoji }, ref) {
  return (
    <StoryFrame pillar={pillar} refProp={ref}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 32 }}>
        {emoji && (
          <div style={{ fontSize: 120, textAlign: "center", opacity: 0.9 }}>
            {emoji}
          </div>
        )}
        <h1 style={{
          fontSize: text.length > 80 ? 44 : text.length > 40 ? 56 : 68,
          fontWeight: 900,
          lineHeight: 1.2,
          margin: 0,
          letterSpacing: "-0.02em",
        }}>
          {text}
        </h1>
      </div>
      {/* Numero do slide — bottom-right */}
      <div style={{
        position: "absolute", top: 120, right: 80,
        padding: "12px 24px", borderRadius: 14,
        background: "rgba(255,255,255,0.25)",
        fontSize: 32, fontWeight: 800,
        backdropFilter: "blur(8px)",
      }}>
        {slideIndex + 1}/{total}
      </div>
    </StoryFrame>
  );
});
