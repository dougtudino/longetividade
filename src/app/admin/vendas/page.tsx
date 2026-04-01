"use client";

import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Order {
  id: string;
  name: string;
  email: string;
  plan: string;
  amount: number; // centavos
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
  byPlan: Record<string, { count: number; revenue: number }>;
  abandonedTotal: number;
  abandonedToday: number;
  conversionRate: number;
  recentOrders: Order[];
  dailyRevenue: DailyRevenue[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const PLAN_LABELS: Record<string, string> = {
  basico: "Basico",
  completo: "Completo",
  vip: "VIP",
};

const STATUS_COLORS: Record<string, string> = {
  approved: "#6B9E6B",
  pending: "#D4A94B",
  rejected: "#C4787A",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
};

const PERIODS: { label: string; days: number }[] = [
  { label: "Hoje", days: 0 },
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

const PER_PAGE = 10;

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function VendasPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState(30);
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Stats API error");
        return r.json();
      })
      .then((d) => setStats(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [period, planFilter, statusFilter]);

  /* ---- Filtered orders ---- */
  const filtered = useMemo(() => {
    if (!stats) return [];
    const now = Date.now();
    return stats.recentOrders.filter((o) => {
      // Period filter
      if (period === 0) {
        const today = new Date();
        const d = new Date(o.createdAt);
        if (
          d.getDate() !== today.getDate() ||
          d.getMonth() !== today.getMonth() ||
          d.getFullYear() !== today.getFullYear()
        )
          return false;
      } else {
        const age = now - new Date(o.createdAt).getTime();
        if (age > period * 86_400_000) return false;
      }
      if (planFilter !== "all" && o.plan !== planFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      return true;
    });
  }, [stats, period, planFilter, statusFilter]);

  /* ---- Summary ---- */
  const totalFiltered = useMemo(
    () =>
      filtered
        .filter((o) => o.status === "approved")
        .reduce((s, o) => s + o.amount, 0) / 100,
    [filtered],
  );
  const countFiltered = filtered.length;
  const avgFiltered = countFiltered > 0 ? totalFiltered / countFiltered : 0;

  /* ---- Pagination ---- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageOrders = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  /* ---- CSV export ---- */
  function exportCSV() {
    const header = "Data,Nome,Email,Plano,Valor,Status";
    const rows = filtered.map((o) =>
      [
        fmtDate(o.createdAt),
        `"${o.name}"`,
        o.email,
        PLAN_LABELS[o.plan] || o.plan,
        (o.amount / 100).toFixed(2),
        STATUS_LABELS[o.status] || o.status,
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vendas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  /* ---- Chart constants ---- */
  const daily = stats.dailyRevenue;
  const maxRev = Math.max(...daily.map((d) => d.revenue), 1);
  const chartW = 800;
  const chartH = 200;
  const leftPad = 55;
  const barW = Math.max(4, (chartW - leftPad) / daily.length - 2);

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
        Vendas
      </h1>

      {/* ================================================================ */}
      {/*  Filters                                                         */}
      {/* ================================================================ */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        {/* Period buttons */}
        <div style={{ display: "flex", gap: 4 }}>
          {PERIODS.map((p) => (
            <button
              key={p.label}
              onClick={() => setPeriod(p.days)}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: period === p.days ? 600 : 400,
                border: "0.5px solid var(--border-default)",
                background:
                  period === p.days ? "var(--accent-soft)" : "var(--bg-card)",
                color:
                  period === p.days ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "background .15s, color .15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Plan select */}
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            border: "0.5px solid var(--border-default)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          <option value="all">Todos planos</option>
          <option value="basico">Basico</option>
          <option value="completo">Completo</option>
          <option value="vip">VIP</option>
        </select>

        {/* Status select */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 13,
            border: "0.5px solid var(--border-default)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          <option value="all">Todos status</option>
          <option value="approved">Aprovado</option>
          <option value="pending">Pendente</option>
          <option value="rejected">Rejeitado</option>
        </select>

        {/* Export CSV */}
        <button
          onClick={exportCSV}
          style={{
            marginLeft: "auto",
            padding: "6px 16px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: "0.5px solid var(--border-default)",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* ================================================================ */}
      {/*  Summary cards                                                   */}
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
          <div style={kpiNumber}>{fmtBRL(totalFiltered)}</div>
          <div style={kpiLabel}>Total R$</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{countFiltered}</div>
          <div style={kpiLabel}>Pedidos</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{fmtBRL(avgFiltered)}</div>
          <div style={kpiLabel}>Ticket medio</div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  Revenue bar chart                                               */}
      {/* ================================================================ */}
      <div style={{ ...cardStyle, marginBottom: 24, overflowX: "auto" }}>
        <div style={{ ...kpiLabel, marginBottom: 12 }}>
          Receita diaria (30 dias)
        </div>
        <svg
          viewBox={`0 0 ${chartW} ${chartH + 30}`}
          width="100%"
          style={{ display: "block", maxWidth: chartW }}
        >
          {/* Y-axis grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const y = chartH - f * chartH;
            return (
              <g key={f}>
                <line
                  x1={leftPad - 4}
                  y1={y}
                  x2={chartW}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeWidth={0.5}
                />
                <text
                  x={leftPad - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={10}
                  fill="var(--text-muted)"
                >
                  {Math.round(maxRev * f)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {daily.map((d, i) => {
            const h = (d.revenue / maxRev) * chartH;
            const x = leftPad + i * ((chartW - leftPad) / daily.length);
            return (
              <g key={d.date}>
                <rect
                  x={x}
                  y={chartH - h}
                  width={barW}
                  height={Math.max(h, 0)}
                  rx={2}
                  fill="var(--accent)"
                  opacity={0.85}
                >
                  <title>
                    {d.date}: {fmtBRL(d.revenue)} ({d.orders} pedidos)
                  </title>
                </rect>
                {i % 5 === 0 && (
                  <text
                    x={x + barW / 2}
                    y={chartH + 16}
                    textAnchor="middle"
                    fontSize={9}
                    fill="var(--text-muted)"
                  >
                    {d.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ================================================================ */}
      {/*  Orders table                                                    */}
      {/* ================================================================ */}
      <div
        style={{
          ...cardStyle,
          padding: 0,
          overflow: "hidden",
        }}
      >
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
                {["Data", "Nome", "Email", "Plano", "Valor", "Status"].map(
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
              {pageOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: 32,
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
              {pageOrders.map((o) => (
                <tr
                  key={o.id}
                  style={{ borderBottom: "0.5px solid var(--border-subtle)" }}
                >
                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    {fmtDate(o.createdAt)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>{o.name}</td>
                  <td
                    style={{
                      padding: "10px 16px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {o.email}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {PLAN_LABELS[o.plan] || o.plan}
                  </td>
                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    {fmtBRL(o.amount / 100)}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        color: STATUS_COLORS[o.status] || "var(--text-muted)",
                        background:
                          (STATUS_COLORS[o.status] || "#888") + "18",
                      }}
                    >
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
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
            {filtered.length} pedido{filtered.length !== 1 ? "s" : ""} —
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
