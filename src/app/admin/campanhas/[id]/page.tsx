"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Metric {
  id: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
}

interface CampaignDetail {
  id: string;
  name: string;
  platform: string;
  objective: string;
  status: "active" | "paused" | "finished";
  budget: number;
  startDate: string;
  endDate?: string | null;
  notes?: string;
  metrics: Metric[];
}

interface MetricForm {
  date: string;
  impressions: string;
  clicks: string;
  spend: string;
  conversions: string;
  revenue: string;
}

const emptyMetricForm: MetricForm = {
  date: "",
  impressions: "",
  clicks: "",
  spend: "",
  conversions: "",
  revenue: "",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const STATUS_COLORS: Record<string, string> = {
  active: "#6B9E6B",
  paused: "#D4A94B",
  finished: "#888",
};
const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  paused: "Pausado",
  finished: "Finalizado",
};

function fmtMoney(n: number): string {
  return "R$" + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR");
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "0.5px solid var(--border-default)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
};

/* ------------------------------------------------------------------ */
/*  SVG Dual-Line Chart                                                */
/* ------------------------------------------------------------------ */
function DualLineChart({
  data,
}: {
  data: { date: string; spend: number; revenue: number }[];
}) {
  if (data.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
        Sem dados para exibir o grafico.
      </div>
    );
  }

  const W = 700;
  const H = 280;
  const PAD_L = 60;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 50;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const allVals = data.flatMap((d) => [d.spend, d.revenue]);
  const maxVal = Math.max(...allVals, 1);

  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

  function toPath(values: number[]): string {
    return values
      .map((v, i) => {
        const x = PAD_L + (data.length > 1 ? i * xStep : chartW / 2);
        const y = PAD_T + chartH - (v / maxVal) * chartH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }

  const spendPath = toPath(data.map((d) => d.spend));
  const revenuePath = toPath(data.map((d) => d.revenue));

  // Y axis ticks
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxVal / yTicks) * i)
  );

  return (
    <div style={cardStyle}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, marginTop: 0 }}>
        Gasto vs Receita Diarios
      </h3>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 10, fontSize: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 3, borderRadius: 2, background: "#C4787A", display: "inline-block" }} />
          <span style={{ color: "var(--text-secondary)" }}>Gasto</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 3, borderRadius: 2, background: "#6B9E6B", display: "inline-block" }} />
          <span style={{ color: "var(--text-secondary)" }}>Receita</span>
        </span>
      </div>

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

        {/* Lines */}
        <path d={spendPath} fill="none" stroke="#C4787A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={revenuePath} fill="none" stroke="#6B9E6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {data.map((d, i) => {
          const x = PAD_L + (data.length > 1 ? i * xStep : chartW / 2);
          return (
            <g key={i}>
              <circle cx={x} cy={PAD_T + chartH - (d.spend / maxVal) * chartH} r="3" fill="#C4787A" />
              <circle cx={x} cy={PAD_T + chartH - (d.revenue / maxVal) * chartH} r="3" fill="#6B9E6B" />
            </g>
          );
        })}

        {/* X axis labels */}
        {data.map((d, i) => {
          const x = PAD_L + (data.length > 1 ? i * xStep : chartW / 2);
          // Show every Nth label to avoid overlap
          const showEvery = Math.max(1, Math.floor(data.length / 10));
          if (i % showEvery !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={x}
              y={H - PAD_B + 18}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="10"
            >
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [metricForm, setMetricForm] = useState<MetricForm>(emptyMetricForm);
  const [saving, setSaving] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}`);
      if (res.ok) {
        setCampaign(await res.json());
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  async function handleAddMetric() {
    setSaving(true);
    try {
      await fetch(`/api/admin/campaigns/${campaignId}/metrics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: metricForm.date,
          impressions: parseInt(metricForm.impressions) || 0,
          clicks: parseInt(metricForm.clicks) || 0,
          spend: parseFloat(metricForm.spend) || 0,
          conversions: parseInt(metricForm.conversions) || 0,
          revenue: parseFloat(metricForm.revenue) || 0,
        }),
      });
      setMetricForm(emptyMetricForm);
      await fetchCampaign();
    } catch {
      /* silently fail */
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p style={{ color: "var(--text-muted)" }}>Carregando...</p>;
  }

  if (!campaign) {
    return <p style={{ color: "#C4787A" }}>Campanha nao encontrada.</p>;
  }

  /* ---------- Compute KPIs from metrics ---------- */
  const metrics = campaign.metrics ?? [];
  const totalSpend = metrics.reduce((s, m) => s + m.spend, 0);
  const totalConversions = metrics.reduce((s, m) => s + m.conversions, 0);
  const totalRevenue = metrics.reduce((s, m) => s + m.revenue, 0);
  const totalImpressions = metrics.reduce((s, m) => s + m.impressions, 0);
  const totalClicks = metrics.reduce((s, m) => s + m.clicks, 0);
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const cpv = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const sortedMetrics = [...metrics].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const chartData = [...metrics]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({ date: m.date.slice(0, 10), spend: m.spend, revenue: m.revenue }));

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/admin/campanhas"
          style={{
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          &larr;
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          {campaign.name}
        </h1>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 6,
            color: STATUS_COLORS[campaign.status] ?? "#888",
            border: `1px solid ${STATUS_COLORS[campaign.status] ?? "#888"}`,
          }}
        >
          {STATUS_LABELS[campaign.status] ?? campaign.status}
        </span>
      </div>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Gasto Total", value: fmtMoney(totalSpend) },
          { label: "Conversões", value: String(totalConversions) },
          { label: "Receita", value: fmtMoney(totalRevenue) },
          {
            label: "ROAS",
            value: roas.toFixed(2) + "x",
            color: roas >= 1 ? "#6B9E6B" : "#C4787A",
          },
          { label: "CPV", value: fmtMoney(cpv) },
          { label: "CTR", value: ctr.toFixed(1) + "%" },
        ].map((kpi) => (
          <div key={kpi.label} style={cardStyle}>
            <div style={{ ...kpiNumber, color: kpi.color ?? "var(--text-primary)" }}>
              {kpi.value}
            </div>
            <div style={kpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 28 }}>
        <DualLineChart data={chartData} />
      </div>

      {/* Metrics table */}
      <div style={{ ...cardStyle, marginBottom: 28, overflowX: "auto" }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginTop: 0, marginBottom: 14 }}>
          Metricas Diarias
        </h3>

        {sortedMetrics.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhuma metrica registrada.</p>
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
                {["Data", "Impressões", "Cliques", "Gasto R$", "Conversões", "Receita R$"].map(
                  (h) => (
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.map((m) => (
                <tr key={m.id}>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--border-subtle)" }}>
                    {m.date.slice(0, 10)}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--border-subtle)" }}>
                    {fmtNum(m.impressions)}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--border-subtle)" }}>
                    {fmtNum(m.clicks)}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--border-subtle)" }}>
                    {fmtMoney(m.spend)}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--border-subtle)" }}>
                    {m.conversions}
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--border-subtle)" }}>
                    {fmtMoney(m.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual metrics input */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginTop: 0, marginBottom: 14 }}>
          Adicionar Metrica
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div>
            <label style={{ ...kpiLabel, display: "block", marginBottom: 4 }}>Data</label>
            <input
              style={inputStyle}
              type="date"
              value={metricForm.date}
              onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })}
            />
          </div>
          <div>
            <label style={{ ...kpiLabel, display: "block", marginBottom: 4 }}>Impressões</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={metricForm.impressions}
              onChange={(e) => setMetricForm({ ...metricForm, impressions: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label style={{ ...kpiLabel, display: "block", marginBottom: 4 }}>Cliques</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={metricForm.clicks}
              onChange={(e) => setMetricForm({ ...metricForm, clicks: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label style={{ ...kpiLabel, display: "block", marginBottom: 4 }}>Gasto R$</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="0.01"
              value={metricForm.spend}
              onChange={(e) => setMetricForm({ ...metricForm, spend: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div>
            <label style={{ ...kpiLabel, display: "block", marginBottom: 4 }}>Conversões</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={metricForm.conversions}
              onChange={(e) => setMetricForm({ ...metricForm, conversions: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label style={{ ...kpiLabel, display: "block", marginBottom: 4 }}>Receita R$</label>
            <input
              style={inputStyle}
              type="number"
              min="0"
              step="0.01"
              value={metricForm.revenue}
              onChange={(e) => setMetricForm({ ...metricForm, revenue: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>
        <button
          onClick={handleAddMetric}
          disabled={saving || !metricForm.date}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            opacity: saving || !metricForm.date ? 0.5 : 1,
          }}
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
