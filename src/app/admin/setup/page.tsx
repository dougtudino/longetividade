"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  link?: string;
};

type SetupGuide = {
  id: string;
  emoji: string;
  shortDesc: string;
  details: ReactNode;
  externalLink?: { label: string; url: string };
};

const SITE_URL = "https://longetividade.com.br";

const GUIDES: Record<string, SetupGuide> = {
  email_pro: {
    id: "email_pro",
    emoji: "📧",
    shortDesc: "Email profissional contato@longetividade.com.br",
    details: (
      <>
        <p>
          Para que os emails de venda saiam de <code>contato@longetividade.com.br</code>
          (e nao caiam em spam), e preciso configurar registros DNS no
          <strong> Registro.br</strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>1. Email hosting:</strong> contrate um servico de email
          (Google Workspace, Zoho Mail gratis, ou Brevo Inbox). Recomendado:
          Zoho Mail (gratis para 5 contas).
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>2. DNS no Registro.br:</strong> entre em
          <a href="https://registro.br/painel/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", marginLeft: 4 }}>
            registro.br/painel
          </a>{" "}
          → dominio <code>longetividade.com.br</code> → Editar zona DNS.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Registros tipicos (Zoho):</strong>
        </p>
        <pre
          style={{
            background: "var(--bg-secondary)",
            padding: 12,
            borderRadius: 8,
            fontSize: 11,
            overflowX: "auto",
            marginTop: 8,
          }}
        >
{`MX  10  mx.zoho.com
MX  20  mx2.zoho.com
MX  50  mx3.zoho.com
TXT @   v=spf1 include:zoho.com ~all
TXT @   v=DKIM1; k=rsa; p=...   (gerada pelo Zoho)
TXT _dmarc   v=DMARC1; p=quarantine; rua=mailto:contato@longetividade.com.br`}
        </pre>
        <p style={{ marginTop: 12 }}>
          <strong>3. Validar:</strong> em 1-24h o DNS propaga. Teste enviando
          um email de teste e confira em https://mxtoolbox.com.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>4. Marcar como feito:</strong> quando o email estiver
          funcionando, salve <code>EMAIL_PRO_DNS_OK=true</code> no painel
          de configuracoes manualmente (ou pelo botao abaixo).
        </p>
      </>
    ),
  },
  brevo_key: {
    id: "brevo_key",
    emoji: "💌",
    shortDesc: "Conectar Brevo (envio de emails transacionais)",
    details: (
      <>
        <p>
          O Brevo (ex-Sendinblue) ja esta integrado no codigo
          (<code>src/lib/email.ts</code>) — falta apenas conectar a chave da API.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>1.</strong> Crie conta gratuita em
          <a href="https://app.brevo.com/account/register" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", marginLeft: 4 }}>
            app.brevo.com/account/register
          </a>{" "}
          (usa o email profissional da Barbara).
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>2.</strong> Va em
          <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", marginLeft: 4 }}>
            Settings &gt; API Keys
          </a>{" "}
          → <strong>Generate a new API key</strong> (escolha permissao SMTP + API).
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>3.</strong> Cole a chave (comeca com <code>xkeysib-</code>) em
          <Link href="/admin/configuracoes#brevo" style={{ color: "var(--accent)", marginLeft: 4 }}>
            Configuracoes &gt; Brevo
          </Link>{" "}
          → <strong>Salvar Brevo</strong> → <strong>Testar Conexao</strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>4.</strong> Verificar dominio em
          <a href="https://app.brevo.com/senders/domain" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", marginLeft: 4 }}>
            Senders &gt; Domains
          </a>{" "}
          (adiciona DKIM/SPF — alguns registros vao para o Registro.br).
        </p>
      </>
    ),
    externalLink: { label: "Abrir Brevo", url: "https://app.brevo.com/settings/keys/api" },
  },
  bm_create: {
    id: "bm_create",
    emoji: "🏢",
    shortDesc: "Business Manager Meta + Conta de Anuncios",
    details: (
      <>
        <p>
          ✅ <strong>Ja feito em 2026-04-11.</strong>
        </p>
        <p style={{ marginTop: 12 }}>
          Conta de anuncios: <strong>CA01- BM Barbara Oliveira</strong>
          <br />
          ID: <code>837047967961012</code> · Moeda BRL · Fuso America/Sao_Paulo
        </p>
        <p style={{ marginTop: 12 }}>
          Veja o passo-a-passo completo em
          <Link href="/admin/campanhas/setup-bm" style={{ color: "var(--accent)", marginLeft: 4 }}>
            Campanhas &gt; Setup BM
          </Link>.
        </p>
      </>
    ),
    externalLink: {
      label: "Configuracoes do Negocio",
      url: "https://business.facebook.com/settings",
    },
  },
  pixel_create: {
    id: "pixel_create",
    emoji: "🎯",
    shortDesc: "Pixel Meta vinculado ao dominio",
    details: (
      <>
        <p>
          ✅ <strong>Ja feito em 2026-04-11.</strong>
        </p>
        <p style={{ marginTop: 12 }}>
          Dataset: <strong>Dados de Longetividade</strong>
          <br />
          ID: <code>953736244279938</code> · Propriedade: Barbara Oliveira
        </p>
        <p style={{ marginTop: 12 }}>
          O pixel ja dispara <code>PageView</code>, <code>InitiateCheckout</code>
          e <code>Purchase</code> automaticamente. Para validar end-to-end com o
          Meta Pixel Helper, siga o checklist em
          <Link
            href="/admin/setup#pixel_qa"
            style={{ color: "var(--accent)", marginLeft: 4 }}
          >
            QA Pixel
          </Link>{" "}
          (story TRACK-001).
        </p>
      </>
    ),
  },
  meta_token: {
    id: "meta_token",
    emoji: "🔑",
    shortDesc: "Token Meta Ads API em Configuracoes",
    details: (
      <>
        <p>
          O token e necessario para o painel ler ROAS/gasto/conversoes da
          Meta Marketing API direto no dashboard de campanhas.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Token curto (60d):</strong> Gere via Marketing API page do app
          Longetividade Admin no Meta for Developers.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Token longo (nao expira):</strong> via System User em
          <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", marginLeft: 4 }}>
            Configuracoes do Negocio &gt; Usuarios &gt; Usuarios do Sistema
          </a>{" "}
          → criar System User &ldquo;longetividade-bot&rdquo; → atribuir ativos
          (BM, conta de anuncios, pixel) → Generate Token com{" "}
          <code>ads_read</code> + <code>read_insights</code> +{" "}
          <code>business_management</code>.
        </p>
        <p style={{ marginTop: 12 }}>
          Cole em
          <Link href="/admin/configuracoes#meta" style={{ color: "var(--accent)", marginLeft: 4 }}>
            Configuracoes &gt; Meta Business
          </Link>{" "}
          → <strong>Salvar Meta</strong> → <strong>Testar Conexao</strong>.
        </p>
      </>
    ),
    externalLink: { label: "Configuracoes Meta", url: "/admin/configuracoes#meta" },
  },
  purchase_test: {
    id: "purchase_test",
    emoji: "🛒",
    shortDesc: "Compra teste validada (webhook Hotmart -> Order)",
    details: (
      <>
        <p>
          Garante que o webhook Hotmart esta criando registros <code>Order</code>
          no banco com <code>status=approved</code>, e que o evento Purchase
          dispara no Pixel.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>1.</strong> Crie cupom de 100% off no Hotmart para um dos
          planos.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>2.</strong> Faca a compra de teste com o cupom.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>3.</strong> Verifique no dashboard se a venda apareceu (ela
          marca esse passo como feito automaticamente).
        </p>
      </>
    ),
    externalLink: {
      label: "Painel Hotmart",
      url: "https://app.hotmart.com/products/manage/7474328",
    },
  },
  social_page_token: {
    id: "social_page_token",
    emoji: "📱",
    shortDesc: "Token da Pagina Facebook pra Luna postar automaticamente",
    details: (
      <>
        <p>
          A Luna precisa de um <strong>Page Access Token</strong> com as permissoes
          <code>pages_manage_posts</code> e <code>instagram_content_publish</code>
          pra publicar no Facebook e Instagram.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>1.</strong> No{" "}
          <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
            Graph API Explorer
          </a>{" "}
          selecione o app <strong>Longetividade Admin</strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>2.</strong> Clique em <strong>Get Page Access Token</strong> → autorize a
          pagina &ldquo;Longetividade&rdquo;.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>3.</strong> Cole o token em{" "}
          <Link href="/admin/configuracoes" style={{ color: "var(--accent)" }}>
            Configuracoes
          </Link>{" "}
          → campo <code>SOCIAL_PAGE_TOKEN</code>.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Dica:</strong> Para token permanente, use um System User (ver guia do Meta Token acima).
        </p>
      </>
    ),
    externalLink: { label: "Graph Explorer", url: "https://developers.facebook.com/tools/explorer/" },
  },
  instagram_connect: {
    id: "instagram_connect",
    emoji: "📸",
    shortDesc: "Conectar Instagram Business a Pagina Facebook",
    details: (
      <>
        <p>
          O auto-posting do Instagram exige que a conta IG seja{" "}
          <strong>Business ou Creator</strong> e esteja <strong>vinculada a Pagina Facebook</strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>1.</strong> No Instagram: Configuracoes → Conta → Mudar para conta profissional.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>2.</strong> No Meta Business Suite:{" "}
          <a href="https://business.facebook.com/settings/instagram-accounts" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
            Configuracoes → Contas do Instagram
          </a>{" "}
          → Conectar → Autorizar.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>3.</strong> Rode o discovery: va em{" "}
          <Link href="/admin/social-media" style={{ color: "var(--accent)" }}>
            Social Media
          </Link>{" "}
          — o sistema auto-detecta o ID do Instagram quando o Page Token esta configurado.
        </p>
      </>
    ),
    externalLink: { label: "Business Suite", url: "https://business.facebook.com/settings/instagram-accounts" },
  },
  luna_content: {
    id: "luna_content",
    emoji: "🌙",
    shortDesc: "Popular banco de posts e knowledge base da Luna",
    details: (
      <>
        <p>
          A Luna precisa de conteudo inicial (25 posts pre-escritos) e da base de
          conhecimento (persona, estrategias, hashtags, benchmarks) pra operar.
        </p>
        <p style={{ marginTop: 12 }}>
          Clique no botao abaixo pra rodar os dois seeds de uma vez:
        </p>
      </>
    ),
  },
  cron_secret: {
    id: "cron_secret",
    emoji: "🔐",
    shortDesc: "Variavel CRON_SECRET no Railway pra proteger endpoints",
    details: (
      <>
        <p>
          Todos os crons usam <code>x-cron-secret</code> ou <code>?secret=...</code>
          pra autenticar. Sem essa variavel, nenhum cron funciona.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>1.</strong> No{" "}
          <a href="https://railway.app/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
            Railway
          </a>{" "}
          → seu servico → Variables → <code>CRON_SECRET</code> = qualquer string segura
          (ex: <code>longetividade-cron-2026</code>).
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>2.</strong> Use essa mesma string nos headers/URLs do cron-job.org.
        </p>
      </>
    ),
    externalLink: { label: "Railway", url: "https://railway.app/dashboard" },
  },
  cron_jobs: {
    id: "cron_jobs",
    emoji: "⏰",
    shortDesc: "Registrar 7 cron jobs no cron-job.org",
    details: (
      <>
        <p>
          Crie uma conta gratuita em{" "}
          <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
            cron-job.org
          </a>{" "}
          e cadastre os jobs abaixo. Em cada um, adicione o header{" "}
          <code>x-cron-secret: SEU_CRON_SECRET</code>.
        </p>
        <div style={{ marginTop: 16 }}>
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 700 }}>Job</th>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 700 }}>URL</th>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 700 }}>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Email Sequence", path: "/api/cron/email-sequence", cron: "0 13 * * *", note: "10h BRT" },
                { name: "Abandoned Cart", path: "/api/cron/abandoned-cart", cron: "*/30 * * * *", note: "cada 30min" },
                { name: "Post Purchase", path: "/api/cron/post-purchase", cron: "0 13 * * *", note: "10h BRT" },
                { name: "Gaia Review", path: "/api/cron/gaia-review", cron: "0 14 * * *", note: "11h BRT" },
                { name: "Maya Daily Report", path: "/api/cron/maya-daily-report", cron: "0 22 * * *", note: "19h BRT" },
                { name: "Luna Generate", path: "/api/cron/social-generate", cron: "0 23 * * 0", note: "Dom 20h BRT" },
                { name: "Luna Auto-Post", path: "/api/cron/social-auto-post", cron: "0 15 * * 1-6", note: "Seg-Sab 12h BRT" },
                { name: "Sync Hotmart", path: "/api/cron/sync-hotmart", cron: "0 6 * * *", note: "3h BRT" },
              ].map((job) => (
                <tr key={job.name} style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                  <td style={{ padding: "6px 8px", fontWeight: 600 }}>{job.name}</td>
                  <td style={{ padding: "6px 8px" }}>
                    <code style={{ fontSize: 10, wordBreak: "break-all" }}>{SITE_URL}{job.path}</code>
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    <code>{job.cron}</code>
                    <br />
                    <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{job.note}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)" }}>
          Todos usam metodo GET. Adicione o header <code>x-cron-secret</code> com o valor
          da variavel CRON_SECRET do Railway.
        </p>
      </>
    ),
    externalLink: { label: "cron-job.org", url: "https://cron-job.org" },
  },
  anthropic_key: {
    id: "anthropic_key",
    emoji: "🤖",
    shortDesc: "Chave Anthropic API pra Maya chat funcionar",
    details: (
      <>
        <p>
          A Maya (chat no dashboard) usa a API da Anthropic (Claude) pra responder
          perguntas sobre o negocio. Sem a chave, o chat fica offline.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>1.</strong> Acesse{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
            console.anthropic.com/settings/keys
          </a>{" "}
          → Create Key.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>2.</strong> Cole como <code>ANTHROPIC_API_KEY</code> no Railway → Variables.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Custo:</strong> ~$0.003 por pergunta (Claude Haiku). Budget de $5/mes cobre uso intenso.
        </p>
      </>
    ),
    externalLink: { label: "Anthropic Console", url: "https://console.anthropic.com/settings/keys" },
  },
  meta_app_review: {
    id: "meta_app_review",
    emoji: "📋",
    shortDesc: "Submeter app pra review pra permissoes de auto-posting",
    details: (
      <>
        <p>
          Pra Luna postar automaticamente no Instagram e Facebook, o app precisa das
          permissoes <code>pages_manage_posts</code> e <code>instagram_content_publish</code>
          aprovadas pelo Meta App Review.
        </p>
        <p style={{ marginTop: 12 }}>
          O guia completo esta em <code>docs/guides/META-APP-REVIEW-GUIDE.md</code>.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong>Resumo:</strong>
        </p>
        <ol style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2 }}>
          <li>Va em{" "}
            <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              developers.facebook.com/apps
            </a>{" "}
            → seu app → App Review
          </li>
          <li>Solicite <code>pages_manage_posts</code> + <code>instagram_content_publish</code></li>
          <li>Grave um screencast mostrando o fluxo (admin aprova post → sistema publica)</li>
          <li>Descreva o uso: &ldquo;Publicacao automatizada de conteudo educativo sobre saude feminina&rdquo;</li>
          <li>Espere aprovacao (1-5 dias uteis)</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 11, color: "var(--text-muted)" }}>
          Enquanto nao aprovado, a Luna funciona em modo manual: gera conteudo, voce copia e cola.
        </p>
      </>
    ),
    externalLink: { label: "Meta App Review", url: "https://developers.facebook.com/apps" },
  },
};

