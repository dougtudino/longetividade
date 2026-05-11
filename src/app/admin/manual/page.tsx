"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

type SectionId =
  | "quickstart"
  | "capacidades"
  | "planejar-aiox"
  | "agentes"
  | "paginas"
  | "workflows"
  | "rotinas"
  | "glossario"
  | "arquivos";

const SECTIONS: Array<{ id: SectionId; label: string; icon: string }> = [
  { id: "quickstart", label: "Quick Start", icon: "🚀" },
  { id: "capacidades", label: "O que o sistema faz", icon: "💡" },
  { id: "planejar-aiox", label: "Planejar via AIOX", icon: "🧠" },
  { id: "agentes", label: "Agentes AIOX", icon: "🤖" },
  { id: "paginas", label: "Páginas do Admin", icon: "🗂" },
  { id: "workflows", label: "Workflows", icon: "🔀" },
  { id: "rotinas", label: "Rotinas & Cron", icon: "⏰" },
  { id: "glossario", label: "Glossário", icon: "📖" },
  { id: "arquivos", label: "Arquivos-chave", icon: "📁" },
];

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 20,
};

const h2: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: "var(--text-primary)",
  margin: "0 0 16px 0",
  letterSpacing: "-0.01em",
};

const h3: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "var(--text-primary)",
  margin: "20px 0 8px 0",
};

const p: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text-secondary)",
  lineHeight: 1.7,
  margin: "0 0 10px 0",
};

function Section({ active, children }: { active: boolean; children: ReactNode }) {
  if (!active) return null;
  return <div style={{ ...card, marginBottom: 20 }}>{children}</div>;
}

function CopyBox({
  title,
  text,
  hint,
  language,
}: {
  title?: string;
  text: string;
  hint?: string;
  language?: "bash" | "prompt" | "markdown" | "text";
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  const accentColor =
    language === "bash"
      ? "#6B9E6B"
      : language === "prompt"
      ? "#9B72CF"
      : language === "markdown"
      ? "#4A90D9"
      : "var(--text-muted)";
  return (
    <div style={{ marginBottom: 14 }}>
      {title && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
          {language && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
                background: `${accentColor}22`,
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {language}
            </span>
          )}
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {title}
          </div>
        </div>
      )}
      <div
        style={{
          position: "relative",
          padding: "12px 76px 12px 14px",
          background: "var(--bg-secondary)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 8,
          fontSize: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          lineHeight: 1.6,
          color: "var(--text-primary)",
          whiteSpace: "pre-wrap",
          overflowX: "auto",
          wordBreak: "break-word",
        }}
      >
        {text}
        <button
          onClick={copy}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            padding: "5px 10px",
            background: copied ? "#6B9E6B" : "var(--bg-card)",
            color: copied ? "#fff" : "var(--text-secondary)",
            border: "0.5px solid var(--border-default)",
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
            whiteSpace: "nowrap",
          }}
          title="Copiar pro clipboard"
        >
          {copied ? "✓ copiado" : "📋 copiar"}
        </button>
      </div>
      {hint && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 6,
            fontStyle: "italic",
          }}
        >
          💡 {hint}
        </div>
      )}
    </div>
  );
}

