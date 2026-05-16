import React from "react";

interface MockupAppDetoxProps {
  className?: string;
}

// Phone mockup mostrando app detox: streak + habit checklist + mini-calendar.
// Placeholder visual ate ter screenshots reais do app.
export function MockupAppDetox({ className = "" }: MockupAppDetoxProps) {
  const phoneW = 280;
  const phoneH = 560;
  const cornerR = 36;
  const bezel = 10;
  const screenR = cornerR - bezel + 2;
  const screenW = phoneW - bezel * 2;
  const screenH = phoneH - bezel * 2;

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.25))",
      }}
    >
      <svg
        width={phoneW}
        height={phoneH}
        viewBox={`0 0 ${phoneW} ${phoneH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/* phone body */}
        <rect
          x={0}
          y={0}
          width={phoneW}
          height={phoneH}
          rx={cornerR}
          fill="#1a1a1a"
        />
        {/* screen */}
        <rect
          x={bezel}
          y={bezel}
          width={screenW}
          height={screenH}
          rx={screenR}
          fill="#FAF7F0"
        />
        {/* notch */}
        <rect
          x={phoneW / 2 - 45}
          y={bezel + 8}
          width={90}
          height={22}
          rx={11}
          fill="#1a1a1a"
        />

        {/* status bar */}
        <text x={28} y={50} fontSize={11} fill="#3D5A3E" fontWeight={700}>
          9:41
        </text>
        <g transform={`translate(${phoneW - 60}, 42)`}>
          <rect x={0} y={0} width={18} height={10} rx={2} fill="#3D5A3E" />
          <rect x={22} y={2} width={3} height={6} rx={1} fill="#3D5A3E" />
        </g>

        {/* greeting */}
        <text x={22} y={92} fontSize={11} fill="#8B9D7B" fontWeight={600}>
          QUARTA, DIA 14
        </text>
        <text x={22} y={118} fontSize={20} fill="#3D5A3E" fontWeight={800}>
          Bom dia, Camila ✨
        </text>

        {/* streak card */}
        <rect
          x={20}
          y={140}
          width={screenW - 20}
          height={88}
          rx={16}
          fill="#3D5A3E"
        />
        <text x={36} y={170} fontSize={11} fill="#B8CFA0" fontWeight={700}>
          SEU STREAK
        </text>
        <text x={36} y={208} fontSize={40} fill="#FAF7F0" fontWeight={900}>
          🔥 14
        </text>
        <text x={150} y={208} fontSize={13} fill="#B8CFA0" fontWeight={600}>
          dias seguidos
        </text>

        {/* habits today */}
        <text x={22} y={262} fontSize={13} fill="#3D5A3E" fontWeight={800}>
          Habitos de hoje
        </text>

        {[
          { label: "Beber 2L de agua", done: true },
          { label: "Cafe da manha com proteina", done: true },
          { label: "Caminhada 15 min", done: true },
          { label: "Refeicao do calendario", done: false },
        ].map((h, i) => {
          const y = 282 + i * 48;
          return (
            <g key={i}>
              <rect
                x={20}
                y={y}
                width={screenW - 20}
                height={40}
                rx={10}
                fill={h.done ? "#E8F0DE" : "#F0EBE0"}
              />
              <circle
                cx={42}
                cy={y + 20}
                r={11}
                fill={h.done ? "#8FB376" : "#FAF7F0"}
                stroke={h.done ? "#8FB376" : "#D4D0C4"}
                strokeWidth={1.5}
              />
              {h.done && (
                <path
                  d={`M${36} ${y + 20}L${40} ${y + 24}L${48} ${y + 16}`}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              <text
                x={62}
                y={y + 24}
                fontSize={12}
                fill={h.done ? "#8B9D7B" : "#3D5A3E"}
                fontWeight={600}
                textDecoration={h.done ? "line-through" : "none"}
              >
                {h.label}
              </text>
            </g>
          );
        })}

        {/* bottom progress */}
        <text x={22} y={502} fontSize={11} fill="#8B9D7B" fontWeight={700}>
          3 DE 4 HABITOS · CONTINUE!
        </text>
        <rect
          x={20}
          y={512}
          width={screenW - 20}
          height={8}
          rx={4}
          fill="#F0EBE0"
        />
        <rect
          x={20}
          y={512}
          width={(screenW - 20) * 0.75}
          height={8}
          rx={4}
          fill="#8FB376"
        />
      </svg>
    </div>
  );
}
