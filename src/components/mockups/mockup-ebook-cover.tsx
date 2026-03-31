import React from "react";

const SIZES = {
  sm: { width: 180, height: 260, titleSize: "1.1rem", subSize: "0.65rem" },
  md: { width: 280, height: 400, titleSize: "1.7rem", subSize: "0.85rem" },
  lg: { width: 380, height: 540, titleSize: "2.3rem", subSize: "1.1rem" },
} as const;

interface MockupEbookCoverProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MockupEbookCover({
  className = "",
  size = "md",
}: MockupEbookCoverProps) {
  const s = SIZES[size];

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1200px",
      }}
    >
      {/* Book wrapper with 3D transform */}
      <div
        style={{
          width: s.width,
          height: s.height,
          position: "relative",
          transformStyle: "preserve-3d",
          transform: "rotateY(-15deg) rotateX(5deg)",
        }}
      >
        {/* Drop shadow underneath */}
        <div
          style={{
            position: "absolute",
            bottom: -12,
            left: 10,
            right: -5,
            height: 30,
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 70%)",
            filter: "blur(8px)",
            transform: "rotateX(90deg)",
            transformOrigin: "bottom center",
            zIndex: 0,
          }}
        />

        {/* Spine edge */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 16,
            height: "100%",
            background: "linear-gradient(to right, #5C7E5F, #7A9E7E)",
            transform: "translateX(-15px) rotateY(90deg)",
            transformOrigin: "right center",
            borderRadius: "2px 0 0 2px",
            zIndex: 1,
          }}
        />

        {/* Main cover face */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #7A9E7E 0%, #b8ccba 40%, #FAF8F5 100%)",
            borderRadius: "0 4px 4px 0",
            boxShadow:
              "4px 4px 20px rgba(0,0,0,0.25), inset -2px 0 6px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10%",
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          {/* Decorative laurel – top-right corner */}
          <svg
            viewBox="0 0 80 80"
            style={{
              position: "absolute",
              top: "5%",
              right: "5%",
              width: "25%",
              height: "25%",
              opacity: 0.25,
            }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 5C30 15 10 20 5 40C15 35 25 38 35 30C28 45 15 55 5 75C20 65 35 60 40 45C45 60 60 65 75 75C65 55 52 45 45 30C55 38 65 35 75 40C70 20 50 15 40 5Z"
              fill="#3D5A3E"
            />
          </svg>

          {/* Decorative laurel – bottom-left corner */}
          <svg
            viewBox="0 0 80 80"
            style={{
              position: "absolute",
              bottom: "5%",
              left: "5%",
              width: "20%",
              height: "20%",
              opacity: 0.18,
              transform: "rotate(180deg)",
            }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 5C30 15 10 20 5 40C15 35 25 38 35 30C28 45 15 55 5 75C20 65 35 60 40 45C45 60 60 65 75 75C65 55 52 45 45 30C55 38 65 35 75 40C70 20 50 15 40 5Z"
              fill="#3D5A3E"
            />
          </svg>

          {/* Thin decorative line */}
          <div
            style={{
              width: "50%",
              height: 1,
              background: "#D4A94B",
              marginBottom: "6%",
              opacity: 0.7,
            }}
          />

          {/* Title */}
          <h2
            className="font-heading"
            style={{
              fontSize: s.titleSize,
              fontWeight: 700,
              color: "#2D2D2D",
              textAlign: "center",
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Emagreça
            <br />
            Sem Dieta
          </h2>

          {/* Gold accent line */}
          <div
            style={{
              width: "30%",
              height: 2,
              background: "linear-gradient(90deg, transparent, #D4A94B, transparent)",
              margin: "6% 0",
            }}
          />

          {/* Subtitle */}
          <p
            style={{
              fontSize: s.subSize,
              fontWeight: 600,
              color: "#3D5A3E",
              textAlign: "center",
              margin: 0,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Método S.E.M
          </p>

          {/* Bottom decorative bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "4%",
              background: "linear-gradient(90deg, #D4A94B, #C4787A, #D4A94B)",
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default MockupEbookCover;
