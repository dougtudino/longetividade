"use client";

import { useCallback, useEffect, useState } from "react";

type FunilData = {
  total: number;
  pageviews: number;
  convRatePct: number;
  daily: { date: string; count: number }[];
  byCtaId: { ctaId: string; count: number }[];
  byPlanId: { planId: string; count: number }[];
  byCampaign: { campaign: string; count: number }[];
  byPathname: { pathname: string; count: number }[];
};

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

function DailyBarChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
        Sem dados.
      </div>
    );
  }
  const W = 700;
  const H = 200;
  const PAD_L = 40;
  const PAD_R = 10;
  const PAD_T = 10;
  const PAD_B = 36;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const barGap = 6;
  const barW = (chartW - barGap * (data.length - 1)) / data.length;

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
        Cliques no CTA por dia (7d)
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const val = Math.round(maxVal * p);
          const y = PAD_T + chartH - p * chartH;
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
                x={PAD_L - 6}
                y={y + 3}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize="10"
              >
                {val}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = PAD_L + i * (barW + barGap);
          const barH = (d.count / maxVal) * chartH;
          const y = PAD_T + chartH - barH;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 0)}
                rx={3}
                fill="var(--accent)"
                opacity={0.85}
              />
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize="10"
                fontWeight={600}
              >
                {d.count > 0 ? d.count : ""}
              </text>
              <text
                x={x + barW / 2}
                y={H - 12}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize="10"
              >
                {d.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
  keyLabel,
  total,
}: {
  title: string;
  rows: { key: string; count: number }[];
  keyLabel: string;
  total: number;
}) {
  return (
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
        {title}
      </h3>
      {rows.length === 0 ? (
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
              {[keyLabel, "Cliques", "%"].map((h) => (
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
            {rows.map((r) => {
              const pct = total > 0 ? ((r.count / total) * 100).toFixed(1) : "0.0";
              return (
                <tr key={r.key}>
                  <td
                    style={{
                      padding: "6px 8px",
                      borderBottom: "0.5px solid var(--border-subtle)",
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.key}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      borderBottom: "0.5px solid var(--border-subtle)",
                    }}
                  >
                    {fmtNum(r.count)}
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
  );
}

export default function FunilPage() {
  const [data, setData] = useState<FunilData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/funil");
      if (res.ok) setData(await res.json());
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Carregando...</p>;
  if (!data) return <p style={{ color: "#C4787A" }}>Erro ao carregar dados do funil.</p>;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: "0 0 8px",
        }}
      >
        Funil
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 24px" }}>
        Cliques no CTA capturados pelo nosso banco (sendBeacon antes do redirect ao Hotmart).
        Independente do Pixel e do Hotmart — fonte da verdade interna.
      </p>

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
          <div style={kpiLabel}>Cliques em CTA (7d)</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{fmtNum(data.pageviews)}</div>
          <div style={kpiLabel}>LPVs nas LPs (7d)</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{data.convRatePct}%</div>
          <div style={kpiLabel}>Taxa LPV → Click</div>
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <DailyBarChart data={data.daily} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <BreakdownTable
          title="Por botao (ctaId)"
          rows={data.byCtaId.map((r) => ({ key: r.ctaId, count: r.count }))}
          keyLabel="Botao"
          total={data.total}
        />
        <BreakdownTable
          title="Por plano"
          rows={data.byPlanId.map((r) => ({ key: r.planId, count: r.count }))}
          keyLabel="Plano"
          total={data.total}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <BreakdownTable
          title="Por campanha (utm_campaign)"
          rows={data.byCampaign.map((r) => ({ key: r.campaign, count: r.count }))}
          keyLabel="Campanha"
          total={data.total}
        />
        <BreakdownTable
          title="Por pagina (pathname)"
          rows={data.byPathname.map((r) => ({ key: r.pathname, count: r.count }))}
          keyLabel="Pagina"
          total={data.total}
        />
      </div>
    </div>
  );
}
