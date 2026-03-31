"use client";

const cardStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 20,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: "var(--text-primary)",
  marginBottom: 16,
};

const badgeActive: React.CSSProperties = {
  display: "inline-block",
  fontSize: 12,
  fontWeight: 600,
  padding: "2px 10px",
  borderRadius: 999,
  background: "rgba(72, 187, 120, 0.15)",
  color: "#48bb78",
};

const tagPopular: React.CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: 999,
  background: "var(--accent)",
  color: "#fff",
  marginLeft: 8,
  verticalAlign: "middle",
};

const linkBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 16px",
  borderRadius: 10,
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  color: "var(--text-primary)",
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  transition: "background 0.15s, border-color 0.15s",
};

const testBtnStyle: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 8,
  border: "0.5px solid var(--border-default)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
};

const checkoutLinks = [
  { label: "Hotmart URL", url: "https://pay.hotmart.com/W98444156P" },
  { label: "Kiwify URL", url: "https://pay.kiwify.com.br/longetividade" },
];

const plans = [
  { name: "Básico", price: "R$37,00" },
  { name: "Completo", price: "R$67,00", tag: "MAIS ESCOLHIDO" },
  { name: "VIP", price: "R$97,00" },
];

const trackingItems = [
  { name: "Meta Pixel", status: "Ativo" },
  { name: "Google Analytics 4", status: "Ativo" },
];

const externalLinks = [
  { label: "Meta Ads Manager", url: "https://business.facebook.com/adsmanager", icon: "📊" },
  { label: "Google Analytics", url: "https://analytics.google.com", icon: "📈" },
  { label: "Railway Dashboard", url: "https://railway.app/dashboard", icon: "🚂" },
  { label: "GitHub Repo", url: "https://github.com", icon: "🐙" },
  { label: "Hotmart Painel", url: "https://app.hotmart.com/products/manage/7474328", icon: "🔥" },
  { label: "Kiwify Painel", url: "https://dashboard.kiwify.com/products", icon: "🥝" },
];

const aboutItems = [
  { label: "Versão", value: "v1.0.0" },
  { label: "Domínio", value: "longetividade.com.br" },
  { label: "Plataforma", value: "Railway" },
  { label: "Stack", value: "Next.js 15 + Prisma + PostgreSQL" },
];

export default function ConfiguracoesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 820 }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        Configurações
      </h1>

      {/* 1. Links de Checkout */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Links de Checkout</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {checkoutLinks.map((link) => (
            <div
              key={link.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 2,
                  }}
                >
                  {link.label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--text-primary)",
                    wordBreak: "break-all",
                  }}
                >
                  {link.url}
                </span>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={testBtnStyle}
              >
                Testar
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Precos dos Planos */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Preços dos Planos</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderTop: i > 0 ? "0.5px solid var(--border-default)" : "none",
              }}
            >
              <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
                {plan.name}
                {plan.tag && <span style={tagPopular}>{plan.tag}</span>}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                {plan.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Pixel e Tracking */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Pixel e Tracking</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {trackingItems.map((item) => (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{item.name}</span>
              <span style={badgeActive}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Links Externos Rapidos */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Links Externos Rápidos</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {externalLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={linkBtnStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-card)";
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* 5. Sobre o Projeto */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Sobre o Projeto</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {aboutItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                {item.label}
              </span>
              <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
