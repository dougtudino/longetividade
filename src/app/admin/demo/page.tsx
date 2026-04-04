"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Styles ─── */
const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 20,
};
const heading: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 };
const sub: React.CSSProperties = { fontSize: 13, color: "var(--text-muted)", marginBottom: 16 };
const badge = (color: string, solid?: boolean): React.CSSProperties => ({
  display: "inline-block", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 999,
  background: solid ? color : color + "22", color: solid ? "#fff" : color,
});
const btnPrimary: React.CSSProperties = {
  padding: "10px 20px", borderRadius: 10, border: "none", background: "#639922",
  color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none",
  display: "inline-flex", alignItems: "center", gap: 6,
};
const btnOutline: React.CSSProperties = {
  ...btnPrimary, background: "transparent", border: "1.5px solid var(--border-default)",
  color: "var(--text-primary)",
};

/* ─── Plan data ─── */
type PlanKey = "basico" | "completo" | "vip";

interface Deliverable {
  name: string;
  type: "pdf" | "app" | "whatsapp" | "video" | "live" | "email";
  status: "pronto" | "criar" | "gravar" | "configurar";
  desc: string;
  file?: string;
}

interface PlanInfo {
  name: string;
  price: string;
  offerId: string;
  color: string;
  deliverables: Deliverable[];
  accessFlow: string[];
}

const PLANS: Record<PlanKey, PlanInfo> = {
  basico: {
    name: "Basico",
    price: "R$ 37",
    offerId: "zxq5tgew",
    color: "#9EBF9E",
    deliverables: [
      { name: "Ebook Metodo S.E.M (PDF)", type: "pdf", status: "pronto", desc: "12 capitulos, ~14.500 palavras, 28-35 paginas", file: "outputs/ebook/emagrecimento-feminino/ebook-emagrecimento-feminino.pdf" },
      { name: "Plano de 7 dias + cardapio", type: "pdf", status: "pronto", desc: "Capitulo 8 do ebook — dia a dia com 4 refeicoes" },
      { name: "Lista de compras estrategica", type: "pdf", status: "pronto", desc: "Capitulo 9 do ebook — organizada por secao do mercado" },
      { name: "Checklist diario imprimivel", type: "pdf", status: "pronto", desc: "Capitulo 12 bonus 1 — 10 habitos diarios para acompanhar" },
      { name: "Tabela de substituicoes alimentares", type: "pdf", status: "pronto", desc: "Capitulo 12 bonus 2 — 20 trocas praticas" },
      { name: "10 atalhos de aceleracao", type: "pdf", status: "pronto", desc: "Capitulo 10 — dicas de aceleracao de resultados" },
    ],
    accessFlow: [
      "Cliente compra no Hotmart (R$37)",
      "Webhook cria Order no banco",
      "Email Brevo com link de download (token 72h)",
      "Cliente clica e baixa o PDF",
      "Download limitado a 3x por token",
    ],
  },
  completo: {
    name: "Completo",
    price: "R$ 67",
    offerId: "uzvdkzkf",
    color: "#7A9E7E",
    deliverables: [
      { name: "Tudo do plano Basico", type: "pdf", status: "pronto", desc: "6 entregaveis inclusos" },
      { name: "Guia de controle emocional avancado (PDF)", type: "pdf", status: "criar", desc: "Expandir cap 7 do ebook em PDF separado — fome emocional, ansiedade, gatilhos" },
      { name: "Planner mensal imprimivel (PDF)", type: "pdf", status: "criar", desc: "Template mensal para acompanhamento — semanas 1-4 com metas e reflexoes" },
      { name: "Acesso grupo WhatsApp (30 dias)", type: "whatsapp", status: "configurar", desc: "Doug cria grupo + link de convite — enviado no email pos-compra" },
    ],
    accessFlow: [
      "Cliente compra no Hotmart (R$67)",
      "Webhook cria Order no banco",
      "Email Brevo com link de download + link do grupo WhatsApp",
      "Cliente baixa ebook + bonus PDFs extras",
      "Cliente entra no grupo WhatsApp via link",
    ],
  },
  vip: {
    name: "VIP",
    price: "R$ 97",
    offerId: "h84hak4e",
    color: "#3D5A3E",
    deliverables: [
      { name: "Tudo do plano Completo", type: "pdf", status: "pronto", desc: "10 entregaveis inclusos" },
      { name: "APP de acompanhamento vitalicio", type: "app", status: "pronto", desc: "PWA em /app — login, onboarding, habitos, agua, movimento, progresso" },
      { name: "Guia de Receitas S.E.M — 30 receitas (PDF)", type: "pdf", status: "criar", desc: "30 receitas praticas alinhadas aos 3 pilares — cafe, almoco, jantar, lanches" },
      { name: "Desafio 21 Dias — programa por email", type: "email", status: "criar", desc: "Sequencia automatica Brevo: 21 emails diarios com missao, dica e frase motivacional" },
      { name: "Diario de Autoconhecimento (PDF)", type: "pdf", status: "criar", desc: "Journal imprimivel 30 dias — reflexoes sobre fome emocional, gatilhos, vitorias, gratidao" },
    ],
    accessFlow: [
      "Cliente compra no Hotmart (R$97)",
      "Webhook cria Order + AppUser + decrementa vaga VIP",
      "Email Brevo com link download + link grupo WhatsApp + instrucoes app",
      "Cliente baixa ebook + bonus PDFs",
      "Cliente acessa /app/login com email da compra",
      "Onboarding 5 etapas → Home com habitos, agua, movimento, progresso",
      "Desafio 21 Dias inicia automaticamente por email (D+1 a D+21)",
    ],
  },
};

