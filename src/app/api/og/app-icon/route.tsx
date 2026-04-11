import { ImageResponse } from "next/og";

export const runtime = "edge";

// Ícone 1024x1024 para upload no Meta for Developers (app icon)
// Acesse via /api/og/app-icon — retorna PNG pronto para download
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #7A9E7E 0%, #3D5A3E 100%)",
          position: "relative",
        }}
      >
        {/* Decoracao circular */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -180,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(212,169,75,0.12)",
            display: "flex",
          }}
        />

        {/* L centro */}
        <div
          style={{
            width: 600,
            height: 600,
            borderRadius: 160,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 40px 80px rgba(0,0,0,0.25)",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 440,
              fontWeight: 900,
              color: "#3D5A3E",
              lineHeight: 1,
              letterSpacing: "-0.05em",
              display: "flex",
            }}
          >
            L
          </div>
        </div>
      </div>
    ),
    {
      width: 1024,
      height: 1024,
    }
  );
}
