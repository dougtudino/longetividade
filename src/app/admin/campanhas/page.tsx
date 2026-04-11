"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Campaign {
  id: string;
  name: string;
  platform: "meta" | "google" | "organic" | "email";
  objective: "conversao" | "trafego" | "awareness";
  status: "active" | "paused" | "finished";
  budget: number;
  startDate: string;
  endDate?: string | null;
  notes?: string;
  createdAt: string;
  totalSpend: number;
  totalConversions: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  roas: number;
  cpv: number;
}

interface CampaignForm {
  name: string;
  platform: string;
  objective: string;
  budget: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const emptyForm: CampaignForm = {
  name: "",
  platform: "meta",
  objective: "conversao",
  budget: "",
  startDate: "",
  endDate: "",
  notes: "",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const PLATFORM_COLORS: Record<string, string> = {
  meta: "#4A90D9",
  google: "#C4787A",
  organic: "#6B9E6B",
  email: "#9B72CF",
};

const PLATFORM_LABELS: Record<string, string> = {
  meta: "Meta",
  google: "Google",
  organic: "Orgânico",
  email: "Email",
};

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

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

function fmtMoney(n: number): string {
  return "R$" + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysSince(dateStr: string): number {
  const start = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 86_400_000));
}

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */
const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 20,
  transition: "background 0.15s",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--text-secondary)",
};

