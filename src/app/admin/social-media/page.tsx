"use client";

import { useCallback, useEffect, useState } from "react";
import PageHelp from "@/components/admin/PageHelp";

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

      {/* Filtros */}
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
          Nenhum post ainda. Clica <strong>"Seed conteudo Luna"</strong> pra popular 10 posts pre-escritos.
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
                    {p.imageBriefing && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: 10, borderRadius: 8, marginBottom: 14, lineHeight: 1.5 }}>
                        <strong>Briefing visual (pra Uma):</strong> {p.imageBriefing}
                      </div>
                    )}
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
