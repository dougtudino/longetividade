"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";

type ScheduledPost = {
  id: string;
  title: string;
  platform: string;
  pillar: string;
  status: string;
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

  useEffect(() => {
    fetch("/api/admin/social/calendar?days=30")
      .then((r) => r.json())
      .then((d) => {
        setCalendar(d.calendar ?? {});
        setUpcomingDates(d.upcomingDates ?? []);
        setGaps(d.gaps ?? []);
        setTotalDates(d.totalDatesYear ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    minHeight: 60,
                    background: isToday ? "rgba(99,153,34,0.1)" : isSunday ? "var(--bg-secondary)" : "transparent",
                    border: isToday ? "2px solid #639922" : isGap ? "1.5px dashed #C4787A40" : "0.5px solid var(--border-subtle)",
                    position: "relative",
                  }}
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
    </div>
  );
}
