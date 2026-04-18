"use client";

import React from "react";

type Tone = "neutral" | "accent" | "success" | "warn" | "danger" | "info";

const TONE_MAP: Record<Tone, { bg: string; color: string; border: string }> = {
  neutral: {
    bg: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    border: "var(--border-subtle)",
  },
  accent: {
    bg: "var(--accent-soft)",
    color: "var(--accent-text)",
    border: "var(--accent-soft)",
  },
  success: {
    bg: "rgba(107,158,107,0.12)",
    color: "#8CC28C",
    border: "rgba(107,158,107,0.3)",
  },
  warn: {
    bg: "rgba(212,169,75,0.12)",
    color: "#D4A94B",
    border: "rgba(212,169,75,0.3)",
  },
  danger: {
    bg: "rgba(196,120,122,0.12)",
    color: "#E09698",
    border: "rgba(196,120,122,0.3)",
  },
  info: {
    bg: "rgba(99,153,34,0.12)",
    color: "#8FBB3F",
    border: "rgba(99,153,34,0.3)",
  },
};

export function Badge({
  tone = "neutral",
  children,
  size = "md",
  dot,
}: {
  tone?: Tone;
  children: React.ReactNode;
  size?: "sm" | "md";
  dot?: boolean;
}) {
  const t = TONE_MAP[tone];
  const isSm = size === "sm";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: isSm ? "2px 8px" : "4px 10px",
        borderRadius: 999,
        background: t.bg,
        color: t.color,
        border: `0.5px solid ${t.border}`,
        fontSize: isSm ? 10 : 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: t.color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
