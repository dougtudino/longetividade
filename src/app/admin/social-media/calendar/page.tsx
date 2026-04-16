"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";

type ScheduledPost = {
  id: string;
  title: string;
  content: string;
  platform: string;
  pillar: string;
  status: string;
  format: string;
  hashtags: string | null;
  slot: string;
  scheduledAt: string;
};

type CommemorativeDate = {
  date: string;
  fullDate: string;
  name: string;
  pillar: string;
  postIdea: string;
  hashtags: string;
};

type CalendarDay = {
  posts: ScheduledPost[];
  commemorative: CommemorativeDate[];
};

type Totals = {
  total: number;
  draft: number;
  review: number;
  approved: number;
  posted: number;
  rejected: number;
  likes: number;
  reach: number;
  topPost: { id: string; title: string; likes: number } | null;
  postedRate: number;
};

const PILLAR_COLOR: Record<string, string> = {
  s: "#7A9E7E", e: "#D4A94B", m: "#3D5A3E", promo: "#C4787A", geral: "#4A90D9",
};

const STATUS_ICON: Record<string, string> = {
  posted: "✓",
  approved: "●",
  review: "◉",
  draft: "○",
  rejected: "✗",
};

const STATUS_COLOR: Record<string, string> = {
  posted: "#6B9E6B",
  approved: "var(--accent)",
  review: "#D4A94B",
  draft: "var(--text-muted)",
  rejected: "#C4787A",
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthOptions(): Array<{ value: string; label: string }> {
  const now = new Date();
  const opts: Array<{ value: string; label: string }> = [];
  // 6 meses anteriores + atual + 6 proximos
  for (let i = -6; i <= 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}${i === 0 ? " (atual)" : ""}`;
    opts.push({ value, label });
  }
  return opts;
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", weekday: "short" });
}

export default function CalendarPage() {
  const [calendar, setCalendar] = useState<Record<string, CalendarDay>>({});
  const [upcomingDates, setUpcomingDates] = useState<CommemorativeDate[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [totalDates, setTotalDates] = useState(0);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ScheduledPost>>({});
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const monthOptions = buildMonthOptions();

  async function reload() {
    setLoading(true);
    const r = await fetch(`/api/admin/social/calendar?month=${selectedMonth}`);
    const d = await r.json();
    setCalendar(d.calendar ?? {});
    setUpcomingDates(d.upcomingDates ?? []);
    setGaps(d.gaps ?? []);
    setTotalDates(d.totalDatesYear ?? 0);
    setTotals(d.totals ?? null);
    setLoading(false);
  }

  useEffect(() => { reload().catch(() => setLoading(false)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [selectedMonth]);

  function startEdit(p: ScheduledPost) {
    setEditingPostId(p.id);
    setEditDraft({
      title: p.title,
      content: p.content,
      status: p.status,
      scheduledAt: p.scheduledAt,
    });
  }

  async function saveEdit() {
    if (!editingPostId) return;
    setSaving(true);
    try {
      await fetch("/api/admin/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingPostId, ...editDraft }),
      });
      setEditingPostId(null);
      setEditDraft({});
      await reload();
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Apagar esse post? Um substituto será gerado automaticamente no mesmo slot.")) return;
    await fetch(`/api/admin/social?id=${id}&replace=1`, { method: "DELETE" });
    await reload();
  }

  async function fillDay() {
    setFilling(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/social/fill-gaps?days=30", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setMsg(data.created > 0 ? `✅ ${data.created} posts gerados nos slots vazios` : "Nenhum gap pra preencher");
      }
      await reload();
    } finally {
      setFilling(false);
    }
  }

  // Gera array de dias do mes selecionado (1 ate ultimo dia)
  const now = new Date();
  const [selYear, selMonth] = selectedMonth.split("-").map(Number);
  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const days: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${selYear}-${String(selMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push(dateStr);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Link href="/admin/social-media" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
          ← Social Media
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          🗓 Calendario Editorial
        </h1>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: "8px 14px", borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: "var(--bg-card)", color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)", cursor: "pointer",
          }}
        >
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px 0" }}>
        Posts planejados e executados do mes · datas comemorativas · gaps pra preencher.
        {totalDates > 0 && ` · ${totalDates} datas comemorativas no ano.`}
      </p>

      <PageHelp
        pageId="social-calendar"
        agent={{ icon: "🌙", name: "Luna", role: "Content Calendar" }}
        title="Planejamento visual de conteudo"
        quickActions={[
          { label: "Mes", description: "Navega entre meses passados e futuros pelo dropdown" },
          { label: "Executado", description: "Posts publicados aparecem com ✓ verde e metricas" },
          { label: "Gaps", description: "Dias sem conteudo agendado (exceto domingos)" },
        ]}
      >
        <p>
          Luna planeja conteudo baseado em <strong>datas comemorativas</strong> relevantes pro nicho
          (Dia da Mulher, Outubro Rosa, Dia Mundial da Agua, etc.) + posts regulares dos pilares S.E.M.
          Navegue por meses pra ver historico de publicacoes e metricas reais do Instagram/Facebook.
        </p>
      </PageHelp>

      {/* Totalizador do mes */}
      {totals && totals.total > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10, marginBottom: 20,
        }}>
          <div style={{ padding: "12px 16px", background: "var(--bg-card)", border: "0.5px solid var(--border-default)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{totals.total}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>posts do mês</div>
          </div>
          <div style={{ padding: "12px 16px", background: "var(--bg-card)", border: "0.5px solid var(--border-default)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Publicados</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#6B9E6B" }}>{totals.posted}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{totals.postedRate}% do total</div>
          </div>
          <div style={{ padding: "12px 16px", background: "var(--bg-card)", border: "0.5px solid var(--border-default)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Aprovados</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{totals.approved}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>na fila</div>
          </div>
          {totals.likes > 0 && (
            <div style={{ padding: "12px 16px", background: "var(--bg-card)", border: "0.5px solid var(--border-default)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Curtidas</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#D4A94B" }}>{totals.likes.toLocaleString("pt-BR")}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>total do mês</div>
            </div>
          )}
          {totals.reach > 0 && (
            <div style={{ padding: "12px 16px", background: "var(--bg-card)", border: "0.5px solid var(--border-default)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Alcance</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#4A90D9" }}>{totals.reach.toLocaleString("pt-BR")}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>pessoas alcançadas</div>
            </div>
          )}
          {totals.topPost && totals.topPost.likes > 0 && (
            <div style={{ padding: "12px 16px", background: "linear-gradient(135deg, rgba(212,169,75,0.1), rgba(212,169,75,0.02))", border: "0.5px solid rgba(212,169,75,0.3)", borderRadius: 10, gridColumn: "span 2" }}>
              <div style={{ fontSize: 10, color: "#D4A94B", textTransform: "uppercase", fontWeight: 700 }}>🏆 Top post</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginTop: 2, lineClamp: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{totals.topPost.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{totals.topPost.likes} curtidas</div>
            </div>
          )}
        </div>
      )}

      {/* Stats rapido (gaps/commem) */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Datas comem.", value: upcomingDates.length, color: "#D4A94B" },
          { label: "Dias sem post", value: gaps.length, color: "#C4787A" },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "12px 18px", background: "var(--bg-card)", border: "0.5px solid var(--border-default)",
            borderRadius: 10, minWidth: 140,
          }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Datas comemorativas proximas */}
      {upcomingDates.length > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(212,169,75,0.08), rgba(212,169,75,0.02))",
          border: "0.5px solid rgba(212,169,75,0.3)", borderRadius: 12, padding: 18, marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
            📅 Datas comemorativas proximas ({upcomingDates.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingDates.map((d, i) => (
              <div key={i} style={{
                padding: 12, background: "var(--bg-card)", borderRadius: 8,
                borderLeft: `3px solid ${PILLAR_COLOR[d.pillar] ?? "#888"}`,
                display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap",
              }}>
                <div style={{ minWidth: 80 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    {fmtDate(d.fullDate)}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 999,
                    background: `${PILLAR_COLOR[d.pillar] ?? "#888"}20`,
                    color: PILLAR_COLOR[d.pillar] ?? "#888",
                    textTransform: "uppercase",
                  }}>
                    {d.pillar}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
                    💡 {d.postIdea}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 4 }}>
                    {d.hashtags}
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(`${d.postIdea}\n\n${d.hashtags}`)}
                  style={{
                    padding: "5px 10px", borderRadius: 6, background: "var(--bg-secondary)",
                    color: "var(--text-muted)", border: "0.5px solid var(--border-default)",
                    fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  📋 Copiar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendario 30 dias */}
      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
      ) : (
        <div style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border-default)",
          borderRadius: 12, padding: 18,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
            📆 Proximos 30 dias
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {/* Header dias da semana */}
            {DAY_NAMES.map((d) => (
              <div key={d} style={{
                textAlign: "center", fontSize: 10, fontWeight: 700,
                color: "var(--text-muted)", textTransform: "uppercase", padding: 4,
              }}>
                {d}
              </div>
            ))}

            {/* Offset pra alinhar com dia da semana */}
            {Array.from({ length: new Date(days[0] + "T12:00:00").getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Dias */}
            {days.map((dateKey) => {
              const d = new Date(dateKey + "T12:00:00");
              const dayNum = d.getDate();
              const isToday = dateKey === now.toISOString().slice(0, 10);
              const isSunday = d.getDay() === 0;
              const dayData = calendar[dateKey];
              const hasPost = (dayData?.posts.length ?? 0) > 0;
              const hasDate = (dayData?.commemorative.length ?? 0) > 0;
              const isGap = gaps.includes(dateKey);

              return (
                <div
                  key={dateKey}
                  onClick={() => !isSunday && setSelectedDay(dateKey)}
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    minHeight: 60,
                    background: isToday ? "rgba(99,153,34,0.1)" : isSunday ? "var(--bg-secondary)" : "transparent",
                    border: isToday ? "2px solid #639922" : isGap ? "1.5px dashed #C4787A40" : "0.5px solid var(--border-subtle)",
                    position: "relative",
                    cursor: isSunday ? "default" : "pointer",
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!isSunday) (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
                >
                  <div style={{
                    fontSize: 12, fontWeight: isToday ? 800 : 600,
                    color: isToday ? "#639922" : isSunday ? "var(--text-muted)" : "var(--text-primary)",
                    marginBottom: 4,
                  }}>
                    {dayNum}
                  </div>

                  {hasDate && (
                    <div style={{
                      fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 4,
                      background: "#D4A94B20", color: "#D4A94B", marginBottom: 2,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      📅 {dayData!.commemorative[0].name}
                    </div>
                  )}

                  {hasPost && dayData!.posts.map((p, i) => (
                    <div key={i} title={`${p.status} · ${p.title}`} style={{
                      fontSize: 8, fontWeight: 600, padding: "1px 4px", borderRadius: 4,
                      background: `${PILLAR_COLOR[p.pillar] ?? "#888"}20`,
                      color: PILLAR_COLOR[p.pillar] ?? "#888",
                      marginBottom: 1,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      opacity: p.status === "draft" ? 0.55 : 1,
                      textDecoration: p.status === "rejected" ? "line-through" : "none",
                      display: "flex", alignItems: "center", gap: 3,
                    }}>
                      <span style={{ color: STATUS_COLOR[p.status] ?? "#888", fontSize: 9, fontWeight: 800 }}>
                        {STATUS_ICON[p.status] ?? "·"}
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {p.title.slice(0, 18)}
                      </span>
                    </div>
                  ))}

                  {isSunday && !hasPost && (
                    <div style={{ fontSize: 8, color: "var(--text-muted)" }}>OFF</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {msg && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, padding: "12px 18px",
          borderRadius: 10, background: msg.startsWith("✅") ? "#6B9E6B" : "var(--bg-card)",
          color: msg.startsWith("✅") ? "#fff" : "var(--text-primary)",
          fontSize: 13, fontWeight: 600, zIndex: 200, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>
          {msg}
          <button onClick={() => setMsg(null)} style={{ marginLeft: 10, background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {selectedDay && (() => {
        const dayData = calendar[selectedDay];
        const dayPosts = dayData?.posts ?? [];
        const dayCommem = dayData?.commemorative ?? [];
        const d = new Date(selectedDay + "T12:00:00");
        const dayLabel = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", weekday: "long" });

        return (
          <div
            onClick={() => { setSelectedDay(null); setEditingPostId(null); }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-primary)", borderRadius: 14, padding: 24,
                maxWidth: 700, width: "100%", maxHeight: "85vh", overflowY: "auto",
                border: "0.5px solid var(--border-default)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0, textTransform: "capitalize" }}>
                  🗓 {dayLabel}
                </h2>
                <button onClick={() => { setSelectedDay(null); setEditingPostId(null); }} style={{
                  background: "transparent", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)",
                }}>✕</button>
              </div>

              {dayCommem.length > 0 && (
                <div style={{
                  padding: 12, borderRadius: 8, background: "rgba(212,169,75,0.08)",
                  border: "0.5px solid rgba(212,169,75,0.3)", marginBottom: 14,
                }}>
                  {dayCommem.map((c, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>📅 {c.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>💡 {c.postIdea}</div>
                    </div>
                  ))}
                </div>
              )}

              {dayPosts.length === 0 ? (
                <div style={{
                  padding: 24, textAlign: "center", color: "var(--text-muted)",
                  border: "1.5px dashed var(--border-subtle)", borderRadius: 10, marginBottom: 14,
                }}>
                  <div style={{ fontSize: 13, marginBottom: 12 }}>Nenhum post agendado nesse dia.</div>
                  <button onClick={fillDay} disabled={filling} style={{
                    padding: "10px 18px", borderRadius: 10, background: "var(--accent)", color: "#fff",
                    border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>
                    {filling ? "Gerando..." : "✨ Preencher gaps dos próximos 30 dias"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {dayPosts.map((p) => {
                    const isEditing = editingPostId === p.id;
                    const pillarColor = PILLAR_COLOR[p.pillar] ?? "#888";
                    const hour = new Date(p.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={p.id} style={{
                        padding: 14, borderRadius: 10, border: `0.5px solid var(--border-default)`,
                        borderLeft: `3px solid ${pillarColor}`, background: "var(--bg-card)",
                      }}>
                        {!isEditing ? (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{p.title}</div>
                                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: `${pillarColor}20`, color: pillarColor, fontWeight: 700 }}>{p.pillar}</span>
                                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--bg-secondary)", color: "var(--text-muted)" }}>{p.slot} · {p.format}</span>
                                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--bg-secondary)", color: "var(--text-muted)" }}>⏰ {hour}</span>
                                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: p.status === "approved" ? "rgba(107,158,107,0.2)" : p.status === "posted" ? "rgba(99,153,34,0.2)" : "var(--bg-secondary)", color: "var(--text-primary)", fontWeight: 700, textTransform: "uppercase" }}>{p.status}</span>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => startEdit(p)} style={{
                                  padding: "6px 12px", borderRadius: 6, background: "var(--bg-secondary)",
                                  border: "0.5px solid var(--border-default)", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "var(--text-primary)",
                                }}>Editar</button>
                                <button onClick={() => deletePost(p.id)} style={{
                                  padding: "6px 12px", borderRadius: 6, background: "transparent",
                                  border: "0.5px solid rgba(196,120,122,0.4)", fontSize: 11, fontWeight: 600, cursor: "pointer", color: "#C4787A",
                                }}>Apagar</button>
                              </div>
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: 120, overflow: "hidden" }}>
                              {p.content.slice(0, 240)}{p.content.length > 240 ? "..." : ""}
                            </div>
                          </>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <input
                              value={editDraft.title ?? ""}
                              onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                              placeholder="Título"
                              style={{ padding: 10, borderRadius: 8, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13, fontWeight: 600 }}
                            />
                            <textarea
                              value={editDraft.content ?? ""}
                              onChange={(e) => setEditDraft({ ...editDraft, content: e.target.value })}
                              placeholder="Conteúdo"
                              rows={6}
                              style={{ padding: 10, borderRadius: 8, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 12, lineHeight: 1.6, resize: "vertical", fontFamily: "inherit" }}
                            />
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <label style={{ fontSize: 11, color: "var(--text-muted)" }}>Horário:</label>
                              <input
                                type="datetime-local"
                                value={editDraft.scheduledAt ? new Date(editDraft.scheduledAt).toISOString().slice(0, 16) : ""}
                                onChange={(e) => setEditDraft({ ...editDraft, scheduledAt: new Date(e.target.value).toISOString() })}
                                style={{ padding: 8, borderRadius: 6, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 12 }}
                              />
                              <select
                                value={editDraft.status ?? "draft"}
                                onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value })}
                                style={{ padding: 8, borderRadius: 6, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 12 }}
                              >
                                <option value="draft">draft</option>
                                <option value="review">review</option>
                                <option value="approved">approved</option>
                                <option value="posted">posted</option>
                                <option value="rejected">rejected</option>
                              </select>
                            </div>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button onClick={() => { setEditingPostId(null); setEditDraft({}); }} style={{
                                padding: "8px 14px", borderRadius: 6, background: "transparent",
                                border: "0.5px solid var(--border-default)", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--text-muted)",
                              }}>Cancelar</button>
                              <button onClick={saveEdit} disabled={saving} style={{
                                padding: "8px 14px", borderRadius: 6, background: "#6B9E6B", color: "#fff",
                                border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
                              }}>{saving ? "Salvando..." : "Salvar"}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
