"use client";

import { useRef, useState, type RefObject, type ComponentType, type ForwardRefExoticComponent, type RefAttributes } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";
import CreativeFeedDor from "@/components/creatives/creative-feed-dor";
import CreativeFeedProva from "@/components/creatives/creative-feed-prova";
import CreativeFeedObjecao from "@/components/creatives/creative-feed-objecao";
import CreativeStoryStat from "@/components/creatives/creative-story-stat";
import CreativeStoryCta from "@/components/creatives/creative-story-cta";
import CreativeBannerDisplay from "@/components/creatives/creative-banner-display";

type CreativeRef = ForwardRefExoticComponent<RefAttributes<HTMLDivElement>>;

type CreativeDef = {
  id: string;
  label: string;
  format: string;
  width: number;
  height: number;
  Component: CreativeRef | ComponentType<{ ref?: RefObject<HTMLDivElement | null> }>;
};

const CREATIVES: CreativeDef[] = [
  { id: "feed-dor", label: "Feed · Dor / Identificacao", format: "Feed", width: 1080, height: 1080, Component: CreativeFeedDor },
  { id: "feed-prova", label: "Feed · Prova Social", format: "Feed", width: 1080, height: 1080, Component: CreativeFeedProva },
  { id: "feed-objecao", label: "Feed · Quebra de Objecao", format: "Feed", width: 1080, height: 1080, Component: CreativeFeedObjecao },
  { id: "story-stat", label: "Story · Stat -4kg", format: "Story", width: 1080, height: 1920, Component: CreativeStoryStat },
  { id: "story-cta", label: "Story · CTA Comece Hoje", format: "Story", width: 1080, height: 1920, Component: CreativeStoryCta },
  { id: "banner-display", label: "Banner · Google Display", format: "Banner", width: 1200, height: 628, Component: CreativeBannerDisplay },
];

export default function CriativosPage() {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function downloadCreative(id: string, width: number, height: number) {
    const node = refs.current[id];
    if (!node) {
      setError(`Nao encontrei o criativo ${id}`);
      return;
    }
    setDownloadingId(id);
    setError(null);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 1,
        width,
        height,
        skipFonts: false,
      });
      const link = document.createElement("a");
      link.download = `longetividade-${id}-${width}x${height}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      setError(`Erro: ${(e as Error).message}`);
    } finally {
      setDownloadingId(null);
    }
  }

  async function downloadAll() {
    for (const c of CREATIVES) {
      await downloadCreative(c.id, c.width, c.height);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Criativos para Meta Ads
        </h1>
        <button
          onClick={downloadAll}
          disabled={!!downloadingId}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: downloadingId ? "wait" : "pointer",
            opacity: downloadingId ? 0.6 : 1,
          }}
        >
          {downloadingId ? "Baixando..." : "↓ Baixar todos"}
        </button>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 24px 0", lineHeight: 1.5 }}>
        6 criativos prontos para subir no Meta Ads Manager. Cada um e renderizado em
        dimensoes pixel-perfect e exportado em PNG. Briefing: @ux-design-expert Uma
        (council 2026-04-11).
      </p>

      <PageHelp
        pageId="criativos"
        agent={{ icon: "🎨", name: "Uma", role: "UX Designer / Criativos" }}
        title="6 criativos React renderizados pixel-perfect"
        quickActions={[
          { label: "Baixar PNG individual", description: "Gera PNG do criativo específico via html-to-image" },
          { label: "Baixar todos", description: "Baixa os 6 em sequência (um por vez, ~3s cada)" },
        ]}
      >
        <p>
          Os criativos são <strong>componentes React</strong> em{" "}
          <code>src/components/creatives/</code>. Cada um é SVG/HTML puro com paleta da
          marca (verde-oliva) e renderizado offscreen, depois capturado via{" "}
          <code>html-to-image</code> pra virar PNG. Resolução nativa mantida
          (1080×1080, 1080×1920, 1200×628).
        </p>
        <p>
          <strong>Meta Ad Policy compliance:</strong> as copies foram reescritas pela Uma
          (conselho 2026-04-11) removendo triggers como números de peso (&ldquo;-4kg&rdquo;),
          timeframes (&ldquo;30 dias&rdquo;) e quick-fix language. Foco: método, relação
          com a comida, experiência emocional.
        </p>
        <p>
          <strong>Pra mudar copy ou paleta:</strong> edita o componente em{" "}
          <code>src/components/creatives/creative-*.tsx</code>. Você também tem o launcher
          automatizado em <Link href="/admin/campanhas/launch-plan" style={{ color: "var(--accent)" }}>/admin/campanhas/launch-plan</Link>{" "}
          que faz upload direto pro Meta sem precisar baixar PNG manualmente.
        </p>
      </PageHelp>

      {error && (
        <div
          style={{
            padding: 12,
            background: "rgba(196,120,122,0.1)",
            border: "0.5px solid rgba(196,120,122,0.4)",
            borderRadius: 10,
            color: "#C4787A",
            fontSize: 13,
            marginBottom: 18,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {CREATIVES.map((c) => {
          const Comp = c.Component as CreativeRef;
          const aspect = c.height / c.width;
          // Limita largura visivel; mantem proporcao
          const previewWidth = Math.min(520, c.width);
          const previewHeight = previewWidth * aspect;
          const scale = previewWidth / c.width;

          return (
            <div
              key={c.id}
              style={{
                background: "var(--bg-card)",
                border: "0.5px solid var(--border-default)",
                borderRadius: 14,
                padding: 24,
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                alignItems: "flex-start",
              }}
            >
              {/* Preview escalado */}
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: previewWidth,
                    height: previewHeight,
                    overflow: "hidden",
                    borderRadius: 10,
                    border: "0.5px solid var(--border-subtle)",
                    background: "#000",
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      width: c.width,
                      height: c.height,
                    }}
                  >
                    <Comp
                      ref={(el: HTMLDivElement | null) => {
                        refs.current[c.id] = el;
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Info + actions */}
              <div style={{ flex: 1, minWidth: 240, display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div
                    style={{
                      display: "inline-block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--accent)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: 6,
                    }}
                  >
                    {c.format} · {c.width}×{c.height}
                  </div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                    {c.label}
                  </h2>
                </div>
                <button
                  onClick={() => downloadCreative(c.id, c.width, c.height)}
                  disabled={downloadingId === c.id}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    background: downloadingId === c.id ? "var(--border-default)" : "var(--accent)",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: downloadingId === c.id ? "wait" : "pointer",
                    width: "fit-content",
                  }}
                >
                  {downloadingId === c.id ? "Gerando PNG..." : `↓ Baixar PNG (${c.width}×${c.height})`}
                </button>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Preview escalado em {Math.round(scale * 100)}%. PNG e exportado em
                  resolucao real ({c.width}×{c.height}).
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
