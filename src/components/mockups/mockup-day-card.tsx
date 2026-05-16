import React from "react";

interface MockupDayCardProps {
  dayNumber: number;
  title: string;
  tasks: string[];
  className?: string;
}

// Cartao de "dia X" do calendario, estilo planner. Usado na secao Como Funciona.
export function MockupDayCard({
  dayNumber,
  title,
  tasks,
  className = "",
}: MockupDayCardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "#FAF7F0",
        borderRadius: 16,
        padding: "28px 24px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 8px 24px -8px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: 2,
            color: "#8B9D7B",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Dia
        </span>
        <span
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: "#3D5A3E",
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          {String(dayNumber).padStart(2, "0")}
        </span>
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#3D5A3E",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: "auto",
        }}
      >
        {tasks.map((task, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                backgroundColor: "#8FB376",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width={10} height={10} viewBox="0 0 12 12">
                <path
                  d="M2 6L5 9L10 3"
                  stroke="#FFFFFF"
                  strokeWidth={2.2}
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 13,
                color: "#3D5A3E",
                fontWeight: 500,
              }}
            >
              {task}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
