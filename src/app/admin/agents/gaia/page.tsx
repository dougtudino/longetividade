"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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
  verdict: "KILL" | "KEEP" | "SCALE_HORIZONTAL" | "SCALE_VERTICAL" | "INSUFFICIENT_DATA";
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
};

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
        const data = (await res.json()) as ReviewResponse;
        setLastReview(data);
        if (!data.ok) setError(data.error ?? "Falha");
        await loadDecisions();
      }
      if (cmd === "seed-knowledge") {
        const res = await fetch("/api/admin/agents/gaia/seed-knowledge", {
          method: "POST",
        });
        const data = await res.json();
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
        <div style={{ fontSize: 36, lineHeight: 1 }}>🌱</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Agente AIOX · @growth
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "4px 0 0 0" }}>
            Gaia · Growth Operator
          </h1>
        </div>
      </div>
      <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0 24px 0", lineHeight: 1.5 }}>
        Paid media operator autonoma. Analisa campanhas Meta, propoe acoes (kill/scale/budget),
        executa via Marketing API apos aprovacao humana. Filosofia: <em>start small, test aggressive, scale what works</em>.
      </p>

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
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {d.status === "proposed" && (
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
