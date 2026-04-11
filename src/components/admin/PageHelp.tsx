"use client";

import { useEffect, useState, type ReactNode } from "react";

type PageHelpProps = {
  pageId: string; // identificador unico da pagina (usado no localStorage)
  agent?: {
    icon: string;
    name: string; // "Gaia", "Maya", "Uma", etc
    role: string; // "Growth Operator"
  };
  title: string;
  children: ReactNode;
  quickActions?: Array<{ label: string; description: string }>;
};

export default function PageHelp({
  pageId,
  agent,
  title,
  children,
  quickActions,
}: PageHelpProps) {
  const storageKey = `pagehelp_open_${pageId}`;
  const [open, setOpen] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "false") setOpen(false);
    } catch {
      /* silent */
    }
  }, [storageKey]);

  function toggle() {
    const newValue = !open;
    setOpen(newValue);
    try {
      localStorage.setItem(storageKey, String(newValue));
    } catch {
      /* silent */
    }
  }

  if (!mounted) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(122,158,126,0.08), rgba(212,169,75,0.05))",
        border: "0.5px solid rgba(122,158,126,0.35)",
        borderRadius: 12,
        marginBottom: 20,
        overflow: "hidden",
      }}
    >
      <button
        onClick={toggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--text-primary)",
        }}
      >
        <div style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>
          {agent?.icon ?? "📖"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Como funciona · {agent ? `${agent.name} · ${agent.role}` : "Guia rapido"}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginTop: 2,
            }}
          >
            {title}
          </div>
        </div>
        <span
          style={{
            fontSize: 18,
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          ⌄
        </span>
      </button>

      {open && (
        <div
          style={{
            padding: "0 18px 18px 54px",
            fontSize: 13,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          {children}

          {quickActions && quickActions.length > 0 && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTop: "0.5px solid rgba(122,158,126,0.25)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: 8,
                }}
              >
                Acoes disponiveis nesta pagina
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {quickActions.map((qa, i) => (
                  <div key={i} style={{ fontSize: 12 }}>
                    <strong style={{ color: "var(--text-primary)" }}>{qa.label}</strong>
                    <span style={{ color: "var(--text-muted)" }}> — {qa.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              color: "var(--text-muted)",
              fontStyle: "italic",
            }}
          >
            Clica no titulo acima pra ocultar esta ajuda — a preferencia fica salva.
          </div>
        </div>
      )}
    </div>
  );
}