type ReportResult = {
  ok: boolean;
  sent?: number;
  failed?: Array<{ email: string; error?: string }>;
  error?: string;
};

export default function SetupPage() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [seedingLuna, setSeedingLuna] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<Record<string, { ok: boolean; detail: string }> | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    fetch("/api/admin/maya/context")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.pendencias ?? []);
        setLoading(false);
        const hash = window.location.hash.replace("#", "");
        if (hash) setExpanded(hash);
      })
      .catch(() => setLoading(false));
  }, []);

  const doneCount = items.filter((i) => i.done).length;
  const total = items.length || 1;
  const pct = Math.round((doneCount / total) * 100);

  async function toggleEmailDns() {
    setMarking("email_pro");
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EMAIL_PRO_DNS_OK: "true" }),
      });
      const res = await fetch("/api/admin/maya/context");
      const data = await res.json();
      setItems(data.pendencias ?? []);
    } finally {
      setMarking(null);
    }
  }

  async function seedLunaAll() {
    setSeedingLuna(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/admin/social/setup-all", { method: "POST" });
      const data = await res.json();
      setSeedResult(data.summary ?? "Feito!");
      const ctx = await fetch("/api/admin/maya/context");
      const ctxData = await ctx.json();
      setItems(ctxData.pendencias ?? []);
    } catch (e) {
      setSeedResult(`Erro: ${(e as Error).message}`);
    } finally {
      setSeedingLuna(false);
    }
  }

  async function runHealthCheck() {
    setLoadingHealth(true);
    try {
      const res = await fetch("/api/admin/health");
      const data = await res.json();
      setHealthData(data.checks ?? {});
    } catch {
      setHealthData(null);
    } finally {
      setLoadingHealth(false);
    }
  }

  async function sendDailyReport() {
    setSendingReport(true);
    setReportResult(null);
    try {
      const res = await fetch("/api/admin/maya/daily-report", { cache: "no-store" });
      const data = (await res.json()) as ReportResult;
      setReportResult(data);
    } catch (e) {
      setReportResult({ ok: false, error: (e as Error).message });
    } finally {
      setSendingReport(false);
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px 0" }}>
        Setup da Barbara
      </h1>

      <PageHelp
        pageId="setup"
        agent={{ icon: "📋", name: "Maya", role: "Auto-detectado" }}
        title="Checklist completo de setup da operação"
        quickActions={[
          { label: "Expandir item", description: "Abre instruções detalhadas com links externos" },
          { label: "Marcar como feito", description: "Apenas email_pro — os outros auto-detectam" },
          { label: "Enviar relatório agora", description: "Dispara Maya daily report via Brevo pros admins imediatamente" },
          { label: "Preview relatório", description: "Abre HTML do email numa aba nova (sem enviar)" },
        ]}
      >
        <p>
          Cobre todos os itens pra Barbara operar o Longetividade com autonomia: email
          profissional, Brevo, BM Meta, Pixel, Token, compra teste. <strong>5 dos 6 itens
          auto-detectam</strong> baseado em estado real do sistema — só o email precisa
          marcação manual (porque o DNS pode estar propagando).
        </p>
        <p>
          No topo tem a ação <strong>Gaia daily report</strong>: testa o email diário da
          Maya sem esperar o cron rodar. Útil pra validar que Brevo + sender estão
          funcionando.
        </p>
      </PageHelp>
      <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "0 0 24px 0", lineHeight: 1.5 }}>
        Configuracao completa para a Barbara operar o Longetividade de forma autonoma.
        Cada item e detectado automaticamente pelo sistema — quando voce conectar
        cada servico, o status muda sozinho.
      </p>

      {/* Progress bar */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Progresso geral
          </span>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {doneCount} / {items.length} ({pct}%)
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "var(--bg-secondary)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct === 100 ? "#6B9E6B" : "var(--accent)",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* Maya — Relatório Diario manual trigger */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>📨</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Relatorio diario da Maya
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            Resumo de vendas, receita, ROAS Meta e pendencias enviado pros admins via Brevo.
          </div>
        </div>
        <a
          href="/api/admin/maya/daily-report?preview=1"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "0.5px solid var(--border-default)",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Preview
        </a>
        <button
          onClick={sendDailyReport}
          disabled={sendingReport}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: sendingReport ? "wait" : "pointer",
            opacity: sendingReport ? 0.6 : 1,
          }}
        >
          {sendingReport ? "Enviando..." : "Enviar agora"}
        </button>
        {reportResult && (
          <div
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 6,
              background: reportResult.ok ? "rgba(107,158,107,0.15)" : "rgba(196,120,122,0.15)",
              color: reportResult.ok ? "#6B9E6B" : "#C4787A",
              fontWeight: 600,
              flexBasis: "100%",
            }}
          >
            {reportResult.ok
              ? `OK — enviado para ${reportResult.sent} admin(s)`
              : `Erro: ${reportResult.error ?? reportResult.failed?.[0]?.error ?? "falha"}`}
          </div>
        )}
      </div>

      {/* Luna — Setup completo (seed content + knowledge) */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>🌙</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Setup completo Luna
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            Popula posts pre-escritos + base de conhecimento (persona, estrategias, hashtags) de uma vez.
          </div>
        </div>
        <button
          onClick={seedLunaAll}
          disabled={seedingLuna}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            cursor: seedingLuna ? "wait" : "pointer",
            opacity: seedingLuna ? 0.6 : 1,
          }}
        >
          {seedingLuna ? "Populando..." : "🌙 Seed tudo"}
        </button>
        {seedResult && (
          <div
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 6,
              background: "rgba(107,158,107,0.15)",
              color: "#6B9E6B",
              fontWeight: 600,
              flexBasis: "100%",
            }}
          >
            {seedResult}
          </div>
        )}
      </div>

      {/* Health Check — diagnostico geral */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: healthData ? 14 : 0 }}>
          <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>🏥</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              Diagnostico do sistema
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Verifica todas as chaves, tokens e configuracoes em tempo real.
            </div>
          </div>
          <button
            onClick={runHealthCheck}
            disabled={loadingHealth}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "0.5px solid var(--border-default)",
              fontSize: 13,
              fontWeight: 600,
              cursor: loadingHealth ? "wait" : "pointer",
            }}
          >
            {loadingHealth ? "Verificando..." : "Rodar diagnostico"}
          </button>
        </div>
        {healthData && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {Object.entries(healthData).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: val.ok ? "rgba(107,158,107,0.08)" : "rgba(196,120,122,0.08)",
                  border: `0.5px solid ${val.ok ? "rgba(107,158,107,0.3)" : "rgba(196,120,122,0.3)"}`,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: val.ok ? "#6B9E6B" : "#C4787A" }}>
                  {val.ok ? "✓" : "✗"} {key}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  {val.detail}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Carregando...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => {
            const guide = GUIDES[item.id];
            const isOpen = expanded === item.id;
            return (
              <div
                key={item.id}
                id={item.id}
                style={{
                  background: "var(--bg-card)",
                  border: `0.5px solid ${item.done ? "rgba(107, 158, 107, 0.5)" : "var(--border-default)"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: 16,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "var(--text-primary)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: item.done ? "rgba(107, 158, 107, 0.15)" : "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                      border: item.done ? "1.5px solid #6B9E6B" : "1.5px solid var(--border-default)",
                    }}
                  >
                    {item.done ? "✓" : guide?.emoji ?? "•"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                    {guide?.shortDesc && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {guide.shortDesc}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: item.done ? "rgba(107, 158, 107, 0.18)" : "rgba(160, 160, 160, 0.15)",
                      color: item.done ? "#6B9E6B" : "#888",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.done ? "Feito" : "Pendente"}
                  </span>
                  <span style={{ fontSize: 18, color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    ⌄
                  </span>
                </button>

                {isOpen && guide && (
                  <div
                    style={{
                      padding: "0 16px 16px 66px",
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    <div style={{ marginBottom: 14 }}>{guide.details}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {guide.externalLink && (
                        guide.externalLink.url.startsWith("/") ? (
                          <Link
                            href={guide.externalLink.url}
                            style={{
                              padding: "8px 14px",
                              borderRadius: 8,
                              background: "var(--accent)",
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            {guide.externalLink.label}
                          </Link>
                        ) : (
                          <a
                            href={guide.externalLink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "8px 14px",
                              borderRadius: 8,
                              background: "var(--accent)",
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            {guide.externalLink.label} ↗
                          </a>
                        )
                      )}
                      {item.id === "email_pro" && !item.done && (
                        <button
                          onClick={toggleEmailDns}
                          disabled={marking === "email_pro"}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 8,
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            border: "0.5px solid var(--border-default)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          {marking === "email_pro" ? "Salvando..." : "Marcar como feito"}
                        </button>
                      )}
                      {item.id === "luna_content" && !item.done && (
                        <button
                          onClick={seedLunaAll}
                          disabled={seedingLuna}
                          style={{
                            padding: "8px 14px",
                            borderRadius: 8,
                            background: "var(--accent)",
                            color: "#fff",
                            border: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {seedingLuna ? "Populando..." : "🌙 Seed conteudo + knowledge"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
