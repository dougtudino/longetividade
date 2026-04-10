"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PlanStats { count: number; revenue: number }
interface Stats {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  conversionRate: number;
  abandonedTotal: number;
  byPlan: { basico: PlanStats; completo: PlanStats; vip: PlanStats };
  recentOrders: { id: string; name: string; plan: string; amount: number; status: string; createdAt: string }[];
}
interface PageviewData {
  total: number;
  byPage: { page: string; count: number }[];
}
interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  budget: number;
  startDate: string;
  totals: { impressions: number; clicks: number; spend: number; conversions: number; revenue: number };
  roas: number;
  cpv: number;
}
interface BrevoList { id: number; name: string; totalSubscribers: number }
interface BrevoEmailStats { requests: number; delivered: number; opens: number; clicks: number; uniqueOpens: number; uniqueClicks: number }

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtBRL(v: number) {
  return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
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

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text-primary)",
  marginBottom: 4,
};

const sectionSub: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-secondary)",
  marginBottom: 16,
};

const badge = (color: string, pulse = false): React.CSSProperties => ({
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  color: "#fff",
  background: color,
  animation: pulse ? "pulse-badge 2s ease-in-out infinite" : undefined,
});

const laneStyle: React.CSSProperties = {
  background: "var(--bg-secondary)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
};

const arrow: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
  padding: "0 4px",
  flexShrink: 0,
};

