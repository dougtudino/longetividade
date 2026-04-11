"use client";

import { useState, type ReactNode } from "react";

export type StepStatus = "pendente" | "em_progresso" | "feito";

export type ChecklistStep = {
  id: string;
  title: string;
  summary: string;
  details: ReactNode;
  externalLink?: { label: string; url: string };
};

const STATUS_LABEL: Record<StepStatus, string> = {
  pendente: "Pendente",
  em_progresso: "Em progresso",
  feito: "Feito",
};

const STATUS_BG: Record<StepStatus, string> = {
  pendente: "rgba(160, 160, 160, 0.15)",
  em_progresso: "rgba(74, 144, 217, 0.18)",
  feito: "rgba(107, 158, 107, 0.18)",
};

const STATUS_COLOR: Record<StepStatus, string> = {
  pendente: "#888",
  em_progresso: "#4A90D9",
  feito: "#6B9E6B",
};

const STATUS_BORDER: Record<StepStatus, string> = {
  pendente: "var(--border-subtle)",
  em_progresso: "rgba(74, 144, 217, 0.5)",
  feito: "rgba(107, 158, 107, 0.5)",
};

const NEXT_STATUS: Record<StepStatus, StepStatus> = {
  pendente: "em_progresso",
  em_progresso: "feito",
  feito: "pendente",
};

export default function SetupChecklist({
  steps,
  statuses,
  onStatusChange,
}: {
  steps: ChecklistStep[];
  statuses: Record<string, StepStatus>;
  onStatusChange: (stepId: string, status: StepStatus) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(steps[0]?.id ?? null);
  const doneCount = steps.filter((s) => statuses[s.id] === "feito").length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Progress header */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Progresso do setup
          </span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {doneCount} / {total} ({pct}%)
          </span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "var(--bg-secondary)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct === 100 ? "#6B9E6B" : "var(--accent)",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {steps.map((step, idx) => {
        const status = statuses[step.id] ?? "pendente";
        const isOpen = expanded === step.id;

        return (
          <div
            key={step.id}
            style={{
              background: "var(--bg-card)",
              border: `0.5px solid ${STATUS_BORDER[status]}`,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : step.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 16,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "var(--text-primary)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: STATUS_BG[status],
                  color: STATUS_COLOR[status],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  border: `1.5px solid ${STATUS_COLOR[status]}`,
                }}
              >
                {status === "feito" ? "✓" : idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{step.title}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {step.summary}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: STATUS_BG[status],
                  color: STATUS_COLOR[status],
                  whiteSpace: "nowrap",
                }}
              >
                {STATUS_LABEL[status]}
              </span>
              <span
                style={{
                  fontSize: 18,
                  color: "var(--text-muted)",
                  transform: isOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              >
                ⌄
              </span>
            </button>

            {isOpen && (
              <div
                style={{
                  padding: "0 16px 16px 62px",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                <div style={{ marginBottom: 14 }}>{step.details}</div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {step.externalLink && (
                    <a
                      href={step.externalLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {step.externalLink.label} ↗
                    </a>
                  )}
                  <button
                    onClick={() => onStatusChange(step.id, NEXT_STATUS[status])}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      border: "0.5px solid var(--border-default)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Marcar como: {STATUS_LABEL[NEXT_STATUS[status]]}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
