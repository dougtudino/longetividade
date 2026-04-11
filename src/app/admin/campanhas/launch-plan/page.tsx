"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STEP_KEYS = [
  "launch_pioneer_step_1",
  "launch_pioneer_step_2",
  "launch_pioneer_step_3",
  "launch_pioneer_step_4",
  "launch_pioneer_step_5",
  "launch_pioneer_step_6",
  "launch_pioneer_step_7",
  "launch_pioneer_step_8",
] as const;

type StepStatus = "pendente" | "em_progresso" | "feito";

const NEXT_STATUS: Record<StepStatus, StepStatus> = {
  pendente: "em_progresso",
  em_progresso: "feito",
  feito: "pendente",
};

const STATUS_LABEL: Record<StepStatus, string> = {
  pendente: "Pendente",
  em_progresso: "Em progresso",
  feito: "Feito",
};

const STATUS_COLOR: Record<StepStatus, string> = {
  pendente: "#888",
  em_progresso: "#4A90D9",
  feito: "#6B9E6B",
};

const ASETS = [
  {
    name: "ASET-01-Interesse-Emagrecimento-Amplo",
    budget: "R$ 30/dia",
    audience: "Mulheres 30-50, Brasil, Interesses: Emagrecimento OU Dieta",
    creatives: "Feed Dor + Feed Objeção + Story Stat",
    utm: "utm_content=interesse-amplo",
  },
  {
    name: "ASET-02-Interesse-Reeducacao",
    budget: "R$ 30/dia",
    audience: "Mulheres 30-50, Brasil, Interesses: Reeducação alimentar OU Low carb",
    creatives: "Feed Dor + Feed Prova",
    utm: "utm_content=reeducacao",
  },
  {
    name: "ASET-03-Maes-Pos-parto",
    budget: "R$ 30/dia",
    audience: "Mulheres 28-42, Brasil, Comportamento: Mães + Interesse: Saúde",
    creatives: "Feed Dor + Feed Objeção + Story Stat",
    utm: "utm_content=maes-pos-parto",
  },
  {
    name: "ASET-04-LAL-1pct-Engaged",
    budget: "R$ 30/dia (PAUSADO até dia 5)",
    audience: "Lookalike 1% Brasil de engajamento da página",
    creatives: "Feed Prova",
    utm: "utm_content=lookalike",
  },
  {
    name: "ASET-05-Retargeting-PageViews",
    budget: "R$ 30/dia (PAUSADO até dia 5)",
    audience: "Visitou /emagreca-sem-dieta nos últimos 7 dias E não comprou",
    creatives: "Story CTA Comece Hoje",
    utm: "utm_content=retargeting",
  },
];

const COPIES = [
  {
    id: "COPY-A",
    name: "Identificação",
    text: `Você não precisa passar fome pra emagrecer.

Você precisa entender por que TUDO que você tentou até hoje te trouxe de volta pro mesmo lugar.

O Método S.E.M é diferente:
✓ Sem dieta restritiva
✓ Sem cortar carboidrato
✓ Sem balança no banheiro

É reeducação alimentar real, pro seu corpo de mulher de verdade.

👉 Conhece o método aqui`,
  },
  {
    id: "COPY-B",
    name: "Prova Social",
    text: `+1.000 mulheres já descobriram o Método S.E.M esse mês.

Bárbara, 38 anos, perdeu 4kg em 30 dias sem academia e sem cortar pão do café.

"Achei que ia ser mais um método. Era diferente. Eu como, tô feliz, e tô emagrecendo."

Quer ser a próxima?
👉 Comece hoje a partir de R$ 37`,
  },
  {
    id: "COPY-C",
    name: "Quebra de Objeção",
    text: `"Eu já tentei TUDO."

Eu sei. Cetogênica, jejum, low carb, shake. Funcionou? Por quanto tempo?

O problema não é você. É o método.

Reeducação alimentar não é dieta — é aprender a comer com prazer sem culpa, sem fome e sem voltar pro mesmo lugar daqui 3 meses.

Conhece o S.E.M 👉`,
  },
  {
    id: "COPY-D",
    name: "Story curto",
    text: `-4kg em 30 dias.
Sem academia. Sem fome.

Método S.E.M.
👆 Arraste pra cima`,
  },
];

