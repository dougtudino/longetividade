"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SocialProofGallery } from "@/components/landing/social-proof-gallery";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SpItem {
  id: string;
  lpSlug: string;
  row: number;
  imageUrl: string;
  alt: string;
  name: string | null;
  caption: string | null;
  kind:
    | "photo"
    | "whatsapp"
    | "testimonial"
    | "lifestyle"
    | "transformation"
    | "progress-quote"
    | "women-gallery"
    | string;
  orderIndex: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Kinds drivam em qual bloco da LP o item aparece:
// - lifestyle/photo → bloco "Sem dieta. Na vida real." (LifestyleBlock)
// - whatsapp/testimonial → bloco "O que outras mulheres estão vivendo" (SocialProofBlock)
// - transformation → bloco "Mudanças reais. Sem extremos." (TransformationBlock)
// - progress-quote → 3 quotes da secao "Pequenas vitorias" (DetoxProgress)
// - women-gallery → galeria "Mulheres que cansaram de recomecar" (DetoxWomenGallery)
const KINDS: Array<{ value: SpItem["kind"]; label: string; emoji: string }> = [
  { value: "lifestyle", label: "Lifestyle (bloco 1)", emoji: "🌿" },
  { value: "whatsapp", label: "WhatsApp (bloco 2)", emoji: "💬" },
  { value: "testimonial", label: "Depoimento (bloco 2)", emoji: "⭐" },
  { value: "transformation", label: "Transformação (bloco 3)", emoji: "✨" },
  { value: "progress-quote", label: "Quote do Progresso (3 cards)", emoji: "💚" },
  { value: "women-gallery", label: "Galeria 'Mulheres que cansaram'", emoji: "👯" },
  { value: "photo", label: "Foto genérica (legado → bloco 1)", emoji: "📷" },
];

const LP_DEFAULT = "emagreca-sem-dieta";
const MIN_PER_ROW = 4;

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */
const card: React.CSSProperties = {
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  background: "var(--bg-card)",
  padding: 14,
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

const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 6,
  border: "1px solid var(--border-default)",
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  fontSize: 13,
};

