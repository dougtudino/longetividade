"use client";
import { PageHeader } from "@/components/admin/ui";

import { useCallback, useEffect, useRef, useState } from "react";

type Competitor = {
  id: string;
  username: string;
  category: string;
  followers: number;
  avgViews30d: number;
  active: boolean;
  _count?: { analyses: number };
};

type Analysis = {
  id: string;
  competitorId: string;
  competitor?: { username: string; followers: number };
  instagramUrl: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  datePosted: string;
  concept: string;
  hook: string;
  retention: string;
  reward: string;
  script: string;
  rawAnalysis: string;
  lunaConcepts: string;
  savedToKnowledge: boolean;
  starred: boolean;
  createdAt: string;
};

type Progress = {
  status: "running" | "completed" | "error";
  phase: "scraping" | "analyzing" | "done";
  log: string[];
  errors: string[];
  videosTotal: number;
  videosAnalyzed: number;
};

type Tab = "dashboard" | "run" | "analyses" | "competitors";

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 18,
};

const badgeGreen: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  background: "rgba(107,158,107,0.2)",
  color: "#6B9E6B",
};

function fmtInt(n: number): string {
  return (n || 0).toLocaleString("pt-BR");
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return iso;
  }
}

export default function VideoIntelligencePage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [analysesTotal, setAnalysesTotal] = useState(0);
  const [analysesPage, setAnalysesPage] = useState(1);
  const [analysesFilter, setAnalysesFilter] = useState<{ username: string; days: number }>({
    username: "",
    days: 0,
  });
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);

  // Run state
  const [selectedUsernames, setSelectedUsernames] = useState<Set<string>>(new Set());
  const [maxVideos, setMaxVideos] = useState(20);
  const [topK, setTopK] = useState(5);
  const [nDays, setNDays] = useState(14);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const logBoxRef = useRef<HTMLDivElement | null>(null);

  // Detail modal
  const [detail, setDetail] = useState<Analysis | null>(null);

  // New competitor form
  const [newUsername, setNewUsername] = useState("");
  const [addingCompetitor, setAddingCompetitor] = useState(false);

  const loadCompetitors = useCallback(async () => {
    setLoadingCompetitors(true);
    try {
      const res = await fetch("/api/admin/video-intelligence/competitors?includeInactive=1");
      const data = await res.json();
      if (data.ok) {
        setCompetitors(data.competitors);
        setSelectedUsernames(
          new Set(data.competitors.filter((c: Competitor) => c.active).map((c: Competitor) => c.username))
        );
      }
    } finally {
      setLoadingCompetitors(false);
    }
  }, []);

  const loadAnalyses = useCallback(async () => {
    setLoadingAnalyses(true);
    try {
      const params = new URLSearchParams({
        page: String(analysesPage),
        limit: "24",
      });
      if (analysesFilter.username) params.set("username", analysesFilter.username);
      if (analysesFilter.days > 0) params.set("days", String(analysesFilter.days));
      const res = await fetch(`/api/admin/video-intelligence/analyses?${params}`);
      const data = await res.json();
      if (data.ok) {
        setAnalyses(data.items);
        setAnalysesTotal(data.total);
      }
    } finally {
      setLoadingAnalyses(false);
    }
  }, [analysesPage, analysesFilter]);

  useEffect(() => {
    loadCompetitors();
    loadAnalyses();
  }, [loadCompetitors, loadAnalyses]);

  // Auto-scroll log box
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [progress?.log.length]);

  async function runPipeline() {
    if (running) return;
    setRunning(true);
    setProgress({
      status: "running",
      phase: "scraping",
      log: [],
      errors: [],
      videosTotal: 0,
      videosAnalyzed: 0,
    });

    try {
      const res = await fetch("/api/admin/video-intelligence/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: Array.from(selectedUsernames),
          maxVideos,
          topK,
          nDays,
        }),
      });

      if (!res.ok || !res.body) {
        setProgress((p) =>
          p ? { ...p, status: "error", errors: [...p.errors, `HTTP ${res.status}`] } : p
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const evt of events) {
          const lines = evt.split("\n");
          let eventName = "message";
          let data = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) eventName = line.slice(7).trim();
            else if (line.startsWith("data: ")) data += line.slice(6);
          }
          if (!data) continue;
          try {
            const parsed = JSON.parse(data);
            if (eventName === "progress") setProgress(parsed as Progress);
            else if (eventName === "error") {
              setProgress((p) =>
                p
                  ? { ...p, status: "error", errors: [...p.errors, (parsed as { message: string }).message] }
                  : p
              );
            }
          } catch {
            /* ignora linha malformada */
          }
        }
      }
      await loadAnalyses();
    } catch (e) {
      setProgress((p) =>
        p ? { ...p, status: "error", errors: [...p.errors, (e as Error).message] } : p
      );
    } finally {
      setRunning(false);
    }
  }

  async function toggleCompetitor(id: string, active: boolean) {
    await fetch("/api/admin/video-intelligence/competitors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    await loadCompetitors();
  }

  async function deleteCompetitor(id: string, username: string) {
    if (!confirm(`Excluir @${username}? Essa acao e permanente.`)) return;
    const res = await fetch(`/api/admin/video-intelligence/competitors?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error || "Erro ao excluir");
      return;
    }
    await loadCompetitors();
  }

  async function addCompetitor() {
    const username = newUsername.trim().replace(/^@/, "");
    if (!username) return;
    setAddingCompetitor(true);
    try {
      const res = await fetch("/api/admin/video-intelligence/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewUsername("");
        await loadCompetitors();
      } else {
        alert(data.error || "Erro ao adicionar");
      }
    } finally {
      setAddingCompetitor(false);
    }
  }

  async function toggleStar(analysis: Analysis) {
    await fetch(`/api/admin/video-intelligence/analyses/${analysis.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: !analysis.starred }),
    });
    await loadAnalyses();
  }

  function toggleUsername(u: string) {
    setSelectedUsernames((prev) => {
      const next = new Set(prev);
      if (next.has(u)) next.delete(u);
      else next.add(u);
      return next;
    });
  }

  // Dashboard computa métricas a partir de analyses carregadas
  const totalViews = analyses.reduce((s, a) => s + (a.views || 0), 0);
  const totalSavedToKnowledge = analyses.filter((a) => a.savedToKnowledge).length;
  const uniqueCompetitorsWithAnalysis = new Set(
    analyses.map((a) => a.competitor?.username).filter(Boolean)
  ).size;
  const avgViews = analyses.length > 0 ? Math.round(totalViews / analyses.length) : 0;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <PageHeader
        title="Video Intelligence"
        subtitle="Reels virais de concorrentes → análise Gemini (ou fallback Claude) → 3 conceitos Luna → knowledge base"
        icon="🎬"
        breadcrumb="Agente AIOX · @luna"
      />
      {/* badgeGreen kept for unused-var compat */}
      <span style={{ ...badgeGreen, display: "none" }}>Luna</span>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--border-default)",
          marginBottom: 20,
        }}
      >
        {([
          ["dashboard", "📊 Dashboard"],
          ["run", "▶️ Executar"],
          ["analyses", "📼 Análises"],
          ["competitors", "👥 Concorrentes"],
        ] as const).map(([key, label]) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--accent)" : "var(--text-secondary)",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* DASHBOARD */}
      {tab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            <MetricCard label="Vídeos analisados" value={fmtInt(analysesTotal)} />
            <MetricCard label="Salvos na Luna" value={fmtInt(totalSavedToKnowledge)} />
            <MetricCard label="Concorrentes c/ análise" value={fmtInt(uniqueCompetitorsWithAnalysis)} />
            <MetricCard label="Views médias" value={fmtInt(avgViews)} />
          </div>

          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "var(--text-primary)" }}>
              Top 10 mais virais
            </h3>
            {loadingAnalyses ? (
              <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
            ) : analyses.length === 0 ? (
              <div style={{ color: "var(--text-muted)", padding: 20 }}>
                Nenhuma análise ainda. Rode o pipeline na aba &ldquo;Executar&rdquo;.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: "var(--text-muted)", textAlign: "left" }}>
                      <th style={th}>Thumb</th>
                      <th style={th}>Concorrente</th>
                      <th style={th}>Views</th>
                      <th style={th}>Likes</th>
                      <th style={th}>Hook</th>
                      <th style={th}>Data</th>
                      <th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.slice(0, 10).map((a) => (
                      <tr
                        key={a.id}
                        style={{ borderTop: "0.5px solid var(--border-default)", cursor: "pointer" }}
                        onClick={() => setDetail(a)}
                      >
                        <td style={td}>
                          {a.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={a.thumbnail}
                              alt=""
                              style={{ width: 48, height: 64, objectFit: "cover", borderRadius: 4 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 48,
                                height: 64,
                                background: "var(--bg-card-hover)",
                                borderRadius: 4,
                              }}
                            />
                          )}
                        </td>
                        <td style={td}>@{a.competitor?.username ?? "?"}</td>
                        <td style={td}>{fmtInt(a.views)}</td>
                        <td style={td}>{fmtInt(a.likes)}</td>
                        <td style={{ ...td, maxWidth: 400 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {a.hook}
                          </div>
                        </td>
                        <td style={td}>{fmtDate(a.datePosted || a.createdAt)}</td>
                        <td style={td}>
                          {a.savedToKnowledge && <span style={badgeGreen}>✓ Luna</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RUN */}
      {tab === "run" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "var(--text-primary)" }}>
              Concorrentes a processar
            </h3>
            <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {competitors
                .filter((c) => c.active)
                .map((c) => (
                  <label
                    key={c.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsernames.has(c.username)}
                      onChange={() => toggleUsername(c.username)}
                    />
                    @{c.username}
                    <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 11 }}>
                      {c._count?.analyses ?? 0} análises
                    </span>
                  </label>
                ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <SliderField label={`Max vídeos por perfil: ${maxVideos}`} min={5} max={50} value={maxVideos} onChange={setMaxVideos} />
              <SliderField label={`Top K (mais virais por perfil): ${topK}`} min={1} max={10} value={topK} onChange={setTopK} />
              <SliderField label={`Janela de dias: ${nDays}`} min={7} max={30} value={nDays} onChange={setNDays} />
            </div>
            <button
              onClick={runPipeline}
              disabled={running || selectedUsernames.size === 0}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                background: running ? "var(--text-muted)" : "var(--accent)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: running ? "not-allowed" : "pointer",
              }}
            >
              {running ? "⏳ Processando..." : `▶️ Rodar pipeline (${selectedUsernames.size} perfis)`}
            </button>
          </div>

          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: "var(--text-primary)" }}>Log em tempo real</h3>
              {progress && (
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {progress.phase} · {progress.videosAnalyzed}/{progress.videosTotal}
                </div>
              )}
            </div>
            {progress && progress.videosTotal > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ height: 6, background: "var(--bg-card-hover)", borderRadius: 3, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.round((progress.videosAnalyzed / progress.videosTotal) * 100)}%`,
                      height: "100%",
                      background: "var(--accent)",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            )}
            <div
              ref={logBoxRef}
              style={{
                height: 320,
                overflowY: "auto",
                background: "#0b0f18",
                color: "#c5d1e0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11,
                padding: 10,
                borderRadius: 6,
                border: "1px solid var(--border-default)",
              }}
            >
              {!progress && <div style={{ color: "#6b7280" }}>Aguardando execução...</div>}
              {progress?.log.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {progress?.errors.map((e, i) => (
                <div key={`e${i}`} style={{ color: "#f87171" }}>{e}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ANALYSES */}
      {tab === "analyses" && (
        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={analysesFilter.username}
              onChange={(e) => {
                setAnalysesPage(1);
                setAnalysesFilter({ ...analysesFilter, username: e.target.value });
              }}
              style={selectStyle}
            >
              <option value="">Todos concorrentes</option>
              {competitors.map((c) => (
                <option key={c.id} value={c.username}>
                  @{c.username}
                </option>
              ))}
            </select>
            <select
              value={analysesFilter.days}
              onChange={(e) => {
                setAnalysesPage(1);
                setAnalysesFilter({ ...analysesFilter, days: Number(e.target.value) });
              }}
              style={selectStyle}
            >
              <option value="0">Todo período</option>
              <option value="7">Últimos 7 dias</option>
              <option value="14">Últimos 14 dias</option>
              <option value="30">Últimos 30 dias</option>
            </select>
            <div style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 13 }}>
              {fmtInt(analysesTotal)} análises
            </div>
          </div>

          {loadingAnalyses ? (
            <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}
            >
              {analyses.map((a) => (
                <AnalysisCard key={a.id} analysis={a} onOpen={() => setDetail(a)} onToggleStar={() => toggleStar(a)} />
              ))}
            </div>
          )}

          {analyses.length === 0 && !loadingAnalyses && (
            <div style={{ ...card, textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
              Nenhuma análise com esses filtros.
            </div>
          )}

          {/* Paginação */}
          {analysesTotal > 24 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              <button
                disabled={analysesPage === 1}
                onClick={() => setAnalysesPage((p) => Math.max(1, p - 1))}
                style={pagerBtn}
              >
                ◀
              </button>
              <span style={{ color: "var(--text-muted)", fontSize: 13, padding: "8px 12px" }}>
                pag {analysesPage} de {Math.ceil(analysesTotal / 24)}
              </span>
              <button
                disabled={analysesPage * 24 >= analysesTotal}
                onClick={() => setAnalysesPage((p) => p + 1)}
                style={pagerBtn}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      )}

      {/* COMPETITORS */}
      {tab === "competitors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "var(--text-primary)" }}>
              Adicionar concorrente
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="@username (sem @ tudo bem)"
                style={{ ...selectStyle, flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCompetitor();
                }}
              />
              <button
                onClick={addCompetitor}
                disabled={addingCompetitor || !newUsername.trim()}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: addingCompetitor ? "not-allowed" : "pointer",
                }}
              >
                {addingCompetitor ? "..." : "Adicionar"}
              </button>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "var(--text-primary)" }}>
              {competitors.length} concorrentes cadastrados
            </h3>
            {loadingCompetitors ? (
              <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", textAlign: "left" }}>
                    <th style={th}>Username</th>
                    <th style={th}>Análises</th>
                    <th style={th}>Status</th>
                    <th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c) => (
                    <tr key={c.id} style={{ borderTop: "0.5px solid var(--border-default)" }}>
                      <td style={td}>
                        <a
                          href={`https://www.instagram.com/${c.username}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--accent)" }}
                        >
                          @{c.username}
                        </a>
                      </td>
                      <td style={td}>{c._count?.analyses ?? 0}</td>
                      <td style={td}>
                        {c.active ? (
                          <span style={badgeGreen}>ativo</span>
                        ) : (
                          <span style={{ ...badgeGreen, background: "rgba(160,160,160,0.2)", color: "#888" }}>inativo</span>
                        )}
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => toggleCompetitor(c.id, !c.active)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: "transparent",
                              color: "var(--text-secondary)",
                              border: "1px solid var(--border-default)",
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            {c.active ? "desativar" : "ativar"}
                          </button>
                          <button
                            onClick={() => deleteCompetitor(c.id, c.username)}
                            disabled={(c._count?.analyses ?? 0) > 0}
                            title={(c._count?.analyses ?? 0) > 0 ? "tem analises — so da pra desativar" : "excluir permanentemente"}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              background: "transparent",
                              color: (c._count?.analyses ?? 0) > 0 ? "var(--text-tertiary, #999)" : "#c94545",
                              border: "1px solid " + ((c._count?.analyses ?? 0) > 0 ? "var(--border-default)" : "#c94545"),
                              fontSize: 12,
                              cursor: (c._count?.analyses ?? 0) > 0 ? "not-allowed" : "pointer",
                              opacity: (c._count?.analyses ?? 0) > 0 ? 0.5 : 1,
                            }}
                          >
                            excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detail && <DetailModal analysis={detail} onClose={() => setDetail(null)} onToggleStar={() => toggleStar(detail)} />}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>{value}</div>
    </div>
  );
}

