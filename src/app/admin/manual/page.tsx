"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

type SectionId = "agentes" | "paginas" | "workflows" | "rotinas" | "glossario" | "arquivos";

const SECTIONS: Array<{ id: SectionId; label: string; icon: string }> = [
  { id: "agentes", label: "Agentes AIOX", icon: "🤖" },
  { id: "paginas", label: "Paginas do Admin", icon: "🗂" },
  { id: "workflows", label: "Workflows", icon: "🔀" },
  { id: "rotinas", label: "Rotinas & Cron", icon: "⏰" },
  { id: "glossario", label: "Glossario", icon: "📖" },
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
  const [active, setActive] = useState<SectionId>("agentes");

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
          Guia completo de agentes AIOX, paginas do admin, workflows, rotinas e glossario.
          Atualizado em 2026-04-11.
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
          title="Campanhas (abas: Campanhas, Mapa, Setup BM, Launch Plan)"
          owner="Gaia (performance) + Doug/Barbara (CRUD)"
          description="Dashboard Meta Ads em tempo real (filtros hoje/ontem/7d/30d), sugestao do dia, grid de campanhas do banco local, mapa visual, setup BM checklist, launch plan blueprint."
        />
        <PageEntry
          href="/admin/campanhas/setup-bm"
          title="Setup BM (Barbara)"
          owner="Barbara (execucao) + auto-detect"
          description="Checklist 6 passos do setup Meta Business. Auto-detecta progresso a partir das settings reais. Ultimo step: testar conexao Meta."
        />
        <PageEntry
          href="/admin/campanhas/launch-plan"
          title="Launch Plan — Primeira Campanha"
          owner="Gaia (blueprint + launcher)"
          description="Blueprint LAUNCH-001 completo. Upload de 6 criativos via Marketing API + launch autonomo de campanha/ad sets/ads. Checklist 8 passos auto-marcado conforme o launcher tem sucesso."
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
          title="Gaia Control"
          owner="Gaia"
          description="Painel de controle da Gaia: stats (decisoes por status + knowledge), comandos (*review, *seed-knowledge), fila de decisoes aguardando aprovacao (approve+execute em 1-click), historico, knowledge base collapsible."
        />
        <PageEntry
          href="/admin/ecossistema"
          title="Ecossistema"
          owner="Doug"
          description="Visao macro do ecossistema de produtos Longetividade e roadmap."
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