const selectStyle: React.CSSProperties = { ...inputStyle };

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function SocialProofAdminPage() {
  const [lpSlug] = useState(LP_DEFAULT);
  const [items, setItems] = useState<SpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast((t) => (t?.msg === msg ? null : t)), 3500);
  }, []);

  const grouped = useMemo(() => {
    const g: Record<1 | 2 | 3, SpItem[]> = { 1: [], 2: [], 3: [] };
    for (const it of items) {
      if (it.row === 1 || it.row === 2 || it.row === 3) g[it.row as 1 | 2 | 3].push(it);
    }
    return g;
  }, [items]);

  const activeByRow = useMemo(() => {
    return {
      1: grouped[1].filter((i) => i.active).length,
      2: grouped[2].filter((i) => i.active).length,
      3: grouped[3].filter((i) => i.active).length,
    };
  }, [grouped]);

  const galleryVisible = activeByRow[1] >= MIN_PER_ROW && activeByRow[2] >= MIN_PER_ROW && activeByRow[3] >= MIN_PER_ROW;
  const totalActive = activeByRow[1] + activeByRow[2] + activeByRow[3];

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/social-proof?lpSlug=${encodeURIComponent(lpSlug)}`);
      if (!res.ok) throw new Error(`GET ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [lpSlug, showToast]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  async function createItem(data: Omit<SpItem, "id" | "createdAt" | "updatedAt" | "lpSlug">) {
    const res = await fetch("/api/admin/social-proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lpSlug, ...data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "falha ao criar");
    }
    await fetchItems();
    showToast("success", "Item adicionado à galeria");
  }

  async function patchItem(id: string, data: Partial<SpItem>) {
    const res = await fetch(`/api/admin/social-proof/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("falha ao atualizar");
    await fetchItems();
    showToast("success", "Atualizado");
  }

  async function deleteItem(id: string) {
    if (!confirm("Remover esse item permanentemente?")) return;
    const res = await fetch(`/api/admin/social-proof/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("falha ao deletar");
    await fetchItems();
    showToast("success", "Removido");
  }

  // Converte items ativos pro formato que o componente de galeria espera.
  const previewCards = useMemo(
    () =>
      items
        .filter((i) => i.active)
        .sort((a, b) => a.row - b.row || a.orderIndex - b.orderIndex)
        .map((i) => ({
          id: i.id,
          row: (i.row === 1 || i.row === 2 || i.row === 3 ? i.row : 1) as 1 | 2 | 3,
          imageUrl: i.imageUrl,
          alt: i.alt,
          caption: i.caption ?? undefined,
        })),
    [items]
  );

  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      {/* ─── Toast ───────────────────────────────────────── */}
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

      {/* ─── Header ──────────────────────────────────────── */}
      <header style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
            Galeria de Prova Social
          </h1>
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "monospace" }}>/{lpSlug}</span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "6px 0 0 0", maxWidth: 700, lineHeight: 1.55 }}>
          3 blocos independentes na LP pública, cada um consumindo uma linha específica do cadastro abaixo:
          <strong> Linha 1 = Lifestyle</strong>, <strong>Linha 2 = Transformação</strong>,
          <strong> Linha 3 = Prova social (WhatsApp)</strong>. Cada bloco aparece individualmente
          quando tiver <strong>{MIN_PER_ROW}+ itens ativos</strong> na sua linha. Imagens otimizadas em WebP e servidas via Cloudflare R2.
        </p>
      </header>

      {/* ─── Stats ───────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <Stat label="Status" value={galleryVisible ? "✓ Visível na LP" : "⏸ Oculta"} hint={galleryVisible ? "3 linhas OK" : "alguma linha < 4 itens"} tone={galleryVisible ? "success" : "warn"} />
        <Stat label="Total de itens" value={items.length} hint={`${totalActive} ativos`} />
        <Stat label="L1 · Lifestyle 🌿" value={activeByRow[1]} hint={`${MIN_PER_ROW}+ ideal`} tone={activeByRow[1] >= MIN_PER_ROW ? "success" : "warn"} />
        <Stat label="L2 · Transformação ✨" value={activeByRow[2]} hint={`${MIN_PER_ROW}+ ideal`} tone={activeByRow[2] >= MIN_PER_ROW ? "success" : "warn"} />
        <Stat label="L3 · Prova social 💬" value={activeByRow[3]} hint={`${MIN_PER_ROW}+ ideal`} tone={activeByRow[3] >= MIN_PER_ROW ? "success" : "warn"} />
      </div>

      {/* ─── Guia de conteúdo ─────────────────────────────── */}
      <ContentGuide />

      {/* ─── Form novo item ──────────────────────────────── */}
      <NewItemForm
        onCreate={async (data) => {
          try {
            await createItem(data);
          } catch (e) {
            showToast("error", e instanceof Error ? e.message : "erro");
          }
        }}
      />

      {/* ─── Listagem por linha ──────────────────────────── */}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando…</p>
      ) : items.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Galeria vazia</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Adicione {MIN_PER_ROW}+ itens em cada linha pro slot ficar visível na LP pública.
          </div>
        </div>
      ) : (
        ([1, 2, 3] as const).map((r) => (
          <section key={r} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: 0,
                }}
              >
                {r === 1 ? "Linha 1 · 🌿 Lifestyle" : r === 2 ? "Linha 2 · ✨ Transformação" : "Linha 3 · 💬 Prova social"}
              </h2>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {grouped[r].length} {grouped[r].length === 1 ? "item" : "itens"} ·{" "}
                {activeByRow[r]} ativo{activeByRow[r] === 1 ? "" : "s"}
              </span>
            </div>
            {grouped[r].length === 0 ? (
              <p style={{ color: "var(--text-hint)", fontSize: 13 }}>—</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
                {grouped[r].map((it) => (
                  <ItemCard
                    key={it.id}
                    item={it}
                    onPatch={async (d) => {
                      try {
                        await patchItem(it.id, d);
                      } catch (e) {
                        showToast("error", e instanceof Error ? e.message : "erro");
                      }
                    }}
                    onDelete={async () => {
                      try {
                        await deleteItem(it.id);
                      } catch (e) {
                        showToast("error", e instanceof Error ? e.message : "erro");
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        ))
      )}

      {/* ─── Preview ao vivo da galeria ──────────────────── */}
      {items.length > 0 && (
        <section
          style={{
            marginTop: 40,
            padding: "28px 0 0 0",
            borderTop: "0.5px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4, padding: "0 0" }}>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Preview ao vivo
            </h2>
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 999,
                background: galleryVisible ? "var(--accent-soft)" : "rgba(239,68,68,0.12)",
                color: galleryVisible ? "var(--accent-text)" : "#f87171",
                fontWeight: 600,
              }}
            >
              {galleryVisible ? "exibido na LP" : "oculto — faltam itens"}
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, margin: "0 0 16px 0" }}>
            Exatamente como aparece em <code style={{ fontFamily: "monospace" }}>/{lpSlug}</code>. Use o hover pra pausar cada linha.
          </p>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-primary)",
            }}
          >
            {galleryVisible ? (
              <SocialProofGallery items={previewCards} />
            ) : (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🧱</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Galeria ainda não completa</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Adicione {MIN_PER_ROW}+ itens ativos em cada linha pra o preview renderizar igual à LP.
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ContentGuide — sugestões de conteúdo pra galeria                   */
/* ------------------------------------------------------------------ */
// A LP renderiza os 3 blocos baseado na LINHA (row 1/2/3) — você controla 100%.
// O kind é metadata (não muda renderização). O que importa é em qual linha você cadastra.
const GUIDE_ROWS = [
  {
    num: 1,
    title: 'Linha 1 → Bloco "Sem dieta. Na vida real."',
    subtitle: "Lifestyle — logo abaixo do hero",
    emoji: "🌿",
    color: "rgba(212,169,75,0.12)",
    tone: "#d4a94b",
    kindLabel: "use linha 1 no form → vira Bloco Lifestyle",
    ideas: [
      "5-6 imagens da MESMA personagem (idealmente a Barbara) em cenas lifestyle",
      "Sem pressa, sem pressão — tomando café olhando pela janela",
      "Comer bem sem culpa — montando o prato",
      "Se olhar com leveza no espelho",
      "Rotina que cabe na vida — trabalhando/cuidando da casa",
      "Recomeçar sem começar do zero — caminhada leve",
    ],
    tip: "Tudo que você cadastrar na Linha 1 aparece nesse bloco. Captions curtas tipo 'Sem culpa no fim do dia.'",
  },
  {
    num: 2,
    title: 'Linha 2 → Bloco "Mudanças reais. Sem extremos."',
    subtitle: "Transformação — lifestyle, não academia pesada",
    emoji: "✨",
    color: "rgba(99,153,34,0.14)",
    tone: "#639922",
    kindLabel: "use linha 2 no form → vira Bloco Transformação",
    ideas: [
      "Aluna antes × agora (sutil, postura + expressão, não só corpo)",
      "Roupa que caiu melhor — foto com espelho",
      "Recomeço gradual — 3 momentos em sequência (semana 1/3/6)",
      "Rotina nova — antes comia na rua, agora prepara em casa",
      "Confiança recuperada — selfie expressão vs silhueta antiga",
      "Números sutis (medidas, manequim) em overlay discreto",
    ],
    tip: "⚠️ Evitar estética fitness/academia pesada. Foco em LEVEZA, não performance. Captions tipo '3 meses de método. Sem extremos.'",
  },
  {
    num: 3,
    title: 'Linha 3 → Bloco "O que outras mulheres estão vivendo"',
    subtitle: "Prova social — prints WhatsApp e depoimentos",
    emoji: "💬",
    color: "rgba(16,185,129,0.12)",
    tone: "#34d399",
    kindLabel: "use linha 3 no form → vira Bloco Prova Social",
    ideas: [
      "Print de conversa WhatsApp (aluna agradecendo)",
      "Screenshot de story do Instagram marcando você",
      "Print de DM com depoimento",
      "Print de avaliação 5★ do Hotmart",
      "Comentário em post no Instagram/Facebook",
      "Print de depoimento em grupo (com consentimento)",
    ],
    tip: "Sempre peça permissão. Em conversa privada, censure nome/número com preto. Use kind=whatsapp/testimonial só como metadata — o que define o bloco é a LINHA.",
  },
];

const GUIDE_COMPLIANCE = [
  "Sempre com autorização da aluna pra publicar",
  "Censure nomes/números em prints privados (retângulo preto)",
  "Nunca fabrique depoimento — só use conteúdo real",
  "Qualidade mínima: imagem nítida, 800px+ largura",
  "Aspecto ideal: 4:5 vertical (combina com o card da galeria)",
];

function ContentGuide() {
  return (
    <details style={{ marginBottom: 20 }}>
      <summary
        style={{
          ...card,
          padding: "14px 18px",
          cursor: "pointer",
          listStyle: "none",
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "border-color 0.15s",
        }}
      >
        <span style={{ fontSize: 18 }}>📋</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            Guia de conteúdo — o que produzir por linha
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Sugestões + compliance. Clique pra expandir.
          </div>
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>▾</span>
      </summary>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {GUIDE_ROWS.map((r) => (
          <div
            key={r.num}
            style={{
              border: "0.5px solid var(--border-default)",
              borderRadius: 10,
              padding: 14,
              background: "var(--bg-card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: r.color,
                  color: r.tone,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                {r.emoji} LINHA {r.num}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
              {r.title}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>{r.subtitle}</div>
            <ul
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                paddingLeft: 18,
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              {r.ideas.map((idea, i) => (
                <li key={i}>{idea}</li>
              ))}
            </ul>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 10,
                marginBottom: 0,
                padding: "6px 10px",
                background: "var(--shimmer)",
                borderRadius: 6,
                lineHeight: 1.5,
              }}
            >
              💡 {r.tip}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 14,
          border: "0.5px solid rgba(239,68,68,0.25)",
          background: "rgba(239,68,68,0.04)",
          borderRadius: 10,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          ⚠️ Compliance & qualidade
        </div>
        <ul style={{ fontSize: 12, color: "var(--text-secondary)", paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
          {GUIDE_COMPLIANCE.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          background: "var(--accent-soft)",
          borderRadius: 10,
          fontSize: 12,
          color: "var(--accent-text)",
          lineHeight: 1.6,
        }}
      >
        <strong>Meta ideal:</strong> 18 itens ativos (6 por linha). Mínimo pra galeria aparecer na LP: 4 por linha.
      </div>
    </details>
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
/*  NewItemForm (com drag-and-drop)                                    */
/* ------------------------------------------------------------------ */
function NewItemForm({
  onCreate,
}: {
  onCreate: (d: Omit<SpItem, "id" | "createdAt" | "updatedAt" | "lpSlug">) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [row, setRow] = useState<1 | 2 | 3>(1);
  const [kind, setKind] = useState<SpItem["kind"]>("photo");
  const [caption, setCaption] = useState("");
  const [name, setName] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(f: File | null) {
    setErr(null);
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit() {
    if (!file) return setErr("escolhe uma imagem primeiro");
    setBusy(true);
    setErr(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "social-proof");
      form.append("slug", `${kind}-row${row}`);
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: form });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error ?? "upload falhou");

      await onCreate({
        row,
        imageUrl: upData.url,
        alt: alt || `Prova social — linha ${row}`,
        name: name.trim() || null,
        caption: caption || null,
        kind,
        orderIndex: 0,
        active: true,
      });

      // reset
      handleFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setCaption("");
      setName("");
      setAlt("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ ...card, marginBottom: 24, padding: 18 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 14px 0" }}>
        + Adicionar novo item
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, alignItems: "start" }}>
        {/* Dropzone */}
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
            if (f) handleFile(f);
          }}
          onClick={() => fileRef.current?.click()}
          style={{
            aspectRatio: "4/5",
            border: `1.5px dashed ${dragOver ? "var(--accent)" : "var(--border-default)"}`,
            borderRadius: 10,
            background: dragOver ? "var(--accent-soft)" : "var(--shimmer)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  fontWeight: 600,
                }}
              >
                trocar
              </span>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 8 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Arraste ou clique</div>
              <div style={{ fontSize: 11, marginTop: 2 }}>PNG, JPG ou WebP · até 10MB</div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Campos */}
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Linha">
              <select value={row} onChange={(e) => setRow(Number(e.target.value) as 1 | 2 | 3)} style={selectStyle}>
                <option value={1}>Linha 1 — 🌿 Lifestyle (Bloco &quot;Sem dieta. Na vida real.&quot;)</option>
                <option value={2}>Linha 2 — ✨ Transformação (Bloco &quot;Mudanças reais. Sem extremos.&quot;)</option>
                <option value={3}>Linha 3 — 💬 Prova social (Bloco &quot;O que outras mulheres estão vivendo&quot;)</option>
              </select>
            </Field>
            <Field label="Tipo de conteúdo">
              <select value={kind} onChange={(e) => setKind(e.target.value)} style={selectStyle}>
                {KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.emoji} {k.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Nome (pra Quote do Progresso e Galeria de Mulheres)">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Camila R., Patricia M."
              style={inputStyle}
            />
          </Field>
          <Field label="Caption / depoimento (texto exibido)">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ex: Marcar o calendario virou meu momento do dia"
              style={inputStyle}
            />
          </Field>
          <Field label="Alt text — acessibilidade e SEO">
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Print do WhatsApp da Maria agradecendo..."
              style={inputStyle}
            />
          </Field>
          {err && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>⚠ {err}</p>}
          <button
            onClick={() => void submit()}
            disabled={busy || !file}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: busy || !file ? "var(--border-default)" : "var(--accent)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy || !file ? "not-allowed" : "pointer",
              alignSelf: "flex-start",
              minWidth: 180,
            }}
          >
            {busy ? "Enviando…" : file ? "Adicionar à galeria →" : "Escolha uma imagem"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ItemCard                                                            */
/* ------------------------------------------------------------------ */
function ItemCard({
  item,
  onPatch,
  onDelete,
}: {
  item: SpItem;
  onPatch: (d: Partial<SpItem>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [caption, setCaption] = useState(item.caption ?? "");
  const [name, setName] = useState(item.name ?? "");
  const [orderIndex, setOrderIndex] = useState(item.orderIndex);
  const dirty =
    (caption || "") !== (item.caption ?? "") ||
    (name || "") !== (item.name ?? "") ||
    orderIndex !== item.orderIndex;

  return (
    <div style={{ ...card, padding: 10, opacity: item.active ? 1 : 0.55, transition: "opacity 0.2s" }}>
      <div
        style={{
          aspectRatio: "4/5",
          background: "var(--shimmer)",
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            fontSize: 10,
            padding: "3px 7px",
            borderRadius: 4,
            background: "rgba(0,0,0,0.55)",
            color: "white",
            fontWeight: 600,
            backdropFilter: "blur(4px)",
          }}
        >
          {KINDS.find((k) => k.value === item.kind)?.emoji ?? "•"} L{item.row}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome (Camila R.)"
          style={{ ...inputStyle, fontSize: 12 }}
        />
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption / depoimento"
          style={{ ...inputStyle, fontSize: 12 }}
        />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Ordem:</label>
          <input
            type="number"
            value={orderIndex}
            onChange={(e) => setOrderIndex(Number(e.target.value))}
            style={{ ...inputStyle, width: 56, fontSize: 12, padding: "4px 8px" }}
          />
          <label
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={item.active}
              onChange={(e) => void onPatch({ active: e.target.checked })}
            />
            ativo
          </label>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() =>
              void onPatch({ caption: caption || null, name: name.trim() || null, orderIndex })
            }
            disabled={!dirty}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid var(--accent)",
              background: dirty ? "var(--accent)" : "transparent",
              color: dirty ? "white" : "var(--text-muted)",
              fontSize: 11,
              fontWeight: 600,
              cursor: dirty ? "pointer" : "not-allowed",
            }}
          >
            Salvar
          </button>
          <button
            onClick={() => void onDelete()}
            title="Remover"
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "#f87171",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Field                                                              */
/* ------------------------------------------------------------------ */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}
