"use client";

import React from "react";

export function Stat({
  label,
  value,
  delta,
  hint,
  icon,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; positive: boolean };
  hint?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 14,
        background: accent ? "var(--accent-soft)" : "var(--bg-card)",
        border: `0.5px solid ${accent ? "var(--accent)" : "var(--border-default)"}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 100,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </div>
        {icon && <div style={{ fontSize: 16, color: "var(--text-muted)" }}>{icon}</div>}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: accent ? "var(--accent-text)" : "var(--text-primary)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {(delta || hint) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          {delta && (
            <span
              style={{
                color: delta.positive ? "#8CC28C" : "#E09698",
                fontWeight: 700,
              }}
            >
              {delta.positive ? "▲" : "▼"} {delta.value}
            </span>
          )}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  );
}

export function StatGrid({ children, minWidth = 180 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}
