"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LP_SLOTS, type LpAssetSlot } from "@/data/lp-asset-slots";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface LpAssetRow {
  id: string;
  lpSlug: string;
  key: string;
  imageUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
  updatedAt: string;
}

const LPS = Object.keys(LP_SLOTS);

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */
const card: React.CSSProperties = {
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  background: "var(--bg-card)",
  padding: 16,
};

const statCardStyle: React.CSSProperties = {
  border: "0.5px solid var(--border-default)",
  borderRadius: 10,
  background: "var(--bg-card)",
  padding: "14px 16px",
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export default function LpAssetsPage() {
  const [lpSlug, setLpSlug] = useState<string>(LPS[0] ?? "emagreca-sem-dieta");
  const [rows, setRows] = useState<LpAssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast((t) => (t?.msg === msg ? null : t)), 3500);
  }, []);

  const slots = useMemo(() => LP_SLOTS[lpSlug] ?? [], [lpSlug]);
  const assetMap = useMemo(() => {
    const map: Record<string, LpAssetRow> = {};
    for (const r of rows) map[r.key] = r;
    return map;
  }, [rows]);

  const stats = useMemo(() => {
    const custom = slots.filter((s) => assetMap[s.key]).length;
    return {
      total: slots.length,
      custom,
      fallback: slots.length - custom,
    };
  }, [slots, assetMap]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lp-assets?lpSlug=${encodeURIComponent(lpSlug)}`);
      if (!res.ok) throw new Error(`GET ${res.status}`);
      const data = await res.json();
      setRows(data.items ?? []);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [lpSlug, showToast]);

  useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

  async function handleUpload(slot: LpAssetSlot, file: File, position: string = "attention") {
    setBusyKey(slot.key);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "lp-assets");
      form.append("slug", `${lpSlug}-${slot.key.replace(/\./g, "-")}`);
      // Dimensões do slot → pipeline sharp aplica resize + crop cover pro aspect exato.
      form.append("targetWidth", String(slot.targetWidth));
      form.append("targetHeight", String(slot.targetHeight));
      // Posição do foco do crop (auto-attention ou uma das 9 posições fixas).
      form.append("position", position);
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: form });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error ?? "upload falhou");

      const putRes = await fetch("/api/admin/lp-assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lpSlug,
          key: slot.key,
          imageUrl: upData.url,
          alt: slot.label,
          width: upData.width,
          height: upData.height,
        }),
      });
      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        throw new Error(err.error ?? "falha ao salvar");
      }
      await fetchAssets();
      showToast("success", `${slot.label} atualizado`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "erro no upload");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleReset(slot: LpAssetSlot) {
    const row = assetMap[slot.key];
    if (!row) return;
    if (!confirm(`Reverter "${slot.label}" pro fallback estático?`)) return;
    setBusyKey(slot.key);
    try {
      const res = await fetch(`/api/admin/lp-assets?id=${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("falha ao deletar");
      await fetchAssets();
      showToast("success", `${slot.label} revertido`);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "erro");
    } finally {
      setBusyKey(null);
    }
  }

  const grouped = useMemo(() => {
    const g: Record<string, LpAssetSlot[]> = { hero: [], mockup: [], avatar: [] };
    for (const s of slots) g[s.group].push(s);
    return g;
  }, [slots]);

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      {/* Toast */}
      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 100,
            padding: "10px 16px",
            borderRadius: 10,
            background: toast.type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
            color: toast.type === "success" ? "#34d399" : "#f87171",
            fontSize: 13,
            fontWeight: 500,
            maxWidth: 360,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          {toast.type === "success" ? "✓ " : "⚠ "}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
            LP Assets — Imagens editáveis
          </h1>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "monospace" }}>/{lpSlug}</span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "6px 0 0 0", maxWidth: 700, lineHeight: 1.55 }}>
          Upload substitui a imagem exibida na LP pública. Cache atualiza em ~60s. Cada imagem é otimizada
          (WebP + resize) e hospedada no Cloudflare R2.
        </p>
      </header>

      {/* Controls + stats */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <select
          value={lpSlug}
          onChange={(e) => setLpSlug(e.target.value)}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: 13,
          }}
        >
          {LPS.map((s) => (
            <option key={s} value={s}>
              /{s}
            </option>
          ))}
        </select>
        <button
          onClick={() => void fetchAssets()}
          style={{
            padding: "7px 14px",
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ↻ Recarregar
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <Stat label="Total de slots" value={stats.total} />
        <Stat label="Customizados" value={stats.custom} tone={stats.custom > 0 ? "success" : undefined} hint="via admin" />
        <Stat label="Fallback" value={stats.fallback} hint="/public/images" />
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando…</p>
      ) : (
        (["hero", "mockup", "avatar"] as const).map((g) => {
          const items = grouped[g];
          if (!items.length) return null;
          return (
            <section key={g} style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 12,
                }}
              >
                {g === "hero" ? "Hero" : g === "mockup" ? "Mockups" : "Avatares (depoimentos)"}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                {items.map((slot) => (
                  <SlotCard
                    key={slot.key}
                    slot={slot}
                    row={assetMap[slot.key]}
                    busy={busyKey === slot.key}
                    onUpload={(f) => void handleUpload(slot, f)}
                    onReset={() => void handleReset(slot)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      {/* Help text fixo no fim */}
      <section style={{ marginTop: 40, paddingTop: 20, borderTop: "0.5px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Dicas
        </h3>
        <ul style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Slots com badge <strong style={{ color: "var(--accent-text)" }}>CUSTOM</strong> usam imagem do R2. Sem badge = fallback estático em <code style={{ fontFamily: "monospace" }}>/public/images/</code>.</li>
          <li>Reverter (↶) remove do DB mas NÃO apaga o arquivo em <code style={{ fontFamily: "monospace" }}>/public</code> — fallback continua funcionando.</li>
          <li>Upload máximo: 10MB. PNG, JPG, WebP. Conversão e resize são automáticos.</li>
          <li>Mudanças aparecem na LP pública em até 60s (cache Next).</li>
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat                                                               */
/* ------------------------------------------------------------------ */
function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "success" | "warn";
}) {
  const color = tone === "success" ? "#34d399" : tone === "warn" ? "#f87171" : "var(--text-primary)";
  return (
    <div style={statCardStyle}>
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.2, marginTop: 2 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: "var(--text-hint)" }}>{hint}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SlotCard                                                           */
/* ------------------------------------------------------------------ */
// As 9 posições de crop + Auto (attention). Cada ponto representa onde o foco
// do crop vai cair quando a imagem for redimensionada pro aspect target.
const CROP_POSITIONS: Array<{ value: string; label: string; coord: [number, number] }> = [
  { value: "left top", label: "Topo esquerda", coord: [0, 0] },
  { value: "top", label: "Topo centro", coord: [1, 0] },
  { value: "right top", label: "Topo direita", coord: [2, 0] },
  { value: "left", label: "Meio esquerda", coord: [0, 1] },
  { value: "centre", label: "Centro", coord: [1, 1] },
  { value: "right", label: "Meio direita", coord: [2, 1] },
  { value: "left bottom", label: "Base esquerda", coord: [0, 2] },
  { value: "bottom", label: "Base centro", coord: [1, 2] },
  { value: "right bottom", label: "Base direita", coord: [2, 2] },
];

function SlotCard({
  slot,
  row,
  busy,
  onUpload,
  onReset,
}: {
  slot: LpAssetSlot;
  row: LpAssetRow | undefined;
  busy: boolean;
  onUpload: (file: File, position?: string) => void;
  onReset: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [position, setPosition] = useState<string>("attention");
  const url = row?.imageUrl ?? slot.fallback;
  const isCustom = Boolean(row);

  return (
    <div style={{ ...card, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onUpload(f, position);
        }}
        style={{
          aspectRatio: slot.group === "avatar" ? "1/1" : slot.aspectHint?.startsWith("horizontal") ? "3/2" : "3/4",
          background: "var(--shimmer)",
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          border: dragOver ? "1.5px solid var(--accent)" : "0.5px solid var(--border-subtle)",
          transition: "border-color 0.15s",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={row?.alt ?? slot.label}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            fontSize: 9,
            padding: "3px 7px",
            borderRadius: 4,
            background: isCustom ? "var(--accent-soft)" : "rgba(0,0,0,0.45)",
            color: isCustom ? "var(--accent-text)" : "rgba(255,255,255,0.85)",
            fontWeight: 700,
            letterSpacing: "0.04em",
            backdropFilter: "blur(4px)",
          }}
        >
          {isCustom ? "CUSTOM" : "FALLBACK"}
        </span>
        {dragOver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-text)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            ⇣ Soltar pra upload
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
          {slot.label}
        </div>

        {/* Badge de tamanho ideal — destaque visual */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 5,
              background: "var(--accent-soft)",
              color: "var(--accent-text)",
              fontFamily: "monospace",
              letterSpacing: "0.02em",
            }}
            title="Tamanho ideal — suba nesse tamanho (ou maior) pra evitar qualquer crop"
          >
            📐 {slot.recommendedSize}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
            {slot.aspectHint}
          </span>
        </div>

        {/* Dica expansível — só aparece se tiver uploadGuide */}
        {slot.uploadGuide && (
          <details style={{ marginTop: 6 }}>
            <summary
              style={{
                cursor: "pointer",
                listStyle: "none",
                fontSize: 10,
                color: "var(--accent)",
                fontWeight: 600,
                userSelect: "none",
              }}
            >
              💡 Como deve ser a foto ideal
            </summary>
            <div
              style={{
                marginTop: 6,
                padding: "8px 10px",
                borderRadius: 6,
                background: "var(--shimmer)",
                border: "0.5px solid var(--border-subtle)",
                fontSize: 11,
                lineHeight: 1.55,
                color: "var(--text-secondary)",
              }}
            >
              {slot.uploadGuide}
              {slot.minSize && (
                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 6,
                    borderTop: "0.5px solid var(--border-subtle)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  <strong>Mínimo aceitável:</strong> {slot.minSize} · abaixo disso pode pixelar.
                </div>
              )}
            </div>
          </details>
        )}
      </div>

      {/* Position selector — mostra preview da imagem atual com overlay 3x3 clicável */}
      <CropPositionSelector
        value={position}
        onChange={setPosition}
        aspectRatio={
          slot.group === "avatar"
            ? "1/1"
            : slot.aspectHint?.startsWith("horizontal")
            ? "3/2"
            : "3/4"
        }
        imageUrl={url}
      />

      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => ref.current?.click()}
          disabled={busy}
          style={{
            flex: 1,
            padding: "7px 10px",
            borderRadius: 6,
            border: "1px solid var(--accent)",
            background: "var(--accent)",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            cursor: busy ? "wait" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Enviando…" : isCustom ? "Trocar foto" : "Escolher foto"}
        </button>
        {isCustom && (
          <button
            onClick={onReset}
            disabled={busy}
            title="Reverter pro fallback estático"
            style={{
              padding: "7px 11px",
              borderRadius: 6,
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 14,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            ↶
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f, position);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CropPositionSelector — 3×3 grid de foco + botão Auto               */
/* ------------------------------------------------------------------ */
function CropPositionSelector({
  value,
  onChange,
  aspectRatio,
  imageUrl,
}: {
  value: string;
  onChange: (v: string) => void;
  aspectRatio: string;
  imageUrl: string;
}) {
  const isAuto = value === "attention";

  // Mapeia a posição pro objectPosition CSS (simula o crop cover no preview)
  const cssObjectPosition: Record<string, string> = {
    "left top": "0% 0%",
    "top": "50% 0%",
    "right top": "100% 0%",
    "left": "0% 50%",
    "centre": "50% 50%",
    "right": "100% 50%",
    "left bottom": "0% 100%",
    "bottom": "50% 100%",
    "right bottom": "100% 100%",
    "attention": "50% 50%", // approx — sharp faz detection, aqui fica centro
    "entropy": "50% 50%",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          Foco do corte
        </span>
        <button
          type="button"
          onClick={() => onChange("attention")}
          title="Detecta rosto / área de interesse automaticamente"
          style={{
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 4,
            border: `1px solid ${isAuto ? "var(--accent)" : "var(--border-default)"}`,
            background: isAuto ? "var(--accent)" : "transparent",
            color: isAuto ? "white" : "var(--text-secondary)",
            fontWeight: 700,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          ✨ Auto
        </button>
      </div>

      {/* Mini-mapa com imagem real + grid 3x3 sobreposto */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio,
          maxHeight: 110,
          borderRadius: 6,
          overflow: "hidden",
          border: "1px solid var(--border-default)",
          background: "var(--shimmer)",
        }}
      >
        {/* Imagem real do slot como background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Preview do crop"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: cssObjectPosition[value] ?? "50% 50%",
            transition: "object-position 0.25s ease",
          }}
        />

        {/* Overlay escurecedor leve pra destacar os pontos */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        {/* Grid 3×3 sobreposto */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
          }}
        >
          {CROP_POSITIONS.map((p) => {
            const selected = value === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onChange(p.value)}
                title={p.label}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Círculo indicador */}
                <span
                  style={{
                    display: "block",
                    width: selected ? 18 : 10,
                    height: selected ? 18 : 10,
                    borderRadius: "50%",
                    background: selected ? "var(--accent)" : "rgba(255,255,255,0.55)",
                    border: selected
                      ? "2px solid white"
                      : "1.5px solid rgba(255,255,255,0.9)",
                    boxShadow: selected
                      ? "0 0 0 3px rgba(16,185,129,0.35), 0 2px 6px rgba(0,0,0,0.4)"
                      : "0 1px 3px rgba(0,0,0,0.3)",
                    transition: "all 0.15s",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          marginTop: 4,
          fontStyle: "italic",
        }}
      >
        {isAuto
          ? "✨ Auto: detecta rosto/área interessante"
          : `Foco: ${CROP_POSITIONS.find((p) => p.value === value)?.label ?? "centro"}`}
      </div>
    </div>
  );
}
