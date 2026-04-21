"use client";

import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Landing pages catalog                                              */
/* ------------------------------------------------------------------ */
type LpStatus = "ativa" | "teste" | "draft" | "hub";

type LpItem = {
  slug: string;        // identificador único
  path: string;        // URL pública na LP
  title: string;
  description: string;
  status: LpStatus;
  tag?: string;
  editAssets?: string; // link pra /admin/lp-assets filtrado (futuro)
};

const LPS: LpItem[] = [
  {
    slug: "emagreca-sem-dieta",
    path: "/emagreca-sem-dieta",
    title: "Emagreça Sem Dieta — Método S.E.M",
    description: "LP principal rodando Meta Ads. Galeria rotativa + pricing completa.",
    status: "ativa",
    tag: "Meta Ads ativa",
    editAssets: "/admin/lp-assets",
  },
  {
    slug: "emagreca-sem-dieta-v2",
    path: "/emagreca-sem-dieta-v2",
    title: "Emagreça Sem Dieta — v2 (teste de hero)",
    description: "Hero refatorado: headline com '21 dias', badge pill emerald, padding reduzido, layout 55/45. noindex.",
    status: "teste",
    tag: "A/B test",
  },
  {
    slug: "home",
    path: "/",
    title: "Homepage Longetividade",
    description: "Página raiz do site.",
    status: "ativa",
  },
  {
    slug: "detox-mental",
    path: "/detox-mental",
    title: "Detox Mental",
    description: "LP do produto de detox mental.",
    status: "ativa",
  },
  {
    slug: "jejum-inteligente",
    path: "/jejum-inteligente",
    title: "Jejum Inteligente",
    description: "LP do produto de jejum intermitente.",
    status: "ativa",
  },
  {
    slug: "movimento-vital",
    path: "/movimento-vital",
    title: "Movimento Vital",
    description: "LP do produto de movimento/exercício.",
    status: "ativa",
  },
  {
    slug: "sono-profundo",
    path: "/sono-profundo",
    title: "Sono Profundo",
    description: "LP do produto de sono.",
    status: "ativa",
  },
  {
    slug: "c-instagram",
    path: "/c/instagram",
    title: "LP criativa — Instagram",
    description: "LP curta pra tráfego Instagram stories.",
    status: "ativa",
    tag: "criativa",
  },
];

const STATUS_COLORS: Record<LpStatus, { bg: string; text: string; label: string }> = {
  ativa: { bg: "rgba(16,185,129,0.15)", text: "#34d399", label: "● Ativa" },
  teste: { bg: "rgba(212,169,75,0.15)", text: "#d4a94b", label: "◐ Teste" },
  draft: { bg: "rgba(138,138,138,0.15)", text: "#8a8a8a", label: "○ Draft" },
  hub: { bg: "var(--accent-soft)", text: "var(--accent-text)", label: "hub" },
};

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */
const card: React.CSSProperties = {
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  background: "var(--bg-card)",
  padding: 18,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

export default function LandingPagesHub() {
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
          Landing Pages
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "6px 0 0 0", maxWidth: 700, lineHeight: 1.55 }}>
          Hub central das LPs do site. Edite imagens, galeria de prova social e acompanhe o status (Ativa / Teste / Draft).
        </p>
      </header>

      {/* Atalhos principais */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          <QuickAction
            href="/admin/lp-assets"
            icon="🖼"
            title="LP Assets"
            subtitle="Hero, mockups, avatares — edição de imagens fixas"
          />
          <QuickAction
            href="/admin/lp-social-proof"
            icon="⭐"
            title="Galeria de Prova Social"
            subtitle="3 linhas rotativas — fotos, prints WhatsApp, depoimentos"
          />
        </div>
      </section>

      {/* Lista de LPs */}
      <section>
        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Landing pages do site ({LPS.length})
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {LPS.map((lp) => (
            <LpCard key={lp.slug} lp={lp} />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QuickAction                                                         */
/* ------------------------------------------------------------------ */
function QuickAction({ href, icon, title, subtitle }: { href: string; icon: string; title: string; subtitle: string }) {
  return (
    <Link
      href={href}
      style={{
        ...card,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        textDecoration: "none",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.background = "var(--bg-card-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.background = "var(--bg-card)";
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: "var(--accent-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{subtitle}</div>
      </div>
      <span style={{ color: "var(--text-muted)", fontSize: 20 }}>→</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  LpCard                                                              */
/* ------------------------------------------------------------------ */
function LpCard({ lp }: { lp: LpItem }) {
  const status = STATUS_COLORS[lp.status];
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "start", gap: 10, justifyContent: "space-between" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{lp.title}</div>
          <code
            style={{
              display: "inline-block",
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "monospace",
              marginTop: 3,
            }}
          >
            {lp.path}
          </code>
        </div>
        <span
          style={{
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 999,
            background: status.bg,
            color: status.text,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {status.label}
        </span>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
        {lp.description}
      </p>

      {lp.tag && (
        <div>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--shimmer)",
              color: "var(--text-muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {lp.tag}
          </span>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
        <a
          href={lp.path}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "7px 10px",
            borderRadius: 6,
            border: "1px solid var(--accent)",
            background: "var(--accent)",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Abrir LP ↗
        </a>
        {lp.editAssets && (
          <Link
            href={lp.editAssets}
            style={{
              padding: "7px 12px",
              borderRadius: 6,
              border: "1px solid var(--border-default)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Editar 🖼
          </Link>
        )}
      </div>
    </div>
  );
}