const STATUS_BADGE: Record<string, { color: string; label: string }> = {
  pronto: { color: "#6B9E6B", label: "PRONTO" },
  criar: { color: "#D4A94B", label: "CRIAR" },
  configurar: { color: "#8B5CF6", label: "CONFIGURAR" },
};

const TYPE_ICON: Record<string, string> = {
  pdf: "📄", app: "📱", whatsapp: "💬", email: "📧",
};

/* ─── Roadmap ─── */
const ROADMAP = [
  {
    phase: "Fase 1 — Lancamento (Agora)",
    status: "em_andamento",
    items: [
      "Sales page com 3 planos + checkout Hotmart",
      "Webhook Hotmart → Order + email de entrega",
      "App VIP (7 telas) com escassez 100 vagas",
      "Dashboard admin com KPIs + App VIP stats",
    ],
  },
  {
    phase: "Fase 2 — Entregaveis Completos",
    status: "proximo",
    items: [
      "Gerar PDFs individuais dos bonus (checklist, tabela, lista, planner)",
      "Guia emocional avancado como PDF separado",
      "Guia de Receitas S.E.M — 30 receitas (PDF)",
      "Diario de Autoconhecimento — journal 30 dias (PDF)",
      "Desafio 21 Dias — sequencia email automatica Brevo",
      "Criar grupo WhatsApp + automacao de link no email",
    ],
  },
  {
    phase: "Fase 3 — Trafego Pago",
    status: "futuro",
    items: [
      "Meta Pixel + GA4 configurados",
      "Campanhas Meta Ads (conversao + retargeting)",
      "Google Ads (search + display)",
      "Email marketing: sequencia lead → venda → upsell",
    ],
  },
  {
    phase: "Fase 4 — Escala",
    status: "futuro",
    items: [
      "Novos produtos: Sono Profundo, Detox Mental, Longevidade 60+",
      "Upsell automatico pos-compra",
      "App: notificacoes push, lembretes personalizados",
      "Programa de afiliados Hotmart",
    ],
  },
];

