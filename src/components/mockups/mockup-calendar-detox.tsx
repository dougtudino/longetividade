import React from "react";

interface MockupCalendarDetoxProps {
  className?: string;
  markedDays?: number;
}

// Placeholder visual do Calendario Detox 21 Dias (3 semanas x 7 dias).
// Substituir por foto real do calendario impresso quando disponivel.
export function MockupCalendarDetox({
  className = "",
  markedDays = 14,
}: MockupCalendarDetoxProps) {
  const days = Array.from({ length: 21 }, (_, i) => i + 1);

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.18))",
        transform: "rotate(-2deg)",
      }}
    >
      <div
        style={{
          backgroundColor: "#FAF7F0",
          borderRadius: 18,
          padding: "28px 24px",
          width: 360,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2.5,
              color: "#8B9D7B",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Calendario Detox
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#3D5A3E",
              fontFamily: "serif",
              lineHeight: 1,
            }}
          >
            21 Dias
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 6,
            marginBottom: 4,
          }}
        >
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
            <div
              key={i}
              style={{
                textAlign: "center",
                fontSize: 10,
                color: "#A8A89C",
                fontWeight: 600,
                paddingBottom: 4,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 6,
          }}
        >
          {days.map((d) => {
            const marked = d <= markedDays;
            return (
              <div
                key={d}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: marked ? "#B8CFA0" : "#F0EBE0",
                  color: marked ? "#3D5A3E" : "#A8A89C",
                  fontSize: 13,
                  fontWeight: 700,
                  position: "relative",
                }}
              >
                {d}
                {marked && (
                  <svg
                    width={8}
                    height={8}
                    viewBox="0 0 10 10"
                    style={{ position: "absolute", bottom: 4 }}
                  >
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="#3D5A3E"
                      strokeWidth={2}
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px dashed #D4D0C4",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            color: "#8B9D7B",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}
        >
          <span>Dia {markedDays} de 21</span>
          <span>🔥 {markedDays} dias seguidos</span>
        </div>
      </div>
    </div>
  );
}