function SliderField({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

function AnalysisCard({
  analysis,
  onOpen,
  onToggleStar,
}: {
  analysis: Analysis;
  onOpen: () => void;
  onToggleStar: () => void;
}) {
  return (
    <div style={{ ...card, padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={onOpen}>
      <div style={{ position: "relative", paddingBottom: "100%", background: "var(--bg-card-hover)" }}>
        {analysis.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={analysis.thumbnail}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "4px 8px",
            borderRadius: 999,
            background: analysis.starred ? "rgba(255,200,0,0.95)" : "rgba(0,0,0,0.5)",
            color: "#fff",
            border: "none",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ★
        </button>
        {analysis.savedToKnowledge && (
          <div style={{ position: "absolute", top: 8, left: 8, ...badgeGreen }}>✓ Luna</div>
        )}
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
          <span>@{analysis.competitor?.username ?? "?"}</span>
          <span>{fmtInt(analysis.views)} views</span>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 8,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {analysis.concept}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            fontStyle: "italic",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          “{analysis.hook}”
        </div>
      </div>
    </div>
  );
}

function DetailModal({
  analysis,
  onClose,
  onToggleStar,
}: {
  analysis: Analysis;
  onClose: () => void;
  onToggleStar: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 24,
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          borderRadius: 12,
          maxWidth: 900,
          width: "100%",
          padding: 24,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ×
        </button>

        <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 12, color: "var(--text-muted)" }}>
          <span>@{analysis.competitor?.username ?? "?"}</span>
          <span>·</span>
          <span>{fmtInt(analysis.views)} views</span>
          <span>·</span>
          <span>{fmtInt(analysis.likes)} likes</span>
          <span>·</span>
          <span>{fmtInt(analysis.comments)} comments</span>
          <span>·</span>
          <span>{fmtDate(analysis.datePosted)}</span>
          {analysis.savedToKnowledge && (
            <>
              <span>·</span>
              <span style={badgeGreen}>✓ Luna knowledge</span>
            </>
          )}
          <button
            onClick={onToggleStar}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: analysis.starred ? "#fbbf24" : "var(--text-muted)",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ★
          </button>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginTop: 0 }}>
          {analysis.concept || "Sem conceito"}
        </h2>

        <a
          href={analysis.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: "var(--accent)" }}
        >
          Abrir no Instagram ↗
        </a>

        <Section title="Hook (primeiros 3s)" content={analysis.hook} highlight />
        <Section title="Retenção" content={analysis.retention} />
        <Section title="Recompensa" content={analysis.reward} />
        <Section title="Roteiro" content={analysis.script} />
        <Section title="🌙 Conceitos Luna (adaptados pro Longetividade)" content={analysis.lunaConcepts} lunaBlock />
      </div>
    </div>
  );
}

function Section({
  title,
  content,
  highlight,
  lunaBlock,
}: {
  title: string;
  content: string;
  highlight?: boolean;
  lunaBlock?: boolean;
}) {
  if (!content?.trim()) return null;
  return (
    <div
      style={{
        marginTop: 16,
        padding: 14,
        background: lunaBlock
          ? "rgba(122,158,126,0.08)"
          : highlight
            ? "rgba(212,169,75,0.08)"
            : "var(--bg-card-hover)",
        borderRadius: 8,
        border: lunaBlock
          ? "0.5px solid rgba(122,158,126,0.3)"
          : "0.5px solid var(--border-default)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
        {content}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "8px 10px", fontSize: 11, fontWeight: 600 };
const td: React.CSSProperties = { padding: "10px", color: "var(--text-secondary)" };
const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-default)",
  fontSize: 13,
};
const pagerBtn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-default)",
  cursor: "pointer",
};
