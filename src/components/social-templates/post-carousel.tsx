"use client";
import { forwardRef } from "react";

// Template de Carrossel (1080x1080 × N slides) — Uma (@ux-design-expert)
// Cada slide e renderizado separadamente e exportado como PNG individual.
// Visual consistente: mesma paleta, logo, pilar badge em todos os slides.

type SlideType = "cover" | "content" | "list" | "quote" | "cta";

type Slide = {
  type: SlideType;
  text: string;
  subtext?: string;
  items?: string[];
  emoji?: string;
};

type Props = {
  slides: Slide[];
  pillar: "s" | "e" | "m" | "promo";
  slideIndex: number; // qual slide renderizar
};

const PILLAR_CONFIG = {
  s: { bg1: "#FAF8F5", bg2: "#E8F5E0", accent: "#7A9E7E", dark: "#3D5A3E", label: "Simplicidade", icon: "🥗" },
  e: { bg1: "#FAF8F5", bg2: "#FFF8EC", accent: "#D4A94B", dark: "#8B7332", label: "Equilíbrio", icon: "💚" },
  m: { bg1: "#FAF8F5", bg2: "#E0F0E8", accent: "#3D5A3E", dark: "#1A3A1C", label: "Movimento", icon: "🏃" },
  promo: { bg1: "#3D5A3E", bg2: "#639922", accent: "#D4A94B", dark: "#3D5A3E", label: "Método S.E.M", icon: "✨" },
};

const PostCarouselSlide = forwardRef<HTMLDivElement, Props>(function PostCarouselSlide(
  { slides, pillar, slideIndex },
  ref
) {
  const config = PILLAR_CONFIG[pillar];
  const slide = slides[slideIndex];
  if (!slide) return null;

  const isFirst = slideIndex === 0;
  const isLast = slideIndex === slides.length - 1;
  const isPromo = pillar === "promo";
  const textColor = isPromo ? "#fff" : "#2D2D2D";
  const mutedColor = isPromo ? "rgba(255,255,255,0.65)" : "rgba(45,45,45,0.5)";
  const bg = isPromo
    ? `linear-gradient(135deg, ${config.bg1} 0%, ${config.bg2} 100%)`
    : `linear-gradient(135deg, ${config.bg1} 0%, ${config.bg2} 100%)`;

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1080,
        background: bg,
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
      {/* Decoração */}
      <div style={{
        position: "absolute", top: -120, right: -120,
        width: 350, height: 350, borderRadius: "50%",
        background: `${config.accent}12`,
      }} />

      {/* Header: logo + pilar + paginacao */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: isPromo ? "rgba(255,255,255,0.2)" : config.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 22, fontWeight: 900,
          }}>L</div>
          <span style={{ fontSize: 16, fontWeight: 700, color: textColor, opacity: 0.7 }}>Longetividade</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
            background: `${config.accent}20`, color: config.accent,
          }}>
            {config.icon} {config.label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: mutedColor }}>
            {slideIndex + 1}/{slides.length}
          </span>
        </div>
      </div>

      {/* Conteúdo — varia por tipo de slide */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", gap: 20 }}>

        {/* COVER — titulo grande + emoji */}
        {slide.type === "cover" && (
          <>
            {slide.emoji && <div style={{ fontSize: 72, lineHeight: 1 }}>{slide.emoji}</div>}
            <h1 style={{
              fontSize: slide.text.length > 50 ? 52 : 64,
              fontWeight: 900, lineHeight: 1.1, color: textColor,
              margin: 0, letterSpacing: "-0.02em",
            }}>
              {slide.text}
            </h1>
            {slide.subtext && (
              <p style={{ fontSize: 26, color: mutedColor, margin: 0, lineHeight: 1.4 }}>
                {slide.subtext}
              </p>
            )}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 20, color: config.accent, fontWeight: 700, marginTop: 10,
            }}>
              Deslize pra ver →
            </div>
          </>
        )}

        {/* CONTENT — texto com destaque */}
        {slide.type === "content" && (
          <>
            {slide.emoji && <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 10 }}>{slide.emoji}</div>}
            <div style={{
              fontSize: 38, fontWeight: 800, lineHeight: 1.3, color: textColor,
              whiteSpace: "pre-wrap",
            }}>
              {slide.text}
            </div>
            {slide.subtext && (
              <p style={{ fontSize: 24, color: mutedColor, margin: 0, lineHeight: 1.5, marginTop: 16 }}>
                {slide.subtext}
              </p>
            )}
          </>
        )}

        {/* LIST — items com checkmarks */}
        {slide.type === "list" && (
          <>
            {slide.text && (
              <h2 style={{ fontSize: 36, fontWeight: 800, color: textColor, margin: "0 0 20px 0" }}>
                {slide.text}
              </h2>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(slide.items ?? []).map((item, i) => {
                const isNegative = item.startsWith("❌") || item.startsWith("✗");
                const isPositive = item.startsWith("✅") || item.startsWith("✓");
                const cleanText = item.replace(/^[❌✗✅✓]\s*/, "");
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: isNegative ? "rgba(196,120,122,0.15)" : isPositive ? `${config.accent}20` : `${config.accent}15`,
                      color: isNegative ? "#C4787A" : config.accent,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 900,
                    }}>
                      {isNegative ? "✗" : isPositive ? "✓" : `${i + 1}`}
                    </div>
                    <span style={{
                      fontSize: 28, fontWeight: 600, color: textColor, lineHeight: 1.4,
                      textDecoration: isNegative ? "line-through" : "none",
                      opacity: isNegative ? 0.6 : 1,
                    }}>
                      {cleanText}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* QUOTE — frase destaque */}
        {slide.type === "quote" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 100, lineHeight: 0.8, color: config.accent, opacity: 0.3,
              fontFamily: "Georgia, serif",
            }}>"</div>
            <div style={{
              fontSize: 40, fontWeight: 800, lineHeight: 1.3, color: textColor,
              fontStyle: "italic", margin: "-20px 0 20px 0",
            }}>
              {slide.text}
            </div>
            {slide.subtext && (
              <div style={{ fontSize: 22, color: mutedColor, fontWeight: 600 }}>
                — {slide.subtext}
              </div>
            )}
          </div>
        )}

        {/* CTA — ultimo slide */}
        {slide.type === "cta" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>{slide.emoji ?? "💚"}</div>
            <h2 style={{
              fontSize: 44, fontWeight: 900, color: textColor, margin: "0 0 20px 0", lineHeight: 1.2,
            }}>
              {slide.text}
            </h2>
            <div style={{
              display: "inline-block", padding: "18px 40px", borderRadius: 16,
              background: config.accent, color: "#fff",
              fontSize: 28, fontWeight: 800,
            }}>
              {slide.subtext ?? "Salva esse post 💚"}
            </div>
          </div>
        )}
      </div>

      {/* Footer — indicador de deslize */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, position: "relative" }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === slideIndex ? 24 : 8, height: 8, borderRadius: 4,
            background: i === slideIndex ? config.accent : `${config.accent}30`,
            transition: "width 0.2s",
          }} />
        ))}
      </div>
    </div>
  );
});

