"use client";

import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, style, ...rest }: InputProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
      <input
        {...rest}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: `0.5px solid ${error ? "#C4787A" : "var(--border-default)"}`,
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color 0.15s",
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? "#C4787A" : "var(--accent)";
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "#C4787A" : "var(--border-default)";
          rest.onBlur?.(e);
        }}
      />
      {hint && !error && (
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: 11, color: "#C4787A", fontWeight: 600 }}>{error}</span>
      )}
    </label>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Textarea({ label, hint, error, style, ...rest }: TextareaProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
      <textarea
        {...rest}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: `0.5px solid ${error ? "#C4787A" : "var(--border-default)"}`,
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          resize: "vertical",
          minHeight: 80,
          lineHeight: 1.5,
          transition: "border-color 0.15s",
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? "#C4787A" : "var(--accent)";
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "#C4787A" : "var(--border-default)";
          rest.onBlur?.(e);
        }}
      />
      {hint && !error && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</span>}
      {error && <span style={{ fontSize: 11, color: "#C4787A", fontWeight: 600 }}>{error}</span>}
    </label>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Select({ label, hint, error, style, children, ...rest }: SelectProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
      <select
        {...rest}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: `0.5px solid ${error ? "#C4787A" : "var(--border-default)"}`,
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          cursor: "pointer",
          ...style,
        }}
      >
        {children}
      </select>
      {hint && !error && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</span>}
      {error && <span style={{ fontSize: 11, color: "#C4787A", fontWeight: 600 }}>{error}</span>}
    </label>
  );
}
