"use client";
import { useEffect, useState } from "react";
import PageHelp from "@/components/admin/PageHelp";

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
  { key: "HOTMART_CLIENT_ID", label: "Hotmart Client ID (Sales API)", hint: "developers.hotmart.com → Minhas credenciais → Client ID", sensitive: false },
  { key: "HOTMART_CLIENT_SECRET", label: "Hotmart Client Secret (Sales API)", hint: "developers.hotmart.com → Minhas credenciais → Client Secret", sensitive: true },
  { key: "HOTMART_OFFER_VIP", label: "Hotmart Offer ID — VIP", hint: "Codigo da oferta VIP (padrao: h84hak4e)" },
  { key: "HOTMART_OFFER_COMPLETO", label: "Hotmart Offer ID — Completo", hint: "Codigo da oferta Completo (padrao: uzvdkzkf)" },
  { key: "HOTMART_OFFER_BASICO", label: "Hotmart Offer ID — Basico", hint: "Codigo da oferta Basico (padrao: zxq5tgew)" },
];

const META_KEYS = [
  {
    key: "META_ADS_ACCOUNT_ID",
    label: "Meta Ads Account ID",
    hint: "Apenas numeros, sem 'act_'. Ex: 837047967961012 (CA01- BM Barbara Oliveira)",
    sensitive: false,
    defaultValue: "837047967961012",
  },
  {
    key: "META_ACCESS_TOKEN",
    label: "Meta Access Token",
    hint: "Token Graph API com ads_read + ads_management + read_insights. Compartilhado entre Marketing API, Pixel e CAPI. Gere em developers.facebook.com/tools/explorer ou via Marketing API page",
    sensitive: true,
  },
  {
    key: "NEXT_PUBLIC_META_PIXEL_ID",
    label: "Meta Pixel ID",
    hint: "ID do dataset 'Dados de Longetividade' (criado em 2026-04-11)",
    sensitive: false,
    defaultValue: "953736244279938",
  },
  {
    key: "META_PAGE_ID",
    label: "Meta Page ID (Facebook Page)",
    hint: "Graph Page ID da Longetividade: 357054767494527 (apenas numeros). Necessario pra Luna postar e Gaia criar ads.",
    sensitive: false,
    defaultValue: "61562570061004",
  },
] as const;

const GOOGLE_KEYS = [
  {
    key: "GOOGLE_CLIENT_ID",
    label: "Google OAuth Client ID",
    hint: "console.cloud.google.com → Credentials → OAuth 2.0 Client ID",
    sensitive: false,
  },
  {
    key: "GOOGLE_CLIENT_SECRET",
    label: "Google OAuth Client Secret",
    hint: "Comeca com GOCSPX-... Nunca compartilhe publicamente.",
    sensitive: true,
  },
] as const;

const SOCIAL_KEYS = [
  {
    key: "SOCIAL_INSTAGRAM_URL",
    label: "Instagram — URL do perfil",
    hint: "Ex: https://www.instagram.com/longetividade/",
    sensitive: false,
  },
  {
    key: "SOCIAL_FACEBOOK_URL",
    label: "Facebook — URL da Page",
    hint: "Ex: https://www.facebook.com/61562570061004",
    sensitive: false,
  },
  {
    key: "INSTAGRAM_ACCOUNT_ID",
    label: "Instagram Business Account ID",
    hint: "Auto-descoberto via /api/admin/social/discover-ig. Ou cole manualmente.",
    sensitive: false,
  },
  {
    key: "SOCIAL_PAGE_TOKEN",
    label: "Page Access Token (pra auto-posting)",
    hint: "Token com pages_manage_posts + instagram_content_publish. Necessario pra Luna postar sozinha.",
    sensitive: true,
  },
] as const;

