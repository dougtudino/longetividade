import React from "react";

interface MockupPhoneTelaProps {
  className?: string;
}

export function MockupPhoneTela({ className = "" }: MockupPhoneTelaProps) {
  const phoneW = 260;
  const phoneH = 520;
  const bezel = 12;
  const notchW = 90;
  const notchH = 22;
  const cornerR = 36;
  const screenR = cornerR - bezel + 2;

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
          transform: "rotate(3deg)",
          filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.22))",
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
          {/* Phone body */}
          <rect
            x={0.5}
            y={0.5}
            width={phoneW - 1}
            height={phoneH - 1}
            rx={cornerR}
            fill="#1a1a1a"
            stroke="#333"
            strokeWidth={1}
          />

          {/* Side buttons – volume */}
          <rect x={-1.5} y={110} width={2} height={28} rx={1} fill="#333" />
          <rect x={-1.5} y={148} width={2} height={28} rx={1} fill="#333" />

          {/* Side button – power */}
          <rect
            x={phoneW - 0.5}
            y={130}
            width={2}
            height={40}
            rx={1}
            fill="#333"
          />

          {/* Screen area */}
          <rect
            x={bezel}
            y={bezel}
            width={phoneW - bezel * 2}
            height={phoneH - bezel * 2}
            rx={screenR}
            fill="#FAF8F5"
          />

          {/* Dynamic Island / Notch */}
          <rect
            x={(phoneW - notchW) / 2}
            y={bezel + 6}
            width={notchW}
            height={notchH}
            rx={notchH / 2}
            fill="#1a1a1a"
          />

          {/* Camera dot */}
          <circle
            cx={(phoneW + notchW) / 2 - 16}
            cy={bezel + 6 + notchH / 2}
            r={4}
            fill="#2a2a3a"
          />

          {/* === Screen content: ebook first page === */}

          {/* Status bar time */}
          <text
            x={bezel + 18}
            y={bezel + 18}
            fontSize="9"
            fontWeight="600"
            fill="#2D2D2D"
          >
            9:41
          </text>

          {/* Battery / signal icons (simplified) */}
          <rect
            x={phoneW - bezel - 30}
            y={bezel + 10}
            width={16}
            height={8}
            rx={2}
            fill="none"
            stroke="#2D2D2D"
            strokeWidth={0.8}
          />
          <rect
            x={phoneW - bezel - 28}
            y={bezel + 12}
            width={10}
            height={4}
            rx={1}
            fill="#7A9E7E"
          />

          {/* Decorative sage header band */}
          <rect
            x={bezel}
            y={bezel + 36}
            width={phoneW - bezel * 2}
            height={80}
            fill="url(#phoneHeaderGrad)"
          />

          <defs>
            <linearGradient
              id="phoneHeaderGrad"
              x1={bezel}
              y1={bezel + 36}
              x2={phoneW - bezel}
              y2={bezel + 116}
            >
              <stop offset="0%" stopColor="#7A9E7E" />
              <stop offset="100%" stopColor="#3D5A3E" />
            </linearGradient>
          </defs>

          {/* Laurel decoration in header */}
          <g
            transform={`translate(${phoneW / 2}, ${bezel + 56})`}
            opacity={0.25}
          >
            {/* Left leaf */}
            <path
              d="M-8 0C-14-6-22-4-20 2C-16 4-12 2-8 0Z"
              fill="#FAF8F5"
            />
            <path
              d="M-6-3C-12-10-20-9-19-3C-15-1-10-1-6-3Z"
              fill="#FAF8F5"
            />
            {/* Right leaf */}
            <path
              d="M8 0C14-6 22-4 20 2C16 4 12 2 8 0Z"
              fill="#FAF8F5"
            />
            <path
              d="M6-3C12-10 20-9 19-3C15-1 10-1 6-3Z"
              fill="#FAF8F5"
            />
          </g>

          {/* Header title */}
          <text
            x={phoneW / 2}
            y={bezel + 82}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#FAF8F5"
            fontFamily="serif"
            letterSpacing="-0.3"
          >
            Emagreça Sem Dieta
          </text>

          {/* Subtitle badge */}
          <text
            x={phoneW / 2}
            y={bezel + 100}
            textAnchor="middle"
            fontSize="8"
            fontWeight="600"
            fill="#FAF8F5"
            letterSpacing="2"
            opacity={0.8}
          >
            MÉTODO S.E.M
          </text>

          {/* Gold separator */}
          <line
            x1={phoneW / 2 - 40}
            y1={bezel + 130}
            x2={phoneW / 2 + 40}
            y2={bezel + 130}
            stroke="#D4A94B"
            strokeWidth={1.5}
            opacity={0.7}
          />

          {/* Content area – intro text placeholder lines */}
          <text
            x={bezel + 20}
            y={bezel + 155}
            fontSize="9"
            fontWeight="700"
            fill="#2D2D2D"
            fontFamily="serif"
          >
            Introdução
          </text>

          {[170, 182, 194, 206].map((y, i) => (
            <rect
              key={i}
              x={bezel + 20}
              y={bezel + y}
              width={phoneW - bezel * 2 - 40 - (i === 3 ? 50 : 0)}
              height={4}
              rx={2}
              fill="#d5d0c8"
            />
          ))}

          {/* Quote block */}
          <rect
            x={bezel + 18}
            y={bezel + 224}
            width={3}
            height={32}
            rx={1.5}
            fill="#C4787A"
          />
          {[230, 242].map((y, i) => (
            <rect
              key={i}
              x={bezel + 28}
              y={bezel + y}
              width={phoneW - bezel * 2 - 56 - (i === 1 ? 30 : 0)}
              height={4}
              rx={2}
              fill="#e0dbd4"
            />
          ))}

          {/* Section heading */}
          <text
            x={bezel + 20}
            y={bezel + 280}
            fontSize="9"
            fontWeight="700"
            fill="#2D2D2D"
            fontFamily="serif"
          >
            Capítulo 1
          </text>

          {/* More text lines */}
          {[295, 307, 319, 331, 343].map((y, i) => (
            <rect
              key={i}
              x={bezel + 20}
              y={bezel + y}
              width={
                phoneW - bezel * 2 - 40 - (i === 4 ? 60 : i === 2 ? 20 : 0)
              }
              height={4}
              rx={2}
              fill="#d5d0c8"
            />
          ))}

          {/* Small decorative leaf icon */}
          <g
            transform={`translate(${phoneW / 2}, ${bezel + 375})`}
            opacity={0.3}
          >
            <path
              d="M0-8C-4-4-8 0-6 4C-2 2 0-2 0-8Z"
              fill="#7A9E7E"
            />
            <path
              d="M0-8C4-4 8 0 6 4C2 2 0-2 0-8Z"
              fill="#7A9E7E"
            />
          </g>

          {/* Bottom navigation dots */}
          {[-12, 0, 12].map((dx, i) => (
            <circle
              key={i}
              cx={phoneW / 2 + dx}
              cy={phoneH - bezel - 20}
              r={i === 0 ? 3 : 2.5}
              fill={i === 0 ? "#7A9E7E" : "#d5d0c8"}
            />
          ))}

          {/* Home indicator bar */}
          <rect
            x={(phoneW - 80) / 2}
            y={phoneH - bezel - 6}
            width={80}
            height={3}
            rx={1.5}
            fill="#2D2D2D"
            opacity={0.2}
          />
        </svg>
      </div>
    </div>
  );
}

export default MockupPhoneTela;
