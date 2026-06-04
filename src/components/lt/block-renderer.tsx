import { formatBRL, type WorkspacePlanView } from "@/lib/workspace-plans";
import type { Block, Blocks } from "@/lib/blocks/schema";

// Renderer block-based das Landing Pages. Substitui o LtLanding fixo: recebe um
// array de blocos tipados (validado por Zod) e renderiza cada um por `type`.
// Server component (sem hooks). O visual dos blocos legados (hero/dores/reframe/
// módulos/oferta/garantia) é idêntico ao LtLanding pra não quebrar nada.

export type SocialProofView = {
  imageUrl: string;
  alt: string;
  name: string | null;
  caption: string | null;
};

type Props = {
  blocks: Blocks;
  plans: WorkspacePlanView[];
  heroImg: string | null;
  brandName: string;
  socialProof?: SocialProofView[];
};

const INK = "#e8edf4";
const MUTED = "#9fb0c3";

export default function BlockRenderer({ blocks, plans, heroImg, brandName, socialProof = [] }: Props) {
  // Tema vem do bloco hero (accent/bg); default navy+gold.
  const hero = blocks.find((b) => b.type === "hero");
  const NAVY = (hero?.type === "hero" && hero.props.bg) || "#0c1626";
  const GOLD = (hero?.type === "hero" && hero.props.accent) || "#d4af37";

  const theme = { NAVY, GOLD };
  const ctx = { plans, heroImg, brandName, socialProof, theme };

  return (
    <main style={{ background: NAVY, color: INK, fontFamily: "system-ui, -apple-system, sans-serif", margin: 0 }}>
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} ctx={ctx} />
      ))}
    </main>
  );
}

type Ctx = {
  plans: WorkspacePlanView[];
  heroImg: string | null;
  brandName: string;
  socialProof: SocialProofView[];
  theme: { NAVY: string; GOLD: string };
};

function planFor(plans: WorkspacePlanView[], planKey?: string) {
  const p = (planKey && plans.find((x) => x.planKey === planKey)) || plans.find((x) => x.planKey === "lt") || plans[0];
  const priceCents = p?.priceCents ?? 2700;
  const checkout = p?.checkoutUrl && p.checkoutUrl !== "#" ? p.checkoutUrl : "#";
  return { plan: p, priceCents, checkout };
}

