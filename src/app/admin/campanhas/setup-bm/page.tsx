"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SetupChecklist, {
  type ChecklistStep,
  type StepStatus,
} from "@/components/admin/setup-checklist";

const STEP_KEYS = [
  "barbara_bm_setup_step_1",
  "barbara_bm_setup_step_2",
  "barbara_bm_setup_step_3",
  "barbara_bm_setup_step_4",
  "barbara_bm_setup_step_5",
  "barbara_bm_setup_step_6",
] as const;

type MetaTestResult = {
  ok: boolean;
  accountId?: string;
  accountName?: string;
  status?: string;
  currency?: string | null;
  error?: string;
};

function isStatus(v: string): v is StepStatus {
  return v === "pendente" || v === "em_progresso" || v === "feito";
}

const STEPS: ChecklistStep[] = [
  {
    id: STEP_KEYS[0],
    title: "1. Criar Business Manager no Facebook",
    summary: "Criar a BM dedicada da Barbara para isolar permissoes e cobranca.",
    details: (
      <>
        Acesse o Meta Business Suite e crie uma BM nova com o nome
        <strong> &ldquo;BM Barbara Oliveira&rdquo;</strong>. Use o e-mail
        comercial da Barbara como administrador. Esta BM vai conter o pixel,
        a conta de anuncios e o catalogo do Longetividade.
      </>
    ),
    externalLink: {
      label: "Abrir Business Suite",
      url: "https://business.facebook.com/overview",
    },
  },
  {
    id: STEP_KEYS[1],
    title: "2. Criar pixel / dataset dentro da BM",
    summary: "Dataset 'Dados de Longetividade' (ja criado: 953736244279938).",
    details: (
      <>
        Dataset criado em 2026-04-11 dentro da BM da Barbara, no
        <strong> Gerenciador de Eventos &gt; Conjuntos de Dados</strong>.
        <br />
        <br />
        Nome: <strong>Dados de Longetividade</strong> · ID
        <code style={{ marginLeft: 6 }}>953736244279938</code> · Propriedade:
        Barbara Oliveira · ja preenchido em Configuracoes como
        <code style={{ marginLeft: 6 }}>NEXT_PUBLIC_META_PIXEL_ID</code>.
      </>
    ),
    externalLink: {
      label: "Gerenciador de Eventos",
      url: "https://business.facebook.com/events_manager2",
    },
  },
  {
    id: STEP_KEYS[2],
    title: "3. Criar conta de anuncios",
    summary: "Adicionar a conta CA01- BM Barbara Oliveira (ja criada: 837047967961012).",
    details: (
      <>
        Em <strong>Configuracoes do Negocio &gt; Contas &gt; Contas de
        anuncios &gt; Adicionar</strong>, crie a conta com o nome
        <strong> &ldquo;CA01- BM Barbara Oliveira&rdquo;</strong>, fuso
        America/Sao_Paulo, moeda BRL.
        <br />
        <br />
        Status atual: <strong>Conta criada</strong> · ID
        <code style={{ marginLeft: 6 }}>837047967961012</code> · ja preenchido
        em Configuracoes.
      </>
    ),
    externalLink: {
      label: "Configuracoes do Negocio",
      url: "https://business.facebook.com/settings",
    },
  },
  {
    id: STEP_KEYS[3],
    title: "4. Gerar token Meta Ads API",
    summary: "Token com permissao read_insights via Graph API Explorer ou System User.",
    details: (
      <>
        Acesse o <strong>Graph API Explorer</strong>, selecione o app, escolha
        a Barbara como usuario e adicione as permissoes:
        <br />
        <code>ads_read</code>, <code>read_insights</code>,
        <code> business_management</code>.
        <br />
        <br />
        Clique em <strong>Generate Access Token</strong>, copie o token e
        cole no campo <strong>Meta Ads Access Token</strong> em Configuracoes.
        Para producao, gere um token de longa duracao via System User
        (Configuracoes do Negocio &gt; Usuarios &gt; Usuarios do Sistema).
      </>
    ),
    externalLink: {
      label: "Graph API Explorer",
      url: "https://developers.facebook.com/tools/explorer/",
    },
  },
  {
    id: STEP_KEYS[4],
    title: "5. Colar token e Account ID em Configuracoes",
    summary: "Salvar credenciais no painel admin (Account ID ja preenchido).",
    details: (
      <>
        Va em <Link href="/admin/configuracoes#meta" style={{ color: "var(--accent)" }}>
          Configuracoes &gt; Meta Business / Ads API
        </Link> e cole o token gerado no passo anterior. Clique em
        <strong> Salvar Meta</strong>.
      </>
    ),
    externalLink: {
      label: "Abrir Configuracoes",
      url: "/admin/configuracoes#meta",
    },
  },
  {
    id: STEP_KEYS[5],
    title: "6. Testar conexao",
    summary: "Validar que o token le a conta de anuncios via Graph API.",
    details: (
      <>
        Use o botao abaixo para chamar
        <code style={{ marginLeft: 6 }}>/api/admin/test-meta-connection</code>.
        Se tudo estiver correto, o painel mostra <strong>OK</strong> com o nome
        e status da conta. Se houver erro, a mensagem indica exatamente o que
        ajustar (token expirado, sem permissao, account ID errado, etc.).
      </>
    ),
  },
];

