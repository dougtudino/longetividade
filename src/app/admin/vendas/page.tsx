"use client";

import { useEffect, useState, useMemo } from "react";

interface Order {
  id: string;
  name: string;
  email: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
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
  recentOrders: Order[];
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
}

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

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(d: string) {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function VendasPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState("30");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    if (!stats) return [];
    let orders = stats.recentOrders;
    if (planFilter !== "all") orders = orders.filter((o) => o.plan === planFilter);
    if (statusFilter !== "all") orders = orders.filter((o) => o.status === statusFilter);

    const now = new Date();
    const days = parseInt(period);
    if (days > 0) {
      const cutoff = new Date(now.getTime() - days * 86400000);
      orders = orders.filter((o) => new Date(o.createdAt) >= cutoff);
    }
    return orders;
  }, [stats, planFilter, statusFilter, period]);

  const summary = useMemo(() => {
    const total = filtered.reduce((s, o) => s + o.amount / 100, 0);
    const count = filtered.length;
    return { total, count, avg: count > 0 ? total / count : 0 };
  }, [filtered]);

  const paged = filtered.slice(page * 10, (page + 1) * 10);
  const totalPages = Math.ceil(filtered.length / 10);

  function exportCSV() {
    const header = "Data,Nome,Email,Plano,Valor,Status\n";
    const rows = filtered
      .map(
        (o) =>
          `${formatDate(o.createdAt)},${o.name},${o.email},${o.plan},${(o.amount / 100).toFixed(2)},${o.status}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Vendas</h1>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
    );
  }

  const maxRev = Math.max(...stats.dailyRevenue.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Vendas</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Hoje", value: "1" },
          { label: "7 dias", value: "7" },
          { label: "30 dias", value: "30" },
          { label: "90 dias", value: "90" },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => { setPeriod(p.value); setPage(0); }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: period === p.value ? "var(--accent)" : "var(--bg-card)",
              color: period === p.value ? "#fff" : "var(--text-secondary)",
              border: "0.5px solid var(--border-default)",
            }}
          >
            {p.label}
          </button>
        ))}

        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "0.5px solid var(--border-default)" }}
        >
          <option value="all">Todos planos</option>
          <option value="basico">Básico</option>
          <option value="completo">Completo</option>
          <option value="vip">VIP</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "0.5px solid var(--border-default)" }}
        >
          <option value="all">Todos status</option>
          <option value="approved">Aprovado</option>
          <option value="pending">Pendente</option>
          <option value="rejected">Rejeitado</option>
        </select>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-lg text-sm font-medium ml-auto"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Exportar CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "TOTAL", value: formatBRL(summary.total) },
          { label: "PEDIDOS", value: String(summary.count) },
          { label: "TICKET MÉDIO", value: formatBRL(summary.avg) },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-default)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
              {c.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div
        className="rounded-xl p-5"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-default)" }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Receita por dia
        </h2>
        <svg viewBox="0 0 800 200" className="w-full" style={{ overflow: "visible" }}>
          {stats.dailyRevenue.map((d, i) => {
            const barH = maxRev > 0 ? (d.revenue / maxRev) * 160 : 0;
            const x = (i / stats.dailyRevenue.length) * 780 + 10;
            const w = 780 / stats.dailyRevenue.length - 2;
            return (
              <g key={d.date}>
                <rect
                  x={x}
                  y={180 - barH}
                  width={Math.max(w, 1)}
                  height={barH}
                  fill="var(--accent)"
                  opacity={0.8}
                  rx={2}
                >
                  <title>{`${d.date}: ${formatBRL(d.revenue)}`}</title>
                </rect>
                {i % 5 === 0 && (
                  <text x={x} y={196} fontSize="8" fill="var(--text-muted)">
                    {d.date.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Orders table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-default)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--text-primary)" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                {["Data", "Nome", "Email", "Plano", "Valor", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((o) => (
                <tr key={o.id} style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                  <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.name}</td>
                  <td className="px-4 py-3 opacity-75">{o.email}</td>
                  <td className="px-4 py-3 capitalize">{o.plan}</td>
                  <td className="px-4 py-3">{formatBRL(o.amount / 100)}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ background: STATUS_COLORS[o.status] || "#888" }}
                    >
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                    Nenhuma venda encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "0.5px solid var(--border-subtle)" }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 rounded text-sm disabled:opacity-30"
              style={{ color: "var(--accent)" }}
            >
              Anterior
            </button>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded text-sm disabled:opacity-30"
              style={{ color: "var(--accent)" }}
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