function DocDownloadRow({
  icon,
  title,
  description,
  viewHref,
  downloadHref,
}: {
  icon: string;
  title: string;
  description: string;
  viewHref: string;
  downloadHref: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: "var(--bg-secondary)",
        border: "0.5px solid var(--border-default)",
        borderRadius: 10,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ fontSize: 22, lineHeight: 1.2, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: 10,
            }}
          >
            {description}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <a
              href={viewHref}
              target="_blank"
              rel="noopener"
              style={{
                fontSize: 11,
                padding: "5px 12px",
                borderRadius: 6,
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "0.5px solid var(--border-default)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              👁 Visualizar
            </a>
            <a
              href={downloadHref}
              style={{
                fontSize: 11,
                padding: "5px 12px",
                borderRadius: 6,
                background: "var(--accent)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              📥 Baixar .md
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityItem({
  icon,
  title,
  description,
  pages,
}: {
  icon: string;
  title: string;
  description: string;
  pages?: Array<{ href: string; label: string }>;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: "var(--bg-secondary)",
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div style={{ fontSize: 22, lineHeight: 1.2, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: pages && pages.length > 0 ? 8 : 0,
            }}
          >
            {description}
          </div>
          {pages && pages.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {pages.map((pg) => (
                <Link
                  key={pg.href}
                  href={pg.href}
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 6,
                    background: "var(--accent)",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {pg.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Agent({
  icon,
  name,
  persona,
  role,
  scope,
  useWhen,
  noUseWhen,
  commands,
}: {
  icon: string;
  name: string;
  persona: string;
  role: string;
  scope: string;
  useWhen: string[];
  noUseWhen?: string[];
  commands?: string[];
}) {
  return (
    <div
      style={{
        padding: 16,
        background: "var(--bg-secondary)",
        borderRadius: 10,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>
            {name} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>· {persona}</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {role}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 8 }}>
        <div><strong>Escopo:</strong> {scope}</div>
        <div style={{ marginTop: 6 }}>
          <strong>Usar quando:</strong>
          <ul style={{ paddingLeft: 18, margin: "4px 0" }}>
            {useWhen.map((u, i) => <li key={i}>{u}</li>)}
          </ul>
        </div>
        {noUseWhen && noUseWhen.length > 0 && (
          <div>
            <strong>NAO usar quando:</strong>
            <ul style={{ paddingLeft: 18, margin: "4px 0", color: "var(--text-muted)" }}>
              {noUseWhen.map((u, i) => <li key={i}>{u}</li>)}
            </ul>
          </div>
        )}
        {commands && commands.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <strong>Comandos:</strong>{" "}
            {commands.map((c, i) => (
              <code
                key={i}
                style={{
                  fontSize: 11,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "var(--bg-card)",
                  marginRight: 4,
                }}
              >
                {c}
              </code>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PageEntry({
  href,
  title,
  owner,
  description,
}: {
  href: string;
  title: string;
  owner: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: "var(--bg-secondary)",
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 6 }}>
        <Link
          href={href}
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--accent)",
            textDecoration: "none",
          }}
        >
          {title}
        </Link>
        <code style={{ fontSize: 11, color: "var(--text-muted)" }}>{href}</code>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
        Agente responsavel: <strong>{owner}</strong>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{description}</div>
    </div>
  );
}

export default function ManualPage() {
  const [active, setActive] = useState<SectionId>("quickstart");

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Sistema Longetividade
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "6px 0 4px 0" }}>
          Manual do Sistema
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
          Manual completo: quick start, capacidades, prompts pra invocar a equipe
          AIOX, agentes, páginas, workflows, rotinas. Atualizado em 2026-04-20.
        </p>
      </div>

      {/* Section nav */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 20,
          paddingBottom: 14,
          borderBottom: "0.5px solid var(--border-default)",
        }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            id={`manual-nav-${s.id}`}
            onClick={() => setActive(s.id)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: active === s.id ? "var(--accent)" : "var(--bg-secondary)",
              color: active === s.id ? "#fff" : "var(--text-secondary)",
              border: "0.5px solid var(--border-default)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* ─── QUICK START ─────────────────────────────── */}
      <Section active={active === "quickstart"}>
        <h2 style={h2}>🚀 Quick Start</h2>
        <p style={p}>
          Bem-vindo ao Longetividade Admin. O sistema é controlado por uma equipe de
          <strong> 12 agentes AIOX</strong> (cada um com responsabilidade exclusiva) + UIs
          pra Doug e Barbara operarem. Escolhe por onde começar conforme seu objetivo:
        </p>

        <h3 style={h3}>🧭 &ldquo;É a primeira vez que entro — por onde começo?&rdquo;</h3>
        <ol style={p as React.CSSProperties}>
          <li>
            Lê a seção <button onClick={() => { document.getElementById("manual-nav-capacidades")?.click(); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, padding: 0, textDecoration: "underline" }}>💡 O que o sistema faz</button> — overview em 1 página das 10 capacidades principais
          </li>
          <li>
            Depois 🤖 Agentes — quem faz o que
          </li>
          <li>
            Depois 🗂 Páginas — onde cada coisa acontece
          </li>
          <li>
            Quando for operar: abre <Link href="/admin/dashboard" style={{ color: "var(--accent)" }}>Dashboard</Link> pra visão macro, <Link href="/admin/campanhas" style={{ color: "var(--accent)" }}>Campanhas</Link> pra Meta Ads, <Link href="/admin/social-media" style={{ color: "var(--accent)" }}>Social Media</Link> pra Luna
          </li>
        </ol>

        <h3 style={h3}>🚀 &ldquo;Quero lançar uma campanha Meta agora&rdquo;</h3>
        <p style={p}>
          Vai direto no fluxo Blueprint. 10-20min se os criativos existem, 1-2h se precisa
          gerar criativos do zero. Fluxo completo documentado em 🔀 Workflows → item 2.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <Link href="/admin/campanhas/launch-blueprint" style={{ padding: "8px 14px", background: "#6B9E6B", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            🗺 Abrir Blueprint Editor →
          </Link>
          <Link href="/admin/campanhas" style={{ padding: "8px 14px", background: "var(--bg-card)", color: "var(--text-primary)", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", border: "0.5px solid var(--border-default)" }}>
            📣 Ver painel Campanhas →
          </Link>
        </div>

        <h3 style={h3}>🧠 &ldquo;Quero pedir pra equipe AIOX planejar uma LAUNCH nova&rdquo;</h3>
        <p style={p}>
          A equipe AIOX (Atlas, Morgan, Pax, Aria, Alex, Uma, Gaia, Dara, Dex, Quinn,
          Gage, River) pode escrever o documento completo de uma LAUNCH antes do blueprint
          — pesquisa de mercado, PRD, persona, stories, spec de criativos. Você invoca via
          Claude Code ou aqui no próprio chat colando os prompts prontos.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => { document.getElementById("manual-nav-planejar-aiox")?.click(); }}
            style={{ padding: "8px 14px", background: "#9B72CF", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            🧠 Ver prompts da equipe AIOX →
          </button>
        </div>

        <h3 style={h3}>📋 &ldquo;Quero consultar/editar templates markdown&rdquo;</h3>
        <p style={p}>Templates vivem em <code>docs/blueprints/</code>:</p>
        <ul style={p as React.CSSProperties}>
          <li><code>launch-template.md</code> — estrutura padrão 8 seções pra qualquer produto novo</li>
          <li><code>launch-001.md</code> — exemplo preenchido (Longetividade Emagreça Sem Dieta)</li>
        </ul>
        <p style={{ ...p, fontSize: 12 }}>
          Copia o template, preenche, usa como input pra Morgan/Pax criarem PRD oficial,
          depois seeda no banco via botão <em>Duplicar pra nova LAUNCH</em>.
        </p>

        <h3 style={h3}>🆘 &ldquo;Algo quebrou — o que fazer?&rdquo;</h3>
        <ul style={p as React.CSSProperties}>
          <li><strong>Erro P2022 (coluna não existe):</strong> schema divergiu. Vai em <Link href="/admin/criativos" style={{ color: "var(--accent)" }}>/admin/criativos</Link> e clica <em>⚡ Migrar schema</em></li>
          <li><strong>Token Meta inválido:</strong> <Link href="/admin/configuracoes" style={{ color: "var(--accent)" }}>/admin/configuracoes#meta</Link> — regerar System User token (nunca expira)</li>
          <li><strong>Página travou sem erro visível:</strong> geralmente localStorage cheio — Clear Site Data no DevTools</li>
          <li><strong>Commits que fui fazer não subiram:</strong> Railway pode estar buildando, confere em railway.app</li>
          <li><strong>Outros:</strong> aciona @qa Quinn pra diagnosticar (prompt na seção 🧠 Planejar via AIOX)</li>
        </ul>
      </Section>

      {/* ─── CAPACIDADES ────────────────────────────── */}
      <Section active={active === "capacidades"}>
        <h2 style={h2}>💡 O que o sistema faz</h2>
        <p style={p}>
          Inventário das <strong>capacidades principais</strong> do Longetividade Admin. Cada item tem
          o agente responsável e o link pra página onde acontece.
        </p>

        <CapabilityItem
          icon="🗺"
          title="Planejar e lançar campanhas Meta Ads end-to-end"
          description="Blueprint editável no banco → preparar (check + fix automático) → lançar 1 clique. Cria Custom Audiences + Lookalike + Campanha + 5 Ad Sets + 16 Ads direto na Meta Marketing API, tudo PAUSED. Suporta múltiplas LAUNCHes (LAUNCH-001/002/003...). Gaia é a dona."
          pages={[
            { href: "/admin/campanhas/launch-blueprint", label: "Blueprint" },
            { href: "/admin/campanhas", label: "Painel" },
          ]}
        />
        <CapabilityItem
          icon="🎨"
          title="Gerar criativos de ad via IA (Uma + Quinn + Blotato)"
          description="Uma consulta knowledge base (persona, playbook, learnings) → escolhe template Blotato + paleta + hook. Quinn valida Meta Ad Policy antes + depois. PNG gerado é uploadado automaticamente pra /adimages, metaImageHash já sai populado. Batch packs de 5 (carousel) ou 18 (campanha completa: 3 angles × 6 templates)."
          pages={[{ href: "/admin/criativos", label: "Criativos" }]}
        />
        <CapabilityItem
          icon="🌱"
          title="Review automático de performance com decisões propostas"
          description="Gaia analisa 7d de insights Meta → aplica regras (CTR < 0.8% = kill, ROAS >= 2 = scale, etc) → cria AgentDecision em status=proposed. Doug aprova via UI. Execução real via Meta API (pause/duplicate/budget change). Expande DIAGNOSE_FUNNEL em checklist acionável com agentes AIOX atribuídos."
          pages={[{ href: "/admin/agents/gaia", label: "Gaia" }]}
        />
        <CapabilityItem
          icon="📱"
          title="Social media multi-slot (Luna)"
          description="Luna gera 12 posts/semana (Seg-Sáb × 3 slots: FEED_AM + REEL + STORY). Hierarquia: commemorative > trend > bank. Consome trends via websearch + video-intelligence de competidores. Auto-posting via Blotato API (createVisual/Carousel/Slideshow). Grade harmônica, trial reels."
          pages={[{ href: "/admin/social-media", label: "Social Media" }]}
        />
        <CapabilityItem
          icon="🎬"
          title="Video Intelligence — espionagem de competidores"
          description="Cron sáb 20h BRT: Apify scrapa Instagram de competidores → Gemini 2.0 Flash analisa vídeos → Claude gera 3 conceitos Luna. Salva em VideoAnalysis + espelha em AgentKnowledge pra Luna usar nos posts da semana seguinte."
          pages={[{ href: "/admin/video-intelligence", label: "Video Intel" }]}
        />
        <CapabilityItem
          icon="💌"
          title="Email + SMS via Brevo + WhatsApp"
          description="Integração Brevo completa (templates, campanhas, listas, automações). Maya dispara relatório diário 8h BRT via cron externo. MCP Brevo disponível pra agentes interagirem com o CRM."
          pages={[{ href: "/admin/email-marketing", label: "Email Marketing" }]}
        />
        <CapabilityItem
          icon="📊"
          title="Tracking qualidade 8+ via Pixel + CAPI"
          description="Pixel standard events (PageView, ViewContent, Lead, InitiateCheckout, Purchase) + Conversions API com fbp/fbc/IP/UA/email hasheado. Lead quality score foi de 3.2 pra 8+. Dedup de Purchase via transaction_id."
          pages={[{ href: "/admin/configuracoes", label: "Configurações" }]}
        />
        <CapabilityItem
          icon="🛒"
          title="Integração Hotmart completa"
          description="Webhook de purchase atualiza Order + User + trigger de VIP access. Src param em todas URLs pra rastrear origem. Dashboard de vendas com filtros por plano/status/período."
          pages={[
            { href: "/admin/vendas", label: "Vendas" },
            { href: "/admin/abandonos", label: "Abandonos" },
          ]}
        />
        <CapabilityItem
          icon="👥"
          title="App VIP + onboarding + hábitos"
          description="App completo pra mulheres VIP que compraram: onboarding, hábitos diários (água, movimento), progresso, escassez sales page embutida. DB local acompanha aderência."
          pages={[{ href: "/admin/app-users", label: "App Users" }]}
        />
        <CapabilityItem
          icon="🧠"
          title="Chat Maya contextual no dashboard"
          description="Maya lê contexto real do negócio (receita, vendas, VIP, pendências, últimas campanhas) e responde perguntas naturalmente. Claude Sonnet 4.6 via API. Pode disparar ações (envio de email, criar tarefa, etc)."
          pages={[{ href: "/admin/dashboard", label: "Dashboard" }]}
        />

        <h3 style={h3}>Em Roadmap (ainda não entregue)</h3>
        <ul style={p as React.CSSProperties}>
          <li>Criar ads automaticamente pra collections novas (hoje só launch-001-pioneer tem mapeamento de copies)</li>
          <li>Autopilot Gaia: execução de decisões sem aprovação manual</li>
          <li>Dropdown de CreativeCollection no blueprint ad set (hoje é digitado manual)</li>
          <li>Multi-produto: dashboard unificado Longetividade + Sono + Jejum</li>
          <li>Advantage+ Shopping Campaigns</li>
        </ul>
      </Section>

      {/* ─── PLANEJAR VIA AIOX ─────────────────────── */}
      <Section active={active === "planejar-aiox"}>
        <h2 style={h2}>🧠 Planejar via AIOX — Prompts copiáveis</h2>
        <p style={p}>
          Antes de clicar &ldquo;+ Seed LAUNCH&rdquo; no blueprint, a equipe AIOX pode produzir
          o documento completo — pesquisa de mercado, PRD, persona, stories, spec de
          criativos, blueprint de budget. Copia o prompt, cola numa sessão nova do Claude
          Code (ou direto aqui) e roda. Cada agente tem seu comando específico.
        </p>

        <h3 style={h3}>📦 Pacote completo — planejar LAUNCH nova do zero</h3>
        <p style={p}>
          Prompt orquestrador que roda a equipe inteira em sequência: Alex pesquisa →
          Morgan PRD → Pax valida → Uma cria spec de criativos → Gaia propõe budget/audiences.
        </p>
        <CopyBox
          language="prompt"
          title="Planejar LAUNCH completa via equipe AIOX"
          text={`Sou Doug, fundador do Longetividade. Quero planejar uma nova LAUNCH com a equipe AIOX.

PRODUTO: [nome do produto, ex: "Sono Profundo"]
VERTICAL: [área, ex: "sono/saúde feminina 30-50"]
PRECO_ALVO: R$ [valor, ex: "67"]
HIPOTESE_PERSONA: [1 frase, ex: "mulheres que sofrem de insônia ou sono ruim há 6+ meses"]

Rode a equipe AIOX em sequência, cada um entregando antes de passar pro próximo:

1. @analyst Alex *research — pesquisa concorrência BR neste vertical, CPA benchmarks, risk de Meta Ad Policy, top 3 angles que performam. Salva em docs/research/[produto].md
2. @pm Morgan *create-prd — PRD com problema, proposta, métricas de sucesso, escopo MVP. Salva em docs/prd/[produto].md
3. @po Pax *validate-story-draft — valida PRD, aponta gaps
4. @ux-design-expert Uma — spec de 6 criativos (3 feed + 2 story + 1 banner) matching os 3 angles (dor/prova/objecao/promessa/cta), validado pra Meta Ad Policy (sem números de peso, sem timeframes)
5. @growth Gaia *blueprint — proposta de budget, 3 cold + 1 warm + 1 hot ad sets, audiences (5 pixel events + 1 lookalike), kill/scale rules
6. Resumo final: um doc docs/blueprints/[produto].md seguindo o template launch-template.md, completo com as 8 seções

Quero ver a entrega de cada agente antes de passar pro próximo. Se houver [LACUNA], me pergunta antes de preencher com assumption.`}
          hint="Cola num chat Claude Code na raiz do projeto. Leva 15-30min pra rodar toda equipe."
        />

        <h3 style={h3}>🔬 Alex (analyst) — *research isolado</h3>
        <CopyBox
          language="prompt"
          title="Pesquisa de mercado + concorrência"
          text={`@analyst Alex *research

TOPICO: [área a pesquisar, ex: "apps de sono feminino BR"]

Entrega:
1. Top 5 concorrentes (nome, proposta, preço, diferencial)
2. CPA benchmark pra aquisição digital no BR (faixa esperada + excellent/good/warning/kill)
3. CTR benchmark Feed IG/FB nessa vertical
4. Top 3 angles que performam em ads (dor/prova/objecao/etc)
5. Riscos Meta Ad Policy específicos desse vertical (sensitive content, health claims, etc)
6. Learnings de LAUNCHes passadas do Longetividade que se aplicam

Salva em docs/research/[topico].md. Cita fontes (URLs de quando possível).`}
        />

        <h3 style={h3}>📋 Morgan (PM) — *create-prd</h3>
        <CopyBox
          language="prompt"
          title="Criar PRD para produto/feature nova"
          text={`@pm Morgan *create-prd

FEATURE_OU_PRODUTO: [nome]
RESEARCH_INPUT: [link pro docs/research/X.md ou "rodar Alex antes"]

Entrega PRD em docs/prd/[feature].md com:
- Problema validado (data-driven, cite research)
- Proposta (1 frase)
- Success metrics (ex: CPA alvo, ROAS alvo, nº conversões/semana)
- Escopo MVP (o que ENTRA — máximo 5 items) + O que fica FORA
- Timeline estimado
- Riscos principais + mitigações
- Decisões estratégicas (não táticas) tomadas

Quando terminar, passa pro @po Pax pra *validate-story-draft.`}
        />

        <h3 style={h3}>🎨 Uma (UX) — briefing de criativos</h3>
        <CopyBox
          language="prompt"
          title="Spec de 6 criativos Meta-compliant"
          text={`@ux-design-expert Uma

PRD: [link docs/prd/X.md]
PERSONA: [1 frase, ex: "mulher 30-45, insônia crônica, rotina intensa"]
PRECO: R$ [valor]
LANDING: [URL]

Entrega briefing de 6 criativos seguindo convenção Meta:

1. feed-dor (1080x1080) — identificação/dor, angle COPY-A
2. feed-prova (1080x1080) — testemunho real, angle COPY-B
3. feed-objecao (1080x1080) — quebra de "já tentei tudo", COPY-C
4. story-stat (1080x1920) — prova social curta, COPY-B adaptada
5. story-cta (1080x1920) — CTA direto com preço, COPY-D
6. banner-display (1200x628) — Google Display

Pra cada:
- Copy A/B/C/D completa (headline, description, cta, primaryText)
- Visual description (paleta, hierarquia, elementos)
- Angles cobertos
- Tags pra matching no launcher
- Validação Meta Ad Policy (checklist sem números de peso, timeframes, before/after, etc)

Salva em docs/criativos/[produto].md.`}
        />

        <h3 style={h3}>🌱 Gaia (growth) — *blueprint</h3>
        <CopyBox
          language="prompt"
          title="Proposta de blueprint Meta Ads"
          text={`@growth Gaia *blueprint

PRODUTO: [nome]
PRECO: R$ [valor]
BUDGET_ALVO: R$ [/dia]
PERSONA_PRIMARIA: [1 frase]
PERSONA_SECUNDARIA: [opcional]

Entrega blueprint completo seguindo docs/blueprints/launch-template.md com:

1. Arquitetura cold/warm/hot (quantos ad sets por camada)
2. Distribuição de budget por ad set com rationale
3. Audiences: 5 website events (Purchase 180d, PageView 7d/30d, InitiateCheckout 30d, Lead 30d) + 1 lookalike 1% BR
4. Targeting de cada ad set (idade, gênero, interesses Meta reais — não inventar IDs, marcar "buscar via Interest Search API")
5. Exclusões (compradores + já em checkout)
6. Cronograma day_1 vs day_5
7. Kill triggers + scale rules aplicados (ROAS>=2 scale, CTR<0.8% kill, etc)
8. Gate de volume pra ativar warm/hot

Salva em docs/blueprints/[produto].md seguindo o template. Marca [LACUNA] se não souber.`}
        />

        <h3 style={h3}>💻 Dex (dev) — *develop</h3>
        <CopyBox
          language="prompt"
          title="Implementar story técnica"
          text={`@dev Dex *develop

STORY: [link pra docs/stories/STORY-XXX.md]

Protocolo:
1. Read story + related files
2. Atomic commits por subtask
3. npx tsc --noEmit antes de commit
4. Seguir padrões do CLAUDE.md do projeto
5. Quando terminar, passa pro @qa Quinn *qa-gate`}
        />

        <h3 style={h3}>🛡 Quinn (QA) — *qa-gate</h3>
        <CopyBox
          language="prompt"
          title="Validar quality gates pré-merge"
          text={`@qa Quinn *qa-gate

STORY: [link]

Roda:
- npx tsc --noEmit (typecheck)
- npm run lint
- npm run test (se aplicável)
- npm run build (smoke)
- Lê código modificado, aponta CONCERNS se tiver
- Verdict: PASS | CONCERNS | FAIL

Se FAIL, volta pra Dex. Se PASS, passa pro @devops Gage.`}
        />

        <h3 style={h3}>🚀 Gage (devops) — *push</h3>
        <CopyBox
          language="prompt"
          title="Git push + PR (único agente autorizado)"
          text={`@devops Gage *push

Por constituição AIOX, você é o ÚNICO agente autorizado a fazer git push.

- git add (arquivos específicos, NUNCA -A)
- git commit -m "tipo(escopo): mensagem"
  - Inclui Co-Authored-By do agente dev
  - Nunca --no-verify
- git push origin main (nunca force push em main)
- Se branch diferente, *create-pr com título + body`}
        />

        <h3 style={h3}>🎯 Meta-prompt — abrir sessão focada</h3>
        <p style={p}>
          Pra iniciar uma sessão de trabalho no Claude Code focada em um objetivo específico:
        </p>
        <CopyBox
          language="prompt"
          title="Início de sessão focada"
          text={`Projeto Longetividade, trabalhando no [OBJETIVO, ex: "lançar LAUNCH-002 Sono"].

Estado atual relevante:
- [1-3 bullets do que já existe, ex: "LAUNCH-001 Emagreça já em Meta com 16 ads em review"]
- [branch/commit atual se importa]

Quero:
- [tarefa específica, ex: "criar blueprint LAUNCH-002 duplicando LAUNCH-001, substituir produto/landing/persona"]

Restrições:
- [ex: "budget mínimo pra validar ferramenta, escalo depois"]
- [ex: "não mexer em Gaia/checklist nem no sistema de email"]

Começar lendo memory/ + docs/blueprints/ pra contexto.`}
          hint="Cola isso no primeiro prompt de uma sessão nova pra Claude pegar contexto. Substitui texto entre [colchetes]."
        />

        <h3 style={h3}>🆘 Diagnóstico — &ldquo;algo quebrou, o que fazer?&rdquo;</h3>
        <CopyBox
          language="prompt"
          title="Diagnosticar erro em produção"
          text={`@qa Quinn — diagnóstico urgente.

ERRO VISTO: [cole o erro/screenshot exato]
ONDE: [página ou endpoint, ex: "/admin/campanhas/launch-blueprint → botão Lançar"]
QUANDO: [agora / depois de deploy XXX / recorrente]
LOGS RAILWAY: [cola output dos logs]

Protocolo:
1. Identifica causa raiz (não sintoma)
2. Propõe 2-3 caminhos de fix com tradeoffs
3. Prioriza o menos destrutivo
4. NÃO executa fix sem minha aprovação

Se for P2022 (coluna não existe), a solução sempre foi ir em /admin/criativos e clicar "Migrar schema".`}
        />
      </Section>

      {/* ─── AGENTES ─────────────────────────────────── */}
      <Section active={active === "agentes"}>
        <h2 style={h2}>🤖 Agentes AIOX</h2>
        <p style={p}>
          O framework AIOX organiza o time em <strong>12 agentes</strong> com responsabilidades
          exclusivas. Cada um tem um nome, persona, autoridade e comandos. Eles colaboram mas
          nao se sobrepoem — um agente nunca assume o escopo de outro.
        </p>

        <Agent
          icon="📋"
          name="@pm"
          persona="Morgan"
          role="Product Manager · Strategist"
          scope="Estrategia, epics, PRDs, roadmap, decisoes go/no-go, course correction"
          useWhen={[
            "Precisa definir a direcao estrategica do produto",
            "Vai criar uma epic (conjunto de stories relacionadas)",
            "Hora de pivotar por dados ou feedback",
          ]}
          noUseWhen={[
            "Criar story individual — isso e @sm River",
            "Pesquisa de mercado profunda — e @analyst Alex",
            "Implementar codigo — e @dev Dex",
          ]}
          commands={["*create-prd", "*create-epic", "*execute-epic"]}
        />

        <Agent
          icon="📐"
          name="@po"
          persona="Pax"
          role="Product Owner · Validator"
          scope="Validacao de stories, backlog hygiene, checklist de qualidade, prioridades"
          useWhen={[
            "Revisar se uma story tem AC claros, testaveis e estimaveis",
            "Ordenar o backlog por valor/urgencia",
            "Dar verdict final antes do dev comecar",
          ]}
          commands={["*validate-story-draft"]}
        />

        <Agent
          icon="🌊"
          name="@sm"
          persona="River"
          role="Scrum Master · Facilitator"
          scope="Criar stories detalhadas a partir de epics, quebrar trabalho, gerenciar branches locais"
          useWhen={[
            "Uma epic foi criada e precisa virar stories concretas",
            "Story vaga precisa ser refinada pra o dev conseguir executar",
            "Handoff entre PM e Dev",
          ]}
          commands={["*draft", "*story-checklist"]}
        />

        <Agent
          icon="🔬"
          name="@analyst"
          persona="Alex"
          role="Market Analyst · Researcher"
          scope="Pesquisa de mercado, concorrencia, benchmarks, research.json, findings"
          useWhen={[
            "Antes de criar PRD — validar demanda e concorrencia",
            "Avaliar risco de ban/policy (como fez com Meta Ads)",
            "Pesquisar novos produtos ou verticais",
          ]}
          commands={["*research"]}
        />

        <Agent
          icon="🏛"
          name="@architect"
          persona="Aria"
          role="Architect · Design Authority"
          scope="Arquitetura tecnica, decisoes de stack, trade-offs, complexity budget"
          useWhen={[
            "Decisao de adicionar novo servico/biblioteca",
            "Design de sistema novo (ex: multi-tenant, filas)",
            "Conflito tecnico entre 2 abordagens",
          ]}
        />

        <Agent
          icon="🎨"
          name="@ux-design-expert"
          persona="Uma"
          role="UX Designer · Empathizer"
          scope="UI/UX, design system, atomic design, criativos de anuncio, acessibilidade"
          useWhen={[
            "Criar novo criativo de ad ou pagina",
            "Revisar copy pra compliance (Meta Ad Policy)",
            "Wireframe + front-end spec",
            "Auditoria de design system",
          ]}
          commands={["*research", "*wireframe", "*build", "*audit"]}
        />

        <Agent
          icon="🌱"
          name="@growth"
          persona="Gaia"
          role="Paid Media Operator"
          scope="Meta Ads + Google Ads, budget, audiences, kill/scale decisoes, ROAS"
          useWhen={[
            "Planejar campanha (blueprint, budget, audiences)",
            "Lancar campanha (via Marketing API no launcher autonomo)",
            "Review de performance (*review) — kill/scale decisions",
            "Otimizar criativos, landing page (delegando pra Uma/Dev)",
          ]}
          noUseWhen={[
            "Criar criativos do zero — delega pra Uma",
            "Fixar landing page — delega pra Dev",
            "Estrategia de produto — escala pro PM",
          ]}
          commands={["*blueprint", "*launch-campaign", "*review", "*kill-list", "*scale-list"]}
        />

        <Agent
          icon="🧠"
          name="Maya"
          persona="Chat AI no dashboard"
          role="Business Assistant"
          scope="Acompanhar negocio, responder perguntas contextuais (receita/vendas/VIP), lembrar pendencias, enviar relatorio diario"
          useWhen={[
            "Perguntas rapidas sobre o estado do negocio",
            "Sumario do dia",
            "Relatorio diario por email (8h BRT via cron)",
          ]}
          commands={["(conversa natural no chat do dashboard)"]}
        />

        <Agent
          icon="💾"
          name="@data-engineer"
          persona="Dara"
          role="Data Engineer"
          scope="Schema Prisma, migrations, queries otimizadas, DDL"
          useWhen={[
            "Adicionar novo modelo Prisma",
            "Migrar dados existentes",
            "Otimizar queries lentas",
          ]}
        />

        <Agent
          icon="💻"
          name="@dev"
          persona="Dex"
          role="Developer"
          scope="Implementacao de codigo, worktrees, branches locais, commits"
          useWhen={[
            "Qualquer story tecnica aprovada pelo PO",
            "Fix de bug",
            "Refactor localizado",
          ]}
          commands={["*develop"]}
        />

        <Agent
          icon="🛡"
          name="@qa"
          persona="Quinn"
          role="Quality Gates"
          scope="Lint, typecheck, test, build, coverage, gate verdicts (PASS/CONCERNS/FAIL)"
          useWhen={[
            "Pre-commit: validar que nao quebra quality gates",
            "Pre-merge: qa-loop (max 5 iteracoes)",
            "Pre-launch: sanity checks de negocio",
          ]}
          commands={["*qa-gate", "*qa-loop"]}
        />

        <Agent
          icon="🚀"
          name="@devops"
          persona="Gage"
          role="Deployment"
          scope="Git push, PR creation, releases, tags, infra (Railway), env vars"
          useWhen={[
            "Unico agente que pode git push (constituicao AIOX)",
            "Criar/fechar PRs",
            "Deploy e releases",
          ]}
          commands={["*push", "*create-pr", "*release"]}
        />
      </Section>

      {/* ─── PAGINAS ────────────────────────────────── */}
      <Section active={active === "paginas"}>
        <h2 style={h2}>🗂 Paginas do Admin</h2>
        <p style={p}>Cada pagina tem um agente responsavel e uma funcao especifica.</p>

        <PageEntry
          href="/admin/dashboard"
          title="Dashboard"
          owner="Maya (chat) + Doug/Barbara (visao geral)"
          description="KPIs do negocio (receita, vendas, ticket, taxa de conversao), chat Maya com contexto, pendencias dinamicas, grafico de receita 30d, App VIP stats."
        />
        <PageEntry
          href="/admin/vendas"
          title="Vendas"
          owner="Doug"
          description="Lista completa de orders aprovadas, filtros por plano/status/periodo."
        />
        <PageEntry
          href="/admin/campanhas"
          title="Campanhas (painel)"
          owner="Gaia (performance) + Doug/Barbara (CRUD)"
          description="Painel principal de Meta Ads. Cards de Blueprints ativos no topo, guia 'Como lançar nova campanha' com 6 passos, dashboard Meta em tempo real (hoje/ontem/7d/30d), sugestão do dia da Maya, grid de campanhas locais. Tabs: Campanhas, Mapa 🗺, Blueprint 📋, Setup BM."
        />
        <PageEntry
          href="/admin/campanhas/launch-blueprint"
          title="🗺 Launch Blueprint (editor)"
          owner="Gaia (engine) + Doug (editor)"
          description="Documento mestre editável de cada LAUNCH (LAUNCH-001/002/003...). Schema no banco: LaunchBlueprint + LaunchAudience + LaunchAdSet. Mapa hierárquico visual da campanha (campaign → audiences → ad sets → ads previstos com creative + copy). Botões: 🔧 Preparar (auto-fix), 🚀 Lançar (idempotente, cria CAs+lookalike+campanha+5 ad sets+16 ads), Dry-run, Duplicar pra nova LAUNCH. Substitui o launcher antigo (launch-001.ts DEPRECATED)."
        />
        <PageEntry
          href="/admin/campanhas/setup-bm"
          title="Setup BM (Barbara)"
          owner="Barbara (execucao) + auto-detect"
          description="Checklist 6 passos do setup Meta Business. Auto-detecta progresso a partir das settings reais. Ultimo step: testar conexao Meta."
        />
        <PageEntry
          href="/admin/campanhas/launch-plan"
          title="Launch Plan (DEPRECATED — redirect)"
          owner="(obsoleta)"
          description="Página antiga com 8 passos manuais + launcher hardcoded. Substituída em 2026-04-20 pelo blueprint. Mantida como redirect (auto-redireciona em 3s) pra preservar bookmarks. Não use."
        />
        <PageEntry
          href="/admin/configuracoes"
          title="Configuracoes"
          owner="Doug/Barbara"
          description="Webhook Hotmart, Meta (account ID, token, pixel ID, page ID), Brevo, Vagas VIP, planos Hotmart, links rapidos."
        />
        <PageEntry
          href="/admin/criativos"
          title="Criativos"
          owner="Uma (briefing) + Doug/Barbara (review + download)"
          description="6 criativos React renderizados pixel-perfect (3 Feed 1080x1080 + 2 Story 1080x1920 + 1 Banner 1200x628). Botao download PNG individual ou batch."
        />
        <PageEntry
          href="/admin/app-icon"
          title="App Icon"
          owner="Uma + Doug"
          description="Icone 1024x1024 PNG para upload no Meta for Developers (Longetividade Admin app)."
        />
        <PageEntry
          href="/admin/setup"
          title="Setup Barbara"
          owner="Maya (checklist dinamico) + Barbara (execucao)"
          description="Checklist completo de setup Barbara: email profissional, Brevo, BM Meta, pixel, token, compra teste. Auto-detect do progresso real."
        />
        <PageEntry
          href="/admin/agents/gaia"
          title="🌱 Gaia Control"
          owner="Gaia"
          description="Painel de controle da Gaia: 4 tabs (Pendentes/Em progresso/Concluídas/Arquivadas), stats por status, comandos (*review, *seed-knowledge), fila de decisões aguardando aprovação (approve+execute em 1-click), histórico, knowledge base. DIAGNOSE_FUNNEL pode virar checklist acionável com agentes AIOX atribuídos (Sprint 2)."
        />
        <PageEntry
          href="/admin/social-media"
          title="🌙 Social Media (Luna)"
          owner="Luna"
          description="Geração e agendamento de 12 posts/semana (Seg-Sáb × 3 slots: FEED_AM + REEL + STORY). Hierarquia commemorative > trend > bank. Auto-posting via Blotato API. Suporta 'Criar a partir de URL' (TikTok/YouTube/Article/PDF → SocialPost)."
        />
        <PageEntry
          href="/admin/video-intelligence"
          title="🎬 Video Intelligence"
          owner="(pipeline automático)"
          description="Espionagem de competidores. Cron sáb 20h BRT: Apify scrapa Instagram → Gemini 2.0 Flash analisa vídeos → Claude gera 3 conceitos pra Luna usar. Resultados salvos em VideoAnalysis + AgentKnowledge."
        />
        <PageEntry
          href="/admin/email-marketing"
          title="💌 Email Marketing"
          owner="Maya + Brevo"
          description="Templates Brevo, campanhas, segmentos, automações. Maya envia relatório diário 8h BRT. MCP Brevo permite agentes interagirem com CRM."
        />
        <PageEntry
          href="/admin/abandonos"
          title="🛒 Abandonos de checkout"
          owner="Doug"
          description="Lista de InitiateCheckout sem Purchase. Permite re-engajar via email/WhatsApp/anúncio retargeting."
        />
        <PageEntry
          href="/admin/app-users"
          title="👥 App Users (VIP)"
          owner="Doug + Maya"
          description="Mulheres VIP (compraram). Acompanha onboarding, hábitos diários (água, movimento), aderência. Liberado pós-compra Hotmart."
        />
        <PageEntry
          href="/admin/admins"
          title="🔐 Admins"
          owner="Doug"
          description="Gestão de usuários admin (Doug, Barbara). Convite por email, controle de acesso."
        />
        <PageEntry
          href="/admin/ecossistema"
          title="🌐 Ecossistema"
          owner="Doug"
          description="Visão macro do ecossistema de produtos Longetividade (Emagreça, Sono, Jejum, Detox, Movimento) e roadmap."
        />
        <PageEntry
          href="/admin/manual"
          title="📖 Manual (esta página)"
          owner="Doug + Claude"
          description="Manual completo do sistema. Atualizar conforme novas features são entregues. Quick start, capacidades, prompts AIOX, agentes, páginas, workflows, rotinas, glossário, arquivos-chave."
        />
      </Section>

      {/* ─── WORKFLOWS ─────────────────────────────── */}
      <Section active={active === "workflows"}>
        <h2 style={h2}>🔀 Workflows principais</h2>

        <h3 style={h3}>1. Rotina diaria (Doug/Barbara, 5 min)</h3>
        <ol style={p as React.CSSProperties}>
          <li>Abre <Link href="/admin/dashboard" style={{ color: "var(--accent)" }}>Dashboard</Link> — ve receita/vendas do dia</li>
          <li>Check email Brevo (8h BRT) — Maya mandou relatorio diario</li>
          <li>Se tem pendencia nova no PendingChecklist, abre <Link href="/admin/setup" style={{ color: "var(--accent)" }}>Setup</Link></li>
          <li>Abre <Link href="/admin/campanhas" style={{ color: "var(--accent)" }}>Campanhas</Link> — confere gasto do dia e ROAS</li>
          <li>Se tem decisoes pendentes em <Link href="/admin/agents/gaia" style={{ color: "var(--accent)" }}>Gaia</Link>, aprova/rejeita</li>
        </ol>

        <h3 style={h3}>2. Lancar nova campanha Meta (Blueprint, ~10-20 min)</h3>
        <p style={p}>
          Fluxo end-to-end do Blueprint (Sprint 3-6, 2026-04-20). Substitui o antigo
          launch-plan manual. <Link href="/admin/campanhas/launch-blueprint" style={{ color: "var(--accent)" }}>Abrir editor</Link>.
        </p>
        <ol style={p as React.CSSProperties}>
          <li>
            <strong>Criar/duplicar blueprint</strong> — <Link href="/admin/campanhas/launch-blueprint" style={{ color: "var(--accent)" }}>/admin/campanhas/launch-blueprint</Link>:
            primeira LAUNCH usa &ldquo;+ Seed LAUNCH-001&rdquo;. Pras seguintes (Sono, Jejum, Detox),
            abre uma existente e clica &ldquo;📋 Duplicar pra nova LAUNCH&rdquo; (prompt
            pede launchId, nome e produto). Reseta metaIds, vem em status=draft.
          </li>
          <li>
            <strong>Editar o plano no banco</strong> — direto na UI: budget total,
            por ad set, idade, genero, interesses (autocomplete Meta Targeting Search),
            activateOn (day_1/day_5/manual), numAds por camada (cold/warm/hot).
            Tudo salva automatico (PATCH em blur). Mapa hierarquico no topo mostra
            campanha → audiences → ad sets → ads previstos em tempo real.
          </li>
          <li>
            <strong>Garantir criativos</strong> — <Link href="/admin/criativos" style={{ color: "var(--accent)" }}>/admin/criativos</Link>:
            collection com slug casando <code>aset.creativesCollectionId</code> do blueprint
            (ex: <code>launch-001-pioneer</code>). 6 PNGs mininum (3 feed + 2 story + 1 banner).
            Clica &ldquo;📤 Upload pra Meta&rdquo; bulk no header — renderiza PNG via
            html-to-image + uploada em /adimages + salva metaImageHash.
          </li>
          <li>
            <strong>🔧 Preparar pra lançamento</strong> — botao na pagina do blueprint.
            Verifica collection + hashes + copies + META_PAGE_ID. Faz auto-fix do que
            da no server: seedCopies (textos padrao), upload de AI-generated via imageUrl
            CDN. Retorna checklist estruturado com acao clicavel por item faltando.
            Tudo verde = pronto pra lancar.
          </li>
          <li>
            <strong>🚀 Lancar no Meta (tudo PAUSED)</strong> — botao verde. Idempotente:
            pra cada entidade, pula se <code>metaXxxId</code> ja existe. Cria em sequencia:
            5 Custom Audiences (pixel events) + 1 Lookalike (nao-bloqueante, fica
            &ldquo;processing&rdquo; horas) + campanha + 5 ad sets + <strong>16 ads</strong>
            (AdCreative + Ad por creative pareado com copy active matching angle).
          </li>
          <li>
            <strong>Ativar no Meta Ads Manager</strong> — Doug/Barbara abrem manualmente
            os 3 cold (ASET-01/02/03) no Day 1. Warm+Hot (ASET-04/05) ficam pausados
            ate Day 5 (aguardar pixel acumular volume + Lookalike sair de processing).
          </li>
          <li>
            <strong>72h sem mexer</strong> — learning phase Meta. Evitar edits de budget,
            targeting, copy. Metricas so sao confiaveis a partir do Day 4.
          </li>
          <li>
            <strong>Day 4 review Gaia</strong> — <Link href="/admin/agents/gaia" style={{ color: "var(--accent)" }}>/admin/agents/gaia</Link>
            → clica <code>*review</code>. Gaia analisa CTR/CPA/ROAS dos 7 dias, propoe
            KILL/KEEP/SCALE/FIX/DIAGNOSE_FUNNEL/PROPOSE_ITERATION. Doug aprova via UI.
          </li>
        </ol>
        <p style={{ ...p, fontSize: 12, fontStyle: "italic", color: "var(--text-muted)" }}>
          Template virgem pra LAUNCH nova: <code>docs/blueprints/launch-template.md</code>
          (8 secoes: produto, persona, arquitetura, budget, criativos, audiences, kill
          triggers, cronograma). Exemplo preenchido: <code>docs/blueprints/launch-001.md</code>.
        </p>

        <h3 style={h3}>3. Review de performance (Gaia, 5 min)</h3>
        <ol style={p as React.CSSProperties}>
          <li>Abre <Link href="/admin/agents/gaia" style={{ color: "var(--accent)" }}>Gaia Control</Link></li>
          <li>Clica <code>*review</code> — Gaia analisa 7d de dados</li>
          <li>Ve decisoes propostas com reasoning</li>
          <li>Aprova individualmente ou em batch (Approve + Execute)</li>
          <li>Marketing API executa (pause/duplicate/budget) via Meta</li>
          <li>Estado registrado em AgentDecision pra auditoria</li>
        </ol>

        <h3 style={h3}>4. Criar nova story (Workflow AIOX)</h3>
        <ol style={p as React.CSSProperties}>
          <li>@pm define objetivo e contexto (epic)</li>
          <li>@sm *draft cria a story detalhada em <code>site/docs/stories/</code></li>
          <li>@po *validate-story-draft verifica AC</li>
          <li>@dev *develop implementa</li>
          <li>@qa *qa-gate roda lint/typecheck/test</li>
          <li>@devops *push empurra pra main → Railway deploy automatico</li>
        </ol>

        <h3 style={h3}>5. Responder rejeicao/policy da Meta</h3>
        <ol style={p as React.CSSProperties}>
          <li>Ad rejeitado no Meta Ads Manager com motivo</li>
          <li>Alex busca na knowledge base &ldquo;Meta Ad Policy&rdquo; pra confirmar o trigger</li>
          <li>Uma reescreve a copy ou criativo afetado</li>
          <li>Dev aplica a mudanca no componente ou blueprint</li>
          <li>Gaia retry do launch (idempotente — so substitui o que mudou)</li>
        </ol>
      </Section>

      {/* ─── ROTINAS ──────────────────────────────── */}
      <Section active={active === "rotinas"}>
        <h2 style={h2}>⏰ Rotinas automaticas & Cron</h2>
        <p style={p}>
          Algumas rotinas rodam automaticamente via cron externo (cron-job.org ou similar)
          chamando endpoints com header <code>x-cron-secret</code> configurado no Railway.
        </p>

        <h3 style={h3}>Cron diarios (recomendados)</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)" }}>
                <th style={{ padding: 10, textAlign: "left", color: "var(--text-muted)" }}>Horario BRT</th>
                <th style={{ padding: 10, textAlign: "left", color: "var(--text-muted)" }}>UTC</th>
                <th style={{ padding: 10, textAlign: "left", color: "var(--text-muted)" }}>Endpoint</th>
                <th style={{ padding: 10, textAlign: "left", color: "var(--text-muted)" }}>O que faz</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["08:00", "11:00", "/api/cron/maya-daily-report", "Maya envia relatorio do dia anterior pros admins"],
                ["08:30", "11:30", "/api/cron/gaia-review", "Gaia analisa campanhas e cria decisoes proposed + envia email"],
                ["09:00", "12:00", "/api/cron/email-sequence", "Dispara emails D+2 e D+5 pros leads"],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "0.5px solid var(--border-subtle)" }}>
                  <td style={{ padding: 10, color: "var(--text-primary)" }}>{row[0]}</td>
                  <td style={{ padding: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>{row[1]}</td>
                  <td style={{ padding: 10, fontFamily: "monospace", fontSize: 11, color: "var(--accent)" }}>{row[2]}</td>
                  <td style={{ padding: 10, color: "var(--text-secondary)" }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={h3}>Como configurar (uma vez)</h3>
        <ol style={p as React.CSSProperties}>
          <li>Gera <code>CRON_SECRET</code>: <code>openssl rand -hex 32</code> ou use{" "}
            <a href="https://passwordsgenerator.net" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>gerador online</a>
          </li>
          <li>Railway → Variables → <code>CRON_SECRET=&lt;valor&gt;</code></li>
          <li>Cria conta gratis em <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>cron-job.org</a></li>
          <li>Pra cada endpoint acima, cria um cronjob:
            <ul>
              <li>URL: a URL completa</li>
              <li>Metodo: GET</li>
              <li>Header custom: <code>x-cron-secret: &lt;mesmo valor&gt;</code></li>
              <li>Schedule: o horario UTC da tabela</li>
            </ul>
          </li>
        </ol>

        <h3 style={h3}>Auto-detecao local (nao precisa cron)</h3>
        <ul style={p as React.CSSProperties}>
          <li><strong>Setup BM checklist</strong> — auto-marca steps 1-5 ao detectar settings configuradas</li>
          <li><strong>Launch Plan checklist</strong> — auto-marca steps 1-2 quando upload tem sucesso, steps 3-7 quando launch tem sucesso</li>
          <li><strong>Maya PendingChecklist</strong> — derivado em tempo real de settings/orders</li>
          <li><strong>Meta Ads insights</strong> — cache 60s, fetch ao abrir /admin/campanhas</li>
        </ul>
      </Section>

      {/* ─── GLOSSARIO ────────────────────────────── */}
      <Section active={active === "glossario"}>
        <h2 style={h2}>📖 Glossario</h2>
        <p style={p}>Termos usados no sistema.</p>

        {[
          { term: "CTR (Click-Through Rate)", def: "Percentual de pessoas que viram o anuncio e clicaram. Calculado: clicks / impressions × 100. Benchmark weight loss BR: 1.5-2.5% saudavel, <0.8% ruim." },
          { term: "CPA (Cost Per Acquisition)", def: "Quanto custa cada compra. Calculado: spend / purchases. Gaia considera saudavel ate 1.5× o ticket medio." },
          { term: "CPM (Cost per Mille)", def: "Custo por 1.000 impressoes. Indica quao competitiva esta a audiencia." },
          { term: "CPC (Cost per Click)", def: "Custo por clique. Varia muito por vertical e audiencia." },
          { term: "ROAS (Return on Ad Spend)", def: "Quanto voltou de receita pra cada R$ 1 gasto. Calculado: purchase_value / spend. Gaia: >= 1.0 break-even, >= 1.5 saudavel, >= 2.0 escalavel." },
          { term: "Ad set", def: "Grupo de anuncios com a mesma segmentacao/budget/otimizacao. Uma campanha tem 1+ ad sets." },
          { term: "Custom Audience", def: "Lista de pessoas baseada em evento (compraram, visitaram, engajaram). Usada pra retargeting ou exclusao." },
          { term: "Lookalike", def: "Audiencia parecida com um source (ex: compradores). Precisa de minimo 100 pessoas no source, ideal 1.000+." },
          { term: "Learning Phase", def: "Primeiras 72h apos lancar um ad set. Algoritmo Meta ta aprendendo. NAO MEXER durante esse periodo." },
          { term: "CBO (Campaign Budget Optimization)", def: "Meta controla distribuicao do budget entre ad sets. No LAUNCH-001 esta DESLIGADO — budget fica no ad set (controle manual)." },
          { term: "Blueprint", def: "Estrutura de dados em TS descrevendo uma campanha completa (campaign + ad sets + creatives + copies)." },
          { term: "Idempotente", def: "Rodar 2x da o mesmo resultado. Launcher Gaia e idempotente — nao cria duplicata." },
          { term: "Dark post", def: "Post nao-publicado na Page, usado so para ads. App precisa estar em Live mode pra criar." },
          { term: "Advantage+ Audience", def: "Meta expande automaticamente a audiencia via IA. Desligado (0) pra teste, ligado (1) pra escala." },
          { term: "LGPD", def: "Lei Geral de Protecao de Dados (Lei 13.709/2018). Regula o tratamento de dados pessoais no Brasil." },
          { term: "Pixel / Dataset", def: "Codigo da Meta que rastreia eventos no site. Nosso: 953736244279938 (&ldquo;Dados de Longetividade&rdquo;)." },
          { term: "Marketing API", def: "API do Meta para criar/gerenciar campanhas programaticamente. Usado pelo launcher autonomo da Gaia." },
          { term: "Conversions API (CAPI)", def: "API server-side do Meta para rastreamento de conversoes (redundancia do Pixel client-side)." },
          { term: "Ticket medio", def: "Valor medio de cada venda. Calculado: total_revenue / total_orders." },
          { term: "AgentDecision", def: "Registro de decisao proposta por um agente (state machine: proposed → approved → executed)." },
          { term: "AgentKnowledge", def: "Entrada na base de conhecimento de um agente (kind: fact/rule/benchmark/reference/learning/policy)." },
          { term: "AppSetting", def: "Tabela key-value no banco. Usada para configuracoes que mudam sem redeploy (tokens, flags, etc)." },
        ].map((g, i) => (
          <div key={i} style={{ padding: "10px 0", borderBottom: "0.5px solid var(--border-subtle)" }}>
            <strong style={{ color: "var(--text-primary)", fontSize: 13 }}>{g.term}</strong>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.5 }}>
              {g.def}
            </div>
          </div>
        ))}
      </Section>

      {/* ─── ARQUIVOS ─────────────────────────────── */}
      <Section active={active === "arquivos"}>
        <h2 style={h2}>📁 Arquivos-chave</h2>
        <p style={p}>Referencia rapida de onde ta cada coisa no codigo.</p>

        <h3 style={h3}>📋 Templates e snapshots de LAUNCH (baixar)</h3>
        <p style={p}>
          Documentos markdown com todo o plano de campanha. Serve pra auditar, versionar,
          ou colar em chat/email. 3 origens distintas:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <DocDownloadRow
            icon="📄"
            title="Template virgem (launch-template.md)"
            description="Estrutura padrão com 8 seções (produto, persona, arquitetura, budget, criativos, audiences, kill triggers, cronograma). Use como base pra LAUNCHes futuras (Sono, Jejum, Detox). Placeholders [MAIUSCULAS] pra preencher."
            viewHref="/api/admin/docs/blueprints/launch-template.md"
            downloadHref="/api/admin/docs/blueprints/launch-template.md?download=1"
          />
          <DocDownloadRow
            icon="📚"
            title="Exemplo preenchido (launch-001.md)"
            description="LAUNCH-001 Longetividade Emagreca Sem Dieta documentada com tags [AGENTES CONFIRMARAM] / [INFERIDO DO CODIGO] / [LACUNA]. Compilado de 5 fontes (blueprint .ts DEPRECATED, launch-plan antigo, seed do banco, gaia-knowledge, landing /emagreca-sem-dieta). Snapshot estatico do dia 2026-04-20."
            viewHref="/api/admin/docs/blueprints/launch-001.md"
            downloadHref="/api/admin/docs/blueprints/launch-001.md?download=1"
          />
          <DocDownloadRow
            icon="🔄"
            title="Snapshot dinamico do blueprint atual (gerado on-demand)"
            description="Markdown gerado em tempo real do estado atual do banco. Inclui metaIds pos-launch, ajustes feitos depois, status real das audiences/ad sets. Sempre refletido em relacao a /admin/campanhas/launch-blueprint. Use pra tirar 'foto' antes de mudar algo critico."
            viewHref="/api/admin/campaigns/blueprint/LAUNCH-001/export"
            downloadHref="/api/admin/campaigns/blueprint/LAUNCH-001/export?download=1"
          />
        </div>
        <p style={{ ...p, fontSize: 12, fontStyle: "italic" }}>
          💡 Dica: pra baixar snapshot de outra LAUNCH, troca <code>LAUNCH-001</code> na URL pro launchId desejado.
          O botão &ldquo;📥 Exportar .md&rdquo; no <Link href="/admin/campanhas/launch-blueprint" style={{ color: "var(--accent)" }}>blueprint editor</Link> também serve pra baixar do blueprint selecionado.
        </p>

        <h3 style={h3}>📁 Onde ta cada coisa no codigo</h3>

        {[
          { section: "Agentes (personas)", files: [
            ["aiox-core-main/AGENTS.md", "Roster completo + atalhos CLI"],
            ["aiox-core-main/.aiox-core/constitution.md", "6 principios nao-negociaveis"],
            ["aiox-core-main/.aiox-core/development/agents/pm.md", "@pm Morgan"],
            ["aiox-core-main/.aiox-core/development/agents/growth.md", "@growth Gaia (criado 2026-04-11)"],
          ]},
          { section: "Stories AIOX", files: [
            ["site/docs/stories/STORY-ADS-001-meta-ads-dashboard.md", ""],
            ["site/docs/stories/STORY-ADS-002-barbara-bm-setup.md", ""],
            ["site/docs/stories/STORY-CREATIVE-001-criativos-meta-ads.md", ""],
            ["site/docs/stories/STORY-EMAIL-001-sequencia-brevo.md", ""],
            ["site/docs/stories/STORY-LAUNCH-001-campanha-pioneira.md", ""],
            ["site/docs/stories/STORY-MAYA-001, 002, 003.md", ""],
            ["site/docs/stories/STORY-TRACK-001-pixel-verificacao.md", ""],
            ["site/docs/stories/STORY-OG-001-open-graph-image.md", ""],
          ]},
          { section: "Bibliotecas core", files: [
            ["src/lib/settings.ts", "getSetting() com cache + env fallback"],
            ["src/lib/meta-ads.ts", "Wrapper Graph API (insights)"],
            ["src/lib/meta-launcher.ts", "Launcher autonomo (campaigns/adsets/ads/creatives)"],
            ["src/lib/gaia-review.ts", "Logica de kill/scale"],
            ["src/lib/gaia-knowledge-seed.ts", "Base inicial da Gaia (13 entries)"],
            ["src/lib/gaia-executor.ts", "Executa decisoes via Marketing API"],
            ["src/lib/maya-report.ts", "Builder do email diario Maya"],
            ["src/lib/email-sequence.ts", "Templates welcome/value/offer"],
            ["src/lib/email.ts", "Wrapper sendEmail Brevo"],
          ]},
          { section: "Blueprints", files: [
            ["src/lib/blueprints/launch-001.ts", "Blueprint LAUNCH-001 (3 ad sets + copies + creatives)"],
          ]},
          { section: "Criativos", files: [
            ["src/components/creatives/brand.ts", "Tokens de marca (cores, fontes)"],
            ["src/components/creatives/creative-feed-dor.tsx", "Feed 1080x1080 - Dor"],
            ["src/components/creatives/creative-feed-prova.tsx", "Feed 1080x1080 - Prova Social"],
            ["src/components/creatives/creative-feed-objecao.tsx", "Feed 1080x1080 - Objeção"],
            ["src/components/creatives/creative-story-stat.tsx", "Story 1080x1920 - Stat"],
            ["src/components/creatives/creative-story-cta.tsx", "Story 1080x1920 - CTA"],
            ["src/components/creatives/creative-banner-display.tsx", "Banner 1200x628 - Display"],
          ]},
          { section: "APIs admin", files: [
            ["src/app/api/admin/stats/route.ts", "Dashboard KPIs"],
            ["src/app/api/admin/meta-insights/route.ts", "Meta Ads insights"],
            ["src/app/api/admin/sync-meta-ads/route.ts", "Sync manual de campanhas"],
            ["src/app/api/admin/campaigns/launch/route.ts", "Launcher autonomo"],
            ["src/app/api/admin/campaigns/upload-creative/route.ts", "Upload PNG → Meta /adimages"],
            ["src/app/api/admin/agents/gaia/review/route.ts", "Gaia review"],
            ["src/app/api/admin/agents/gaia/decisions/route.ts", "Decisions CRUD"],
            ["src/app/api/admin/agents/gaia/knowledge/route.ts", "Knowledge CRUD"],
            ["src/app/api/admin/maya/context/route.ts", "Maya context (vendas/pendencias)"],
            ["src/app/api/admin/maya/route.ts", "Maya chat (Anthropic)"],
            ["src/app/api/admin/maya/daily-report/route.ts", "Maya daily report manual"],
            ["src/app/api/admin/test-meta-connection/route.ts", "Teste conexao Meta"],
            ["src/app/api/admin/test-brevo/route.ts", "Teste conexao Brevo"],
          ]},
          { section: "Cron publicos", files: [
            ["src/app/api/cron/maya-daily-report/route.ts", "Maya relatorio diario (CRON_SECRET)"],
            ["src/app/api/cron/email-sequence/route.ts", "Brevo D+2/D+5 (CRON_SECRET)"],
            ["src/app/api/cron/gaia-review/route.ts", "Gaia review diario (CRON_SECRET)"],
          ]},
          { section: "Prisma schema", files: [
            ["prisma/schema.prisma", "Order, AdminUser, Lead, AgentKnowledge, AgentDecision, AppSetting, Campaign, CampaignMetric, etc"],
          ]},
        ].map((sec, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              {sec.section}
            </div>
            {sec.files.map(([path, desc], j) => (
              <div
                key={j}
                style={{
                  padding: "6px 12px",
                  background: "var(--bg-secondary)",
                  borderRadius: 6,
                  marginBottom: 4,
                  fontSize: 11,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <code style={{ color: "var(--accent)", flexShrink: 0 }}>{path}</code>
                {desc && <span style={{ color: "var(--text-muted)" }}>— {desc}</span>}
              </div>
            ))}
          </div>
        ))}
      </Section>
    </div>
  );
}