export default function SetupBMPage() {
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>(() => {
    const init: Record<string, StepStatus> = {};
    for (const k of STEP_KEYS) init[k] = "pendente";
    return init;
  });
  const [loaded, setLoaded] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<MetaTestResult | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(async (data: Record<string, string>) => {
        // Auto-deteccao do status real baseado em settings configuradas
        const hasAccount = !!data.META_ADS_ACCOUNT_ID;
        const hasPixel = !!data.NEXT_PUBLIC_META_PIXEL_ID;
        const hasToken = !!(data.META_ACCESS_TOKEN || data.META_ADS_ACCESS_TOKEN);
        const hasPage = !!data.META_PAGE_ID;
        const hasAllConfig = hasAccount && hasPixel && hasToken;

        const autoDetected: Record<(typeof STEP_KEYS)[number], boolean> = {
          [STEP_KEYS[0]]: hasAccount, // 1. Criar Business Manager (provado pelo account ID)
          [STEP_KEYS[1]]: hasPixel, // 2. Criar pixel/dataset
          [STEP_KEYS[2]]: hasAccount, // 3. Criar conta de anuncios
          [STEP_KEYS[3]]: hasToken, // 4. Gerar token
          [STEP_KEYS[4]]: hasAllConfig && hasPage, // 5. Colar credenciais (precisa tudo + page)
          [STEP_KEYS[5]]: false, // 6. Testar conexao — so via botao Testar
        };

        const toPersist: Record<string, string> = {};
        setStatuses((prev) => {
          const next = { ...prev };
          for (const k of STEP_KEYS) {
            // Auto-deteccao tem prioridade sobre valor salvo (se config existe, e feito)
            if (autoDetected[k]) {
              next[k] = "feito";
              if (data[k] !== "feito") toPersist[k] = "feito";
            } else {
              const saved = data[k];
              if (saved && isStatus(saved)) next[k] = saved;
            }
          }
          return next;
        });
        setLoaded(true);

        // Persiste auto-deteccoes no AppSetting (silencioso)
        if (Object.keys(toPersist).length > 0) {
          try {
            await fetch("/api/admin/settings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(toPersist),
            });
          } catch {
            /* silent */
          }
        }
      })
      .catch(() => setLoaded(true));
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
      /* silently fail */
    }
  }

  async function runTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/test-meta-connection", { cache: "no-store" });
      const data = (await res.json()) as MetaTestResult;
      setTestResult(data);
      if (data.ok) {
        await updateStatus(STEP_KEYS[5], "feito");
      }
    } catch (e) {
      setTestResult({ ok: false, error: (e as Error).message });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
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
        <span
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--accent)",
            borderBottom: "2px solid var(--accent)",
          }}
        >
          Setup BM
        </span>
        <Link
          href="/admin/campanhas/launch-plan"
          style={{
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
            borderBottom: "2px solid transparent",
          }}
        >
          Launch Plan 🌱
        </Link>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px 0" }}>
        Setup Business Manager
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
          margin: "0 0 24px 0",
          lineHeight: 1.5,
        }}
      >
        Checklist guiado para a Barbara configurar a BM dedicada do Longetividade.
        Cada passo pode ser marcado como <em>em progresso</em> ou <em>feito</em> e
        o status fica salvo. O ultimo passo testa a conexao real com a Meta Ads API.
      </p>

      {!loaded ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Carregando...</div>
      ) : (
        <SetupChecklist steps={STEPS} statuses={statuses} onStatusChange={updateStatus} />
      )}

      {/* Test conexao box (passo 6) */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 12,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "0 0 8px 0",
          }}
        >
          Testar conexao Meta Ads API
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            margin: "0 0 14px 0",
            lineHeight: 1.5,
          }}
        >
          Faz um GET na conta <code>act_837047967961012</code> usando o token
          salvo. Sucesso marca o passo 6 como feito automaticamente.
        </p>
        <button
          onClick={runTest}
          disabled={testing}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: testing ? "wait" : "pointer",
            opacity: testing ? 0.6 : 1,
          }}
        >
          {testing ? "Testando..." : "Testar Conexao"}
        </button>

        {testResult && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 8,
              fontSize: 13,
              background: testResult.ok
                ? "rgba(107, 158, 107, 0.12)"
                : "rgba(196, 120, 122, 0.12)",
              border: `0.5px solid ${
                testResult.ok ? "rgba(107, 158, 107, 0.4)" : "rgba(196, 120, 122, 0.4)"
              }`,
              color: testResult.ok ? "#6B9E6B" : "#C4787A",
            }}
          >
            {testResult.ok ? (
              <>
                <strong>Conexao OK</strong>
                <br />
                Conta: {testResult.accountName} ({testResult.accountId})
                <br />
                Status: {testResult.status}
                {testResult.currency && ` · Moeda: ${testResult.currency}`}
              </>
            ) : (
              <>
                <strong>Falha:</strong> {testResult.error}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