export default PostCarouselSlide;

// ─── Parser: converte texto do post em slides ──────────────

export function parseContentToSlides(title: string, content: string): Slide[] {
  const slides: Slide[] = [];
  const lines = content.split("\n").filter((l) => l.trim());

  // Slide 1: Cover (titulo)
  const firstLine = lines[0] ?? "";
  const emoji = firstLine.match(/^[\p{Emoji}]/u)?.[0];
  slides.push({
    type: "cover",
    text: title.replace(/ — \d{4}-\d{2}-\d{2}$/, ""),
    subtext: firstLine.replace(/^[\p{Emoji}]\s*/u, "").slice(0, 80),
    emoji: emoji ?? undefined,
  });

  // Analisa conteudo pra extrair slides intermediarios
  let currentItems: string[] = [];
  let currentHeader = "";

  for (const line of lines.slice(1)) {
    const trimmed = line.trim();

    // Linhas com ✅/❌/emoji numerado → item de lista
    if (/^[❌✗✅✓🟢🟠🟤💧🧠🔥🌿🦶🌬️🌳📵1-9️⃣]/.test(trimmed) || /^\d+[.)]/.test(trimmed)) {
      currentItems.push(trimmed);
      continue;
    }

    // Se acumulou items, cria slide de lista
    if (currentItems.length >= 2) {
      slides.push({
        type: "list",
        text: currentHeader || "",
        items: currentItems.slice(0, 6), // max 6 items por slide
      });
      currentItems = [];
      currentHeader = "";
    }

    // Linhas curtas e impactantes → potencial quote
    if (trimmed.length < 60 && trimmed.length > 10 && !trimmed.includes(":")) {
      if (slides.length < 6) { // limita slides
        slides.push({ type: "content", text: trimmed, emoji: trimmed.match(/^[\p{Emoji}]/u)?.[0] });
      }
    } else if (trimmed.endsWith(":") || trimmed.endsWith("?")) {
      currentHeader = trimmed;
    }
  }

  // Flush items pendentes
  if (currentItems.length >= 2) {
    slides.push({
      type: "list",
      text: currentHeader || "",
      items: currentItems.slice(0, 6),
    });
  }

  // Limita a 8 slides max (Instagram permite 10, mas 6-8 e ideal)
  const mainSlides = slides.slice(0, 7);

  // Ultimo slide: CTA
  mainSlides.push({
    type: "cta",
    text: "Gostou? Salva e manda pra uma amiga!",
    subtext: "Salva esse post 💚",
    emoji: "💚",
  });

  return mainSlides;
}
