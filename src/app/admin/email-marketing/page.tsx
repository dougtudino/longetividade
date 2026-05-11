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
            { step: 2, label: "D+5 Oferta", desc: "Oferta R$67 direto Hotmart", count: stats?.step2_d5 ?? 0, color: "#6B9E6B", preview: "offer" },
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

      {/* ─── 3 FUNIS COMPLETOS ───────────────────────── */}

      {/* Funil 2: Carrinho Abandonado */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          🛒 Funil: Carrinho Abandonado
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          Dispara quando alguem clica em comprar mas nao finaliza. Cron: <code>/api/cron/abandoned-cart</code> a cada 30min.
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { label: "30min", subject: "Voce esqueceu algo...", desc: "Lembrete gentil. Lista o que leva. CTA: Finalizar compra → Hotmart direto.", rule: "AbandonedCheckout.step='checkout' E idade >= 30min E nao tem Order aprovada com mesmo email", color: "#D4A94B" },
            { label: "24h", subject: "Sua vaga ainda esta aberta", desc: "Responde 3 objecoes (caro? funciona? tempo?). Box R$67 + garantia. CTA: Checkout direto.", rule: "AbandonedCheckout.step='email_30min' E idade >= 24h E nao tem Order aprovada", color: "#C4787A" },
          ].map((e, i) => (
            <div key={i} style={{ flex: 1, minWidth: 260 }}>
              <div style={{ padding: 14, background: `${e.color}10`, border: `1.5px solid ${e.color}35`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: e.color, textTransform: "uppercase", marginBottom: 6 }}>Email · {e.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>"{e.subject}"</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>{e.desc}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: 8, borderRadius: 6, lineHeight: 1.4 }}>
                  <strong>Regra:</strong> {e.rule}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Hoje: {stats?.abandonedToday ?? 0} abandonos · Auto-detecta recuperacao (se comprou, marca "recovered")
        </div>
      </div>

      {/* Funil 3: Pos-Compra + Upsell */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          🎓 Funil: Pos-Compra + Upsell VIP
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          Nurture pra quem JA COMPROU. Reduz refund, aumenta engajamento, prepara upsell. Cron: <code>/api/cron/post-purchase</code> diario 10h BRT.
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          {[
            { label: "D+1", subject: "[Nome], por onde comecar?", desc: "Primeiros passos: ler intro + cap 1, imprimir checklist, escolher 1 habito. Se VIP: CTA abrir app.", rule: "Order.status='approved' E idade >= 1 dia E Lead.sequenceStep=9 (comprador novo)", color: "#639922" },
            { label: "D+7", subject: "1 semana! Como esta indo?", desc: "Checkin emocional. Menciona sinais de progresso (menos fome, mais disposicao). Dica: Regra das 3 Horas.", rule: "Lead.sequenceStep=10 E Order.idade >= 7 dias", color: "#7A9E7E" },
            { label: "D+21", subject: "[Nome], 21 dias! Voce e incrivel", desc: "Celebracao. Se Basico/Completo: card upsell VIP (app + desafio + receitas). Se VIP: encoraja usar app.", rule: "Lead.sequenceStep=11 E Order.idade >= 21 dias. Upsell so se plan != 'vip'", color: "#3D5A3E" },
          ].map((e, i) => (
            <div key={i} style={{ flex: 1, minWidth: 260 }}>
              <div style={{ padding: 14, background: `${e.color}10`, border: `1.5px solid ${e.color}35`, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: e.color, textTransform: "uppercase", marginBottom: 6 }}>Email · {e.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>"{e.subject}"</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 8 }}>{e.desc}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: 8, borderRadius: 6, lineHeight: 1.4 }}>
                  <strong>Regra:</strong> {e.rule}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CATALOGO COMPLETO DE EMAILS ────────────── */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
          📋 Catalogo: Todos os Emails do Sistema ({10} emails)
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                {["Funil", "Email", "Trigger", "Assunto", "Destino CTA", "Regra", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 8px", textAlign: "left", color: "var(--text-muted)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", borderBottom: "0.5px solid var(--border-subtle)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { funnel: "Boas-vindas", name: "D+0 Welcome", trigger: "POST /api/leads (imediato)", subject: "Bem-vinda ao Metodo S.E.M!", dest: "/emagreca-sem-dieta", rule: "Lead criado, isNew=true", status: "ativo", color: "#4A90D9" },
                { funnel: "Boas-vindas", name: "D+2 Valor", trigger: "Cron 9h BRT", subject: "A regra das 3 horas", dest: "/emagreca-sem-dieta", rule: "Lead.step=0 E idade >= 2d", status: "ativo", color: "#D4A94B" },
                { funnel: "Boas-vindas", name: "D+5 Oferta", trigger: "Cron 9h BRT", subject: "[Nome], hoje e o ultimo dia", dest: "Hotmart checkout direto", rule: "Lead.step=1 E idade >= 5d", status: "ativo", color: "#6B9E6B" },
                { funnel: "Carrinho", name: "30min", trigger: "Cron 30min", subject: "Voce esqueceu algo...", dest: "Hotmart checkout direto", rule: "Abandon.step=checkout E >= 30min E !comprou", status: "ativo", color: "#D4A94B" },
                { funnel: "Carrinho", name: "24h", trigger: "Cron 30min", subject: "Sua vaga ainda esta aberta", dest: "Hotmart checkout direto", rule: "Abandon.step=email_30min E >= 24h E !comprou", status: "ativo", color: "#C4787A" },
                { funnel: "Entrega", name: "Ebook", trigger: "Webhook Hotmart", subject: "Seu ebook chegou!", dest: "Link download (token 72h)", rule: "PURCHASE_APPROVED event", status: "ativo", color: "#7A9E7E" },
                { funnel: "Pos-compra", name: "D+1", trigger: "Cron 10h BRT", subject: "[Nome], por onde comecar?", dest: "App VIP (se VIP) / ebook", rule: "Order approved E >= 1d E step=9", status: "ativo", color: "#639922" },
                { funnel: "Pos-compra", name: "D+7", trigger: "Cron 10h BRT", subject: "1 semana! Como esta indo?", dest: "/emagreca-sem-dieta", rule: "step=10 E >= 7d", status: "ativo", color: "#7A9E7E" },
                { funnel: "Pos-compra", name: "D+21 Upsell", trigger: "Cron 10h BRT", subject: "[Nome], 21 dias!", dest: "Hotmart VIP (se !vip) / App", rule: "step=11 E >= 21d. Upsell se plan!=vip", status: "ativo", color: "#3D5A3E" },
                { funnel: "Admin", name: "Maya Daily", trigger: "Cron 8h BRT", subject: "Resumo diario", dest: "/admin/dashboard", rule: "Envia pra todos AdminUser", status: "ativo", color: "#3D5A3E" },
              ].map((e, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                  <td style={{ padding: "8px", fontWeight: 600, color: e.color }}>{e.funnel}</td>
                  <td style={{ padding: "8px", fontWeight: 600 }}>{e.name}</td>
                  <td style={{ padding: "8px", color: "var(--text-muted)", fontSize: 11 }}>{e.trigger}</td>
                  <td style={{ padding: "8px", fontStyle: "italic" }}>{e.subject}</td>
                  <td style={{ padding: "8px", fontSize: 11, color: "var(--text-muted)" }}>{e.dest}</td>
                  <td style={{ padding: "8px", fontSize: 10, color: "var(--text-muted)", maxWidth: 200 }}>{e.rule}</td>
                  <td style={{ padding: "8px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(107,158,107,0.2)", color: "#6B9E6B", textTransform: "uppercase" }}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
