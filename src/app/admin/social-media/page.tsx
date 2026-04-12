"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";
import PostFeed from "@/components/social-templates/post-feed";
import PostStory from "@/components/social-templates/post-story";
import PostCarouselSlide, { parseContentToSlides } from "@/components/social-templates/post-carousel";
import { getTemplateForFormat } from "@/components/social-templates/registry";

type Post = {
  id: string;
  title: string;
  content: string;
  platform: string;
  format: string;
  pillar: string;
  hashtags: string | null;
  imageBriefing: string | null;
  status: string;
  reviewNote: string | null;
  scheduledAt: string | null;
  postedAt: string | null;
  createdAt: string;
};

const PILLAR_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  s: { bg: "rgba(122,158,126,0.2)", color: "#7A9E7E", label: "S · Nutricao" },
  e: { bg: "rgba(212,169,75,0.2)", color: "#D4A94B", label: "E · Emocional" },
  m: { bg: "rgba(61,90,62,0.2)", color: "#3D5A3E", label: "M · Movimento" },
  promo: { bg: "rgba(196,120,122,0.2)", color: "#C4787A", label: "Promo" },
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  draft: { bg: "rgba(160,160,160,0.2)", color: "#888" },
  review: { bg: "rgba(74,144,217,0.2)", color: "#4A90D9" },
  approved: { bg: "rgba(212,169,75,0.2)", color: "#D4A94B" },
  posted: { bg: "rgba(107,158,107,0.2)", color: "#6B9E6B" },
  rejected: { bg: "rgba(196,120,122,0.2)", color: "#C4787A" },
};

const PLATFORM_ICON: Record<string, string> = {
  instagram: "📸",
  facebook: "📘",
  stories: "📱",
  reels: "🎬",
  tiktok: "🎵",
};

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 18,
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", weekday: "short" });
}