// Fonte unica de precos: src/config/plans.ts (nao hardcodar aqui)
import { PLAN_SUMMARY, HOTMART_CHECKOUT_URL } from "@/config/plans";
const plans = PLAN_SUMMARY.map((p) => ({
  ...p,
  tag: p.highlighted ? "MAIS ESCOLHIDO" : undefined,
}));

const externalLinks = [
  { label: "Hotmart Painel", url: "https://app.hotmart.com/products/manage/7474328", icon: "🔥" },
  { label: "Hotmart Webhooks", url: "https://app.hotmart.com/tools/webhook", icon: "🔗" },
  { label: "Railway Dashboard", url: "https://railway.app/dashboard", icon: "🚂" },
  { label: "GitHub Repo", url: "https://github.com/dougtudino/longetividade", icon: "🐙" },
  { label: "Meta Ads Manager", url: "https://business.facebook.com/adsmanager", icon: "📊" },
  { label: "Google Analytics", url: "https://analytics.google.com", icon: "📈" },
];

type MetaTestResult = {
  ok: boolean;
  accountId?: string;
  accountName?: string;
  status?: string;
  currency?: string | null;
  error?: string;
};

type BrevoTestResult = {
  ok: boolean;
  email?: string | null;
  name?: string | null;
  company?: string | null;
  sendCredits?: number;
  error?: string;
};

type ResetPreview = {
  ok: boolean;
  counts: Record<string, number>;
};

