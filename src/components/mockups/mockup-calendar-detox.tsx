import React from "react";

interface MockupCalendarDetoxProps {
  className?: string;
  markedDays?: number;
}

// Placeholder visual do Calendario Detox 21 Dias (3 semanas x 7 dias).
// Estetica "vivido" — leve rotacao, post-it, ima geladeira, marcacoes
// irregulares — em vez de "template digital limpo". Substituir por foto
// real do calendario impresso quando disponivel.
export function MockupCalendarDetox({
  className = "",
  markedDays = 14,
}: MockupCalendarDetoxProps) {
  const days = Array.from({ length: 21 }, (_, i) => i + 1);

  // Marcacoes irregulares: alguns dias riscados com X, outros com check,
  // outros com smiley. Tira a sensacao de template digital perfeito.
  const markStyle = (d: number): "check" | "x" | "smiley" => {
    if (d % 5 === 0) return "smiley";
    if (d % 4 === 0) return "x";
    return "check";
  };

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.20))",
        transform: "rotate(-2.5deg)",
        position: "relative",
      }}
    >
      {/* Ima da geladeira no topo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 48,
          height: 16,
          borderRadius: 5,
          background: "linear-gradient(180deg, #D4A94B 0%, #A57F2A 100%)",
          boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
          zIndex: 3,
        }}
      />

      {/* Post-it amarelo no canto superior direito */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 28,
          right: -22,
          width: 78,
          height: 78,
          backgroundColor: "#F8E58A",
          borderRadius: 2,
          transform: "rotate(8deg)",
          boxShadow: "0 6px 14px rgba(0,0,0,0.18)",
          padding: 8,
          fontFamily: "cursive, serif",
          fontSize: 11,
          color: "#5A4A1F",
          fontWeight: 600,
          lineHeight: 1.2,
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          zIndex: 2,
        }}
      >
        beber agua todo dia ✨
      </div>

      <div
        style={{
          backgroundColor: "#FAF7F0",
          borderRadius: 12,
          padding: "32px 26px 24px",
          width: 360,
          border: "1px solid rgba(0,0,0,0.06)",
          // Textura de papel sutil via gradiente
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(139, 157, 123, 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 157, 123, 0.03) 0%, transparent 50%)",
          position: "relative",
          zIndex: 1,
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
            const style = marked ? markStyle(d) : null;
            // Rotacao sutil aleatoria pra parecer escrito a mao
            const rotation = (d * 37) % 7 - 3;
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
                  <div
                    style={{
                      position: "absolute",
                      bottom: 3,
                      transform: `rotate(${rotation}deg)`,
                      fontSize: 10,
                      lineHeight: 1,
                      color: style === "x" ? "#B23B3B" : "#3D5A3E",
                    }}
                  >
                    {style === "check" && (
                      <svg width={10} height={10} viewBox="0 0 12 12">
                        <path
                          d="M2 6L4.5 8.5L10 3"
                          stroke="currentColor"
                          strokeWidth={2.2}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {style === "x" && (
                      <span style={{ fontSize: 11, fontWeight: 800 }}>×</span>
                    )}
                    {style === "smiley" && <span style={{ fontSize: 10 }}>♡</span>}
                  </div>
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

      {/* Caneta encostada no canto inferior esquerdo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -8,
          left: 12,
          width: 90,
          height: 10,
          borderRadius: 3,
          background:
            "linear-gradient(90deg, #3D5A3E 0%, #3D5A3E 75%, #C8B580 75%, #C8B580 95%, #2A2A2A 95%, #2A2A2A 100%)",
          transform: "rotate(-12deg)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.20)",
          zIndex: 0,
        }}
      />
    </div>
  );
}
