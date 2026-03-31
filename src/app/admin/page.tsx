"use client";

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PlanStats {
  count: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  name: string;
  email: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface Stats {
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalOrders: number;
  ordersToday: number;
  ordersThisMonth: number;
  avgTicket: number;
  byPlan: {
    basico: PlanStats;
    completo: PlanStats;
    vip: PlanStats;
  };
  abandonedTotal: number;
  abandonedToday: number;
  conversionRate: number;
  recentOrders: RecentOrder[];
  dailyRevenue: DailyRevenue[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtBRL(cents: number): string {
  const val = cents / 100;
  return (
    "R$ " +
    val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${min}`;
}

function deltaPercent(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */
function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "24px 0" }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: "0.5px solid var(--border-default)",
              borderRadius: 12,
              padding: 20,
              height: 110,
            }}
          >
            <div style={{ ...pulseBar, width: "40%", height: 12, marginBottom: 12 }} />
            <div style={{ ...pulseBar, width: "60%", height: 28 }} />
          </div>
        ))}
      </div>
      {/* Chart skeleton */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 20,
          height: 320,
        }}
      >
        <div style={{ ...pulseBar, width: "30%", height: 14, marginBottom: 24 }} />
        <div style={{ ...pulseBar, width: "100%", height: 240 }} />
      </div>
      {/* Two panels */}
      <div style={{ display: "flex", gap: 16 }}>
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: "var(--bg-card)",
              border: "0.5px solid var(--border-default)",
              borderRadius: 12,
              padding: 20,
              height: 220,
            }}
          >
            <div style={{ ...pulseBar, width: "50%", height: 14, marginBottom: 16 }} />
            <div style={{ ...pulseBar, width: "100%", height: 20, marginBottom: 10 }} />
            <div style={{ ...pulseBar, width: "100%", height: 20, marginBottom: 10 }} />
            <div style={{ ...pulseBar, width: "100%", height: 20 }} />
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 20,
          height: 300,
        }}
      >
        <div style={{ ...pulseBar, width: "20%", height: 14, marginBottom: 16 }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ ...pulseBar, width: "100%", height: 16, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );
}

const pulseBar: React.CSSProperties = {
  background: "var(--border-subtle)",
  borderRadius: 6,
  animation: "pulse 1.5s ease-in-out infinite",
};

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */
function KPICard({
  label,
  value,
  delta,
  deltaLabel,
  sub,
}: {
  label: string;
  value: string;
  delta?: number | null;
  deltaLabel?: string;
  sub?: string;
}) {
  const deltaColor =
    delta == null
      ? "var(--text-muted)"
      : delta >= 0
        ? "#6B9E6B"
        : "#C4787A";
  const deltaStr =
    delta == null
      ? "\u2014"
      : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 12,
        padding: 20,
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
    >
      <div
        style={{
          fontSize: 12,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      {(delta !== undefined || sub) && (
        <div style={{ marginTop: 6, fontSize: 13 }}>
          {delta !== undefined && (
            <span style={{ color: deltaColor }}>
              {deltaStr}
              {deltaLabel && (
                <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>{deltaLabel}</span>
              )}
            </span>
          )}
          {sub && (
            <span style={{ color: "var(--text-muted)", marginLeft: delta !== undefined ? 8 : 0 }}>
              {sub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue Chart (pure SVG)                                           */
/* ------------------------------------------------------------------ */
function RevenueChart({ data }: { data: DailyRevenue[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 800;
  const H = 280;
  const PAD_L = 70;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  const avg = data.reduce((s, d) => s + d.revenue, 0) / (data.length || 1);
  const barW = Math.max((chartW / data.length) * 0.7, 2);
  const gap = chartW / data.length;

  // Y-axis ticks (4 lines)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxRev * f));

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        Receita dos ultimos 30 dias
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block" }}
        onMouseLeave={() => setHover(null)}
      >
        {/* Grid lines + Y labels */}
        {yTicks.map((val, i) => {
          const y = PAD_T + chartH - (val / maxRev) * chartH;
          return (
            <g key={i}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                stroke="var(--border-subtle)"
                strokeWidth={0.5}
              />
              <text
                x={PAD_L - 8}
                y={y + 4}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize={10}
              >
                {fmtBRL(val)}
              </text>
            </g>
          );
        })}

        {/* Average dashed line */}
        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={PAD_T + chartH - (avg / maxRev) * chartH}
          y2={PAD_T + chartH - (avg / maxRev) * chartH}
          stroke="var(--text-muted)"
          strokeWidth={1}
          strokeDasharray="6 4"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.revenue / maxRev) * chartH;
          const x = PAD_L + i * gap + (gap - barW) / 2;
          const y = PAD_T + chartH - barH;
          const isHovered = hover === i;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              {/* Invisible hit area */}
              <rect
                x={PAD_L + i * gap}
                y={PAD_T}
                width={gap}
                height={chartH}
                fill="transparent"
              />
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 1)}
                rx={2}
                fill={isHovered ? "var(--accent-hover)" : "var(--accent)"}
                opacity={isHovered ? 1 : 0.85}
                style={{ transition: "opacity 0.15s" }}
              />
            </g>
          );
        })}

        {/* X-axis labels (every 5th) */}
        {data.map((d, i) => {
          if (i % 5 !== 0) return null;
          const x = PAD_L + i * gap + gap / 2;
          const label = d.date.slice(5).replace("-", "/");
          return (
            <text
              key={i}
              x={x}
              y={H - 8}
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize={10}
            >
              {label}
            </text>
          );
        })}

        {/* Tooltip */}
        {hover !== null && data[hover] && (() => {
          const d = data[hover];
          const x = PAD_L + hover * gap + gap / 2;
          const barH = (d.revenue / maxRev) * chartH;
          const y = PAD_T + chartH - barH - 10;
          const label = `${d.date.slice(5).replace("-", "/")} — ${fmtBRL(d.revenue)}`;
          const tipW = label.length * 6.5 + 16;
          const tipX = Math.min(Math.max(x - tipW / 2, 0), W - tipW);
          return (
            <g>
              <rect
                x={tipX}
                y={y - 22}
                width={tipW}
                height={24}
                rx={6}
                fill="var(--bg-secondary)"
                stroke="var(--border-default)"
                strokeWidth={0.5}
              />
              <text
                x={tipX + tipW / 2}
                y={y - 6}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={11}
                fontWeight={600}
              >
                {label}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Plan Distribution                                                  */
/* ------------------------------------------------------------------ */
function PlanDistribution({ byPlan }: { byPlan: Stats["byPlan"] }) {
  const plans = [
    { key: "basico" as const, label: "Basico", price: "R$ 37", color: "#9EBF9E" },
    { key: "completo" as const, label: "Completo", price: "R$ 67", color: "#7A9E7E" },
    { key: "vip" as const, label: "VIP", price: "R$ 97", color: "#3D5A3E" },
  ];
  const totalCount = plans.reduce((s, p) => s + byPlan[p.key].count, 0) || 1;

  return (
    <div
      style={{
        flex: 1,
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 12,
        padding: 20,
        minWidth: 280,
      }}
    >
      <div
        style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}
      >
        Distribuicao por Plano
      </div>
      {plans.map((p) => {
        const pct = (byPlan[p.key].count / totalCount) * 100;
        return (
          <div key={p.key} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
                {p.label}{" "}
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{p.price}</span>
              </span>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {byPlan[p.key].count} vendas &middot; {fmtBRL(byPlan[p.key].revenue)}
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: "var(--border-subtle)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 4,
                  background: p.color,
                  transition: "width 0.5s ease",
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
/*  Funnel Metrics                                                     */
/* ------------------------------------------------------------------ */
function FunnelMetrics({
  abandonedTotal,
  totalOrders,
  conversionRate,
  avgTicket,
}: {
  abandonedTotal: number;
  totalOrders: number;
  conversionRate: number;
  avgTicket: number;
}) {
  const startedCheckout = abandonedTotal + totalOrders;
  const maxVal = startedCheckout || 1;

  const rows = [
    { label: "Visitantes", value: "\u2014", width: 100, color: "var(--border-default)" },
    {
      label: "Iniciaram checkout",
      value: startedCheckout.toLocaleString("pt-BR"),
      width: 100,
      color: "var(--accent)",
    },
    {
      label: "Completaram compra",
      value: totalOrders.toLocaleString("pt-BR"),
      width: startedCheckout ? (totalOrders / maxVal) * 100 : 0,
      color: "#6B9E6B",
    },
  ];

  return (
    <div
      style={{
        flex: 1,
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 12,
        padding: 20,
        minWidth: 280,
      }}
    >
      <div
        style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}
      >
        Metricas de Funil
      </div>

      {/* Funnel bars */}
      <div style={{ marginBottom: 16 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                color: "var(--text-secondary)",
                marginBottom: 4,
              }}
            >
              <span>{r.label}</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.value}</span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "var(--border-subtle)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${r.width}%`,
                  borderRadius: 3,
                  background: r.color,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div
        style={{
          display: "flex",
          gap: 20,
          paddingTop: 12,
          borderTop: "0.5px solid var(--border-subtle)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Taxa conversao
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            {conversionRate.toFixed(1)}%
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Ticket medio
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            {fmtBRL(avgTicket)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recent Orders Table                                                */
/* ------------------------------------------------------------------ */
function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  const statusColors: Record<string, string> = {
    approved: "#6B9E6B",
    pending: "#D4A94B",
    rejected: "#C4787A",
  };
  const statusLabels: Record<string, string> = {
    approved: "Aprovado",
    pending: "Pendente",
    rejected: "Rejeitado",
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 12,
        padding: 20,
        overflowX: "auto",
      }}
    >
      <div
        style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}
      >
        Ultimas Vendas
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}
      >
        <thead>
          <tr>
            {["Data", "Nome", "Email", "Plano", "Valor", "Status"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "0.5px solid var(--border-subtle)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              style={{ borderBottom: "0.5px solid var(--border-subtle)" }}
            >
              <td style={tdStyle}>{fmtDate(o.createdAt)}</td>
              <td style={tdStyle}>{o.name}</td>
              <td style={{ ...tdStyle, color: "var(--text-secondary)" }}>{o.email}</td>
              <td style={tdStyle}>
                {o.plan.charAt(0).toUpperCase() + o.plan.slice(1)}
              </td>
              <td style={tdStyle}>{fmtBRL(o.amount)}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: statusColors[o.status] || "var(--text-muted)",
                  }}
                >
                  {statusLabels[o.status] || o.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "var(--text-primary)",
  whiteSpace: "nowrap",
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar dados");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div style={{ padding: 40, color: "#C4787A", textAlign: "center" }}>
        <p style={{ fontSize: 16, fontWeight: 600 }}>Erro ao carregar dashboard</p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>{error}</p>
      </div>
    );
  }

  if (!stats) return <Skeleton />;

  const monthDelta = deltaPercent(stats.revenueThisMonth, stats.revenueLastMonth);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @media (max-width: 768px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .panels-row { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Row 1 — KPI Cards */}
        <div
          className="kpi-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
        >
          <KPICard
            label="Receita Hoje"
            value={fmtBRL(stats.revenueToday)}
            delta={null}
            deltaLabel="vs ontem"
          />
          <KPICard
            label="Receita Mes"
            value={fmtBRL(stats.revenueThisMonth)}
            delta={monthDelta}
            deltaLabel="vs mes anterior"
          />
          <KPICard
            label="Vendas Hoje"
            value={String(stats.ordersToday)}
          />
          <KPICard
            label="Taxa Conversao"
            value={`${stats.conversionRate.toFixed(1)}%`}
            sub={`${stats.abandonedToday} abandonos hoje`}
          />
        </div>

        {/* Row 2 — Revenue Chart */}
        {stats.dailyRevenue.length > 0 && <RevenueChart data={stats.dailyRevenue} />}

        {/* Row 3 — Two panels */}
        <div className="panels-row" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <PlanDistribution byPlan={stats.byPlan} />
          <FunnelMetrics
            abandonedTotal={stats.abandonedTotal}
            totalOrders={stats.totalOrders}
            conversionRate={stats.conversionRate}
            avgTicket={stats.avgTicket}
          />
        </div>

        {/* Row 4 — Recent Orders */}
        {stats.recentOrders.length > 0 && <RecentOrdersTable orders={stats.recentOrders} />}
      </div>
    </>
  );
}
