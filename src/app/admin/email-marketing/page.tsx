"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";

type Lead = {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  sequenceStep: number;
  lastEmailAt: string | null;
  createdAt: string;
};

type Stats = {
  total: number;
  step0_welcome: number;
  step1_d2: number;
  step2_d5: number;
  converted: number;
  conversionRate: string;
  abandonedTotal: number;
  abandonedToday: number;
};

const STEP_LABELS: Record<number, { label: string; color: string; icon: string }> = {
  0: { label: "D+0 Welcome", color: "#4A90D9", icon: "📧" },
  1: { label: "D+2 Valor", color: "#D4A94B", icon: "💡" },
  2: { label: "D+5 Oferta", color: "#6B9E6B", icon: "🎯" },
  [-1]: { label: "Opt-out", color: "#888", icon: "🚫" },
};

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 18,
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export default function EmailMarketingPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "0" | "1" | "2">("all");
  const [sending, setSending] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/leads")
      .then((r) => r.json())
      .then((d) => {
        setLeads(d.leads ?? []);
        setStats(d.stats ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function sendTestEmail(type: "welcome" | "value" | "offer") {
    setSending(type);
    setSendResult(null);
    try {
      // Envia pra o primeiro admin
      const res = await fetch("/api/admin/maya/daily-report?preview=1");
      // Abrir preview em nova aba é mais útil
      window.open(`/api/admin/email-preview?email=${type}&name=Teste`, "_blank");
      setSendResult(`Preview aberto pra ${type}`);
    } catch {
      setSendResult("Erro ao abrir preview");
    } finally {
      setSending(null);
    }
  }

  const filtered = filter === "all"
    ? leads
    : leads.filter((l) => l.sequenceStep === parseInt(filter));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Crescimento · Email Marketing
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "4px 0 20px 0" }}>
          Email Marketing & Funis
        </h1>
      </div>

      <PageHelp
        pageId="email-marketing"
        agent={{ icon: "📧", name: "Gaia + Maya", role: "Email Automation" }}
        title="Funis de email automaticos"
        quickActions={[
          { label: "Preview emails", description: "Veja como cada email fica visualmente antes de enviar" },
          { label: "Filtrar leads por step", description: "Veja quem está em qual etapa do funil" },
          { label: "Cron automático", description: "D+2 e D+5 rodam todo dia 9h BRT via cron-job.org" },
        ]}
      >
        <p>
          Dois funis automaticos rodando: <strong>Sequencia de boas-vindas</strong> (D+0/D+2/D+5)
          pra leads capturados na landing, e <strong>Carrinho abandonado</strong> (30min/24h)
          pra quem iniciou checkout mas nao finalizou. Tudo via Brevo SMTP API.
        </p>
      </PageHelp>

      {/* ─── FUNIL VISUAL ───────────────────────────── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          📊 Funil de Boas-Vindas
        </div>

        <div style={{ display: "flex", gap: 0, alignItems: "stretch", marginBottom: 20 }}>
          {[
            { step: 0, label: "D+0 Welcome", desc: "Email imediato ao capturar lead", count: stats?.step0_welcome ?? 0, color: "#4A90D9", preview: "welcome" },
            { step: 1, label: "D+2 Valor", desc: "Dica 'Regra das 3 horas'", count: stats?.step1_d2 ?? 0, color: "#D4A94B", preview: "value" },
            { step: 2, label: "D+5 Oferta", desc: "Oferta R$37 direto Hotmart", count: stats?.step2_d5 ?? 0, color: "#6B9E6B", preview: "offer" },
            { step: -1, label: "Converteu", desc: "Lead virou comprador", count: stats?.converted ?? 0, color: "#3D5A3E", preview: null },
          ].map((s, i) => (
            <div key={s.step} style={{ flex: 1, position: "relative" }}>
              {/* Arrow connector */}
              {i > 0 && (
                <div style={{
                  position: "absolute", left: -12, top: "50%", transform: "translateY(-50%)",
                  fontSize: 20, color: "var(--text-muted)", zIndex: 1,
                }}>→</div>
              )}
              <div
                style={{
                  padding: 16,
                  background: `${s.color}12`,
                  border: `2px solid ${s.color}40`,
                  borderRadius: 12,
                  margin: "0 8px",
                  textAlign: "center",
                  minHeight: 130,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 36, fontWeight: 900, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.desc}</div>
                {s.preview && (
                  <a
                    href={`/api/admin/email-preview?email=${s.preview}&name=Cliente`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 10, color: s.color, fontWeight: 700,
                      textDecoration: "underline", marginTop: 4,
                    }}
                  >
                    Preview →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats summary */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10,
          padding: 14, background: "var(--bg-secondary)", borderRadius: 10,
        }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Total leads</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{stats?.total ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Converteram</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#6B9E6B" }}>{stats?.converted ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Taxa conversao</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>{stats?.conversionRate ?? 0}%</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Carrinhos abandonados</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#D4A94B" }}>{stats?.abandonedTotal ?? 0}</div>
          </div>
        </div>
      </div>

      {/* ─── FUNIL CARRINHO ABANDONADO ──────────────── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              🛒 Recuperacao de Carrinho Abandonado
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              2 emails automaticos: 30min + 24h apos abandono. Direto pro checkout Hotmart.
            </div>
          </div>
          <a
            href="/api/admin/email-preview?email=welcome&name=Teste"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 14px", borderRadius: 8, background: "var(--bg-secondary)",
              color: "var(--text-primary)", border: "0.5px solid var(--border-default)",
              fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}
          >
            Adicionar cron (30min)
          </a>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            flex: 1, minWidth: 200, padding: 14, background: "#D4A94B12",
            border: "2px solid #D4A94B40", borderRadius: 10, textAlign: "center",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#D4A94B", textTransform: "uppercase" }}>Email 1 · 30min</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>"Voce esqueceu algo..."</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Lembrete gentil + lista do que leva</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "var(--text-muted)", fontSize: 20 }}>→</div>
          <div style={{
            flex: 1, minWidth: 200, padding: 14, background: "#C4787A12",
            border: "2px solid #C4787A40", borderRadius: 10, textAlign: "center",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C4787A", textTransform: "uppercase" }}>Email 2 · 24h</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6 }}>"Sua vaga ainda esta aberta"</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Objecoes respondidas + CTA checkout direto</div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)" }}>
          Cron: <code>/api/cron/abandoned-cart</code> · Hoje: {stats?.abandonedToday ?? 0} abandonos
        </div>
      </div>

      {/* ─── SEQUENCIAS DISPONIVEIS ─────────────────── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
          📋 Emails do Sistema
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {[
            { id: "welcome", name: "D+0 Welcome", trigger: "Captura de lead", subject: "Bem-vinda ao Metodo S.E.M!", status: "ativo", color: "#4A90D9" },
            { id: "value", name: "D+2 Valor", trigger: "Cron 9h (2 dias apos)", subject: "A regra das 3 horas", status: "ativo", color: "#D4A94B" },
            { id: "offer", name: "D+5 Oferta", trigger: "Cron 9h (5 dias apos)", subject: "[Nome], hoje e o ultimo dia", status: "ativo", color: "#6B9E6B" },
            { id: "delivery", name: "Entrega Ebook", trigger: "Webhook Hotmart", subject: "Seu ebook chegou!", status: "ativo", color: "#7A9E7E" },
            { id: "abandoned-30", name: "Carrinho 30min", trigger: "Cron 30min", subject: "Voce esqueceu algo...", status: "novo", color: "#D4A94B" },
            { id: "abandoned-24", name: "Carrinho 24h", trigger: "Cron 24h", subject: "Sua vaga ainda esta aberta", status: "novo", color: "#C4787A" },
            { id: "maya-daily", name: "Maya Relatorio", trigger: "Cron 8h BRT", subject: "Resumo diario", status: "ativo", color: "#3D5A3E" },
            { id: "gaia-review", name: "Gaia Decisoes", trigger: "Cron 8:30 BRT", subject: "Decisoes aguardando", status: "ativo", color: "#639922" },
          ].map((e) => (
            <div
              key={e.id}
              style={{
                padding: 14, background: "var(--bg-secondary)", borderRadius: 10,
                borderLeft: `3px solid ${e.color}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{e.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                  background: e.status === "ativo" ? "rgba(107,158,107,0.2)" : "rgba(74,144,217,0.2)",
                  color: e.status === "ativo" ? "#6B9E6B" : "#4A90D9",
                  textTransform: "uppercase",
                }}>{e.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                Trigger: {e.trigger}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Assunto: <em>{e.subject}</em>
              </div>
              {["welcome", "value", "offer"].includes(e.id) && (
                <a
                  href={`/api/admin/email-preview?email=${e.id}&name=Cliente`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: e.color, fontWeight: 700, marginTop: 6, display: "inline-block" }}
                >
                  Ver preview →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── LISTA DE LEADS ─────────────────────────── */}
      <div style={{ ...card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            👥 Leads ({filtered.length})
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { key: "all", label: "Todos" },
              { key: "0", label: "D+0" },
              { key: "1", label: "D+2" },
              { key: "2", label: "D+5 (fim)" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
                style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: filter === f.key ? "var(--accent)" : "var(--bg-secondary)",
                  color: filter === f.key ? "#fff" : "var(--text-secondary)",
                  border: "0.5px solid var(--border-default)", cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
            Nenhum lead ainda. Quando alguem preencher o formulario na landing, aparece aqui.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.slice(0, 50).map((l) => {
              const step = STEP_LABELS[l.sequenceStep] ?? STEP_LABELS[0];
              return (
                <div
                  key={l.id}
                  style={{
                    padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: 8,
                    display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{l.email}</div>
                    {l.source && (
                      <span style={{
                        fontSize: 10, padding: "1px 6px", borderRadius: 999,
                        background: "var(--bg-card)", color: "var(--text-muted)", marginTop: 2,
                        display: "inline-block",
                      }}>
                        {l.source}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                    background: `${step.color}20`, color: step.color,
                  }}>
                    {step.icon} {step.label}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {fmtDate(l.lastEmailAt)}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
                    {fmtDate(l.createdAt)}
                  </span>
                </div>
              );
            })}
            {filtered.length > 50 && (
              <div style={{ textAlign: "center", padding: 10, color: "var(--text-muted)", fontSize: 11 }}>
                ... e mais {filtered.length - 50} leads
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
