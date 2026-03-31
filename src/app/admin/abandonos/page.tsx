"use client";

import { useEffect, useState, useMemo } from "react";

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

function formatDate(d: string) {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function AbandonosPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [abandoned, setAbandoned] = useState<AbandonedCheckout[]>([]);
  const [page, setPage] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(console.error);
    fetch("/api/admin/abandoned").then((r) => r.json()).then(setAbandoned).catch(console.error);
  }, []);

  const weekCount = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return abandoned.filter((a) => new Date(a.createdAt) >= weekAgo).length;
  }, [abandoned]);

  const abandonRate = stats
    ? stats.abandonedTotal + stats.totalOrders > 0
      ? ((stats.abandonedTotal / (stats.abandonedTotal + stats.totalOrders)) * 100).toFixed(1)
      : "0.0"
    : "—";

  // Group by hour for chart
  const hourlyData = useMemo(() => {
    const hours = new Array(24).fill(0);
    for (const a of abandoned) {
      const h = new Date(a.createdAt).getHours();
      hours[h]++;
    }
    return hours;
  }, [abandoned]);

  const maxHourly = Math.max(...hourlyData, 1);

  const paged = abandoned.slice(page * 10, (page + 1) * 10);
  const totalPages = Math.ceil(abandoned.length / 10);

  async function copyEmail(email: string, id: string) {
    await navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Donut chart values
  const convPct = stats ? stats.conversionRate : 0;
  const abandPct = 100 - convPct;

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Abandonos</h1>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Checkouts Abandonados</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "ABANDONOS HOJE", value: String(stats.abandonedToday) },
          { label: "ABANDONOS SEMANA", value: String(weekCount) },
          { label: "TAXA DE ABANDONO", value: `${abandonRate}%` },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-default)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-secondary)" }}>
              {c.label}
            </p>
            <p className="text-[28px] font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Donut + Hourly charts side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut chart */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-default)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Conversão vs Abandono
          </h2>
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 200 200" width="180" height="180">
              {/* Background circle */}
              <circle cx="100" cy="100" r="70" fill="none" stroke="#C4787A" strokeWidth="20" />
              {/* Conversion arc */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#6B9E6B"
                strokeWidth="20"
                strokeDasharray={`${(convPct / 100) * 440} 440`}
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
              {/* Center text */}
              <text x="100" y="95" textAnchor="middle" fontSize="22" fontWeight="bold" fill="var(--text-primary)">
                {stats.totalOrders + stats.abandonedTotal}
              </text>
              <text x="100" y="115" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
                total
              </text>
            </svg>
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#6B9E6B" }} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Convertidos {convPct.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#C4787A" }} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Abandonados {abandPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Hourly chart */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-default)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Abandonos por hora do dia
          </h2>
          <svg viewBox="0 0 500 180" className="w-full" style={{ overflow: "visible" }}>
            {hourlyData.map((count, h) => {
              const barH = maxHourly > 0 ? (count / maxHourly) * 140 : 0;
              const x = (h / 24) * 480 + 10;
              const w = 480 / 24 - 2;
              return (
                <g key={h}>
                  <rect
                    x={x}
                    y={150 - barH}
                    width={w}
                    height={barH}
                    fill="#C4787A"
                    opacity={0.7}
                    rx={2}
                  >
                    <title>{`${String(h).padStart(2, "0")}h: ${count} abandonos`}</title>
                  </rect>
                  {h % 3 === 0 && (
                    <text x={x + w / 2} y={168} fontSize="9" fill="var(--text-muted)" textAnchor="middle">
                      {h}h
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Abandonos table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border-default)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--text-primary)" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                {["Email", "Plano tentado", "Etapa", "Data", "Ação"].map((h) => (
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
              {paged.map((a) => (
                <tr key={a.id} style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3 capitalize">{a.plan || "—"}</td>
                  <td className="px-4 py-3">{a.step}</td>
                  <td className="px-4 py-3">{formatDate(a.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyEmail(a.email, a.id)}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      {copiedId === a.id ? "Copiado!" : "Copiar email"}
                    </button>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }}>
                    Nenhum abandono encontrado
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
