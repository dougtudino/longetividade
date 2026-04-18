"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
};

const SIZE_MAP: Record<Size, { padding: string; fontSize: number; height: number; gap: number }> = {
  sm: { padding: "0 12px", fontSize: 12, height: 32, gap: 6 },
  md: { padding: "0 16px", fontSize: 13, height: 38, gap: 8 },
  lg: { padding: "0 20px", fontSize: 14, height: 44, gap: 10 },
};

function variantStyle(variant: Variant, disabled: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    border: "none",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
  switch (variant) {
    case "primary":
      return { ...base, background: "var(--accent)", color: "#fff" };
    case "secondary":
      return {
        ...base,
        background: "var(--bg-card)",
        color: "var(--text-primary)",
        border: "0.5px solid var(--border-default)",
      };
    case "ghost":
      return { ...base, background: "transparent", color: "var(--text-secondary)" };
    case "danger":
      return { ...base, background: "#C4787A", color: "#fff" };
    case "success":
      return { ...base, background: "#6B9E6B", color: "#fff" };
  }
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  iconRight,
  fullWidth,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps) {
  const sz = SIZE_MAP[size];
  const isDisabled = !!(disabled || loading);
  return (
    <button
      {...rest}
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sz.gap,
        padding: sz.padding,
        height: sz.height,
        borderRadius: 10,
        fontSize: sz.fontSize,
        fontWeight: 600,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        transition: "transform 0.1s, filter 0.15s",
        width: fullWidth ? "100%" : undefined,
        ...variantStyle(variant, isDisabled),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.filter = "brightness(1.1)";
        rest.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "none";
        rest.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = "scale(0.98)";
        rest.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "none";
        rest.onMouseUp?.(e);
      }}
    >
      {loading ? (
        <Spinner size={sz.fontSize} />
      ) : (
        <>
          {icon && <span style={{ display: "inline-flex" }}>{icon}</span>}
          {children}
          {iconRight && <span style={{ display: "inline-flex" }}>{iconRight}</span>}
        </>
      )}
    </button>
  );
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      aria-label="loading"
      style={{
        width: size,
        height: size,
        display: "inline-block",
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "adm-spin 0.7s linear infinite",
      }}
    >
      <style>{`@keyframes adm-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