const extLink = (href: string, label: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "6px 14px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      color: "var(--accent)",
      background: "var(--accent-soft)",
      textDecoration: "none",
      transition: "background 0.15s",
      whiteSpace: "nowrap",
    }}
  >
    {label} ↗
  </a>
);

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */
function Section({ num, title, sub, children }: { num: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", opacity: 0.7 }}>
          {String(num).padStart(2, "0")}
        </span>
        <h2 style={sectionTitle}>{title}</h2>
      </div>
      <p style={sectionSub}>{sub}</p>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Flow row (horizontal arrows)                                       */
/* ------------------------------------------------------------------ */
function FlowRow({ steps }: { steps: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, padding: "12px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{
            padding: "6px 14px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-primary)",
            background: "var(--bg-card)",
            border: "0.5px solid var(--border-default)",
            whiteSpace: "nowrap",
          }}>
            {s}
          </span>
          {i < steps.length - 1 && <span style={arrow}>→</span>}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI mini card                                                      */
/* ------------------------------------------------------------------ */
function KPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function EcossistemaPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pageviews, setPageviews] = useState<PageviewData | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [brevoLists, setBrevoLists] = useState<BrevoList[] | null>(null);
  const [brevoEmail, setBrevoEmail] = useState<BrevoEmailStats | null>(null);
  const [brevoError, setBrevoError] = useState(false);
  const [railwayUp, setRailwayUp] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const results = await Promise.allSettled([
        fetch("/api/admin/stats").then(r => r.json()),
        fetch("/api/admin/pageviews").then(r => r.json()),
        fetch("/api/admin/campaigns").then(r => r.json()),
        fetch("/api/admin/ecossistema/brevo").then(r => r.ok ? r.json() : Promise.reject()),
        fetch("https://longetividade-production.up.railway.app/api/health", { mode: "no-cors", signal: AbortSignal.timeout(5000) }).then(() => true).catch(() => false),
      ]);

      if (results[0].status === "fulfilled") setStats(results[0].value);
      if (results[1].status === "fulfilled") setPageviews(results[1].value);
      if (results[2].status === "fulfilled") setCampaigns(Array.isArray(results[2].value) ? results[2].value : []);
      if (results[3].status === "fulfilled") {
        const bData = results[3].value;
        setBrevoLists(bData.lists || []);
        setBrevoEmail(bData.emailStats || null);
      } else {
        setBrevoError(true);
      }
      if (results[4].status === "fulfilled") setRailwayUp(results[4].value as boolean);

      setLoading(false);
    }
    load();
  }, []);

  // Derived
  const lastApproved = stats?.recentOrders?.find(o => o.status === "approved");
  const topPages = pageviews?.byPage?.slice(0, 5) || [];
  const activeCampaigns = campaigns?.filter(c => c.status === "active") || [];

  // Env flags (we check via meta tags or just show static — these get passed from brevo endpoint)
  const metaPixelId = typeof window !== "undefined" ? (document.querySelector('meta[name="meta-pixel-id"]')?.getAttribute("content") || "") : "";
  const ga4Id = typeof window !== "undefined" ? (document.querySelector('meta[name="ga4-id"]')?.getAttribute("content") || "") : "";

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }`}</style>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ ...cardStyle, height: 120 }}>
            <div style={{ background: "var(--border-subtle)", borderRadius: 6, width: "40%", height: 14, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ background: "var(--border-subtle)", borderRadius: 6, width: "60%", height: 28, marginTop: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse-badge { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @media (max-width: 768px) {
          .eco-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .eco-two-col { grid-template-columns: 1fr !important; }
          .eco-links-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Ecossistema — Visao Geral do Projeto
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Todos os fluxos, produtos, ferramentas e agentes em um so lugar
          </p>
        </div>

        {/* ============================================================ */}
        {/*  SECAO 0 — KPIs RAPIDOS                                       */}
        {/* ============================================================ */}
        <Section num={0} title="KPIs Rapidos" sub="Dados reais do banco de dados">
          <div className="eco-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            <KPI label="Pedidos Aprovados" value={String(stats?.totalOrders || 0)} />
            <KPI label="Receita Total" value={fmtBRL(stats?.totalRevenue || 0)} />
            <KPI label="Ticket Medio" value={fmtBRL(stats?.avgTicket || 0)} />
            <KPI label="Taxa Conversao" value={`${(stats?.conversionRate || 0).toFixed(1)}%`} sub={`${stats?.abandonedTotal || 0} abandonos`} />
            <KPI label="Produtos Ativos" value="1" sub="Emagreca Sem Dieta" />
            <KPI label="Produtos Planejados" value="4" sub="Em desenvolvimento" />
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 1 — ORIGEM DO TRAFEGO                                  */}
        {/* ============================================================ */}
        <Section num={1} title="Origem do Trafego" sub="Canais pagos e organicos de aquisicao">
          <div className="eco-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Pago */}
            <div style={laneStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Pago
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>Meta Ads</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Feed 1080x1080 · Stories 1080x1920 · Reels</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={badge("#D4A94B")}>6 criativos prontos</span>
                    {extLink("https://business.facebook.com/adsmanager", "Abrir")}
                  </div>
                </div>
                <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>Google Ads</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Search + Display</div>
                  </div>
                  {extLink("https://ads.google.com", "Abrir")}
                </div>
              </div>
            </div>

            {/* Organico */}
            <div style={laneStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Organico
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>longetividade.com.br</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>SEO</div>
                  </div>
                  {extLink("https://longetividade.com.br", "Visitar")}
                </div>
                <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>WhatsApp</div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Card compartilhavel</span>
                </div>
                <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>YouTube</div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Thumbnail pronto</span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 2 — PAGINAS DO SITE                                    */}
        {/* ============================================================ */}
        <Section num={2} title="Paginas do Site" sub="Paginas ativas e subdominios configurados">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>Homepage</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>longetividade.com.br</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {topPages.find(p => p.page === "/") && (
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {topPages.find(p => p.page === "/")!.count} views
                  </span>
                )}
                {extLink("https://longetividade.com.br", "Visitar")}
              </div>
            </div>

            <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>Pagina de Vendas</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/emagreca-sem-dieta</div>
                </div>
                <span style={badge("#6B9E6B", true)}>ATIVO</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {topPages.find(p => p.page.includes("emagreca")) && (
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                    {topPages.find(p => p.page.includes("emagreca"))!.count} views
                  </span>
                )}
                {extLink("https://longetividade.com.br/emagreca-sem-dieta", "Visitar")}
              </div>
            </div>

            {/* Top pages from pageviews */}
            {topPages.length > 0 && (
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>Top 5 Paginas (30 dias)</div>
                {topPages.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < topPages.length - 1 ? "0.5px solid var(--border-subtle)" : "none" }}>
                    <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{p.page}</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{p.count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Subdomains */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", alignSelf: "center" }}>Subdominios CNAME:</span>
              {["emagrecer", "sono", "detox"].map(s => (
                <span key={s} style={badge("var(--accent)")}>
                  {s}.longetividade.com.br
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 3 — PRODUTOS                                           */}
        {/* ============================================================ */}
        <Section num={3} title="Produtos" sub="Catalogo ativo e em desenvolvimento">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {/* Produto ativo */}
            <div style={{ ...cardStyle, borderColor: "#6B9E6B", borderWidth: 2, borderStyle: "solid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Emagreca Sem Dieta</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Metodo S.E.M</div>
                </div>
                <span style={badge("#6B9E6B", true)}>ATIVO</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                {[
                  { plan: "Basico", price: "R$ 37", color: "#9EBF9E" },
                  { plan: "Completo", price: "R$ 67", color: "#7A9E7E" },
                  { plan: "VIP", price: "R$ 97", color: "#3D5A3E" },
                ].map(p => (
                  <div key={p.plan} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: p.color + "18", textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.plan}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{p.price}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {stats?.byPlan?.[p.plan.toLowerCase() as keyof typeof stats.byPlan]?.count || 0} vendas
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {extLink("https://pay.hotmart.com/H105141835Q", "Hotmart")}
                {extLink("https://pay.kiwify.com.br/3fle7dM", "Kiwify")}
              </div>
            </div>

            {/* Produtos em breve */}
            {[
              { name: "Sono Profundo", icon: "\uD83C\uDF19" },
              { name: "Detox Mental", icon: "\uD83E\uDDE0" },
              { name: "Longevidade 60+", icon: "\u2764\uFE0F" },
              { name: "Energia & Metabolismo", icon: "\u26A1" },
            ].map(p => (
              <div key={p.name} style={{ ...cardStyle, borderStyle: "dashed", opacity: 0.7 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>
                    {p.icon} {p.name}
                  </div>
                  <span style={badge("#D4A94B")}>EM BREVE</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 4 — CHECKOUT E PAGAMENTO                               */}
        {/* ============================================================ */}
        <Section num={4} title="Checkout e Pagamento" sub="Hotmart — 3 ofertas com webhook ativo">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
            {[
              { plan: "Basico", price: "R$ 37", offerId: "zxq5tgew", color: "#9EBF9E" },
              { plan: "Completo", price: "R$ 67", offerId: "uzvdkzkf", color: "#7A9E7E" },
              { plan: "VIP", price: "R$ 97", offerId: "h84hak4e", color: "#3D5A3E" },
            ].map(p => (
              <div key={p.plan} style={{ ...cardStyle, borderLeft: `3px solid ${p.color}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 4 }}>{p.plan} — {p.price}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginBottom: 8 }}>offerId: {p.offerId}</div>
                {extLink(`https://pay.hotmart.com/H105141835Q?off=${p.offerId}`, "Testar")}
              </div>
            ))}
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", marginBottom: 8 }}>Webhook Hotmart</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace", wordBreak: "break-all" }}>/api/webhooks/hotmart</span>
              <span style={badge("#6B9E6B", true)}>ATIVO</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>hottok configurado via /admin/configuracoes</div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Fluxo pos-compra</div>
          <FlowRow steps={["Hotmart Webhook", "Cria Order", "Se VIP: cria AppUser", "Email Brevo", "Download token", "PDF entregue"]} />

          {lastApproved && (
            <div style={{ ...cardStyle, marginTop: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>Ultima venda:</span>
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{lastApproved.name}</span>
              <span style={badge("#6B9E6B")}>{lastApproved.plan}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtBRL(lastApproved.amount / 100)}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(lastApproved.createdAt)}</span>
            </div>
          )}
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 5 — CRM E LISTAS (BREVO)                               */}
        {/* ============================================================ */}
        <Section num={5} title="CRM e Listas (Brevo)" sub="Contatos, listas e metricas de email marketing">
          {brevoError ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>--</div>
              <span style={badge("#C4787A")}>Configure BREVO_API_KEY no Railway</span>
            </div>
          ) : (
            <>
              {/* Email stats */}
              {brevoEmail && (
                <div className="eco-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                  <KPI label="Emails Enviados (30d)" value={String(brevoEmail.requests || 0)} />
                  <KPI label="Entregues" value={String(brevoEmail.delivered || 0)} />
                  <KPI label="Taxa Abertura" value={brevoEmail.requests ? `${((brevoEmail.uniqueOpens / brevoEmail.requests) * 100).toFixed(1)}%` : "--"} />
                  <KPI label="Taxa Clique" value={brevoEmail.requests ? `${((brevoEmail.uniqueClicks / brevoEmail.requests) * 100).toFixed(1)}%` : "--"} />
                </div>
              )}

              {/* Lists */}
              {brevoLists && brevoLists.length > 0 && (
                <div style={cardStyle}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>Listas de contatos</div>
                  {brevoLists.map((l, i) => (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < brevoLists.length - 1 ? "0.5px solid var(--border-subtle)" : "none" }}>
                      <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{l.name}</span>
                      <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{l.totalSubscribers} contatos</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Fluxo de CRM</div>
            <FlowRow steps={["Lead", "Lista Principal", "Abandono", "Sequencia 3 emails", "Comprador", "Tag por plano", "Upsell 30 dias"]} />
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 6 — APP VIP                                            */}
        {/* ============================================================ */}
        <Section num={6} title="App VIP — Acompanhamento" sub="PWA exclusivo para compradores do plano VIP (R$97)">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Login", path: "/app/login", desc: "Email da compra" },
              { label: "Onboarding", path: "/app/onboarding", desc: "5 etapas" },
              { label: "Home", path: "/app/home", desc: "Dashboard + frase do dia" },
              { label: "Agua", path: "/app/agua", desc: "Controle de copos" },
              { label: "Habitos", path: "/app/habitos", desc: "10 checkboxes S.E.M" },
              { label: "Movimento", path: "/app/movimento", desc: "Registro exercicio" },
              { label: "Progresso", path: "/app/progresso", desc: "Peso + marcos" },
            ].map(p => (
              <div key={p.path} style={cardStyle}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{p.desc}</div>
                {extLink(`https://www.longetividade.com.br${p.path}`, "Abrir")}
              </div>
            ))}
          </div>
          <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Escassez</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>100 vagas vitalícias — apos esgotar, R$27/mes</div>
            </div>
            <span style={badge("#639922", true)}>PWA</span>
            <span style={badge("#6B9E6B", true)}>ATIVO</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
            Modelos: AppUser, AppProfile, AppCheckin, AppWaterLog, AppWeightLog, AppVipSlot
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 7 — INFRAESTRUTURA                                     */}
        {/* ============================================================ */}
        <Section num={7} title="Infraestrutura" sub="Servicos, banco de dados e tracking">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>Railway</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={badge(railwayUp === false ? "#C4787A" : "#6B9E6B", railwayUp !== false)}>
                  {railwayUp === null ? "Verificando..." : railwayUp ? "Online" : "Offline"}
                </span>
                {extLink("https://railway.app/dashboard", "Painel")}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>PostgreSQL</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{stats?.totalOrders || 0}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>orders no banco</div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>GitHub</div>
              {extLink("https://github.com/dougtudino/longetividade", "Repositorio")}
            </div>

            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>DNS Registro.br</div>
              <span style={badge("var(--accent)")}>5 registros configurados</span>
            </div>

            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>Meta Pixel</div>
              <span style={badge(metaPixelId ? "#6B9E6B" : "#D4A94B")}>
                {metaPixelId ? "Configurado" : "Verificar META_PIXEL_ID"}
              </span>
            </div>

            <div style={cardStyle}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>GA4</div>
              <span style={badge(ga4Id ? "#6B9E6B" : "#D4A94B")}>
                {ga4Id ? "Configurado" : "Verificar GA4_ID"}
              </span>
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 8 — CAMPANHAS ATIVAS                                   */}
        {/* ============================================================ */}
        <Section num={7} title="Campanhas Ativas" sub="Campanhas de marketing em andamento">
          {activeCampaigns.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>Nenhuma campanha ativa</div>
              <Link
                href="/admin/campanhas"
                style={{
                  display: "inline-flex",
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  background: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                Ir para Campanhas
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {activeCampaigns.map(c => {
                const platColors: Record<string, string> = { meta: "#1877F2", google: "#EA4335", organic: "#6B9E6B", email: "#D4A94B" };
                return (
                  <div key={c.id} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{c.name}</div>
                        <span style={badge(platColors[c.platform] || "var(--accent)")}>{c.platform}</span>
                      </div>
                      <span style={badge("#6B9E6B")}>Ativa</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginTop: 8 }}>
                      <div><span style={{ color: "var(--text-muted)" }}>Budget/dia:</span> <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>R$ {c.budget}</span></div>
                      {c.totals.conversions > 0 && (
                        <>
                          <div><span style={{ color: "var(--text-muted)" }}>ROAS:</span> <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{c.roas.toFixed(2)}</span></div>
                          <div><span style={{ color: "var(--text-muted)" }}>CPV:</span> <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>R$ {c.cpv.toFixed(2)}</span></div>
                          <div><span style={{ color: "var(--text-muted)" }}>Conversoes:</span> <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{c.totals.conversions}</span></div>
                        </>
                      )}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Link href={`/admin/campanhas/${c.id}`} style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                        Ver detalhes →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 9 — EQUIPE AIOX                                        */}
        {/* ============================================================ */}
        <Section num={8} title="Equipe AIOX" sub="Agentes de IA que constroem e operam o projeto">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={laneStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Planejamento
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["@analyst", "@pm", "@architect", "@ux-expert"].map(a => (
                  <span key={a} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "#8B5CF6", background: "rgba(139,92,246,0.12)" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div style={laneStyle}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6B9E6B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Desenvolvimento
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["@sm", "@dev", "@qa", "@po", "@data-engineer", "@devops", "@git"].map(a => (
                  <span key={a} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, color: "#6B9E6B", background: "rgba(107,158,107,0.12)" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Fluxo de desenvolvimento</div>
            <FlowRow steps={["@sm cria stories", "@dev implementa", "@qa revisa", "@git push", "Railway deploya"]} />

            <div style={cardStyle}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Info tecnica</div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Framework:</span>
                <span style={{ color: "var(--text-primary)" }}>AIOX v4.2 (SynkraAI/aiox-core)</span>
                <span style={{ color: "var(--text-muted)" }}>Ativacao:</span>
                <span style={{ color: "var(--text-primary)" }}>Claude Code com /agent-name</span>
                <span style={{ color: "var(--text-muted)" }}>Path:</span>
                <span style={{ color: "var(--text-primary)", wordBreak: "break-all" }}>C:\Users\dougt\projetos\ebook-emagrecimentofeminino\site</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECAO 10 — LINKS RAPIDOS                                      */}
        {/* ============================================================ */}
        <Section num={9} title="Links Rapidos" sub="Acesso direto a todas as plataformas">
          <div className="eco-links-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {[
              { label: "Site ao vivo", href: "https://longetividade.com.br" },
              { label: "Pagina de vendas", href: "https://longetividade.com.br/emagreca-sem-dieta" },
              { label: "Checkout Hotmart", href: "https://pay.hotmart.com/H105141835Q" },
              { label: "Checkout Kiwify", href: "https://pay.kiwify.com.br/3fle7dM" },
              { label: "Painel Hotmart", href: "https://app.hotmart.com" },
              { label: "Painel Kiwify", href: "https://dashboard.kiwify.com.br" },
              { label: "Brevo", href: "https://app.brevo.com" },
              { label: "Railway", href: "https://railway.app/dashboard" },
              { label: "GitHub", href: "https://github.com/dougtudino/longetividade" },
              { label: "Registro.br", href: "https://registro.br" },
              { label: "Meta Ads Manager", href: "https://business.facebook.com/adsmanager" },
              { label: "Google Ads", href: "https://ads.google.com" },
              { label: "Google Analytics", href: "https://analytics.google.com" },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "12px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  background: "var(--bg-card)",
                  border: "0.5px solid var(--border-default)",
                  textDecoration: "none",
                  transition: "background 0.15s, border-color 0.15s",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-soft)";
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-card)";
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }}
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
