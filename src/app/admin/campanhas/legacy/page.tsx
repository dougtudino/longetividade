"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";

// Pagina oculta /admin/campanhas/legacy — NAO linkada no menu da sidebar
// nem nos tabs de /admin/campanhas. Acesso so via URL direta.
//
// Mostra campanhas com source='legacy' OR 'synced' (criadas fora do
// sistema Blueprint). Auditoria/curiosidade do Doug. Sem metricas
// agregadas, sem botao de criar/editar — read-only.

type LegacyCampaign = {
  id: string;
  name: string;
  platform: string;
  objective: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  metaCampaignId: string | null;
  source: string;
  launchId: string | null;
  createdAt: string;
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalConversions: number;
  totalRevenue: number;
};

type Tab = "legacy" | "synced";

const SOURCE_COLOR: Record<string, string> = {
  legacy: "#888",
  synced: "#4A90D9",
  blueprint: "#6B9E6B",
};

function fmtMoney(n: number): string {
  return "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function LegacyCampanhasPage() {
  const [tab, setTab] = useState<Tab>("legacy");
  const [items, setItems] = useState<LegacyCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/campaigns?scope=${tab}`)
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader
        title="Campanhas legadas (read-only)"
        subtitle="Auditoria de campanhas fora do sistema Blueprint. Pagina oculta — acesso so via URL direta."
        icon="📜"
        breadcrumb={
          <Link
            href="/admin/campanhas"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            ← Painel de campanhas
          </Link>
        }
      />

      <div
        style={{
          padding: 14,
          background: "rgba(212,169,75,0.08)",
          border: "0.5px solid rgba(212,169,75,0.4)",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        ⚠ <strong>Pagina oculta de auditoria.</strong> Lista campanhas no banco
        local que NAO sao do sistema Blueprint (origem: criacao avulsa antiga ou
        sync do Meta Ads sem launch correspondente). NAO sao mostradas no admin
        oficial <Link href="/admin/campanhas" style={{ color: "var(--accent)" }}>/admin/campanhas</Link> e nao contam nas metricas
        agregadas. Read-only — sem editar/deletar/criar.
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "0.5px solid var(--border-default)" }}>
        {(["legacy", "synced"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 600,
              color: tab === t ? "var(--accent)" : "var(--text-secondary)",
              borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t === "legacy" ? "Legacy (criação avulsa antiga)" : "Synced (do Meta sem Launch)"}
          </button>
        ))}
      </div>

      {loading && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Carregando...</div>}
      {!loading && items.length === 0 && (
        <div style={{ padding: 30, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          Nenhuma campanha em <code>source=&apos;{tab}&apos;</code>.
        </div>
      )}
      {items.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--border-default)", textAlign: "left" }}>
                {["Nome", "Source", "Plataforma", "Status", "Budget", "Início", "Meta ID", "Gasto total", "Impressões", "Cliques", "Conversões"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                  <td style={{ padding: "10px", color: "var(--text-primary)", fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        borderRadius: 999,
                        background: `${SOURCE_COLOR[c.source] ?? "#888"}22`,
                        color: SOURCE_COLOR[c.source] ?? "#888",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {c.source}
                    </span>
                  </td>
                  <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{c.platform}</td>
                  <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{c.status}</td>
                  <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{fmtMoney(c.budget)}/d</td>
                  <td style={{ padding: "10px", color: "var(--text-muted)" }}>{fmtDate(c.startDate)}</td>
                  <td style={{ padding: "10px", color: "var(--text-muted)", fontFamily: "monospace", fontSize: 10 }}>
                    {c.metaCampaignId ? c.metaCampaignId.slice(0, 16) + "..." : "—"}
                  </td>
                  <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{fmtMoney(c.totalSpend)}</td>
                  <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{fmtNum(c.totalImpressions)}</td>
                  <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{fmtNum(c.totalClicks)}</td>
                  <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{c.totalConversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, fontSize: 11, color: "var(--text-muted)", textAlign: "right" }}>
            {items.length} campanha{items.length === 1 ? "" : "s"} listada{items.length === 1 ? "" : "s"}
          </div>
        </div>
      )}
    </div>
  );
}
