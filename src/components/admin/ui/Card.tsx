"use client";

import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  padding?: number | string;
};

export function Card({ interactive, padding = 20, style, children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 14,
        padding,
        transition: "transform 0.15s, border-color 0.15s, background 0.15s",
        cursor: interactive ? "pointer" : "default",
        color: "var(--text-primary)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.borderColor = "var(--border-hover)";
          e.currentTarget.style.background = "var(--bg-card-hover)";
        }
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.background = "var(--bg-card)";
        }
        rest.onMouseLeave?.(e);
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
  icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0, flex: 1 }}>
        {icon && <div style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{icon}</div>}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.3,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 2,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}