type ResetResult = {
  ok: boolean;
  mode?: string;
  deleted?: Record<string, number>;
  before?: Record<string, number>;
  after?: Record<string, number>;
  errors?: string[];
  error?: string;
};

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slots, setSlots] = useState<{ total: number; used: number; available: number } | null>(null);
  const [metaTest, setMetaTest] = useState<MetaTestResult | null>(null);
  const [testingMeta, setTestingMeta] = useState(false);
  const [brevoTest, setBrevoTest] = useState<BrevoTestResult | null>(null);
  const [testingBrevo, setTestingBrevo] = useState(false);
  const [resetPreview, setResetPreview] = useState<ResetPreview | null>(null);
  const [resetConfirm, setResetConfirm] = useState("");
  const [preserveSynced, setPreserveSynced] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(async (data: Record<string, string>) => {
        const next = { ...data };
        const toPersist: Record<string, string> = {};

        // Migracao silenciosa: META_ADS_ACCESS_TOKEN (legado) -> META_ACCESS_TOKEN (canonico)
        if (!next.META_ACCESS_TOKEN && next.META_ADS_ACCESS_TOKEN) {
          next.META_ACCESS_TOKEN = next.META_ADS_ACCESS_TOKEN;
          toPersist.META_ACCESS_TOKEN = next.META_ADS_ACCESS_TOKEN;
        }

        for (const m of META_KEYS) {
          if (!next[m.key] && "defaultValue" in m && m.defaultValue) {
            next[m.key] = m.defaultValue;
            toPersist[m.key] = m.defaultValue;
          }
        }
        setSettings(next);

        // Auto-persiste defaults nao-sensiveis (account ID, pixel ID) ja conhecidos
        if (Object.keys(toPersist).length > 0) {
          try {
            await fetch("/api/admin/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(toPersist),
            });
          } catch {
            /* silently fail */
          }
        }
      })
      .catch(() => {});
    fetch("/api/app/slots").then((r) => r.json()).then(setSlots).catch(() => {});
  }, []);

  async function testMetaConnection() {
    setTestingMeta(true);
    setMetaTest(null);
    try {
      const res = await fetch("/api/admin/test-meta-connection", { cache: "no-store" });
      const data = (await res.json()) as MetaTestResult;
      setMetaTest(data);
    } catch (e) {
      setMetaTest({ ok: false, error: (e as Error).message });
    } finally {
      setTestingMeta(false);
    }
  }

  async function testBrevoConnection() {
    setTestingBrevo(true);
    setBrevoTest(null);
    try {
      const res = await fetch("/api/admin/test-brevo", { cache: "no-store" });
      const data = (await res.json()) as BrevoTestResult;
      setBrevoTest(data);
    } catch (e) {
      setBrevoTest({ ok: false, error: (e as Error).message });
    } finally {
      setTestingBrevo(false);
    }
  }

  async function loadResetPreview() {
    try {
      const res = await fetch("/api/admin/reset-test-data");
      const data = (await res.json()) as ResetPreview;
      setResetPreview(data);
    } catch {
      /* silent */
    }
  }

  async function executeReset() {
    if (resetConfirm !== "DELETAR TUDO") return;
    setResetting(true);
    setResetResult(null);
    try {
      const res = await fetch("/api/admin/reset-test-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmPhrase: "DELETAR TUDO",
          preserveSynced,
        }),
      });
      const data = (await res.json()) as ResetResult;
      setResetResult(data);
      if (data.ok) {
        setResetConfirm("");
        await loadResetPreview();
      }
    } catch (e) {
      setResetResult({ ok: false, error: (e as Error).message });
    } finally {
      setResetting(false);
    }
  }

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

      <PageHelp
        pageId="configuracoes"
        agent={{ icon: "⚙️", name: "Doug/Bárbara", role: "Admin setup" }}
        title="Credenciais e configurações de integrações"
        quickActions={[
          { label: "Salvar", description: "Persiste valores no AppSetting. Trim automático + cache invalidation" },
          { label: "Testar Conexão (Meta)", description: "Valida META_ACCESS_TOKEN + account ID contra Graph API" },
          { label: "Testar Conexão (Brevo)", description: "Valida BREVO_API_KEY chamando /v3/account" },
        ]}
      >
        <p>
          Todas as integrações externas (Hotmart, Meta, Brevo) ficam aqui. Valores salvos
          vão pra tabela <code>AppSetting</code> no banco — podem ser lidos por qualquer
          endpoint via <code>getSetting()</code> sem redeploy.
        </p>
        <p>
          <strong>Token Meta:</strong> o nome canônico é <code>META_ACCESS_TOKEN</code>.
          Prioridade: env Railway primeiro (System User token não expira), AppSetting como
          fallback. Use <code>META_ACCESS_TOKEN</code> pra Marketing API, Pixel e CAPI
          (futuro).
        </p>
      </PageHelp>

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

      {/* 1.5 Meta Ads / Business Manager */}
      <div id="meta" style={cardStyle}>
        <h2 style={sectionTitle}>Meta Business / Ads API</h2>
        <p style={{ ...hintStyle, marginTop: 0, marginBottom: 16 }}>
          Configure as credenciais da BM da Barbara para o painel ler ROAS, gasto
          e conversoes direto da Meta Ads API. O Account ID ja vem preenchido com
          a conta <strong>CA01- BM Barbara Oliveira</strong>.
        </p>

        {META_KEYS.map((s) => (
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

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={saveSettings} disabled={saving} style={saveBtnStyle}>
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Meta"}
          </button>
          <button
            onClick={testMetaConnection}
            disabled={testingMeta || !settings.META_ADS_ACCESS_TOKEN}
            style={{
              ...saveBtnStyle,
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "0.5px solid var(--border-default)",
              opacity: testingMeta || !settings.META_ADS_ACCESS_TOKEN ? 0.6 : 1,
            }}
          >
            {testingMeta ? "Testando..." : "Testar Conexao"}
          </button>

          {metaTest && (
            <span style={metaTest.ok ? badgeActive : badgePending}>
              {metaTest.ok
                ? `OK — ${metaTest.accountName} (${metaTest.status})`
                : `Erro: ${metaTest.error}`}
            </span>
          )}
        </div>
      </div>

      {/* 1.6 Brevo */}
      <div id="brevo" style={cardStyle}>
        <h2 style={sectionTitle}>Brevo (Email Marketing)</h2>
        <p style={{ ...hintStyle, marginTop: 0, marginBottom: 16 }}>
          Chave da API Brevo usada para enviar emails de entrega de ebook,
          confirmacao e listas. Crie em <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>app.brevo.com/settings/keys/api</a>.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>BREVO_API_KEY</label>
          <input
            type="password"
            value={settings.BREVO_API_KEY ?? ""}
            onChange={(e) => updateSetting("BREVO_API_KEY", e.target.value)}
            placeholder="xkeysib-..."
            style={inputStyle}
          />
          <p style={hintStyle}>Comeca com xkeysib-... — gere uma chave SMTP/API com permissao de envio.</p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={saveSettings} disabled={saving} style={saveBtnStyle}>
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Brevo"}
          </button>
          <button
            onClick={testBrevoConnection}
            disabled={testingBrevo || !settings.BREVO_API_KEY}
            style={{
              ...saveBtnStyle,
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "0.5px solid var(--border-default)",
              opacity: testingBrevo || !settings.BREVO_API_KEY ? 0.6 : 1,
            }}
          >
            {testingBrevo ? "Testando..." : "Testar Conexao"}
          </button>

          {brevoTest && (
            <span style={brevoTest.ok ? badgeActive : badgePending}>
              {brevoTest.ok
                ? `OK — ${brevoTest.email ?? "conta conectada"}${brevoTest.sendCredits ? ` · ${brevoTest.sendCredits} creditos` : ""}`
                : `Erro: ${brevoTest.error}`}
            </span>
          )}
        </div>
      </div>

      {/* 1.7 Blotato */}
      <BlotatoSection />

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
                  href={`https://pay.hotmart.com/H105141835Q?off=${plan.offerId}`}
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

      {/* 4. Google OAuth */}
      <div id="google" style={cardStyle}>
        <h2 style={sectionTitle}>Google OAuth (Login com Google)</h2>
        <p style={{ ...hintStyle, marginTop: 0, marginBottom: 16 }}>
          Credenciais do Google Cloud Console pra login com Google no app e no painel admin.
          Gere em <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>console.cloud.google.com</a>.
        </p>

        {GOOGLE_KEYS.map((s) => (
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

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={saveSettings} disabled={saving} style={saveBtnStyle}>
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Google"}
          </button>
          <span style={settings.GOOGLE_CLIENT_ID ? badgeActive : badgePending}>
            {settings.GOOGLE_CLIENT_ID ? "Configurado" : "Pendente"}
          </span>
        </div>
      </div>

      {/* 4.2 Redes Sociais */}
      <div id="social" style={cardStyle}>
        <h2 style={sectionTitle}>Redes Sociais (Luna auto-posting)</h2>
        <p style={{ ...hintStyle, marginTop: 0, marginBottom: 16 }}>
          Configure as contas de Instagram e Facebook pra Luna postar automaticamente.
          O <strong>Page Token</strong> e necessario pra auto-posting (requer Meta App Review).
        </p>

        {SOCIAL_KEYS.map((s) => (
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

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={saveSettings} disabled={saving} style={saveBtnStyle}>
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Redes Sociais"}
          </button>
          <span style={settings.SOCIAL_PAGE_TOKEN ? badgeActive : badgePending}>
            {settings.SOCIAL_PAGE_TOKEN ? "Auto-posting configurado" : "Auto-posting pendente"}
          </span>
        </div>
      </div>

      {/* 4.5 Danger Zone — Reset Banco */}
      <div
        style={{
          ...cardStyle,
          border: "0.5px solid rgba(196,120,122,0.4)",
          background: "linear-gradient(135deg, rgba(196,120,122,0.06), rgba(196,120,122,0.02))",
        }}
      >
        <button
          onClick={() => {
            setShowDangerZone(!showDangerZone);
            if (!showDangerZone && !resetPreview) loadResetPreview();
          }}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
          }}
        >
          <div>
            <h2 style={{ ...sectionTitle, color: "#C4787A", margin: 0 }}>
              ⚠️ Danger Zone · Zerar dados de teste
            </h2>
            <p style={{ ...hintStyle, marginTop: 4 }}>
              Deleta Orders, AbandonedCheckout, Leads, AppUsers, PageViews, MayaMessages,
              Campaigns. Preserva: AdminUser, AppSetting, Knowledge base da Gaia, Coleções de criativos.
            </p>
          </div>
          <span style={{ fontSize: 20, color: "#C4787A", transform: showDangerZone ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
            ⌄
          </span>
        </button>

        {showDangerZone && (
          <div style={{ marginTop: 20 }}>
            {resetPreview && (
              <div
                style={{
                  padding: 14,
                  background: "var(--bg-secondary)",
                  borderRadius: 10,
                  marginBottom: 16,
                  fontSize: 12,
                  fontFamily: "monospace",
                  lineHeight: 1.8,
                }}
              >
                <strong style={{ color: "#C4787A" }}>Atualmente no banco:</strong>
                <div style={{ marginTop: 8 }}>
                  {Object.entries(resetPreview.counts).map(([key, count]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{key}</span>
                      <strong style={{ color: count > 0 ? "#C4787A" : "var(--text-muted)" }}>{count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 16,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={preserveSynced}
                onChange={(e) => setPreserveSynced(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <span style={{ color: "var(--text-secondary)" }}>
                Preservar vendas com <code>hotmartTransactionId</code> (vendas sincronizadas via Sales API)
              </span>
            </label>

            <div style={{ marginBottom: 14 }}>
              <label style={{ ...labelStyle, color: "#C4787A" }}>
                Pra confirmar, digite: <strong>DELETAR TUDO</strong>
              </label>
              <input
                type="text"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="Digite DELETAR TUDO"
                style={{
                  ...inputStyle,
                  borderColor:
                    resetConfirm === "DELETAR TUDO" ? "#C4787A" : "var(--border-default)",
                }}
              />
            </div>

            <button
              onClick={executeReset}
              disabled={resetConfirm !== "DELETAR TUDO" || resetting}
              style={{
                ...saveBtnStyle,
                background: resetConfirm === "DELETAR TUDO" ? "#C4787A" : "var(--border-default)",
                cursor:
                  resetConfirm === "DELETAR TUDO" && !resetting ? "pointer" : "not-allowed",
              }}
            >
              {resetting ? "Deletando..." : "🔥 DELETAR DADOS DE TESTE AGORA"}
            </button>

            {resetResult && (
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 10,
                  background: resetResult.ok
                    ? "rgba(107,158,107,0.12)"
                    : "rgba(196,120,122,0.12)",
                  border: `0.5px solid ${
                    resetResult.ok ? "rgba(107,158,107,0.4)" : "rgba(196,120,122,0.4)"
                  }`,
                  fontSize: 12,
                  fontFamily: "monospace",
                  lineHeight: 1.8,
                }}
              >
                {resetResult.ok ? (
                  <>
                    <strong style={{ color: "#6B9E6B" }}>
                      ✓ Reset completo ({resetResult.mode})
                    </strong>
                    <div style={{ marginTop: 8 }}>
                      {Object.entries(resetResult.deleted ?? {}).map(([key, count]) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-secondary)" }}>{key}</span>
                          <strong style={{ color: "#6B9E6B" }}>-{count}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#C4787A" }}>
                    <strong>Erro:</strong> {resetResult.error ?? resetResult.errors?.join(" · ")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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

// ─── Blotato: templates + API key status ──────────────
function BlotatoSection() {
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    type?: string;
    description?: string;
  }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    templateIdSent?: string;
    templateIdNormalized?: string;
    creationId?: string;
    status?: string;
    outputUrl?: string | null;
    error?: string;
  } | null>(null);
  const [debugRaw, setDebugRaw] = useState<unknown>(null);
  const [debuggingRaw, setDebuggingRaw] = useState(false);
  const [history, setHistory] = useState<Array<{
    source: string;
    createdAt: string;
    title: string;
    templateId?: string;
    outputUrl?: string | null;
    mood?: string;
    reasoning?: string;
    ok?: boolean;
  }> | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const r = await fetch("/api/admin/blotato/history");
      const d = await r.json();
      if (d.ok) setHistory(d.items);
    } catch {
      /* silent */
    } finally {
      setLoadingHistory(false);
    }
  }

  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<{
    ok: boolean;
    id?: string;
    status?: string;
    outputUrl?: string | null;
    error?: string;
  } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  async function lookupCreation() {
    if (!lookupId.trim()) return;
    setLookingUp(true);
    setLookupResult(null);
    try {
      const r = await fetch(`/api/admin/blotato/creations/${lookupId.trim()}`);
      const d = await r.json();
      setLookupResult(d);
    } catch (e) {
      setLookupResult({ ok: false, error: (e as Error).message });
    } finally {
      setLookingUp(false);
    }
  }

  async function fetchDebugRaw() {
    setDebuggingRaw(true);
    setDebugRaw(null);
    try {
      const r = await fetch("/api/admin/blotato/debug-raw");
      const d = await r.json();
      setDebugRaw(d);
    } catch (e) {
      setDebugRaw({ ok: false, error: (e as Error).message });
    } finally {
      setDebuggingRaw(false);
    }
  }

  async function testRender() {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await fetch("/api/admin/blotato/test-render", { method: "POST" });
      const d = await r.json();
      setTestResult(d);
    } catch (e) {
      setTestResult({ ok: false, error: (e as Error).message });
    } finally {
      setTesting(false);
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/blotato/templates");
      const d = await r.json();
      if (d.ok) {
        setTemplates(d.templates);
      } else {
        setError(d.error ?? "erro");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function syncNow() {
    setSyncing(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/blotato/templates", { method: "POST" });
      const d = await r.json();
      if (d.ok) {
        setTemplates(d.templates);
        setLastSync(new Date().toLocaleTimeString("pt-BR"));
      } else {
        setError(d.error ?? "erro");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div id="blotato" style={cardStyle}>
      <h2 style={sectionTitle}>Blotato (AI + Publish)</h2>
      <p style={{ ...hintStyle, marginTop: 0, marginBottom: 16 }}>
        Blotato gera arte (imagens/reels) e publica IG+FB via Uma e Quinn. A chave
        fica no Railway como <code>BLOTATO_API_KEY</code>. Aqui você vê o catálogo
        de templates disponíveis no seu plano.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <button
          onClick={syncNow}
          disabled={syncing}
          style={{
            ...saveBtnStyle,
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)",
            opacity: syncing ? 0.6 : 1,
          }}
        >
          {syncing ? "Sincronizando..." : "↻ Sincronizar templates"}
        </button>
        <button
          onClick={testRender}
          disabled={testing || !templates}
          style={{
            ...saveBtnStyle,
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)",
            opacity: testing || !templates ? 0.6 : 1,
          }}
          title="Testa render com o 1o template do cache — isola se o problema eh template, auth, ou prompt"
        >
          {testing ? "Testando..." : "🧪 Testar render (1o template)"}
        </button>
        <button
          onClick={fetchDebugRaw}
          disabled={debuggingRaw}
          style={{
            ...saveBtnStyle,
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)",
            opacity: debuggingRaw ? 0.6 : 1,
          }}
          title="Mostra resposta crua do endpoint /videos/templates do Blotato"
        >
          {debuggingRaw ? "Carregando..." : "🐛 Debug raw"}
        </button>
        <button
          onClick={fetchHistory}
          disabled={loadingHistory}
          style={{
            ...saveBtnStyle,
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)",
            opacity: loadingHistory ? 0.6 : 1,
          }}
          title="Lista todos renders feitos via Uma (creative + social)"
        >
          {loadingHistory ? "Carregando..." : "📜 Histórico de renders"}
        </button>
        {lastSync && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Última sync: {lastSync}
          </span>
        )}
        {templates && (
          <span style={badgeActive}>
            {templates.length} templates disponíveis
          </span>
        )}
      </div>

      {testResult && (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 8,
            background: testResult.ok
              ? "rgba(107,158,107,0.1)"
              : "rgba(196,120,122,0.1)",
            border: `0.5px solid ${testResult.ok ? "rgba(107,158,107,0.3)" : "rgba(196,120,122,0.3)"}`,
            fontSize: 12,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: testResult.ok ? "#6B9E6B" : "#C4787A",
              marginBottom: 6,
            }}
          >
            {testResult.ok ? "✓ Teste render" : "✗ Falha no teste"}
          </div>
          {testResult.templateIdSent && (
            <div style={{ fontFamily: "monospace", color: "var(--text-muted)", marginBottom: 4 }}>
              Template enviado: <code>{testResult.templateIdSent}</code>
            </div>
          )}
          {testResult.templateIdNormalized &&
            testResult.templateIdNormalized !== testResult.templateIdSent && (
              <div style={{ fontFamily: "monospace", color: "var(--text-muted)", marginBottom: 4 }}>
                UUID normalizado: <code>{testResult.templateIdNormalized}</code>
              </div>
            )}
          {testResult.creationId && (
            <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>
              Creation ID: <code>{testResult.creationId}</code> · Status: {testResult.status}
            </div>
          )}
          {testResult.outputUrl && (
            <div style={{ marginTop: 8 }}>
              <a
                href={testResult.outputUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600 }}
              >
                Ver output →
              </a>
            </div>
          )}
          {testResult.error && (
            <div style={{ color: "#C4787A", marginTop: 4, whiteSpace: "pre-wrap" }}>
              {testResult.error}
            </div>
          )}
        </div>
      )}

      {loading && !templates && (
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Carregando catálogo...</div>
      )}
      {error && (
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: "rgba(196,120,122,0.12)",
            border: "0.5px solid rgba(196,120,122,0.3)",
            color: "#C4787A",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}
      <div style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: "var(--bg-secondary)", border: "0.5px solid var(--border-subtle)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Recuperar creation (timeout/debug)
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="f89aa880-e2a1-410d-993f-744987600c8c"
            style={{ ...inputStyle, flex: 1, minWidth: 260, fontFamily: "monospace", fontSize: 12 }}
          />
          <button
            onClick={lookupCreation}
            disabled={lookingUp || !lookupId.trim()}
            style={{
              ...saveBtnStyle,
              padding: "10px 16px",
              opacity: lookingUp || !lookupId.trim() ? 0.6 : 1,
            }}
          >
            {lookingUp ? "Buscando..." : "🔍 Buscar"}
          </button>
        </div>
        {lookupResult && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 6,
              background: lookupResult.ok ? "rgba(107,158,107,0.08)" : "rgba(196,120,122,0.08)",
              border: `0.5px solid ${lookupResult.ok ? "rgba(107,158,107,0.3)" : "rgba(196,120,122,0.3)"}`,
              fontSize: 12,
            }}
          >
            {lookupResult.ok ? (
              <>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  Status: {lookupResult.status}
                </div>
                {lookupResult.outputUrl && (
                  <a
                    href={lookupResult.outputUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent)", wordBreak: "break-all" }}
                  >
                    {lookupResult.outputUrl}
                  </a>
                )}
              </>
            ) : (
              <div style={{ color: "#C4787A" }}>{lookupResult.error}</div>
            )}
          </div>
        )}
      </div>

      {history !== null && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Histórico ({history.length} renders)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflow: "auto" }}>
            {history.map((h, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: "var(--bg-secondary)",
                  border: `0.5px solid ${h.ok === false ? "rgba(212,169,75,0.4)" : "var(--border-subtle)"}`,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                {h.outputUrl && (
                  <div style={{ flexShrink: 0, width: 72, height: 72, borderRadius: 6, overflow: "hidden", background: "#000" }}>
                    {h.outputUrl.endsWith(".mp4") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎬</div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={h.outputUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: h.source === "creative" ? "rgba(99,153,34,0.2)" : h.source === "social-post" ? "rgba(100,150,200,0.2)" : "rgba(212,169,75,0.2)",
                      color: h.source === "creative" ? "#8FBB3F" : h.source === "social-post" ? "#6496C8" : "#D4A94B",
                    }}>
                      {h.source === "orphan-brief" ? "ÓRFÃO" : h.source}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{h.title}</span>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {new Date(h.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {h.templateId && (
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace", marginBottom: 2 }}>
                      {h.templateId.slice(0, 60)}
                    </div>
                  )}
                  {h.mood && (
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      mood: {h.mood}
                    </div>
                  )}
                  {h.reasoning && (
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.4 }}>
                      {h.reasoning.slice(0, 200)}
                    </div>
                  )}
                  {h.outputUrl && (
                    <a
                      href={h.outputUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: "var(--accent)", marginTop: 4, display: "inline-block" }}
                    >
                      Ver output →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {debugRaw !== null && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Raw response de /videos/templates
          </div>
          <pre
            style={{
              fontSize: 11,
              padding: 12,
              borderRadius: 8,
              background: "var(--bg-secondary)",
              border: "0.5px solid var(--border-default)",
              color: "var(--text-primary)",
              maxHeight: 400,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "monospace",
              margin: 0,
            }}
          >
            {JSON.stringify(debugRaw, null, 2)}
          </pre>
        </div>
      )}

      {templates && templates.length > 0 && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}>
            Ver {templates.length} templates (click em cada pra ver inputs esperados)
          </summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, maxHeight: 500, overflow: "auto" }}>
            {templates.map((t) => (
              <TemplateRow key={t.id} template={t} />
            ))}
          </div>
        </details>
      )}

      <p style={{ ...hintStyle, marginTop: 16 }}>
        💡 Roda 1x no setup. Depois só quando Blotato adicionar templates novos
        (raro). Uma usa esse cache quando você gera criativo com IA.
      </p>
    </div>
  );
}

// ─── TemplateRow com inputs expand/collapse ──────────────
function TemplateRow({
  template,
}: {
  template: { id: string; name: string; type?: string; description?: string };
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<unknown>(null);

  async function loadInputs() {
    if (inputs !== null) return;
    setLoading(true);
    try {
      const r = await fetch(
        `/api/admin/blotato/templates/${encodeURIComponent(template.id)}`
      );
      const d = await r.json();
      const remote = d.remote as { inputs?: unknown } | null;
      setInputs(remote?.inputs ?? d.cached ?? null);
    } catch (e) {
      setInputs({ error: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    setOpen(!open);
    if (!open) loadInputs();
  }

  return (
    <div
      style={{
        fontSize: 12,
        padding: "6px 10px",
        borderRadius: 6,
        background: "var(--bg-secondary)",
        color: "var(--text-secondary)",
        border: "0.5px solid var(--border-subtle)",
      }}
    >
      <div
        onClick={toggle}
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {template.name}
            {template.type && (
              <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.6 }}>
                · {template.type}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>
            {template.id.slice(0, 60)}
          </div>
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{open ? "▼" : "▶"}</span>
      </div>
      {open && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "0.5px solid var(--border-subtle)" }}>
          {loading && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Carregando inputs...</div>}
          {!loading && inputs !== null && (
            <pre
              style={{
                fontSize: 10,
                background: "var(--bg-card)",
                padding: 8,
                borderRadius: 4,
                margin: 0,
                maxHeight: 220,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "monospace",
                color: "var(--text-primary)",
              }}
            >
              {JSON.stringify(inputs, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