const STEPS = [
  {
    id: STEP_KEYS[0],
    title: "1. Validar pré-requisitos",
    body: (
      <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
        <li>✅ Pixel <code>953736244279938</code> ativo</li>
        <li>✅ Conta de anúncios <code>act_837047967961012</code> com saldo</li>
        <li>✅ Token Marketing API válido (testado em /admin/configuracoes)</li>
        <li>⚠️ STORY-TRACK-001 — recomendado validar Pixel Helper antes (não bloqueante)</li>
      </ul>
    ),
  },
  {
    id: STEP_KEYS[1],
    title: "2. Baixar os 6 criativos em /admin/criativos",
    body: (
      <>
        <p>
          Vai em <Link href="/admin/criativos" style={{ color: "var(--accent)" }}>/admin/criativos</Link> e clica em <strong>Baixar todos</strong>. Os 6 PNGs vão pro seu Downloads.
        </p>
        <p>Confere se a paleta e a tipografia ficaram boas. Se quiser fine-tune, abre no Canva/Photoshop.</p>
      </>
    ),
  },
  {
    id: STEP_KEYS[2],
    title: "3. Criar 4 Custom Audiences no Meta",
    body: (
      <>
        <p>Em <code>business.facebook.com → Audiences → Create</code>:</p>
        <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li><strong>LONG-CA-Compradores</strong> — Custom Audience baseada em Pixel: evento <code>Purchase</code>, janela 180 dias</li>
          <li><strong>LONG-CA-PageView-7d</strong> — Pixel: evento PageView na URL contendo <code>emagreca-sem-dieta</code>, janela 7 dias</li>
          <li><strong>LONG-CA-PageView-30d</strong> — mesma config, janela 30 dias (source para Lookalike futuro)</li>
          <li><strong>LONG-CA-IC-7d</strong> — InitiateCheckout sem Purchase, janela 7 dias</li>
        </ul>
      </>
    ),
  },
  {
    id: STEP_KEYS[3],
    title: "4. Criar a Campanha",
    body: (
      <>
        <p>Em <code>Ads Manager → Create → Campaign</code>:</p>
        <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li><strong>Nome:</strong> <code>LONG-AQ-01-Conversao-Pioneer-Mar2026</code></li>
          <li><strong>Objetivo:</strong> Sales / Conversões</li>
          <li><strong>Tipo de compra:</strong> Leilão</li>
          <li><strong>Buying type:</strong> Auction</li>
          <li><strong>Special Ad Categories:</strong> Nenhum</li>
          <li><strong>CBO (Campaign Budget Optimization):</strong> <strong>DESLIGADO</strong> — budget vai por ad set</li>
        </ul>
      </>
    ),
  },
  {
    id: STEP_KEYS[4],
    title: "5. Criar 3 Ad Sets cold (ASET-01, 02, 03)",
    body: (
      <>
        <p>Para CADA ad set abaixo, configura:</p>
        <ul style={{ paddingLeft: 18, lineHeight: 1.7, marginBottom: 12 }}>
          <li>Optimization for ad delivery: <strong>Conversions</strong></li>
          <li>Conversion event: <strong>Purchase</strong></li>
          <li>Pixel: <strong>Dados de Longetividade</strong> (953736244279938)</li>
          <li>Attribution setting: <strong>7-day click + 1-day view</strong></li>
          <li>Bid strategy: <strong>Lowest cost</strong> (sem cost cap)</li>
          <li>Posicionamentos: <strong>Manual</strong> → Feed IG + Feed FB + Stories IG</li>
          <li>Schedule: começa <strong>hoje 12h BRT</strong>, sem data fim</li>
          <li>Exclusion: <strong>LONG-CA-Compradores</strong></li>
        </ul>
        <p style={{ marginTop: 14, fontWeight: 600 }}>Configurações específicas de cada ad set abaixo ↓</p>
      </>
    ),
  },
  {
    id: STEP_KEYS[5],
    title: "6. Subir criativos com copies por ad set",
    body: (
      <>
        <p>Cada ad set roda 2-3 criativos em rotação dinâmica.</p>
        <p>Para cada anúncio dentro do ad set:</p>
        <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li><strong>Format:</strong> Single image</li>
          <li><strong>Image:</strong> upload o PNG correspondente (baixado do passo 2)</li>
          <li><strong>Primary text:</strong> COPY-A, COPY-B ou COPY-C (ver abaixo)</li>
          <li><strong>Headline:</strong> &ldquo;Método S.E.M — Emagreça sem dieta&rdquo;</li>
          <li><strong>Description:</strong> &ldquo;A partir de R$ 37 · Reeducação alimentar real&rdquo;</li>
          <li><strong>Call to action:</strong> Saiba mais</li>
          <li><strong>Website URL:</strong> use a URL com UTM correta do ad set</li>
          <li><strong>Display link:</strong> longetividade.com.br</li>
        </ul>
      </>
    ),
  },
  {
    id: STEP_KEYS[6],
    title: "7. Review & publicar",
    body: (
      <>
        <p>Antes de publicar:</p>
        <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Confere previews em todos os posicionamentos (mobile/desktop/stories)</li>
          <li>Confere gasto total programado: <strong>R$ 90/dia</strong> (3 ad sets × R$30) — ASET-04 e 05 ainda pausados</li>
          <li>Confere que pixel está vinculado em cada ad set</li>
          <li>Clica <strong>Publish</strong></li>
        </ul>
        <p style={{ marginTop: 12, color: "#C4787A", fontWeight: 600 }}>
          ⚠️ Após publicar, NÃO mexer em nada por 72h. Algoritmo está em fase de aprendizado.
        </p>
      </>
    ),
  },
  {
    id: STEP_KEYS[7],
    title: "8. Volta dia 4 para o primeiro review",
    body: (
      <>
        <p>Dia 4 (72h após o launch), Gaia (eu) vou rodar <code>*review</code> e analisar:</p>
        <ul style={{ paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Qual ad set tem melhor CTR (&gt;2% ideal)</li>
          <li>Qual ad set tem melhor CPA (&lt; R$ 25 ideal pra ticket de R$ 37)</li>
          <li>Qual criativo está performando melhor</li>
          <li>Recomendação: matar / continuar / escalar</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Você vai ver os dados em tempo real em <Link href="/admin/campanhas" style={{ color: "var(--accent)" }}>/admin/campanhas</Link>.
        </p>
      </>
    ),
  },
];

export default function LaunchPlanPage() {
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>(() => {
    const init: Record<string, StepStatus> = {};
    for (const k of STEP_KEYS) init[k] = "pendente";
    return init;
  });
  const [expanded, setExpanded] = useState<string | null>(STEP_KEYS[0]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setStatuses((prev) => {
          const next = { ...prev };
          for (const k of STEP_KEYS) {
            const v = data[k];
            if (v === "pendente" || v === "em_progresso" || v === "feito") next[k] = v;
          }
          return next;
        });
      })
      .catch(() => {});
  }, []);

  async function updateStatus(stepId: string, status: StepStatus) {
    setStatuses((prev) => ({ ...prev, [stepId]: status }));
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [stepId]: status }),
      });
    } catch {
      /* silent */
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  }

  const doneCount = STEP_KEYS.filter((k) => statuses[k] === "feito").length;
  const pct = Math.round((doneCount / STEP_KEYS.length) * 100);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      {/* Tab nav */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          borderBottom: "0.5px solid var(--border-default)",
        }}
      >
        <Link
          href="/admin/campanhas"
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
            borderBottom: "2px solid transparent",
          }}
        >
          Campanhas
        </Link>
        <Link
          href="/admin/campanhas/setup-bm"
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
            borderBottom: "2px solid transparent",
          }}
        >
          Setup BM
        </Link>
        <span
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--accent)",
            borderBottom: "2px solid var(--accent)",
          }}
        >
          Launch Plan
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          STORY-LAUNCH-001 · Gaia 🌱
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "6px 0 8px 0" }}>
          Campanha Meta Pioneira
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
          Blueprint completo da primeira campanha. Filosofia: <em>start small, test aggressive, scale what works</em>.
          R$ 90/dia inicial, 3 ad sets cold, 72h sem mexer. Meta: 1 vencedor com ROAS ≥ 1.5 em 7 dias.
        </p>
      </div>

      {/* Resumo numérico */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Budget inicial", value: "R$ 90/dia" },
          { label: "Budget 7d", value: "R$ 630" },
          { label: "Ad sets ativos", value: "3 cold" },
          { label: "Criativos", value: "5 distintos" },
          { label: "Meta ROAS", value: "≥ 1.5" },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              padding: 14,
              background: "var(--bg-card)",
              border: "0.5px solid var(--border-default)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progresso */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Execução Bárbara — {doneCount}/{STEP_KEYS.length} passos ({pct}%)
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

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {STEPS.map((step, idx) => {
          const status = statuses[step.id];
          const isOpen = expanded === step.id;
          return (
            <div
              key={step.id}
              style={{
                background: "var(--bg-card)",
                border: `0.5px solid ${status === "feito" ? "rgba(107,158,107,0.5)" : "var(--border-default)"}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : step.id)}
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
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: status === "feito" ? "rgba(107,158,107,0.18)" : "var(--bg-secondary)",
                    color: STATUS_COLOR[status],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                    border: `1.5px solid ${STATUS_COLOR[status]}`,
                  }}
                >
                  {status === "feito" ? "✓" : idx + 1}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{step.title}</div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: status === "feito" ? "rgba(107,158,107,0.18)" : "rgba(160,160,160,0.15)",
                    color: STATUS_COLOR[status],
                  }}
                >
                  {STATUS_LABEL[status]}
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: "0 16px 16px 62px",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ marginBottom: 14 }}>{step.body}</div>
                  <button
                    onClick={() => updateStatus(step.id, NEXT_STATUS[status])}
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
                    Marcar como: {STATUS_LABEL[NEXT_STATUS[status]]}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ad Sets detalhe */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "32px 0 14px 0" }}>
        Configuração detalhada dos 5 Ad Sets
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {ASETS.map((a) => (
          <div
            key={a.name}
            style={{
              padding: 16,
              background: "var(--bg-card)",
              border: "0.5px solid var(--border-default)",
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <code style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{a.name}</code>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{a.budget}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
              <strong>Audiência:</strong> {a.audience}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
              <strong>Criativos:</strong> {a.creatives}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              <code>{a.utm}</code>
            </div>
          </div>
        ))}
      </div>

      {/* Copies prontas */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "32px 0 14px 0" }}>
        Copies prontas (clica pra copiar)
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {COPIES.map((c) => (
          <div
            key={c.id}
            style={{
              padding: 16,
              background: "var(--bg-card)",
              border: "0.5px solid var(--border-default)",
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <code style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{c.id}</code>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 8 }}>· {c.name}</span>
              </div>
              <button
                onClick={() => copyText(c.text, c.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: copyFeedback === c.id ? "#6B9E6B" : "var(--bg-secondary)",
                  color: copyFeedback === c.id ? "#fff" : "var(--text-primary)",
                  border: "0.5px solid var(--border-default)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {copyFeedback === c.id ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
            <pre
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                background: "var(--bg-secondary)",
                padding: 12,
                borderRadius: 8,
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                margin: 0,
              }}
            >
              {c.text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