function BlockView({ block, ctx }: { block: Block; ctx: Ctx }) {
  const { NAVY, GOLD } = ctx.theme;

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

  switch (block.type) {
    case "hero": {
      const p = block.props;
      const { priceCents, checkout } = planFor(ctx.plans, "lt");
      const heroImg = ctx.heroImg;
      const heroText = (
        <div style={{ flex: heroImg ? "1 1 380px" : "1 1 auto", minWidth: 280, maxWidth: heroImg ? 560 : "100%" }}>
          {p.badge && (
            <div style={{ display: "inline-block", border: `1px solid ${GOLD}`, color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 999, marginBottom: 28 }}>
              {p.badge}
            </div>
          )}
          <h1 style={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, margin: "0 0 20px" }}>
            {p.title}
            {p.highlight && (<><br /><span style={{ color: GOLD }}>{p.highlight}</span></>)}
          </h1>
          {p.subtitle && <p style={{ fontSize: 19, lineHeight: 1.5, color: MUTED, margin: "0 0 32px", maxWidth: 560 }}>{p.subtitle}</p>}
          <a href={checkout} style={ctaStyle}>
            {p.ctaLabel}
            {formatBRL(priceCents)}
          </a>
          {p.note && <div style={{ fontSize: 13, color: MUTED, marginTop: 14 }}>{p.note}</div>}
        </div>
      );
      return (
        <section style={{ maxWidth: heroImg ? 1040 : 720, margin: "0 auto", padding: "72px 24px 56px", display: "flex", gap: 48, alignItems: "center", justifyContent: "center", flexWrap: "wrap", textAlign: heroImg ? "left" : "center" }}>
          {heroText}
          {heroImg && (
            <div style={{ flex: "1 1 320px", minWidth: 260, maxWidth: 420 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImg} alt={ctx.brandName} style={{ width: "100%", borderRadius: 18, display: "block", border: `1px solid ${GOLD}59`, boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }} />
            </div>
          )}
        </section>
      );
    }

    case "bullets": {
      const p = block.props;
      if (p.variant === "pains") {
        return (
          <section style={{ background: "#0a1220", padding: "56px 24px" }}>
            <div style={{ maxWidth: 880, margin: "0 auto" }}>
              {p.title && <h2 style={sectionTitle}>{p.title}</h2>}
              <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginTop: 36 }}>
                {p.items.map((it, i) => (
                  <div key={i} style={cardStyle}>
                    {it.title && <h3 style={{ color: GOLD, fontSize: 18, fontWeight: 700, margin: "0 0 10px" }}>{it.title}</h3>}
                    <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.55, margin: 0 }}>{it.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }
      // checklist / plain
      return (
        <section style={{ background: "#0a1220", padding: "56px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {p.title && <h2 style={sectionTitle}>{p.title}</h2>}
            <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0", display: "grid", gap: 14 }}>
              {p.items.map((it, i) => (
                <li key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {p.variant === "checklist" && <span style={{ color: GOLD, fontWeight: 800, fontSize: 18, flexShrink: 0 }}>✓</span>}
                  <span style={{ fontSize: 16, lineHeight: 1.5, color: INK }}>
                    {it.title ? <strong>{it.title}: </strong> : null}
                    {it.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    }

    case "reframe": {
      const p = block.props;
      return (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <h2 style={{ ...sectionTitle, fontSize: 30 }}>
            {p.title}
            {p.highlight && (<><br /><span style={{ color: GOLD }}>{p.highlight}</span></>)}
          </h2>
          {p.body && <p style={{ fontSize: 18, lineHeight: 1.6, color: MUTED, marginTop: 20 }}>{p.body}</p>}
        </section>
      );
    }

    case "offer": {
      const p = block.props;
      const { plan, priceCents, checkout } = planFor(ctx.plans, p.planKey);
      return (
        <section style={{ maxWidth: 560, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          {p.title && <h2 style={sectionTitle}>{p.title}</h2>}
          <div style={{ background: "#0f1d31", border: `2px solid ${GOLD}`, borderRadius: 16, padding: "36px 28px", marginTop: 32 }}>
            <div style={{ fontSize: 15, color: MUTED, marginBottom: 6 }}>{plan?.label ?? ctx.brandName}</div>
            <div style={{ fontSize: 52, fontWeight: 800, color: GOLD, lineHeight: 1 }}>{formatBRL(priceCents)}</div>
            {p.subtitle && <div style={{ fontSize: 14, color: MUTED, margin: "10px 0 24px" }}>{p.subtitle}</div>}
            <a href={checkout} style={{ ...ctaStyle, display: "block", width: "100%", boxSizing: "border-box" }}>COMEÇAR AGORA</a>
          </div>
          {checkout === "#" && (
            <p style={{ fontSize: 12, color: MUTED, marginTop: 16, opacity: 0.7 }}>
              (checkout em configuração — defina a oferta Hotmart no WorkspacePlan)
            </p>
          )}
        </section>
      );
    }

    case "guarantee": {
      return (
        <section style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px 56px", textAlign: "center" }}>
          <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "18px 22px" }}>
            {block.props.text}
          </div>
        </section>
      );
    }

    case "cta": {
      const p = block.props;
      const { priceCents, checkout } = planFor(ctx.plans, p.planKey);
      return (
        <section style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
          <a href={checkout} style={ctaStyle}>{p.label}{p.planKey ? ` — ${formatBRL(priceCents)}` : ""}</a>
          {p.note && <div style={{ fontSize: 13, color: MUTED, marginTop: 14 }}>{p.note}</div>}
        </section>
      );
    }

    case "socialProof": {
      const p = block.props;
      const items = ctx.socialProof;
      if (items.length === 0) return null;
      return (
        <section style={{ background: "#0a1220", padding: "56px 24px" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            {p.title && <h2 style={sectionTitle}>{p.title}</h2>}
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 32 }}>
              {items.map((it, i) => (
                <figure key={i} style={{ margin: 0, ...cardStyle, padding: 0, overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.imageUrl} alt={it.alt} style={{ width: "100%", display: "block" }} />
                  {(it.name || it.caption) && (
                    <figcaption style={{ padding: "12px 14px" }}>
                      {it.name && <div style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>{it.name}</div>}
                      {it.caption && <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.5 }}>{it.caption}</div>}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "faq": {
      const p = block.props;
      if (p.items.length === 0) return null;
      return (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px" }}>
          {p.title && <h2 style={sectionTitle}>{p.title}</h2>}
          <div style={{ marginTop: 28, display: "grid", gap: 14 }}>
            {p.items.map((it, i) => (
              <div key={i} style={cardStyle}>
                <h3 style={{ color: INK, fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>{it.q}</h3>
                <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.55, margin: 0 }}>{it.a}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "videoSales": {
      const p = block.props;
      return (
        <section style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px", textAlign: "center" }}>
          {p.title && <h2 style={{ ...sectionTitle, marginBottom: 28 }}>{p.title}</h2>}
          <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 14, overflow: "hidden", border: `1px solid ${GOLD}33` }}>
            <iframe
              src={p.videoUrl}
              title={p.title || "Vídeo"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
        </section>
      );
    }

    case "priceComparison": {
      const p = block.props;
      if (p.columns.length === 0) return null;
      return (
        <section style={{ maxWidth: 980, margin: "0 auto", padding: "56px 24px" }}>
          {p.title && <h2 style={sectionTitle}>{p.title}</h2>}
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 32 }}>
            {p.columns.map((c, i) => (
              <div key={i} style={{ ...cardStyle, textAlign: "center", border: c.highlight ? `2px solid ${GOLD}` : cardStyle.border }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{c.label}</div>
                {c.price && <div style={{ fontSize: 32, fontWeight: 800, color: GOLD, margin: "10px 0" }}>{c.price}</div>}
                <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "grid", gap: 8, textAlign: "left" }}>
                  {c.items.map((it, j) => (
                    <li key={j} style={{ color: MUTED, fontSize: 14, lineHeight: 1.5 }}>• {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "testimonials": {
      const p = block.props;
      if (p.items.length === 0) return null;
      return (
        <section style={{ background: "#0a1220", padding: "56px 24px" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            {p.title && <h2 style={sectionTitle}>{p.title}</h2>}
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 32 }}>
              {p.items.map((it, i) => (
                <div key={i} style={cardStyle}>
                  <p style={{ color: INK, fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" }}>“{it.text}”</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {it.avatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.avatar} alt={it.name} style={{ width: 36, height: 36, borderRadius: 999, objectFit: "cover" }} />
                    )}
                    <span style={{ color: GOLD, fontWeight: 700, fontSize: 14 }}>{it.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
