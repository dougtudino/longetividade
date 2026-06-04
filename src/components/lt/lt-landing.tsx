import { formatBRL, type WorkspacePlanView } from "@/lib/workspace-plans";
import type { LtContent } from "@/lib/landing-content";

// Template de Low Ticket — render data-driven. Reutilizado por /corretor-blindado
// e pela rota dinâmica /lt/[slug]. Conteúdo vem de LtContent; preços de
// WorkspacePlan; foto do hero de LpAsset. Server component (sem hooks).

type Props = {
  content: LtContent;
  plans: WorkspacePlanView[];
  heroImg: string | null;
  brandName: string;
};

const INK = "#e8edf4";
const MUTED = "#9fb0c3";

export default function LtLanding({ content, plans, heroImg, brandName }: Props) {
  const NAVY = content.bg ?? "#0c1626";
  const GOLD = content.accent ?? "#d4af37";

  const lt = plans.find((p) => p.planKey === "lt") ?? plans[0];
  const priceCents = lt?.priceCents ?? 2700;
  const checkout = lt?.checkoutUrl && lt.checkoutUrl !== "#" ? lt.checkoutUrl : "#";

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
  const sectionTitle: React.CSSProperties = { fontSize: 26, fontWeight: 800, textAlign: "center", margin: 0, lineHeight: 1.2 };
  const cardStyle: React.CSSProperties = {
    background: "#0f1d31",
    border: `1px solid ${GOLD}33`,
    borderRadius: 14,
    padding: "24px 22px",
    textAlign: "left",
  };

  const heroText = (
    <div style={{ flex: heroImg ? "1 1 380px" : "1 1 auto", minWidth: 280, maxWidth: heroImg ? 560 : "100%" }}>
      <div style={{ display: "inline-block", border: `1px solid ${GOLD}`, color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 28 }}>
        {content.heroBadge}
      </div>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, margin: "0 0 20px" }}>
        {content.heroTitle}
        <br />
        <span style={{ color: GOLD }}>{content.heroHighlight}</span>
      </h1>
      <p style={{ fontSize: 19, lineHeight: 1.5, color: MUTED, margin: "0 0 32px", maxWidth: 560 }}>{content.heroSubtitle}</p>
      <a href={checkout} style={ctaStyle}>
        {content.heroCtaPrefix}
        {formatBRL(priceCents)}
      </a>
      <div style={{ fontSize: 13, color: MUTED, marginTop: 14 }}>{content.heroNote}</div>
    </div>
  );

  return (
    <main style={{ background: NAVY, color: INK, fontFamily: "system-ui, -apple-system, sans-serif", margin: 0 }}>
      {/* HERO */}
      <section
        style={{
          maxWidth: heroImg ? 1040 : 720,
          margin: "0 auto",
          padding: "72px 24px 56px",
          display: "flex",
          gap: 48,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          textAlign: heroImg ? "left" : "center",
        }}
      >
        {heroText}
        {heroImg && (
          <div style={{ flex: "1 1 320px", minWidth: 260, maxWidth: 420 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImg} alt={brandName} style={{ width: "100%", borderRadius: 18, display: "block", border: `1px solid ${GOLD}59`, boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }} />
          </div>
        )}
      </section>

      {/* DORES */}
      <section style={{ background: "#0a1220", padding: "56px 24px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <h2 style={sectionTitle}>{content.doresTitle}</h2>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 36 }}>
            {content.dores.map((d, i) => (
              <div key={i} style={cardStyle}>
                <h3 style={{ color: GOLD, fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>{d.t}</h3>
                <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.55, margin: 0 }}>{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REFRAME */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ ...sectionTitle, fontSize: 30 }}>
          {content.reframeTitle}
          <br />
          <span style={{ color: GOLD }}>{content.reframeHighlight}</span>
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: MUTED, marginTop: 20 }}>{content.reframeBody}</p>
      </section>

      {/* MÓDULOS */}
      <section style={{ background: "#0a1220", padding: "56px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={sectionTitle}>{content.modulesTitle}</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0", display: "grid", gap: 14 }}>
            {content.modules.map((m, i) => (
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
        <h2 style={sectionTitle}>{content.pricingTitle}</h2>
        <div style={{ background: "#0f1d31", border: `2px solid ${GOLD}`, borderRadius: 16, padding: "36px 28px", marginTop: 32 }}>
          <div style={{ fontSize: 15, color: MUTED, marginBottom: 6 }}>{lt?.label ?? brandName}</div>
          <div style={{ fontSize: 52, fontWeight: 800, color: GOLD, lineHeight: 1 }}>{formatBRL(priceCents)}</div>
          <div style={{ fontSize: 14, color: MUTED, margin: "10px 0 24px" }}>{content.pricingSubtitle}</div>
          <a href={checkout} style={{ ...ctaStyle, display: "block", width: "100%", boxSizing: "border-box" }}>
            COMEÇAR AGORA
          </a>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 16, lineHeight: 1.5 }}>{content.guarantee}</div>
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
