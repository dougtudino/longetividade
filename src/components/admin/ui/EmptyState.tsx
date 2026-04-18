"use client";

import React from "react";

export function EmptyState({
  icon = "📦",
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "48px 24px",
        background: "var(--bg-card)",
        border: "0.5px dashed var(--border-default)",
        borderRadius: 14,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 12, lineHeight: 1 }}>{icon}</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: action ? 20 : 0,
            lineHeight: 1.5,
            maxWidth: 460,
            margin: "0 auto",
          }}
        >
          {description}
        </div>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
  icon,
  action,
}: {
  tone?: "info" | "warn" | "danger" | "success";
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const COLORS: Record<string, { bg: string; border: string; fg: string; default_icon: string }> = {
    info: {
      bg: "rgba(99,153,34,0.08)",
      border: "rgba(99,153,34,0.3)",
      fg: "#8FBB3F",
      default_icon: "ℹ️",
    },
    warn: {
      bg: "rgba(212,169,75,0.10)",
      border: "rgba(212,169,75,0.3)",
      fg: "#D4A94B",
      default_icon: "⚠️",
    },
    danger: {
      bg: "rgba(196,120,122,0.10)",
      border: "rgba(196,120,122,0.3)",
      fg: "#E09698",
      default_icon: "⛔",
    },
    success: {
      bg: "rgba(107,158,107,0.10)",
      border: "rgba(107,158,107,0.3)",
      fg: "#8CC28C",
      default_icon: "✅",
    },
  };
  const c = COLORS[tone];
  return (
    <div
      style={{
        background: c.bg,
        border: `0.5px solid ${c.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <div style={{ fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>{icon ?? c.default_icon}</div>
      <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: c.fg, lineHeight: 1.5 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: 2 }}>{title}</div>}
        {children}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