export default function SocialMediaPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [seeding, setSeeding] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [downloading, setDownloading] = useState<string | null>(null);
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadPosts = useCallback(async () => {
    try {
      const url = filter === "all" ? "/api/admin/social" : `/api/admin/social?status=${filter}`;
      const res = await fetch(url);
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : { posts: [], counts: {} };
      setPosts(data.posts ?? []);
      setCounts(data.counts ?? {});
      if (data.warning) setError(data.warning);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  async function seedContent() {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/social/seed", { method: "POST" });
      const data = await res.json();
      if (!data.ok) setError(data.error);
      await loadPosts();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  async function downloadImage(post: Post) {
    const node = previewRefs.current[post.id];
    if (!node) return;
    setDownloading(post.id);
    try {
      const { toPng } = await import("html-to-image");
      const tmpl = getTemplateForFormat(post.format);
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 1, width: tmpl.width, height: tmpl.height });
      const link = document.createElement("a");
      link.download = `longetividade-${post.pillar}-${post.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch { /* silent */ }
    finally { setDownloading(null); }
  }

  async function updateStatus(postId: string, newStatus: string) {
    setUpdating(postId);
    try {
      await fetch("/api/admin/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, status: newStatus }),
      });
      await loadPosts();
    } catch {
      /* silent */
    } finally {
      setUpdating(null);
    }
  }

  const totalPosts = Object.values(counts).reduce((s, c) => s + c, 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
        <div style={{ fontSize: 36, lineHeight: 1 }}>🌙</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Agente AIOX · @social
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "4px 0 0 0" }}>
            Luna · Social Media
          </h1>
        </div>
      </div>
      <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0 20px 0" }}>
        Gestao de conteudo, calendario editorial, e fila de postagens pra Facebook e Instagram.
      </p>

      <PageHelp
        pageId="social-media"
        agent={{ icon: "🌙", name: "Luna", role: "Social Media Manager" }}
        title="Calendario editorial + fila de posts"
        quickActions={[
          { label: "Seed conteudo", description: "Popula 10 posts pre-escritos baseados nos pilares S.E.M" },
          { label: "Filtrar por status", description: "Draft / Em review / Aprovado / Postado" },
          { label: "Mudar status", description: "Avanca post no workflow: draft → review → approved → posted" },
        ]}
      >
        <p>
          Luna gera conteudo baseado nos <strong>4 pilares</strong>: S (Nutricao 2x/sem),
          E (Emocional 2x/sem), M (Movimento 1x/sem), Promo (1x/sem max).
          Regra 80/20: 80% valor, 20% venda. Cada post segue o workflow:
          <strong> draft → review (QA) → approved → posted</strong>.
        </p>
      </PageHelp>

      {error && (
        <div style={{ padding: 12, background: "rgba(196,120,122,0.1)", border: "0.5px solid rgba(196,120,122,0.3)", borderRadius: 10, color: "#C4787A", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Stats + Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { key: "draft", label: "Rascunho", icon: "📝" },
            { key: "review", label: "Em review", icon: "🔍" },
            { key: "approved", label: "Aprovado", icon: "✅" },
            { key: "posted", label: "Postado", icon: "📤" },
          ].map((s) => (
            <div key={s.key} style={{ ...card, padding: "10px 16px", textAlign: "center", minWidth: 90 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>{s.icon} {s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: STATUS_BADGE[s.key]?.color ?? "#888" }}>{counts[s.key] ?? 0}</div>
            </div>
          ))}
        </div>
        <button onClick={seedContent} disabled={seeding} style={{
          padding: "10px 18px", borderRadius: 10, background: "var(--accent)", color: "#fff",
          border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          {seeding ? "Populando..." : `🌙 Seed conteudo Luna (${totalPosts > 0 ? "adicionar" : "10 posts"})`}
        </button>
      </div>

      {/* View mode + Filtros + Calendar link */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setViewMode("list")} style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: viewMode === "list" ? "var(--accent)" : "var(--bg-secondary)",
            color: viewMode === "list" ? "#fff" : "var(--text-secondary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}>📋 Lista</button>
          <button onClick={() => setViewMode("grid")} style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: viewMode === "grid" ? "var(--accent)" : "var(--bg-secondary)",
            color: viewMode === "grid" ? "#fff" : "var(--text-secondary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}>📱 Grid Instagram</button>
        </div>
        <Link href="/admin/social-media/calendar" style={{
          padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)",
          color: "var(--text-primary)", border: "0.5px solid var(--border-default)",
          fontSize: 12, fontWeight: 600, textDecoration: "none",
        }}>🗓 Calendário →</Link>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "draft", "review", "approved", "posted"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: filter === f ? "var(--accent)" : "var(--bg-secondary)",
            color: filter === f ? "#fff" : "var(--text-secondary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}>
            {f === "all" ? "Todos" : f}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
      ) : posts.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌙</div>
          Nenhum post ainda. Clica <strong>"Seed conteudo Luna"</strong> pra popular 25 posts.
        </div>
      ) : viewMode === "grid" ? (
        /* ─── GRID VIEW (estilo Instagram) ─── */
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4,
            background: "var(--bg-card)", borderRadius: 12, overflow: "hidden",
            border: "0.5px solid var(--border-default)", padding: 4,
          }}>
            {posts.filter((p) => p.format !== "stories" && p.format !== "reels").slice(0, 12).map((p) => {
              const pillar = PILLAR_COLORS[p.pillar] ?? PILLAR_COLORS.s;
              return (
                <div
                  key={p.id}
                  onClick={() => { setViewMode("list"); setExpanded(p.id); }}
                  style={{
                    aspectRatio: "1", overflow: "hidden", borderRadius: 6, cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <div style={{
                    width: "100%", height: "100%", overflow: "hidden",
                  }}>
                    <div style={{
                      transform: "scale(0.185)", transformOrigin: "top left",
                      width: 1080, height: 1080,
                    }}>
                      <PostFeed
                        ref={(el: HTMLDivElement | null) => { previewRefs.current[p.id] = el; }}
                        title={p.title.replace(/ — \d{4}-\d{2}-\d{2}$/, "")}
                        body={p.content.split("\n")[0]}
                        pillar={p.pillar as "s" | "e" | "m" | "promo"}
                      />
                    </div>
                  </div>
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    padding: "20px 8px 6px", color: "#fff", fontSize: 9, fontWeight: 600,
                  }}>
                    {p.title.replace(/ — \d{4}-\d{2}-\d{2}$/, "").slice(0, 30)}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
            Preview do feed Instagram · Clique em qualquer post pra expandir
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((p) => {
            const pillar = PILLAR_COLORS[p.pillar] ?? PILLAR_COLORS.s;
            const statusBadge = STATUS_BADGE[p.status] ?? STATUS_BADGE.draft;
            const isExpanded = expanded === p.id;

            return (
              <div key={p.id} style={{ ...card, borderLeft: `3px solid ${pillar.color}` }}>
                <div
                  onClick={() => setExpanded(isExpanded ? null : p.id)}
                  style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 18 }}>{PLATFORM_ICON[p.platform] ?? "📱"}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{p.title}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: pillar.bg, color: pillar.color, fontWeight: 700 }}>{pillar.label}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: statusBadge.bg, color: statusBadge.color, fontWeight: 700, textTransform: "uppercase" }}>{p.status}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--bg-secondary)", color: "var(--text-muted)" }}>{p.format}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)" }}>
                    {p.scheduledAt ? `📅 ${fmtDate(p.scheduledAt)}` : "Sem data"}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "0.5px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 14 }}>
                      {p.content}
                    </div>
                    {p.hashtags && (
                      <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 10, lineHeight: 1.5 }}>
                        {p.hashtags}
                      </div>
                    )}
                    {/* Preview da arte */}
                    <div style={{ marginBottom: 14 }}>
                      {p.format === "carrossel" ? (
                        /* CARROSSEL: mostra todos os slides */
                        (() => {
                          const slides = parseContentToSlides(p.title, p.content);
                          return (
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                                📑 Carrossel: {slides.length} slides
                              </div>
                              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                                {slides.map((slide, si) => (
                                  <div key={si} style={{ flexShrink: 0 }}>
                                    <div style={{
                                      width: 160, height: 160, overflow: "hidden",
                                      borderRadius: 8, border: "0.5px solid var(--border-subtle)",
                                    }}>
                                      <div style={{
                                        transform: "scale(0.148)", transformOrigin: "top left",
                                        width: 1080, height: 1080,
                                      }}>
                                        <PostCarouselSlide
                                          ref={(el: HTMLDivElement | null) => {
                                            previewRefs.current[`${p.id}-slide-${si}`] = el;
                                          }}
                                          slides={slides}
                                          pillar={p.pillar as "s" | "e" | "m" | "promo"}
                                          slideIndex={si}
                                        />
                                      </div>
                                    </div>
                                    <div style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
                                      {si + 1}/{slides.length} · {slide.type}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        /* SINGLE: feed ou story */
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                          <div style={{
                            width: 200, height: p.format === "stories" || p.format === "reels" ? 355 : 200,
                            overflow: "hidden", borderRadius: 8, border: "0.5px solid var(--border-subtle)",
                            flexShrink: 0,
                          }}>
                            <div style={{
                              transform: `scale(${200 / 1080})`,
                              transformOrigin: "top left",
                              width: 1080,
                              height: p.format === "stories" || p.format === "reels" ? 1920 : 1080,
                            }}>
                              {p.format === "stories" || p.format === "reels" ? (
                                <PostStory
                                  ref={(el: HTMLDivElement | null) => { previewRefs.current[p.id] = el; }}
                                  title={p.title.replace(/ — \d{4}-\d{2}-\d{2}$/, "")}
                                  body={p.content.split("\n")[0]}
                                  pillar={p.pillar as "s" | "e" | "m" | "promo"}
                                />
                              ) : (
                                <PostFeed
                                  ref={(el: HTMLDivElement | null) => { previewRefs.current[p.id] = el; }}
                                  title={p.title.replace(/ — \d{4}-\d{2}-\d{2}$/, "")}
                                  body={p.content.split("\n")[0]}
                                  pillar={p.pillar as "s" | "e" | "m" | "promo"}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {p.imageBriefing && (
                        <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: 10, borderRadius: 8, lineHeight: 1.5 }}>
                          <strong>Briefing visual (Uma):</strong> {p.imageBriefing}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {p.status === "draft" && (
                        <button onClick={() => updateStatus(p.id, "review")} disabled={updating === p.id}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "#4A90D9", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          🔍 Enviar pra Review
                        </button>
                      )}
                      {p.status === "review" && (
                        <>
                          <button onClick={() => updateStatus(p.id, "approved")} disabled={updating === p.id}
                            style={{ padding: "6px 14px", borderRadius: 8, background: "#6B9E6B", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            ✅ Aprovar
                          </button>
                          <button onClick={() => updateStatus(p.id, "rejected")} disabled={updating === p.id}
                            style={{ padding: "6px 14px", borderRadius: 8, background: "#C4787A", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            ✗ Rejeitar
                          </button>
                        </>
                      )}
                      {p.status === "approved" && (
                        <button onClick={() => updateStatus(p.id, "posted")} disabled={updating === p.id}
                          style={{ padding: "6px 14px", borderRadius: 8, background: "#639922", color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          📤 Marcar como Postado
                        </button>
                      )}
                      <button
                        onClick={() => { navigator.clipboard.writeText(p.content + (p.hashtags ? "\n\n" + p.hashtags : "")); }}
                        style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "0.5px solid var(--border-default)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        📋 Copiar texto
                      </button>
                      <button
                        onClick={() => downloadImage(p)}
                        disabled={downloading === p.id}
                        style={{ padding: "6px 14px", borderRadius: 8, background: "var(--bg-secondary)", color: "var(--text-primary)", border: "0.5px solid var(--border-default)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {downloading === p.id ? "Gerando..." : "🖼 Baixar arte"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
