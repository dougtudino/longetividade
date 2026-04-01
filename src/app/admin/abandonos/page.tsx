"use client";

import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface AbandonedCheckout {
  id: string;
  email: string;
  plan: string | null;
  step: string;
  createdAt: string;
}

interface Stats {
  totalOrders: number;
  abandonedTotal: number;
  abandonedToday: number;
  conversionRate: number;
}

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */
const cardStyle: React.CSSProperties = {
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 20,
  background: "var(--bg-card)",
};

const kpiNumber: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "var(--text-primary)",
  lineHeight: 1.2,
};

const kpiLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
  letterSpacing: "0.04em",
  marginTop: 4,
};

const PER_PAGE = 10;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${min}`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AbandonosPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [abandoned, setAbandoned] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => {
        if (!r.ok) throw new Error("Stats API error");
        return r.json();
      }),
      fetch("/api/admin/abandoned").then((r) => {
        if (!r.ok) throw new Error("Abandoned API error");
        return r.json();
      }),
    ])
      .then(([s, a]) => {
        setStats(s);
        setAbandoned(a.abandoned ?? a ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ---- KPI: abandonos semana ---- */
  const weekCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86_400_000;
    return abandoned.filter((a) => new Date(a.createdAt).getTime() >= weekAgo)
      .length;
  }, [abandoned]);

  /* ---- KPI: taxa de abandono ---- */
  const abandonRate =
    stats && stats.abandonedTotal + stats.totalOrders > 0
      ? (
          (stats.abandonedTotal /
            (stats.abandonedTotal + stats.totalOrders)) *
          100
        ).toFixed(1)
      : "0.0";

  /* ---- Donut values ---- */
  const convPct = stats ? stats.conversionRate : 0;
  const abandPct = 100 - convPct;
  const totalCount = stats ? stats.totalOrders + stats.abandonedTotal : 0;

  // SVG donut math (radius 70, circumference ~440)
  const R = 70;
  const C = 2 * Math.PI * R;
  const convArc = (convPct / 100) * C;

  /* ---- Hourly distribution ---- */
  const hourlyData = useMemo(() => {
    const hours = new Array(24).fill(0) as number[];
    for (const a of abandoned) {
      hours[new Date(a.createdAt).getHours()]++;
    }
    return hours;
  }, [abandoned]);

  const maxHourly = Math.max(...hourlyData, 1);

  /* ---- Table pagination ---- */
  const totalPages = Math.max(1, Math.ceil(abandoned.length / PER_PAGE));
  const paged = abandoned.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  /* ---- Copy email ---- */
  async function copyEmail(email: string, id: string) {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* fallback: ignore */
    }
  }

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div style={{ padding: 40, color: "var(--text-muted)" }}>
        Carregando...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: 40, color: "var(--text-muted)" }}>
        Erro ao carregar dados.
      </div>
    );
  }

  /* ---- Hourly chart constants ---- */
  const hChartW = 500;
  const hChartH = 150;
  const hLeftPad = 10;
  const hBarW = (hChartW - hLeftPad) / 24 - 2;

  /* ---- Render ---- */
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 24,
        }}
      >
        Checkouts Abandonados
      </h1>

      {/* ================================================================ */}
      {/*  KPI cards                                                       */}
      {/* ================================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <div style={kpiNumber}>{stats.abandonedToday}</div>
          <div style={kpiLabel}>Abandonos hoje</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{weekCount}</div>
          <div style={kpiLabel}>Abandonos semana</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{abandonRate}%</div>
          <div style={kpiLabel}>Taxa de abandono</div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  Charts row: Donut + Hourly                                      */}
      {/* ================================================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* ---- Donut chart ---- */}
        <div style={cardStyle}>
          <div style={{ ...kpiLabel, marginBottom: 16 }}>
            Conversao vs Abandono
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <svg viewBox="0 0 200 200" width={180} height={180}>
              {/* Background ring (abandonment) */}
              <circle
                cx={100}
                cy={100}
                r={R}
                fill="none"
                stroke="#C4787A"
                strokeWidth={20}
              />
              {/* Conversion arc */}
              <circle
                cx={100}
                cy={100}
                r={R}
                fill="none"
                stroke="#6B9E6B"
                strokeWidth={20}
                strokeDasharray={`${convArc} ${C}`}
                strokeDashoffset={0}
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
              {/* Center text */}
              <text
                x={100}
                y={95}
                textAnchor="middle"
                fontSize={22}
                fontWeight="bold"
                fill="var(--text-primary)"
              >
                {totalCount}
              </text>
              <text
                x={100}
                y={115}
                textAnchor="middle"
                fontSize={11}
                fill="var(--text-secondary)"
              >
                total
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#6B9E6B",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Convertidos {convPct.toFixed(1)}%
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#C4787A",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Abandonados {abandPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* ---- Hourly bar chart ---- */}
        <div style={cardStyle}>
          <div style={{ ...kpiLabel, marginBottom: 16 }}>
            Abandonos por hora do dia
          </div>
          <svg
            viewBox={`0 0 ${hChartW} ${hChartH + 24}`}
            width="100%"
            style={{ display: "block", maxWidth: hChartW }}
          >
            {hourlyData.map((count, h) => {
              const barH =
                maxHourly > 0 ? (count / maxHourly) * (hChartH - 10) : 0;
              const x = hLeftPad + h * ((hChartW - hLeftPad) / 24);
              return (
                <g key={h}>
                  <rect
                    x={x}
                    y={hChartH - barH}
                    width={hBarW}
                    height={Math.max(barH, 0)}
                    rx={2}
                    fill="var(--accent)"
                    opacity={0.75}
                  >
                    <title>
                      {String(h).padStart(2, "0")}h: {count} abandonos
                    </title>
                  </rect>
                  {h % 3 === 0 && (
                    <text
                      x={x + hBarW / 2}
                      y={hChartH + 16}
                      textAnchor="middle"
                      fontSize={9}
                      fill="var(--text-muted)"
                    >
                      {h}h
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  Abandonos table                                                 */}
      {/* ================================================================ */}
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              color: "var(--text-primary)",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "0.5px solid var(--border-default)",
                  textAlign: "left",
                }}
              >
                {["Email", "Plano tentado", "Etapa", "Data", "Acao"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    Nenhum abandono encontrado.
                  </td>
                </tr>
              )}
              {paged.map((a) => (
                <tr
                  key={a.id}
                  style={{
                    borderBottom: "0.5px solid var(--border-subtle)",
                  }}
                >
                  <td style={{ padding: "10px 16px" }}>{a.email}</td>
                  <td
                    style={{
                      padding: "10px 16px",
                      textTransform: "capitalize",
                    }}
                  >
                    {a.plan || "\u2014"}
                  </td>
                  <td style={{ padding: "10px 16px" }}>{a.step}</td>
                  <td
                    style={{
                      padding: "10px 16px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtDate(a.createdAt)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <button
                      onClick={() => copyEmail(a.email, a.id)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        border: "none",
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        cursor: "pointer",
                        transition: "opacity .15s",
                      }}
                    >
                      {copiedId === a.id ? "Copiado!" : "Copiar email"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            borderTop: "0.5px solid var(--border-default)",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          <span>
            {abandoned.length} abandono{abandoned.length !== 1 ? "s" : ""} —
            pagina {page + 1} de {totalPages}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                border: "0.5px solid var(--border-default)",
                background: "var(--bg-card)",
                color:
                  page === 0 ? "var(--text-muted)" : "var(--text-primary)",
                cursor: page === 0 ? "default" : "pointer",
                fontSize: 13,
                opacity: page === 0 ? 0.5 : 1,
              }}
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                border: "0.5px solid var(--border-default)",
                background: "var(--bg-card)",
                color:
                  page >= totalPages - 1
                    ? "var(--text-muted)"
                    : "var(--text-primary)",
                cursor: page >= totalPages - 1 ? "default" : "pointer",
                fontSize: 13,
                opacity: page >= totalPages - 1 ? 0.5 : 1,
              }}
            >
              Proximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
