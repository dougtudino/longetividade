"use client";

import type { AggregatedInsights } from "@/lib/meta-ads";

type Props = {
  account: AggregatedInsights | null;
  loading?: boolean;
  error?: string | null;
};

type Suggestion = {
  emoji: string;
  title: string;
  body: string;
  tone: "good" | "warn" | "bad" | "info";
};

function buildSuggestion(a: AggregatedInsights): Suggestion {
  if (a.spend === 0 && a.impressions === 0) {
    return {
      emoji: "🚀",
      title: "Hora de comecar",
      body: "Nenhuma campanha rodou nos ultimos 7 dias. Crie sua primeira campanha no Meta Ads para comecar a coletar dados.",
      tone: "info",
    };
  }
  if (a.spend > 0 && a.purchases === 0) {
    return {
      emoji: "⚠️",
      title: "Gastando sem converter",
      body: `R$ ${a.spend.toFixed(2)} gastos sem nenhuma compra. Reveja segmentacao e criativos. Considere pausar o conjunto com maior CPM.`,
      tone: "bad",
    };
  }
  if (a.roas >= 2) {
    return {
      emoji: "🔥",
      title: `ROAS ${a.roas.toFixed(2)}x — escala isso`,
      body: `Cada R$ 1 investido virou R$ ${a.roas.toFixed(2)}. Aumente o orcamento da campanha de melhor performance em 20% e monitore por 48h.`,
      tone: "good",
    };
  }
  if (a.roas >= 1) {
    return {
      emoji: "📈",
      title: `ROAS ${a.roas.toFixed(2)}x — saudavel`,
      body: "Esta no positivo. Foque em otimizar criativos com CTR acima da media para empurrar mais.",
      tone: "good",
    };
  }
  if (a.ctr < 1 && a.impressions > 1000) {
    return {
      emoji: "🎨",
      title: `CTR ${a.ctr.toFixed(2)}% — criativos cansados`,
      body: "CTR abaixo de 1% indica criativos sem apelo. Teste 3 novas variacoes nesta semana (headline, imagem, video).",
      tone: "warn",
    };
  }
  return {
    emoji: "📊",
    title: `ROAS ${a.roas.toFixed(2)}x`,
    body: `${a.purchases.toFixed(0)} compras, R$ ${a.spend.toFixed(2)} gastos. Continue monitorando — proxima acao depende de mais dados.`,
    tone: "info",
  };
}

const TONE: Record<Suggestion["tone"], { bg: string; border: string; color: string }> = {
  good: { bg: "rgba(107, 158, 107, 0.12)", border: "rgba(107, 158, 107, 0.4)", color: "#6B9E6B" },
  warn: { bg: "rgba(212, 169, 75, 0.12)", border: "rgba(212, 169, 75, 0.4)", color: "#D4A94B" },
  bad: { bg: "rgba(196, 120, 122, 0.12)", border: "rgba(196, 120, 122, 0.4)", color: "#C4787A" },
  info: { bg: "rgba(74, 144, 217, 0.12)", border: "rgba(74, 144, 217, 0.4)", color: "#4A90D9" },
};

export default function SugestaoDoDia({ account, loading, error }: Props) {
  if (loading) {
    return (
      <div
        style={{
          padding: 16,
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          fontSize: 13,
          color: "var(--text-muted)",
        }}
      >
        Maya analisando os dados...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 16,
          background: "rgba(196, 120, 122, 0.12)",
          border: "0.5px solid rgba(196, 120, 122, 0.4)",
          borderRadius: 12,
          fontSize: 13,
          color: "#C4787A",
        }}
      >
        <strong>Sugestao indisponivel:</strong> {error}
      </div>
    );
  }

  if (!account) return null;

  const s = buildSuggestion(account);
  const t = TONE[s.tone];

  return (
    <div
      style={{
        padding: 16,
        background: t.bg,
        border: `0.5px solid ${t.border}`,
        borderRadius: 12,
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{s.emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
          Sugestao do dia · Maya
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: t.color, marginBottom: 4 }}>
          {s.title}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {s.body}
        </div>
      </div>
    </div>
  );
}
