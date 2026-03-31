import React from "react";

interface MockupEbookSpreadProps {
  className?: string;
}

const CHECKLIST_ITEMS = [
  "Mindset de emagrecimento",
  "Alimentação consciente",
  "Rotina de movimento",
  "Gestão do estresse",
  "Sono reparador",
];

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function MockupEbookSpread({ className = "" }: MockupEbookSpreadProps) {
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1000px",
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: 560,
          width: "100%",
          transform: "rotateX(4deg)",
          filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.2))",
        }}
      >
        {/* Left page */}
        <div
          style={{
            flex: 1,
            background: "#FAF8F5",
            padding: "7% 6%",
            borderRadius: "6px 0 0 6px",
            position: "relative",
            boxShadow: "inset -4px 0 8px rgba(0,0,0,0.06)",
            minHeight: 320,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Page curl top-left */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 24,
              height: 24,
              background:
                "linear-gradient(135deg, #e8e4df 50%, transparent 50%)",
              borderRadius: "6px 0 0 0",
            }}
          />

          <h3
            className="font-heading"
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#2D2D2D",
              margin: "0 0 8% 0",
              borderBottom: "1.5px solid #D4A94B",
              paddingBottom: "4%",
              letterSpacing: "-0.01em",
            }}
          >
            Checklist Essencial
          </h3>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
            {CHECKLIST_ITEMS.map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: "6%",
                  fontSize: "0.72rem",
                  color: "#2D2D2D",
                  lineHeight: 1.3,
                }}
              >
                {/* Checkmark icon */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ flexShrink: 0 }}
                >
                  <circle cx="8" cy="8" r="7.5" fill="#7A9E7E" opacity={0.15} />
                  <circle cx="8" cy="8" r="7.5" stroke="#7A9E7E" strokeWidth={1} />
                  <path
                    d="M4.5 8L7 10.5L11.5 5.5"
                    stroke="#3D5A3E"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Page number */}
          <span
            style={{
              fontSize: "0.6rem",
              color: "#999",
              textAlign: "center",
              display: "block",
            }}
          >
            12
          </span>
        </div>

        {/* Center spine shadow */}
        <div
          style={{
            width: 6,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.03), rgba(0,0,0,0.1))",
            flexShrink: 0,
          }}
        />

        {/* Right page */}
        <div
          style={{
            flex: 1,
            background: "#FAF8F5",
            padding: "7% 6%",
            borderRadius: "0 6px 6px 0",
            position: "relative",
            boxShadow: "inset 4px 0 8px rgba(0,0,0,0.04)",
            minHeight: 320,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Page curl top-right */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 24,
              height: 24,
              background:
                "linear-gradient(225deg, #e8e4df 50%, transparent 50%)",
              borderRadius: "0 6px 0 0",
            }}
          />

          <h3
            className="font-heading"
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#2D2D2D",
              margin: "0 0 8% 0",
              borderBottom: "1.5px solid #C4787A",
              paddingBottom: "4%",
              letterSpacing: "-0.01em",
            }}
          >
            Plano de 7 Dias
          </h3>

          {/* Days grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              flex: 1,
            }}
          >
            {DAYS.map((day, i) => (
              <div
                key={i}
                style={{
                  background:
                    i === 0
                      ? "linear-gradient(135deg, #7A9E7E, #3D5A3E)"
                      : "#f0ede8",
                  borderRadius: 4,
                  padding: "6px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: i === 0 ? "#FAF8F5" : "#2D2D2D",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {day}
                </span>
                {/* Placeholder lines */}
                <div
                  style={{
                    height: 3,
                    width: "80%",
                    background: i === 0 ? "rgba(255,255,255,0.35)" : "#d5d0c8",
                    borderRadius: 2,
                  }}
                />
                <div
                  style={{
                    height: 3,
                    width: "55%",
                    background: i === 0 ? "rgba(255,255,255,0.2)" : "#ddd8d0",
                    borderRadius: 2,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Page number */}
          <span
            style={{
              fontSize: "0.6rem",
              color: "#999",
              textAlign: "center",
              display: "block",
              marginTop: "4%",
            }}
          >
            13
          </span>
        </div>
      </div>
    </div>
  );
}

export default MockupEbookSpread;