const btnPrimary: React.CSSProperties = {
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 20px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "0.5px solid var(--border-default)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  /* ---------- modal helpers ---------- */
  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(c: Campaign) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      platform: c.platform,
      objective: c.objective,
      budget: String(c.budget),
      startDate: c.startDate?.slice(0, 10) ?? "",
      endDate: c.endDate?.slice(0, 10) ?? "",
      notes: c.notes ?? "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const body = {
        name: form.name,
        platform: form.platform,
        objective: form.objective,
        budget: parseFloat(form.budget) || 0,
        startDate: form.startDate,
        endDate: form.endDate || null,
        notes: form.notes,
      };

      if (editingId) {
        await fetch(`/api/admin/campaigns`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...body }),
        });
      } else {
        await fetch("/api/admin/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchCampaigns();
    } catch {
      /* silently fail */
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(c: Campaign) {
    const newStatus = c.status === "active" ? "paused" : "active";
    try {
      await fetch("/api/admin/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, status: newStatus }),
      });
      await fetchCampaigns();
    } catch {
      /* silently fail */
    }
  }

  /* ---------- render ---------- */
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Tab nav */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          borderBottom: "0.5px solid var(--border-default)",
        }}
      >
        <span
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--accent)",
            borderBottom: "2px solid var(--accent)",
          }}
        >
          Campanhas
        </span>
        <Link
          href="/admin/campanhas/setup-bm"
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
            borderBottom: "2px solid transparent",
          }}
        >
          Setup BM
        </Link>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Campanhas
        </h1>
        <button style={btnPrimary} onClick={openNew}>
          + Nova Campanha
        </button>
      </div>

      {/* Campaign cards */}
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando...</p>
      ) : campaigns.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
          Nenhuma campanha cadastrada. Crie a primeira!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {campaigns.map((c) => {
            const ctr =
              c.totalImpressions > 0
                ? ((c.totalClicks / c.totalImpressions) * 100).toFixed(1)
                : "0.0";
            const days = daysSince(c.startDate);

            return (
              <div key={c.id} style={cardStyle}>
                {/* Row 1: Platform + Name + Status */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "3px 8px",
                      borderRadius: 6,
                      color: "#fff",
                      background: PLATFORM_COLORS[c.platform] ?? "#888",
                    }}
                  >
                    {PLATFORM_LABELS[c.platform] ?? c.platform}
                  </span>
                  <Link
                    href={`/admin/campanhas/${c.id}`}
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      flex: 1,
                    }}
                  >
                    {c.name}
                  </Link>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      color: STATUS_COLORS[c.status] ?? "#888",
                      border: `1px solid ${STATUS_COLORS[c.status] ?? "#888"}`,
                    }}
                  >
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </div>

                {/* Row 2: Budget + days */}
                <div style={{ ...labelStyle, marginBottom: 10 }}>
                  Budget: {fmtMoney(c.budget)}/dia &nbsp;|&nbsp; {days} dias rodando
                </div>

                {/* Row 3: Impressions / Clicks / CTR */}
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    marginBottom: 10,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    Impressões: <strong style={{ color: "var(--text-primary)" }}>{fmtNum(c.totalImpressions)}</strong>
                  </span>
                  <span>
                    Cliques: <strong style={{ color: "var(--text-primary)" }}>{fmtNum(c.totalClicks)}</strong>
                  </span>
                  <span>
                    CTR: <strong style={{ color: "var(--text-primary)" }}>{ctr}%</strong>
                  </span>
                </div>

                {/* Row 4: Spend / Conversions / ROAS / CPV */}
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    marginBottom: 14,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    Gasto: <strong style={{ color: "var(--text-primary)" }}>{fmtMoney(c.totalSpend)}</strong>
                  </span>
                  <span>
                    Conversões: <strong style={{ color: "var(--text-primary)" }}>{c.totalConversions}</strong>
                  </span>
                  <span>
                    ROAS:{" "}
                    <strong style={{ color: c.roas >= 1 ? "#6B9E6B" : "#C4787A" }}>
                      {c.roas.toFixed(2)}x
                    </strong>
                  </span>
                  <span>
                    CPV: <strong style={{ color: "var(--text-primary)" }}>{fmtMoney(c.cpv)}</strong>
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => openEdit(c)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: "0.5px solid var(--border-default)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>
                  {c.status !== "finished" && (
                    <button
                      onClick={() => toggleStatus(c)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "0.5px solid var(--border-default)",
                        background: "var(--bg-secondary)",
                        color:
                          c.status === "active" ? "#D4A94B" : "#6B9E6B",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      {c.status === "active" ? "Pausar" : "Retomar"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Links rapidos */}
      <div style={{ marginTop: 40 }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 14,
          }}
        >
          Links Rapidos
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {[
            { label: "Meta Ads Manager", href: "https://business.facebook.com/adsmanager" },
            { label: "Google Ads", href: "https://ads.google.com" },
            { label: "Hotmart Dashboard", href: "https://app.hotmart.com/products/manage/7474328" },
            { label: "Kiwify Dashboard", href: "https://dashboard.kiwify.com/products" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...cardStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--accent)",
                textDecoration: "none",
                padding: 14,
              }}
            >
              {link.label} &nbsp;&#8599;
            </a>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 100,
            }}
          />
          {/* Panel */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(480px, 92vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              zIndex: 101,
              ...cardStyle,
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                {editingId ? "Editar Campanha" : "Nova Campanha"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: 22,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Nome */}
              <div>
                <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>Nome</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome da campanha"
                />
              </div>

              {/* Plataforma + Objetivo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>
                    Plataforma
                  </label>
                  <select
                    style={inputStyle}
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  >
                    <option value="meta">Meta</option>
                    <option value="google">Google</option>
                    <option value="organic">Orgânico</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>
                    Objetivo
                  </label>
                  <select
                    style={inputStyle}
                    value={form.objective}
                    onChange={(e) => setForm({ ...form, objective: e.target.value })}
                  >
                    <option value="conversao">Conversão</option>
                    <option value="trafego">Tráfego</option>
                    <option value="awareness">Awareness</option>
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>
                  Budget Diário (R$)
                </label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* Datas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>
                    Data Início
                  </label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>
                    Data Fim (opcional)
                  </label>
                  <input
                    style={inputStyle}
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>Notas</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Observações sobre a campanha..."
                />
              </div>

              {/* Save */}
              <button
                style={{ ...btnPrimary, width: "100%", opacity: saving ? 0.6 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