const PHASE_COLORS: Record<string, string> = {
  em_andamento: "#639922",
  proximo: "#D4A94B",
  futuro: "#6b7280",
};

/* ─── Component ─── */
export default function DemoPage() {
  const [activePlan, setActivePlan] = useState<PlanKey>("vip");
  const [demoLoading, setDemoLoading] = useState(false);
  const router = useRouter();
  const plan = PLANS[activePlan];

  async function handleDemoLogin() {
    setDemoLoading(true);
    await fetch("/api/app/demo-login", { method: "POST" });
    setDemoLoading(false);
    window.open("/app", "_blank");
  }

  const totalDeliverables = plan.deliverables.length;
  const readyCount = plan.deliverables.filter((d) => d.status === "pronto").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Demo & Roadmap
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Simule a experiencia do cliente por plano e acompanhe o roadmap de entregaveis
        </p>
      </div>

      {/* ─── Plan Selector ─── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {(Object.keys(PLANS) as PlanKey[]).map((key) => {
          const p = PLANS[key];
          const active = key === activePlan;
          return (
            <button
              key={key}
              onClick={() => setActivePlan(key)}
              style={{
                flex: 1,
                minWidth: 140,
                padding: "16px 20px",
                borderRadius: 12,
                border: `2px solid ${active ? p.color : "var(--border-default)"}`,
                background: active ? p.color + "15" : "var(--bg-card)",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: active ? p.color : "var(--text-primary)" }}>
                {p.name}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>{p.price}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginTop: 4 }}>{p.offerId}</div>
            </button>
          );
        })}
      </div>

      {/* ─── Entregaveis ─── */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={heading}>Entregaveis — {plan.name}</h2>
            <p style={{ ...sub, marginBottom: 0 }}>{readyCount}/{totalDeliverables} prontos</p>
          </div>
          <div style={{ height: 8, width: 120, borderRadius: 4, background: "var(--border-subtle)" }}>
            <div style={{ height: "100%", borderRadius: 4, background: plan.color, width: `${(readyCount / totalDeliverables) * 100}%` }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {plan.deliverables.map((d, i) => {
            const st = STATUS_BADGE[d.status];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "start",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "var(--bg-secondary)",
                  border: d.status === "pronto" ? `1px solid ${plan.color}33` : "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{TYPE_ICON[d.type]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</span>
                    <span style={badge(st.color, d.status === "pronto")}>{st.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{d.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Fluxo de Acesso do Cliente ─── */}
      <div style={card}>
        <h2 style={heading}>Jornada do Cliente — {plan.name}</h2>
        <p style={sub}>Como o cliente recebe e acessa tudo</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {plan.accessFlow.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 12, fontWeight: 700,
                  background: plan.color, color: "#fff",
                }}>
                  {i + 1}
                </div>
                {i < plan.accessFlow.length - 1 && (
                  <div style={{ width: 2, height: 24, background: plan.color + "40" }} />
                )}
              </div>
              <div style={{ paddingTop: 4, paddingBottom: i < plan.accessFlow.length - 1 ? 12 : 0 }}>
                <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{step}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Simulador — Abrir App VIP ─── */}
      {activePlan === "vip" && (
        <div style={{ ...card, borderColor: "#639922", borderWidth: 2, borderStyle: "solid" }}>
          <h2 style={heading}>Simulador — App VIP</h2>
          <p style={sub}>Teste todas as telas do app como se fosse um cliente VIP</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Login", path: "/app/login", icon: "🔑" },
              { label: "Onboarding", path: "/app/onboarding", icon: "📋" },
              { label: "Home", path: "/app/home", icon: "🏠" },
              { label: "Agua", path: "/app/agua", icon: "💧" },
              { label: "Habitos", path: "/app/habitos", icon: "✅" },
              { label: "Movimento", path: "/app/movimento", icon: "🏃" },
              { label: "Progresso", path: "/app/progresso", icon: "📊" },
            ].map((t) => (
              <a
                key={t.path}
                href={t.path}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...btnOutline,
                  justifyContent: "center",
                  padding: "14px 12px",
                  flexDirection: "column",
                  gap: 4,
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 24 }}>{t.icon}</span>
                <span style={{ fontSize: 13 }}>{t.label}</span>
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={handleDemoLogin} disabled={demoLoading} style={btnPrimary}>
              {demoLoading ? "Criando..." : "Entrar no App como Admin"} &rarr;
            </button>
            <a href="/emagreca-sem-dieta#pricing" target="_blank" rel="noopener noreferrer" style={btnOutline}>
              Ver Sales Page
            </a>
          </div>
        </div>
      )}

      {/* ─── Testar Checkout ─── */}
      <div style={card}>
        <h2 style={heading}>Testar Checkout — {plan.name}</h2>
        <p style={sub}>Abre o checkout do Hotmart com o preco correto</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href={`https://pay.hotmart.com/H105141835Q?offerId=${plan.offerId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={btnPrimary}
          >
            Abrir Checkout {plan.name} ({plan.price}) &rarr;
          </a>
          <a
            href="https://pay.hotmart.com/H105141835Q"
            target="_blank"
            rel="noopener noreferrer"
            style={btnOutline}
          >
            Checkout sem oferta (padrao)
          </a>
        </div>
      </div>

      {/* ─── Roadmap ─── */}
      <div style={card}>
        <h2 style={heading}>Roadmap do Projeto</h2>
        <p style={sub}>Visao geral das fases de desenvolvimento</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ROADMAP.map((phase, pi) => (
            <div key={pi} style={{ borderLeft: `3px solid ${PHASE_COLORS[phase.status]}`, paddingLeft: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{phase.phase}</span>
                <span style={badge(PHASE_COLORS[phase.status], phase.status === "em_andamento")}>
                  {phase.status === "em_andamento" ? "EM ANDAMENTO" : phase.status === "proximo" ? "PROXIMO" : "FUTURO"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {phase.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: PHASE_COLORS[phase.status],
                    }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Resumo Arquivos ─── */}
      <div style={card}>
        <h2 style={heading}>Arquivos do Projeto</h2>
        <p style={sub}>Onde esta cada coisa no repositorio</p>
        <div style={{ fontSize: 13, fontFamily: "monospace", lineHeight: 1.8, color: "var(--text-secondary)" }}>
          {[
            { path: "prisma/schema.prisma", desc: "Models: Order, AppUser, AppProfile, AppCheckin, AppVipSlot, AppSetting" },
            { path: "src/app/emagreca-sem-dieta/page.tsx", desc: "Sales page com PricingSection (3 planos)" },
            { path: "src/components/landing/pricing-section.tsx", desc: "Componente 3 planos + VipBanner" },
            { path: "src/config/plans.ts", desc: "PLANS[] com checkoutUrl Hotmart por oferta" },
            { path: "src/app/api/webhooks/hotmart/route.ts", desc: "Webhook: cria Order + AppUser VIP" },
            { path: "src/app/app/", desc: "7 telas PWA: login, onboarding, home, agua, habitos, movimento, progresso" },
            { path: "src/lib/vip-slots.ts", desc: "getVipSlots() + claimVipSlot() — escassez 100 vagas" },
            { path: "src/lib/settings.ts", desc: "getSetting() — le do banco com cache + fallback env" },
            { path: "src/data/quotes.ts", desc: "60 frases motivacionais do Metodo S.E.M" },
            { path: "public/manifest.json", desc: "PWA config — icones, cores, start_url" },
            { path: "outputs/ebook/", desc: "Ebook completo + PDF + capitulos + QA report" },
          ].map((f) => (
            <div key={f.path} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ color: plan.color, fontWeight: 600 }}>{f.path}</span>
              <span style={{ color: "var(--text-muted)" }}>— {f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
