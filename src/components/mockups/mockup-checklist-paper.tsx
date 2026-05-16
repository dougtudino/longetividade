import React from "react";

interface MockupChecklistPaperProps {
  className?: string;
}

// Checklist diario em papel, estilo planner premium.
// Placeholder ate ter foto real impressa.
export function MockupChecklistPaper({ className = "" }: MockupChecklistPaperProps) {
  const items = [
    { label: "Beber 2L de agua", done: true },
    { label: "Cafe com proteina", done: true },
    { label: "Caminhada 15 min", done: true },
    { label: "Refeicao do dia", done: false },
    { label: "Dormir antes das 23h", done: false },
  ];

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.18))",
        transform: "rotate(1.5deg)",
      }}
    >
      <div
        style={{
          backgroundColor: "#FAF7F0",
          borderRadius: 14,
          padding: 28,
          width: 280,
          border: "1px solid rgba(0,0,0,0.06)",
          position: "relative",
        }}
      >
        {/* "magnet" no topo */}
        <div
          style={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 40,
            height: 14,
            backgroundColor: "#D4A94B",
            borderRadius: 4,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "#8B9D7B",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Checklist · Dia 14
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#3D5A3E",
              fontFamily: "serif",
            }}
          >
            Hoje eu vou
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 5,
                  border: "1.5px solid",
                  borderColor: item.done ? "#8FB376" : "#D4D0C4",
                  backgroundColor: item.done ? "#8FB376" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.done && (
                  <svg width={12} height={12} viewBox="0 0 12 12">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: item.done ? "#A8A89C" : "#3D5A3E",
                  fontWeight: 600,
                  textDecoration: item.done ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 14,
            borderTop: "1px dashed #D4D0C4",
            fontSize: 10,
            color: "#8B9D7B",
            fontWeight: 600,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          3 de 5 · Continue 💪
        </div>
      </div>
    </div>
  );
}
