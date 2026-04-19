"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageHelp from "@/components/admin/PageHelp";
import { PageHeader } from "@/components/admin/ui";

type Decision = {
  id: string;
  agentId: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  params: Record<string, unknown>;
  reasoning: string;
  priority: "low" | "normal" | "high" | "critical";
  status: "proposed" | "approved" | "executed" | "rejected" | "failed";
  approvedBy: string | null;
  approvedAt: string | null;
  executedAt: string | null;
  executionResult: Record<string, unknown> | null;
  rejectedReason: string | null;
  createdAt: string;
};

type KnowledgeEntry = {
  id: string;
  kind: string;
  title: string;
  body: string;
  source: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type Verdict = {
  adSetId: string;
  adSetName: string;
  verdict:
    | "KILL"
    | "KEEP"
    | "SCALE_HORIZONTAL"
    | "SCALE_VERTICAL"
    | "INSUFFICIENT_DATA"
    | "FIX_AUDIENCE"
    | "FIX_COPY"
    | "FIX_CREATIVE"
    | "FIX_BUDGET"
    | "DIAGNOSE_FUNNEL"
    | "PROPOSE_ITERATION";
  reasoning: string[];
  metrics: {
    spend: number;
    impressions: number;
    clicks: number;
    ctr: number;
    cpa: number;
    purchases: number;
    roas: number;
  };
};

type ReviewResponse = {
  ok: boolean;
  summary?: {
    total: number;
    kill: number;
    keep: number;
    scale: number;
    insufficient: number;
    totalSpend: number;
    totalRevenue: number;
    blendedRoas: number;
    blendedCpa: number;
  };
  verdicts?: Verdict[];
  decisionsCreated?: number;
  error?: string;
};

const PRIORITY_COLOR: Record<string, string> = {
  low: "#888",
  normal: "#4A90D9",
  high: "#D4A94B",
  critical: "#C4787A",
};

const STATUS_COLOR: Record<string, string> = {
  proposed: "#4A90D9",
  approved: "#D4A94B",
  executed: "#6B9E6B",
  rejected: "#888",
  failed: "#C4787A",
};

const VERDICT_COLOR: Record<string, string> = {
  KILL: "#C4787A",
  KEEP: "#888",
  SCALE_HORIZONTAL: "#6B9E6B",
  SCALE_VERTICAL: "#7A9E7E",
  INSUFFICIENT_DATA: "#888",
  // Growth Operator
  FIX_AUDIENCE: "#9B72CF",
  FIX_COPY: "#D4A94B",
  FIX_CREATIVE: "#D4A94B",
  FIX_BUDGET: "#4A90D9",
  DIAGNOSE_FUNNEL: "#C4787A",
  PROPOSE_ITERATION: "#9B72CF",
};

// Acoes que NAO executam (DIAGNOSE_FUNNEL, PROPOSE_ITERATION) — exibem
// botoes diferentes (Marcar como lido / Levar pro council).
const NO_EXECUTION_ACTIONS = new Set(["DIAGNOSE_FUNNEL", "PROPOSE_ITERATION"]);

// Render do bloco especifico de cada tipo de decisao.
function renderDecisionBody(d: Decision): React.ReactNode {
  const params = d.params ?? {};
  const action = d.action;

  if (action === "DIAGNOSE_FUNNEL") {
    const funnel = params.funnelBreakdown as Record<string, number> | undefined;
    const bottleneck = params.bottleneck as string | undefined;
    const recommendation = params.recommendationText as string | undefined;
    return (
      <div style={{ marginTop: 8, padding: 12, background: "var(--bg-card)", borderRadius: 8 }}>
        {funnel && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {[
              ["Impr", funnel.impressions],
              ["Cliques", funnel.clicks],
              ["PageViews", funnel.pageViews],
              ["Leads", funnel.leads],
              ["IniCheck", funnel.initiateCheckouts],
              ["Compras", funnel.purchases],
            ].map(([k, v]) => (
              <span
                key={k as string}
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: "var(--bg-secondary)",
                  color: v === 0 ? "#C4787A" : "var(--text-primary)",
                  fontWeight: 600,
                }}
              >
                {k}: {(v as number).toLocaleString("pt-BR")}
              </span>
            ))}
          </div>
        )}
        {bottleneck && (
          <div style={{ fontSize: 12, marginBottom: 6 }}>
            <strong>Bottleneck:</strong>{" "}
            <span style={{ color: "#C4787A", fontWeight: 700, textTransform: "uppercase" }}>{bottleneck}</span>
          </div>
        )}
        {recommendation && (
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <strong>Recomendacao:</strong> {recommendation}
          </div>
        )}
      </div>
    );
  }

  if (action === "PROPOSE_ITERATION") {
    const learnings = (params.learnings as string[] | undefined) ?? [];
    const next = params.suggestedNextStep as Record<string, string> | undefined;
    return (
      <div style={{ marginTop: 8, padding: 12, background: "var(--bg-card)", borderRadius: 8 }}>
        {learnings.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              Learnings
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {learnings.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        )}
        {next && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              Sugestao proxima iteracao
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {next.personaShift && <div><strong>Persona:</strong> {next.personaShift}</div>}
              {next.angleShift && <div><strong>Angulo:</strong> {next.angleShift}</div>}
              {next.offerShift && <div><strong>Oferta:</strong> {next.offerShift}</div>}
              {next.notes && <div style={{ fontStyle: "italic", marginTop: 4 }}>{next.notes}</div>}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (action === "FIX_AUDIENCE") {
    const proposed = params.proposedTargeting as Record<string, unknown> | undefined;
    const expected = params.expectedImpact as string | undefined;
    return (
      <div style={{ marginTop: 8, padding: 12, background: "var(--bg-card)", borderRadius: 8 }}>
        {expected && (
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
            <strong>Impacto esperado:</strong> {expected}
          </div>
        )}
        {proposed && (
          <pre style={{ fontSize: 11, fontFamily: "ui-monospace, monospace", background: "var(--bg-secondary)", padding: 10, borderRadius: 6, margin: 0, overflowX: "auto" }}>
{JSON.stringify(proposed, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (action === "FIX_COPY" || action === "FIX_CREATIVE") {
    const briefing =
      (params.proposedCreativeBriefing as string | undefined) ??
      (params.proposedCopyDirection as string | undefined);
    return briefing ? (
      <div style={{ marginTop: 8, padding: 12, background: "var(--bg-card)", borderRadius: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
          Briefing pra Uma
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{briefing}</div>
      </div>
    ) : null;
  }

  if (action === "FIX_BUDGET" || action === "INCREASE_BUDGET" || action === "DECREASE_BUDGET") {
    const current = (params.currentBudgetCents as number | undefined) ?? 0;
    const proposed = (params.proposedBudgetCents as number | undefined) ?? (params.newBudgetCents as number | undefined) ?? 0;
    if (proposed > 0) {
      return (
        <div style={{ marginTop: 8, padding: 12, background: "var(--bg-card)", borderRadius: 8, fontSize: 12 }}>
          Budget: {fmtBRL(current / 100)} → <strong style={{ color: proposed > current ? "#6B9E6B" : "#D4A94B" }}>{fmtBRL(proposed / 100)}</strong>
        </div>
      );
    }
  }

  return null;
}

function fmtBRL(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 14,
  padding: 20,
};

export default function GaiaControlPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [knowledgeCounts, setKnowledgeCounts] = useState<Record<string, number>>({});
  const [lastReview, setLastReview] = useState<ReviewResponse | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDecisions = useCallback(async () => {
    const res = await fetch("/api/admin/agents/gaia/decisions?limit=50");
    const data = await res.json();
    if (data.ok) {
      setDecisions(data.decisions);
      setCounts(data.counts);
    }
  }, []);

  const loadKnowledge = useCallback(async () => {
    const res = await fetch("/api/admin/agents/gaia/knowledge");
    const data = await res.json();
    if (data.ok) {
      setKnowledge(data.entries);
      setKnowledgeCounts(data.counts);
    }
  }, []);

  useEffect(() => {
    loadDecisions();
    loadKnowledge();
  }, [loadDecisions, loadKnowledge]);

  async function runCommand(cmd: "review" | "review-dry" | "seed-knowledge") {
    setRunning(cmd);
    setError(null);
    try {
      if (cmd === "review" || cmd === "review-dry") {
        const res = await fetch("/api/admin/agents/gaia/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preset: "last_7d", dryRun: cmd === "review-dry" }),
        });
        const raw = await res.text();
        let data: ReviewResponse;
        try {
          data = raw ? JSON.parse(raw) : { ok: false, error: "Resposta vazia" };
        } catch {
          data = {
            ok: false,
            error: `HTTP ${res.status}. Body: ${raw.slice(0, 200) || "(vazio)"}`,
          };
        }
        setLastReview(data);
        if (!data.ok) setError(data.error ?? "Falha");
        await loadDecisions();
      }
      if (cmd === "seed-knowledge") {
        const res = await fetch("/api/admin/agents/gaia/seed-knowledge", {
          method: "POST",
        });
        const raw = await res.text();
        let data: { ok: boolean; error?: string };
        try {
          data = raw ? JSON.parse(raw) : { ok: false, error: "Resposta vazia" };
        } catch {
          data = {
            ok: false,
            error: `HTTP ${res.status}. Body: ${raw.slice(0, 200) || "(vazio)"}. Se aparecer logo apos deploy, aguarde 1-2min pro Railway rodar prisma db push.`,
          };
        }
        if (!data.ok) setError(data.error ?? "Falha");
        await loadKnowledge();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(null);
    }
  }

  async function actOnDecision(decisionId: string, action: string) {
    setRunning(`${action}-${decisionId}`);
    setError(null);
    try {
      const res = await fetch("/api/admin/agents/gaia/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId, action }),
      });
      const data = await res.json();
      if (!data.ok && data.error) setError(data.error);
      await loadDecisions();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(null);
    }
  }

  const pendingDecisions = decisions.filter((d) => d.status === "proposed" || d.status === "approved");
  const recentDecisions = decisions.filter((d) => d.status === "executed" || d.status === "failed" || d.status === "rejected").slice(0, 10);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader
        title="Gaia · Growth Operator"
        subtitle="Passo 3 do fluxo Meta Ads. Gaia analisa ROAS/CTR de campanhas ativas e propõe pause/scale/duplicate. Você aprova aqui, o executor aplica na Meta sozinho."
        icon="🌱"
        breadcrumb="Agente AIOX · @growth"
      />

      <PageHelp
        pageId="agents-gaia"
        agent={{ icon: "🌱", name: "Gaia", role: "Paid Media Operator" }}
        title="Painel de controle da operação de mídia paga"
        quickActions={[
          { label: "*review", description: "Analisa 7 dias de campanhas e cria propostas de ação (kill/scale/budget)" },
          { label: "*review --dry-run", description: "Só analisa, não cria decisões — útil pra validar sem comprometer" },
          { label: "*seed-knowledge", description: "Popula a base inicial da Gaia (13 entries: regras, benchmarks, policy)" },
          { label: "Approve + Execute", description: "Aprova a decisão e executa via Marketing API em 1 clique" },
          { label: "Só aprovar", description: "Aprova mas deixa a execução pra depois (fluxo mais cauteloso)" },
          { label: "Rejeitar", description: "Descarta a proposta — fica no histórico com o motivo" },
        ]}
      >
        <p>
          A Gaia é a operadora de mídia paga do Longetividade. Ela não cria criativos
          (isso é a Uma) nem implementa código (isso é o Dex) — o foco dela é decidir
          <strong> o que fazer com as campanhas rodando</strong>: matar losers, escalar
          vencedores, ajustar budget.
        </p>
        <p>
          <strong>Fluxo típico:</strong> você clica <code>*review</code> → Gaia consulta
          os insights Meta dos últimos 7 dias → aplica as regras kill/scale (ex: mata
          ad sets com CTR {"<"} 0.8% após 5k impressões) → cria decisões em
          <code> status=proposed</code>. Você revisa cada uma e aprova/rejeita. Decisões
          aprovadas viram chamadas reais à Marketing API.
        </p>
        <p>
          <strong>Tudo reversível:</strong> pause pode virar unpause, duplicate pode ser
          deletado, budget pode voltar. A Gaia nunca faz nada sem seu OK — exceto no
          autopilot mode (futuro, ainda não implementado).
        </p>
        <p>
          <strong>Knowledge base:</strong> a base de conhecimento é o que torna a Gaia
          inteligente. Ela lê as regras da base pra tomar decisões. Você pode adicionar
          entries novas via API ou pedir pra mim via chat. Quando o conhecimento crescer,
          a Gaia fica mais precisa.
        </p>
      </PageHelp>

      {error && (
        <div
          style={{
            padding: 12,
            background: "rgba(196,120,122,0.12)",
            border: "0.5px solid rgba(196,120,122,0.4)",
            borderRadius: 10,
            color: "#C4787A",
            fontSize: 13,
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {/* Stats overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Decisões propostas", value: counts.proposed ?? 0, color: "#4A90D9" },
          { label: "Aprovadas", value: counts.approved ?? 0, color: "#D4A94B" },
          { label: "Executadas", value: counts.executed ?? 0, color: "#6B9E6B" },
          { label: "Rejeitadas / Falhas", value: (counts.rejected ?? 0) + (counts.failed ?? 0), color: "#888" },
          { label: "Entries knowledge", value: knowledge.length, color: "#9EBF9E" },
        ].map((s) => (
          <div key={s.label} style={card}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Commands */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
          🎮 Comandos da Gaia
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { key: "review", label: "*review (analisa + cria propostas)", cmd: "review" as const, primary: true },
            { key: "review-dry", label: "*review --dry-run (só analisa)", cmd: "review-dry" as const, primary: false },
            { key: "seed", label: "*seed-knowledge (popular base)", cmd: "seed-knowledge" as const, primary: false },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => runCommand(b.cmd)}
              disabled={running === b.cmd}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                background: b.primary ? "var(--accent)" : "var(--bg-secondary)",
                color: b.primary ? "#fff" : "var(--text-primary)",
                border: b.primary ? "none" : "0.5px solid var(--border-default)",
                fontSize: 13,
                fontWeight: 600,
                cursor: running === b.cmd ? "wait" : "pointer",
                opacity: running === b.cmd ? 0.6 : 1,
              }}
            >
              {running === b.cmd ? "Rodando..." : b.label}
            </button>
          ))}
        </div>

        {lastReview?.summary && (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              background: "var(--bg-secondary)",
              borderRadius: 10,
              fontSize: 12,
              fontFamily: "ui-monospace, monospace",
              lineHeight: 1.6,
            }}
          >
            <strong>Ultimo review:</strong> {lastReview.summary.total} ad sets ·{" "}
            <span style={{ color: "#C4787A" }}>{lastReview.summary.kill} kill</span> ·{" "}
            <span style={{ color: "#888" }}>{lastReview.summary.keep} keep</span> ·{" "}
            <span style={{ color: "#6B9E6B" }}>{lastReview.summary.scale} scale</span> ·{" "}
            <span style={{ color: "#888" }}>{lastReview.summary.insufficient} insuficiente</span>
            <br />
            Spend total: <strong>{fmtBRL(lastReview.summary.totalSpend)}</strong> · Revenue:{" "}
            <strong>{fmtBRL(lastReview.summary.totalRevenue)}</strong> · Blended ROAS:{" "}
            <strong style={{ color: lastReview.summary.blendedRoas >= 1 ? "#6B9E6B" : "#C4787A" }}>
              {lastReview.summary.blendedRoas.toFixed(2)}x
            </strong>
            <br />
            Decisoes criadas nesse run: <strong>{lastReview.decisionsCreated ?? 0}</strong>
          </div>
        )}
      </div>

      {/* Decisoes pendentes */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
          ⚖️ Decisoes pendentes de aprovacao ({pendingDecisions.length})
        </div>
        {pendingDecisions.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Nenhuma decisao pendente. Rode <code>*review</code> para a Gaia analisar as campanhas.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingDecisions.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: 14,
                  background: "var(--bg-secondary)",
                  borderRadius: 10,
                  border: `0.5px solid ${PRIORITY_COLOR[d.priority]}`,
                  borderLeftWidth: 3,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        background: PRIORITY_COLOR[d.priority],
                        padding: "2px 8px",
                        borderRadius: 999,
                        textTransform: "uppercase",
                      }}
                    >
                      {d.priority}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: STATUS_COLOR[d.status],
                        background: `${STATUS_COLOR[d.status]}22`,
                        padding: "2px 8px",
                        borderRadius: 999,
                        textTransform: "uppercase",
                      }}
                    >
                      {d.status}
                    </span>
                    <code style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{d.action}</code>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmtDate(d.createdAt)}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {d.targetName}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>
                  {d.reasoning}
                </div>
                {renderDecisionBody(d)}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {d.status === "proposed" && NO_EXECUTION_ACTIONS.has(d.action) && (
                    <>
                      {/* DIAGNOSE_FUNNEL / PROPOSE_ITERATION — sao reports, nao acoes */}
                      <button
                        onClick={() => actOnDecision(d.id, "approve_execute")}
                        disabled={running?.startsWith("approve") ?? false}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "#6B9E6B",
                          color: "#fff",
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✓ Marcar como lido
                      </button>
                      {d.action === "PROPOSE_ITERATION" && (
                        <Link
                          href={`/admin/campanhas?fromGaia=${d.id}`}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 8,
                            background: "#9B72CF",
                            color: "#fff",
                            border: "none",
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          → Levar pro council
                        </Link>
                      )}
                      <button
                        onClick={() => actOnDecision(d.id, "reject")}
                        disabled={running?.startsWith("reject") ?? false}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "var(--bg-card)",
                          color: "var(--text-muted)",
                          border: "0.5px solid var(--border-default)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Arquivar
                      </button>
                    </>
                  )}
                  {d.status === "proposed" && !NO_EXECUTION_ACTIONS.has(d.action) && (
                    <>
                      <button
                        onClick={() => actOnDecision(d.id, "approve_execute")}
                        disabled={running?.startsWith("approve") ?? false}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "#6B9E6B",
                          color: "#fff",
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ✓ Aprovar + Executar
                      </button>
                      <button
                        onClick={() => actOnDecision(d.id, "approve")}
                        disabled={running?.startsWith("approve") ?? false}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "var(--bg-card)",
                          color: "var(--text-primary)",
                          border: "0.5px solid var(--border-default)",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Só aprovar
                      </button>
                      <button
                        onClick={() => actOnDecision(d.id, "reject")}
                        disabled={running?.startsWith("reject") ?? false}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "var(--bg-card)",
                          color: "#C4787A",
                          border: "0.5px solid #C4787A",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ✗ Rejeitar
                      </button>
                    </>
                  )}
                  {d.status === "approved" && (
                    <button
                      onClick={() => actOnDecision(d.id, "execute")}
                      disabled={running?.startsWith("execute") ?? false}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        background: "#6B9E6B",
                        color: "#fff",
                        border: "none",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ▶ Executar agora
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico recente */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
          📜 Histórico recente (10 últimas)
        </div>
        {recentDecisions.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhum historico ainda.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recentDecisions.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: "10px 12px",
                  background: "var(--bg-secondary)",
                  borderRadius: 8,
                  fontSize: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 200 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: STATUS_COLOR[d.status],
                      background: `${STATUS_COLOR[d.status]}22`,
                      padding: "2px 8px",
                      borderRadius: 999,
                      textTransform: "uppercase",
                    }}
                  >
                    {d.status}
                  </span>
                  <code>{d.action}</code>
                  <span style={{ color: "var(--text-muted)" }}>· {d.targetName}</span>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{fmtDate(d.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Knowledge base */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
            🧠 Knowledge base ({knowledge.length} entradas)
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(knowledgeCounts).map(([kind, count]) => (
              <span
                key={kind}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                }}
              >
                {kind}: {count}
              </span>
            ))}
          </div>
        </div>
        {knowledge.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)", padding: 10 }}>
            Base vazia. Clica <code>*seed-knowledge</code> acima para popular com {""}
            as regras iniciais da Gaia (filosofia, benchmarks, Meta Ad Policy).
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {knowledge.slice(0, 10).map((k) => (
              <details
                key={k.id}
                style={{
                  background: "var(--bg-secondary)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                }}
              >
                <summary style={{ cursor: "pointer", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "var(--bg-card)",
                      color: VERDICT_COLOR[k.kind] ?? "var(--text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    {k.kind}
                  </span>
                  <strong style={{ color: "var(--text-primary)", flex: 1 }}>{k.title}</strong>
                </summary>
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: "0.5px solid var(--border-subtle)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {k.body}
                  {k.source && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                      fonte: {k.source}
                    </div>
                  )}
                </div>
              </details>
            ))}
            {knowledge.length > 10 && (
              <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 8 }}>
                ... e mais {knowledge.length - 10} entradas
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer — link outros agentes */}
      <div
        style={{
          marginTop: 32,
          padding: 16,
          background: "var(--bg-secondary)",
          borderRadius: 10,
          fontSize: 12,
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        Outros agentes AIOX: Maya (em{" "}
        <Link href="/admin/dashboard" style={{ color: "var(--accent)", fontWeight: 600 }}>
          dashboard
        </Link>
        ) · Uma/PM/QA (conselho no chat)
      </div>
    </div>
  );
}
