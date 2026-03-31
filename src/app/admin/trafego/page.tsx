"use client";

import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PageviewData {
  byPage: { page: string; count: number }[];
  byDevice: { device: string; count: number }[];
  bySource: { utm_source: string; count: number }[];
  daily: { date: string; count: number }[];
  total: number;
  todayCount: number;
}

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */
const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 20,
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
  letterSpacing: "0.05em",
  color: "var(--text-secondary)",
  marginTop: 4,
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

/* ------------------------------------------------------------------ */
/*  SVG Bar Chart                                                      */
/* ------------------------------------------------------------------ */
function DailyBarChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
        Sem dados para exibir.
      </div>
    );
  }

  const W = 700;
  const H = 240;
  const PAD_L = 50;
  const PAD_R = 10;
  const PAD_T = 10;
  const PAD_B = 50;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const barGap = 2;
  const barW = Math.max(2, (chartW - barGap * data.length) / data.length);

  // Y axis ticks
  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxVal / yTicks) * i)
  );

  return (
    <div style={cardStyle}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginTop: 0,
          marginBottom: 12,
        }}
      >
        Pageviews Diarios (30 dias)
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }}>
        {/* Grid lines */}
        {yLabels.map((val, i) => {
          const y = PAD_T + chartH - (val / maxVal) * chartH;
          return (
            <g key={i}>
              <line
                x1={PAD_L}
                y1={y}
                x2={W - PAD_R}
                y2={y}
                stroke="var(--border-subtle)"
                strokeWidth="0.5"
              />
              <text
                x={PAD_L - 8}
                y={y + 4}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize="10"
              >
                {val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = PAD_L + i * (barW + barGap);
          const barH = (d.count / maxVal) * chartH;
          const y = PAD_T + chartH - barH;

          // Show every Nth x label
          const showEvery = Math.max(1, Math.floor(data.length / 10));
          const showLabel = i % showEvery === 0 || i === data.length - 1;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 0)}
                rx={2}
                fill="var(--accent)"
                opacity={0.8}
              />
              {showLabel && (
                <text
                  x={x + barW / 2}
                  y={H - PAD_B + 18}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10"
                >
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Horizontal Bar (for devices)                                       */
/* ------------------------------------------------------------------ */
function HorizontalBars({
  items,
  total,
}: {
  items: { label: string; count: number }[];
  total: number;
}) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item) => {
        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0";
        const widthPct = (item.count / maxCount) * 100;
        return (
          <div key={item.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: "var(--text-secondary)" }}>
                {fmtNum(item.count)} ({pct}%)
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 8,
                borderRadius: 4,
                background: "var(--bg-secondary)",
              }}
            >
              <div
                style={{
                  width: `${widthPct}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: "var(--accent)",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function TrafegoPage() {
  const [data, setData] = useState<PageviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pageviews");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Carregando...</p>;
  }

  if (!data) {
    return <p style={{ color: "#C4787A" }}>Erro ao carregar dados de trafego.</p>;
  }

  const topPage = data.byPage.length > 0 ? data.byPage[0].page : "-";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Title */}
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: "0 0 24px",
        }}
      >
        Trafego
      </h1>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div style={cardStyle}>
          <div style={kpiNumber}>{fmtNum(data.total)}</div>
          <div style={kpiLabel}>Pageviews (30 dias)</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{fmtNum(data.todayCount)}</div>
          <div style={kpiLabel}>Pageviews Hoje</div>
        </div>
        <div style={cardStyle}>
          <div
            style={{
              ...kpiNumber,
              fontSize: 18,
              wordBreak: "break-all",
            }}
          >
            {topPage}
          </div>
          <div style={kpiLabel}>Top Pagina</div>
        </div>
      </div>

      {/* Daily chart */}
      <div style={{ marginBottom: 28 }}>
        <DailyBarChart data={data.daily} />
      </div>

      {/* Two panels side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Top pages */}
        <div style={cardStyle}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginTop: 0,
              marginBottom: 14,
            }}
          >
            Top Paginas
          </h3>
          {data.byPage.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Sem dados.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                color: "var(--text-primary)",
              }}
            >
              <thead>
                <tr>
                  {["Pagina", "Visitas", "%"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "6px 8px",
                        borderBottom: "0.5px solid var(--border-default)",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.byPage.map((p) => {
                  const pct = data.total > 0 ? ((p.count / data.total) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={p.page}>
                      <td
                        style={{
                          padding: "6px 8px",
                          borderBottom: "0.5px solid var(--border-subtle)",
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.page}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          borderBottom: "0.5px solid var(--border-subtle)",
                        }}
                      >
                        {fmtNum(p.count)}
                      </td>
                      <td
                        style={{
                          padding: "6px 8px",
                          borderBottom: "0.5px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Devices */}
        <div style={cardStyle}>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginTop: 0,
              marginBottom: 14,
            }}
          >
            Dispositivos
          </h3>
          <HorizontalBars
            items={data.byDevice.map((d) => ({ label: d.device, count: d.count }))}
            total={data.total}
          />
        </div>
      </div>

      {/* Traffic sources table */}
      <div style={cardStyle}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginTop: 0,
            marginBottom: 14,
          }}
        >
          Fontes de Trafego
        </h3>
        {data.bySource.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Sem dados de UTM source.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              color: "var(--text-primary)",
            }}
          >
            <thead>
              <tr>
                {["Source", "Visitas", "% do Total"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      borderBottom: "0.5px solid var(--border-default)",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.bySource.map((s) => {
                const pct = data.total > 0 ? ((s.count / data.total) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={s.utm_source}>
                    <td
                      style={{
                        padding: "8px 10px",
                        borderBottom: "0.5px solid var(--border-subtle)",
                        fontWeight: 500,
                      }}
                    >
                      {s.utm_source || "(direto)"}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        borderBottom: "0.5px solid var(--border-subtle)",
                      }}
                    >
                      {fmtNum(s.count)}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        borderBottom: "0.5px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
