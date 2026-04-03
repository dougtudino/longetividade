"use client";
import { useEffect, useState } from "react";

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid var(--border-default)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 4,
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--text-muted)",
  marginTop: 4,
};

const saveBtnStyle: React.CSSProperties = {
  padding: "10px 24px",
  borderRadius: 10,
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
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

const badgePending: React.CSSProperties = {
  ...badgeActive,
  background: "rgba(237, 137, 54, 0.15)",
  color: "#ed8936",
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
  transition: "background 0.15s",
};

const SETTINGS_KEYS = [
  { key: "HOTMART_WEBHOOK_SECRET", label: "Hotmart Webhook Secret (hottok)", hint: "Copie do painel Hotmart > Ferramentas > Webhooks", sensitive: true },
  { key: "HOTMART_OFFER_VIP", label: "Hotmart Offer ID — VIP", hint: "Codigo da oferta VIP (padrao: h84hak4e)" },
  { key: "HOTMART_OFFER_COMPLETO", label: "Hotmart Offer ID — Completo", hint: "Codigo da oferta Completo (padrao: uzvdkzkf)" },
  { key: "HOTMART_OFFER_BASICO", label: "Hotmart Offer ID — Basico", hint: "Codigo da oferta Basico (padrao: zxq5tgew)" },
];

const plans = [
  { name: "Basico", price: "R$37,00", offerId: "zxq5tgew" },
  { name: "Completo", price: "R$67,00", tag: "MAIS ESCOLHIDO", offerId: "uzvdkzkf" },
  { name: "VIP", price: "R$97,00", offerId: "h84hak4e" },
];

const externalLinks = [
  { label: "Hotmart Painel", url: "https://app.hotmart.com/products/manage/7474328", icon: "🔥" },
  { label: "Hotmart Webhooks", url: "https://app.hotmart.com/tools/webhook", icon: "🔗" },
  { label: "Railway Dashboard", url: "https://railway.app/dashboard", icon: "🚂" },
  { label: "GitHub Repo", url: "https://github.com/dougtudino/longetividade", icon: "🐙" },
  { label: "Meta Ads Manager", url: "https://business.facebook.com/adsmanager", icon: "📊" },
  { label: "Google Analytics", url: "https://analytics.google.com", icon: "📈" },
];

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slots, setSlots] = useState<{ total: number; used: number; available: number } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then(setSettings).catch(() => {});
    fetch("/api/app/slots").then((r) => r.json()).then(setSlots).catch(() => {});
  }, []);

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const webhookUrl = "https://www.longetividade.com.br/api/webhooks/hotmart";
  const hasSecret = !!settings.HOTMART_WEBHOOK_SECRET;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 820 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
        Configuracoes
      </h1>

      {/* 1. Webhook Hotmart */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Webhook Hotmart</h2>
        <div style={{ marginBottom: 16 }}>
          <span style={labelStyle}>URL do Webhook (copie e cole no Hotmart)</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={webhookUrl}
              readOnly
              style={{ ...inputStyle, background: "var(--bg-card)", cursor: "text" }}
            />
            <button
              onClick={() => navigator.clipboard.writeText(webhookUrl)}
              style={{ ...saveBtnStyle, padding: "10px 14px", whiteSpace: "nowrap" }}
            >
              Copiar
            </button>
          </div>
          <p style={hintStyle}>Cole esta URL em Hotmart &gt; Produto &gt; Ferramentas &gt; Webhooks</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: "var(--text-primary)" }}>Status:</span>
          <span style={hasSecret ? badgeActive : badgePending}>
            {hasSecret ? "Configurado" : "Pendente"}
          </span>
        </div>

        {SETTINGS_KEYS.map((s) => (
          <div key={s.key} style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{s.label}</label>
            <input
              type={s.sensitive ? "password" : "text"}
              value={settings[s.key] ?? ""}
              onChange={(e) => updateSetting(s.key, e.target.value)}
              placeholder={s.hint}
              style={inputStyle}
            />
            <p style={hintStyle}>{s.hint}</p>
          </div>
        ))}

        <button onClick={saveSettings} disabled={saving} style={saveBtnStyle}>
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Configuracoes"}
        </button>
      </div>

      {/* 2. Vagas VIP */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Vagas App VIP</h2>
        {slots ? (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: 32, fontWeight: 800, color: "var(--accent)" }}>{slots.available}</span>
              <span style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 8 }}>vagas restantes</span>
            </div>
            <div>
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                {slots.used} usadas de {slots.total} totais
              </span>
            </div>
            <div style={{ width: "100%", height: 8, borderRadius: 4, background: "var(--bg-secondary)" }}>
              <div style={{
                height: "100%",
                borderRadius: 4,
                background: slots.available <= 20 ? "#ed8936" : "var(--accent)",
                width: `${(slots.used / slots.total) * 100}%`,
                transition: "width 0.3s",
              }} />
            </div>
          </div>
        ) : (
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Carregando...</span>
        )}
      </div>

      {/* 3. Planos e Ofertas */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Planos Hotmart</h2>
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{plan.offerId}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{plan.price}</span>
                <a
                  href={`https://pay.hotmart.com/H105141835Q?offerId=${plan.offerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}
                >
                  Testar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Links Externos */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Links Rapidos</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {externalLinks.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={linkBtnStyle}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* 5. Sobre */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>Sobre o Projeto</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Versao", value: "v2.0.0" },
            { label: "Dominio", value: "longetividade.com.br" },
            { label: "Plataforma", value: "Railway" },
            { label: "Stack", value: "Next.js 16 + Prisma 7 + PostgreSQL" },
            { label: "Checkout", value: "Hotmart (3 ofertas)" },
            { label: "App VIP", value: "/app — PWA com 7 telas" },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: 14, color: "var(--text-primary)" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
