"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";
import { CREATIVES_REGISTRY } from "@/components/creatives/registry";

type CollectionSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  creativesCount: number;
  createdAt: string;
};

type CreativeItem = {
  id: string;
  slug: string;
  componentKey: string;
  name: string;
  format: string;
  width: number;
  height: number;
  description: string | null;
  tags: string[];
  metaImageHash: string | null;
  createdAt: string;
};

type CollectionDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  creatives: CreativeItem[];
};

export default function CriativosPage() {
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<CollectionDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  // Download / creation UI state
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // New collection modal
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [newForm, setNewForm] = useState({ slug: "", name: "", description: "", icon: "✨" });

  const loadCollections = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/creatives/collections");
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { collections: [] };
      setCollections(data.collections ?? []);
      if (data.warning) {
        setError(data.warning);
        if (data.warning.includes("does not exist") || data.warning.includes("nao existe")) {
          setNeedsMigration(true);
        }
      } else {
        setNeedsMigration(false);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  async function runMigration() {
    setMigrating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/migrate/schema", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setNeedsMigration(false);
        await loadCollections();
      } else {
        const failed = (data.results ?? [])
          .filter((r: { ok: boolean }) => !r.ok)
          .map((r: { label: string; error?: string }) => `${r.label}: ${r.error}`)
          .join(" · ");
        setError(`Migration falhou: ${failed || "erro desconhecido"}`);
      }
    } catch (e) {
      setError(`Migration falhou: ${(e as Error).message}`);
    } finally {
      setMigrating(false);
    }
  }

  const loadCollectionDetail = useCallback(async (slug: string) => {
    setLoadingDetail(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/creatives/collections/${slug}`);
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { ok: false, error: "Vazio" };
      if (data.ok) {
        setSelectedCollection(data.collection);
      } else {
        setError(data.error ?? "Falha ao carregar");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    if (selectedSlug) {
      loadCollectionDetail(selectedSlug);
    } else {
      setSelectedCollection(null);
    }
  }, [selectedSlug, loadCollectionDetail]);

  async function seedInitial() {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/creatives/seed", { method: "POST" });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { ok: false, error: "Vazio" };
      if (data.ok === false && data.error) {
        setError(data.error);
      }
      await loadCollections();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  async function createCollection(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.slug || !newForm.name) return;
    try {
      const res = await fetch("/api/admin/creatives/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });
      const data = await res.json();
      if (data.ok) {
        setCreatingCollection(false);
        setNewForm({ slug: "", name: "", description: "", icon: "✨" });
        await loadCollections();
      } else {
        setError(data.error ?? "Falha ao criar");
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function downloadCreative(creative: CreativeItem) {
    const node = refs.current[creative.slug];
    if (!node) {
      setError(`Nao encontrei o criativo ${creative.slug}`);
      return;
    }
    setDownloadingId(creative.slug);
    setError(null);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 1,
        width: creative.width,
        height: creative.height,
      });
      const link = document.createElement("a");
      link.download = `longetividade-${selectedCollection?.slug}-${creative.slug}-${creative.width}x${creative.height}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      setError(`Erro: ${(e as Error).message}`);
    } finally {
      setDownloadingId(null);
    }
  }

  async function downloadAll() {
    if (!selectedCollection) return;
    for (const c of selectedCollection.creatives) {
      await downloadCreative(c);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  const btnPrimary: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: 10,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  };

  const btnSecondary: React.CSSProperties = {
    padding: "10px 20px",
    borderRadius: 10,
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    border: "0.5px solid var(--border-default)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };

  // ─── HEADER ────────────────────────────────────────
  const header = (
    <>
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
          Criativos — Galeria
        </h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {selectedSlug && (
            <button
              onClick={() => setSelectedSlug(null)}
              style={btnSecondary}
            >
              ← Todas as coleções
            </button>
          )}
          {!selectedSlug && (
            <>
              <button
                onClick={() => setCreatingCollection(true)}
                style={btnSecondary}
              >
                + Nova coleção
              </button>
              <button onClick={seedInitial} disabled={seeding} style={btnPrimary}>
                {seeding ? "Populando..." : "↓ Seed inicial (LAUNCH-001)"}
              </button>
            </>
          )}
          {selectedSlug && selectedCollection && selectedCollection.creatives.length > 0 && (
            <button onClick={downloadAll} disabled={!!downloadingId} style={btnPrimary}>
              {downloadingId ? "Baixando..." : "↓ Baixar todos"}
            </button>
          )}
        </div>
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          margin: "0 0 24px 0",
          lineHeight: 1.5,
        }}
      >
        Galeria de criativos organizados em coleções. Cada nova campanha vira uma coleção —
        assim a galeria cresce sem perder histórico. Os PNGs são renderizados em tempo real
        a partir dos componentes React (pixel-perfect).
      </p>

      <PageHelp
        pageId="criativos"
        agent={{ icon: "🎨", name: "Uma", role: "UX Designer / Criativos" }}
        title="Galeria de criativos por coleção"
        quickActions={[
          { label: "Seed inicial", description: "Popula a coleção LAUNCH-001 com os 6 criativos atuais (idempotente)" },
          { label: "Nova coleção", description: "Cria uma pasta nova vazia — criativos são adicionados via seed ou API" },
          { label: "Abrir coleção", description: "Click num card → preview + download dos criativos daquela coleção" },
          { label: "Baixar individual / todos", description: "Gera PNG via html-to-image em resolução nativa e faz download" },
        ]}
      >
        <p>
          Quando você precisar de criativos novos, eu (Claude) crio os componentes em{" "}
          <code>src/components/creatives/</code>, registro em <code>registry.ts</code>,
          e cadastro na coleção certa via API. A galeria cresce sozinha.
        </p>
        <p>
          <strong>Fluxo recomendado:</strong> cada campanha Meta tem sua coleção própria
          (LAUNCH-001, LAUNCH-002, etc). Isso facilita rastrear qual criativo foi usado
          em qual campanha e comparar performance.
        </p>
      </PageHelp>

      {error && (
        <div
          style={{
            padding: 12,
            background: "rgba(196,120,122,0.1)",
            border: "0.5px solid rgba(196,120,122,0.3)",
            borderRadius: 10,
            color: "#C4787A",
            fontSize: 13,
            marginBottom: 18,
          }}
        >
          <div style={{ marginBottom: needsMigration ? 10 : 0 }}>{error}</div>
          {needsMigration && (
            <button
              onClick={runMigration}
              disabled={migrating}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "#C4787A",
                color: "#fff",
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                cursor: migrating ? "wait" : "pointer",
                opacity: migrating ? 0.6 : 1,
              }}
            >
              {migrating ? "Aplicando schema..." : "⚡ Aplicar schema agora"}
            </button>
          )}
        </div>
      )}
    </>
  );

  // ─── MODE 1: LISTA DE COLEÇÕES ─────────────────────
  if (!selectedSlug) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {header}

        {loadingList && (
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Carregando coleções...</div>
        )}

        {!loadingList && collections.length === 0 && !error && (
          <div
            style={{
              padding: 32,
              background: "var(--bg-card)",
              border: "0.5px dashed var(--border-default)",
              borderRadius: 14,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>📁</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              Nenhuma coleção ainda
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              Clica <strong>Seed inicial</strong> para popular a coleção LAUNCH-001 com os 6 criativos atuais.
            </div>
            <button onClick={seedInitial} disabled={seeding} style={btnPrimary}>
              {seeding ? "Populando..." : "Seed inicial"}
            </button>
          </div>
        )}

        {collections.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {collections.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSelectedSlug(c.slug)}
                style={{
                  textAlign: "left",
                  padding: 20,
                  background: "var(--bg-card)",
                  border: "0.5px solid var(--border-default)",
                  borderRadius: 14,
                  cursor: "pointer",
                  transition: "transform 0.15s, border-color 0.15s",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 32, lineHeight: 1 }}>{c.icon ?? "📁"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      <code>{c.slug}</code>
                    </div>
                  </div>
                </div>
                {c.description && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: "0 0 12px 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {c.description.length > 140 ? c.description.slice(0, 140) + "..." : c.description}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 10,
                    borderTop: "0.5px solid var(--border-subtle)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--accent)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {c.creativesCount} criativo{c.creativesCount === 1 ? "" : "s"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Nova coleção modal */}
        {creatingCollection && (
          <>
            <div
              onClick={() => setCreatingCollection(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 100,
              }}
            />
            <form
              onSubmit={createCollection}
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "var(--bg-card)",
                border: "0.5px solid var(--border-default)",
                borderRadius: 14,
                padding: 28,
                width: "min(480px, 92vw)",
                zIndex: 101,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Nova coleção
              </h2>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Slug (URL-friendly)
                </label>
                <input
                  value={newForm.slug}
                  onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                  placeholder="launch-002-retarget"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "0.5px solid var(--border-default)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    fontFamily: "monospace",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Nome
                </label>
                <input
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="LAUNCH-002 · Retargeting"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "0.5px solid var(--border-default)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Ícone (emoji)
                </label>
                <input
                  value={newForm.icon}
                  onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
                  placeholder="✨"
                  style={{
                    width: 80,
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "0.5px solid var(--border-default)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: 18,
                    textAlign: "center",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  Descrição
                </label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "0.5px solid var(--border-default)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setCreatingCollection(false)}
                  style={btnSecondary}
                >
                  Cancelar
                </button>
                <button type="submit" style={btnPrimary}>
                  Criar coleção
                </button>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                Criativos são adicionados via seed ou API após criar a coleção.
              </div>
            </form>
          </>
        )}
      </div>
    );
  }

  // ─── MODE 2: DETALHE DE COLEÇÃO ────────────────────
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {header}

      {loadingDetail && (
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Carregando coleção...</div>
      )}

      {selectedCollection && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 32, lineHeight: 1 }}>{selectedCollection.icon ?? "📁"}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
                  {selectedCollection.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <code>{selectedCollection.slug}</code> · {selectedCollection.creatives.length}{" "}
                  criativo{selectedCollection.creatives.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            {selectedCollection.description && (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                {selectedCollection.description}
              </p>
            )}
          </div>

          {selectedCollection.creatives.length === 0 ? (
            <div
              style={{
                padding: 32,
                background: "var(--bg-card)",
                border: "0.5px dashed var(--border-default)",
                borderRadius: 14,
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              Coleção vazia. Criativos são adicionados via seed ou API.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {selectedCollection.creatives.map((c) => {
                const registryEntry = CREATIVES_REGISTRY[c.componentKey];
                if (!registryEntry) {
                  return (
                    <div
                      key={c.id}
                      style={{
                        padding: 16,
                        background: "rgba(196,120,122,0.1)",
                        border: "0.5px solid rgba(196,120,122,0.3)",
                        borderRadius: 10,
                        color: "#C4787A",
                        fontSize: 13,
                      }}
                    >
                      ⚠ Componente <code>{c.componentKey}</code> não encontrado no registry.
                      Verifica <code>src/components/creatives/registry.ts</code>.
                    </div>
                  );
                }

                const Comp = registryEntry.Component as React.ForwardRefExoticComponent<
                  React.RefAttributes<HTMLDivElement>
                >;
                const aspect = c.height / c.width;
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
                              refs.current[c.slug] = el;
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 240,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "inline-block",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--accent)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 6,
                          }}
                        >
                          {c.format} · {c.width}×{c.height}
                        </div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                          }}
                        >
                          {c.name}
                        </h2>
                      </div>

                      {c.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--text-secondary)",
                            margin: 0,
                            lineHeight: 1.6,
                          }}
                        >
                          {c.description}
                        </p>
                      )}

                      {c.tags.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {c.tags.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: 10,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: "var(--bg-secondary)",
                                color: "var(--text-muted)",
                                fontWeight: 600,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => downloadCreative(c)}
                        disabled={downloadingId === c.slug}
                        style={{
                          ...btnPrimary,
                          padding: "8px 16px",
                          fontSize: 13,
                          width: "fit-content",
                        }}
                      >
                        {downloadingId === c.slug ? "Gerando..." : `↓ Baixar PNG`}
                      </button>

                      {c.metaImageHash && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Meta hash: <code>{c.metaImageHash}</code>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
