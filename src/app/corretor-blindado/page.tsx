import type { Metadata } from "next";
import { getWorkspacePlans, formatBRL, type WorkspacePlanView } from "@/lib/workspace-plans";

// LP do LT "Corretor Blindado" — 2º tenant interno (dogfood da fábrica de
// workspaces). Workspace-aware desde a linha 1: planos vêm do WorkspacePlan
// (workspace corretor-blindado), com fallback estático pra renderizar mesmo
// antes da migration rodar. O funil de emagrecimento fica intocado.

export const metadata: Metadata = {
  title: "Corretor Blindado — a papelada que ninguém te ensinou",
  description:
    "O curso não ensinou, o estágio te abandonou. O mapa da documentação imobiliária que blinda sua próxima venda — e vira seu diferencial.",
};

const WORKSPACE_ID = "corretor-blindado";

// Fallback estático espelha o seed (db-migrations.ts). Garante LP renderizável
// pré-migration / sem DB.
const FALLBACK_PLANS: WorkspacePlanView[] = [
  { planKey: "lt", label: "Corretor Blindado", priceCents: 2700, checkoutUrl: "#", orderIndex: 0 },
  { planKey: "bump", label: "Pack de Contratos", priceCents: 1700, checkoutUrl: "#", orderIndex: 1 },
  { planKey: "upsell", label: "Casos Difíceis", priceCents: 19700, checkoutUrl: "#", orderIndex: 2 },
];

const NAVY = "#0c1626";
const GOLD = "#d4af37";
const INK = "#e8edf4";
const MUTED = "#9fb0c3";

const DORES = [
  {
    t: "Saiu cru do curso",
    d: "“Fiz o curso online e parece que não sei absolutamente nada.” O TTI tira o CRECI, mas não te prepara pra prática.",
  },
  {
    t: "O estágio te abandonou",
    d: "“Ninguém quer te ajudar, cada um por si.” Você foi jogado num plantão e teve que se virar sozinho.",
  },
  {
    t: "E a papelada?",
    d: "Certidões, matrícula, cartório, quem paga, quando vai a registro. O buraco que ninguém preenche — e o que mais dá medo de travar uma venda.",
  },
];

const MODULOS = [
  "A mentalidade que transforma documentação em arma de venda",
  "As certidões essenciais: quais, pra quê e em que ordem",
  "Ler uma matrícula sem medo — ônus, hipoteca, averbação, linha a linha",
  "Onde tirar cada documento: sites, cartórios, custo e prazo",
  "Quem paga o quê e quando: comprador × vendedor × corretor",
  "Os 7 sinais de uma venda que vai travar — antes de perder tempo",
  "Captação com exclusividade usando documentação (vira autoridade pro dono)",
];

export default async function CorretorBlindadoPage() {
  const dbPlans = await getWorkspacePlans(WORKSPACE_ID);
  const plans = dbPlans.length > 0 ? dbPlans : FALLBACK_PLANS;
  const lt = plans.find((p) => p.planKey === "lt") ?? plans[0];
  const checkout = lt.checkoutUrl && lt.checkoutUrl !== "#" ? lt.checkoutUrl : "#";

  return (
    <main style={{ background: NAVY, color: INK, fontFamily: "system-ui, -apple-system, sans-serif", margin: 0 }}>
      {/* HERO */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "72px 24px 56px", textAlign: "center" }}>
        <div style={{ display: "inline-block", border: `1px solid ${GOLD}`, color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 28 }}>
          Pra corretor que está começando
        </div>
        <h1 style={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, margin: "0 0 20px" }}>
          Fez o curso e saiu cru?<br />
          <span style={{ color: GOLD }}>Você não está sozinho.</span>
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.5, color: MUTED, margin: "0 auto 32px", maxWidth: 560 }}>
          O curso não ensinou. O estágio te abandonou. Aqui está a papelada que
          ninguém te mostrou — pra você não travar sua próxima venda por não
          saber ler uma matrícula.
        </p>
        <a href={checkout} style={ctaStyle}>
          QUERO PARAR DE TER MEDO DA PAPELADA — {formatBRL(lt.priceCents)}
        </a>
        <div style={{ fontSize: 13, color: MUTED, marginTop: 14 }}>
          Acesso imediato · consome em 1–2h · 7 dias de garantia
        </div>
      </section>

      {/* DORES */}
      <section style={{ background: "#0a1220", padding: "56px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <h2 style={sectionTitle}>Se isso é você, esse material foi feito pra te tirar do buraco</h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 36 }}>
            {DORES.map((d) => (
              <div key={d.t} style={cardStyle}>
                <h3 style={{ color: GOLD, fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>{d.t}</h3>
                <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.55, margin: 0 }}>{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REFRAME / BIG IDEA */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ ...sectionTitle, fontSize: 30 }}>
          Documentação não é a parte chata.<br />
          <span style={{ color: GOLD }}>É a sua arma de venda.</span>
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: MUTED, marginTop: 20 }}>
          O corretor que domina a papelada fecha mais — porque passa segurança
          ao comprador — e perde menos — porque capta com exclusividade e vira
          autoridade pro dono do imóvel. É o pilar com <strong style={{ color: INK }}>menos
          concorrência</strong> e o que mais decide uma venda.
        </p>
      </section>

      {/* O QUE TEM DENTRO */}
      <section style={{ background: "#0a1220", padding: "56px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={sectionTitle}>O que tem dentro</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0", display: "grid", gap: 14 }}>
            {MODULOS.map((m, i) => (
              <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ color: GOLD, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 16, lineHeight: 1.5, color: INK }}>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <h2 style={sectionTitle}>Quanto custa parar de travar suas vendas?</h2>
        <div style={{ background: "#0f1d31", border: `2px solid ${GOLD}`, borderRadius: 16, padding: "36px 28px", marginTop: 32 }}>
          <div style={{ fontSize: 15, color: MUTED, marginBottom: 6 }}>{lt.label}</div>
          <div style={{ fontSize: 52, fontWeight: 800, color: GOLD, lineHeight: 1 }}>{formatBRL(lt.priceCents)}</div>
          <div style={{ fontSize: 14, color: MUTED, margin: "10px 0 24px" }}>pagamento único · acesso imediato</div>
          <a href={checkout} style={{ ...ctaStyle, display: "block", width: "100%", boxSizing: "border-box" }}>
            COMEÇAR AGORA
          </a>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 16, lineHeight: 1.5 }}>
            Garantia incondicional de 7 dias. Se não te ajudar, devolvemos cada centavo.
          </div>
        </div>
        {checkout === "#" && (
          <p style={{ fontSize: 12, color: MUTED, marginTop: 16, opacity: 0.7 }}>
            (checkout em configuração — defina a oferta Hotmart no WorkspacePlan)
          </p>
        )}
      </section>
    </main>
  );
}

const ctaStyle: React.CSSProperties = {
  display: "inline-block",
  background: GOLD,
  color: NAVY,
  fontWeight: 800,
  fontSize: 16,
  textDecoration: "none",
  padding: "16px 28px",
  borderRadius: 12,
  letterSpacing: "0.01em",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 800,
  textAlign: "center",
  margin: 0,
  lineHeight: 1.2,
};

const cardStyle: React.CSSProperties = {
  background: "#0f1d31",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 14,
  padding: "24px 22px",
  textAlign: "left",
};
