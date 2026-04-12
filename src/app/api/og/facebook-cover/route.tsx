import { ImageResponse } from "next/og";

export const runtime = "edge";

// GET /api/og/facebook-cover
// Capa da Facebook Page — 820x312 (tamanho recomendado pelo FB)
// Download: abre a URL no browser, botao direito → Salvar imagem
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #FAF8F5 0%, #F0EDE5 40%, #7A9E7E 100%)",
          padding: "40px 60px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decoração */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(122,158,126,0.15)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: "40%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(212,169,75,0.1)",
            display: "flex",
          }}
        />

        {/* Lado esquerdo: logo + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "#7A9E7E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              L
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#3D5A3E", letterSpacing: "-0.02em" }}>
              Longetividade
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#2D2D2D", opacity: 0.7, maxWidth: 400, lineHeight: 1.4 }}>
            Viva mais. Viva melhor.
          </div>
        </div>

        {/* Lado direito: pilares */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
          {[
            { letter: "S", label: "Simplicidade", color: "#7A9E7E" },
            { letter: "E", label: "Equilíbrio", color: "#D4A94B" },
            { letter: "M", label: "Movimento", color: "#3D5A3E" },
          ].map((p) => (
            <div key={p.letter} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: p.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                {p.letter}
              </div>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#2D2D2D", opacity: 0.8 }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>

        {/* URL no canto */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 24,
            fontSize: 12,
            color: "rgba(61,90,62,0.5)",
            fontWeight: 600,
            display: "flex",
          }}
        >
          longetividade.com.br
        </div>
      </div>
    ),
    { width: 820, height: 312 }
  );
}
