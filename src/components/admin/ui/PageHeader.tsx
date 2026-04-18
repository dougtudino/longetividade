"use client";

import React from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumb && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          {breadcrumb}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
          {icon && <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{icon}</div>}
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>
        </div>
        {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            margin: "0",
            lineHeight: 1.5,
            maxWidth: 720,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 12,
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: "0.5px solid var(--border-subtle)",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {right}
    </div>
  );
}
