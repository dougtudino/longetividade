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

const PILLAR_COLOR: Record<string, string> = {
  s: "#7A9E7E", e: "#D4A94B", m: "#3D5A3E", promo: "#C4787A", geral: "#4A90D9",
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function fmtDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", weekday: "short" });
}

export default function CalendarPage() {
  const [calendar, setCalendar] = useState<Record<string, CalendarDay>>({});
  const [upcomingDates, setUpcomingDates] = useState<CommemorativeDate[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [totalDates, setTotalDates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ScheduledPost>>({});
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function reload() {
    const r = await fetch("/api/admin/social/calendar?days=30");
    const d = await r.json();
    setCalendar(d.calendar ?? {});
    setUpcomingDates(d.upcomingDates ?? []);
    setGaps(d.gaps ?? []);
    setTotalDates(d.totalDatesYear ?? 0);
    setLoading(false);
  }

  useEffect(() => { reload().catch(() => setLoading(false)); }, []);

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

  // Gera array de 30 dias a partir de hoje
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    days.push(d.toISOString().slice(0, 10));
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Link href="/admin/social-media" style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
          ← Social Media
        </Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "4px 0 6px 0" }}>
        🗓 Calendario Editorial
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 20px 0" }}>
        Proximos 30 dias: posts agendados + datas comemorativas + gaps pra preencher.
        {totalDates > 0 && ` · ${totalDates} datas comemorativas no ano.`}
      </p>

      <PageHelp
        pageId="social-calendar"
        agent={{ icon: "🌙", name: "Luna", role: "Content Calendar" }}
        title="Planejamento visual de conteudo"
        quickActions={[
          { label: "30 dias", description: "Visao dos proximos 30 dias com posts + datas" },
          { label: "Gaps", description: "Dias sem conteudo agendado (exceto domingos)" },
          { label: "Datas comemorativas", description: "Sugestoes de post pro nicho wellness" },
        ]}
      >
        <p>
          Luna planeja conteudo baseado em <strong>datas comemorativas</strong> relevantes pro nicho
          (Dia da Mulher, Outubro Rosa, Dia Mundial da Agua, etc.) + posts regulares dos pilares S.E.M.
          Gaps mostram dias sem post — preencha pra manter consistencia.
        </p>
      </PageHelp>

      {/* Stats rapido */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Posts agendados", value: Object.values(calendar).reduce((s, d) => s + d.posts.length, 0), color: "#6B9E6B" },
          { label: "Datas proximas", value: upcomingDates.length, color: "#D4A94B" },
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
                    <div key={i} style={{
                      fontSize: 8, fontWeight: 600, padding: "1px 4px", borderRadius: 4,
                      background: `${PILLAR_COLOR[p.pillar] ?? "#888"}20`,
                      color: PILLAR_COLOR[p.pillar] ?? "#888",
                      marginBottom: 1,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {p.title.slice(0, 20)}
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
