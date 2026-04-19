# Diagnóstico Gaia — Pause Operator → Growth Operator

**Data:** 2026-04-19  
**Status:** Pronto para expansão  
**Leitura estimada:** 5 minutos

---

## 1. Mapa de Arquivos

### Core Logic
- `src/lib/gaia-review.ts:1–266` — Análise de ad set, verdicts (KILL/KEEP/SCALE_HORIZONTAL/SCALE_VERTICAL), thresholds hardcoded
- `src/lib/gaia-executor.ts:1–124` — Execução no Meta API v21.0, funções para pausar/ativar/duplicar/ajustar budget
- `src/lib/gaia-knowledge-seed.ts:1–257` — Base de conhecimento: 17 entradas pré-feitas (filosofia, critérios kill/scale, benchmarks, política Meta)

### Cron & API Routes
- `src/app/api/cron/gaia-review/route.ts:1–209` — Diário 8h BRT: fetch insights, cria decisões proposed, envia email
- `src/app/api/cron/gaia-execute-approved/route.ts:1–108` — Horário: executa decisões approved, MAX_PER_RUN=20
- `src/app/api/admin/agents/gaia/decisions/route.ts:1–209` — Workflow aprovação: approve → approved, execute → executed/failed, reject
- `src/app/api/admin/agents/gaia/review/route.ts:159` — Manual review endpoint (GET dry-run, POST com preset/dryRun)

### Database Schema
- `prisma/schema.prisma` — **AgentDecision** (proposedAction como JSON, states: proposed/approved/executed/rejected/failed), **AgentKnowledge** (fact/rule/benchmark/reference/learning/policy)

### UI Dashboard
- `src/app/admin/agents/gaia/page.tsx:1–655` — React dashboard: stats, pending decisions, knowledge base, action buttons

### Integrations
- `src/lib/meta-ads.ts` — fetchCampaignsWithInsights, postGraph helper
- `src/lib/email.ts` — sendEmail notificações

---

## 2. Fluxo Atual em ASCII

```
DISCOVERY (Cron Diário)
   ↓
   [Meta Ads API] → fetchCampaignsWithInsights("last_7d")
                    └─ spend, impressions, clicks, ctr, cpc, purchases, roas

ANALYSIS
   ↓
   [gaia-review.ts] → reviewAdSet(insights, DEFAULT_THRESHOLDS)
   ├─ KILL? (spend without conversions OR CTR<0.8% OR CPA>1.5x ticket)
   ├─ SCALE_H? (ROAS ≥ 2.0) → DUPLICATE_ADSET
   ├─ SCALE_V? (ROAS 1.5–2.0) → INCREASE_BUDGET
   └─ KEEP (no action)

DECISION CREATION
   ↓
   [Prisma] → agentDecision.create({status: "proposed", action: "...", ...})

NOTIFICATION
   ↓
   [sendEmail] → Admins recebem table de verdicts

APPROVAL (Manual)
   ↓
   approve: proposed → approved
   reject: proposed → rejected
   execute: approved → executed|failed

EXECUTION (Cron Horário)
   ↓
   [gaia-executor.ts] → executeDecision()
   ├─ executePauseAdSet()
   ├─ executeDuplicateAdSet()
   └─ executeUpdateBudget()

AUDIT
   ↓
   [Prisma] → update { status: "executed", executedAt, result }
```

---

## 3. Reaproveitável (Existe & Serve Expansão)

| Componente | Arquivo | Reutilizável Para |
|-----------|---------|-------------------|
| **AgentDecision model** | schema.prisma | FIX_AUDIENCE, FIX_COPY, DIAGNOSE_FUNNEL |
| **AgentKnowledge model** | schema.prisma | Base conhecimento única |
| **reviewAdSet() core** | gaia-review.ts | Template análise |
| **DEFAULT_THRESHOLDS** | gaia-review.ts | Tuning por ação |
| **gaia-executor pattern** | gaia-executor.ts | if(action) then execute |
| **Decision workflow** | decisions/route.ts | Approve → Execute |
| **Cron pattern** | gaia-review/route.ts | Daily + hourly automation |
| **Email notification** | gaia-review/route.ts | Notificar admins |
| **17-entry knowledge base** | gaia-knowledge-seed.ts | Meta policy, benchmarks |
| **Dashboard UI** | page.tsx | React + TailwindCSS |

---

## 4. Faltando (Growth Operator)

| Falta | Complexidade | Esforço |
|------|--------------|--------|
| **Análise de Audience** (broad vs interest, lookalike) | ALTA | 2-3 dias |
| **Análise de Copy & Creative** (performance por ad) | ALTA | 3-4 dias |
| **Funnel Diagnosis** (leak points) | MÉDIA | 2-3 dias |
| **Propostas de Iteração** (regras tipo "se CTR baixo, novo creative") | MÉDIA | 2 dias |
| **Meta API Creative & Audience** (updateAdSet com targeting) | ALTA | 2-3 dias |
| **Knowledge base expandida** (+5 entries) | BAIXA | 1 dia |
| **Thresholds expandidos** (7 → 15) | BAIXA | 1 dia |
| **UI expandida** (audience table, funnel) | MÉDIA | 1-2 dias |
| **Testes & Validação** (unit + integration) | ALTA | 3-5 dias |

---

## 5. Riscos (Mexer em X ou Y)

### Críticos
- **Quebrar workflow** = decision executada 2x ou nunca
  → Check executedAt, idempotência
  
- **Alterar gaia-executor sem Meta API docs** = ad set errado
  → Testar sandbox Meta, log calls

- **Hardcoding thresholds** = KILL decisões incorretas
  → Usar DEFAULT_THRESHOLDS + knowledge base

### Altos
- **Expandir reviewAdSet sem refatoração** = função 500+ linhas
  → Quebrar em sub-funções + testes

- **proposedAction sem validação** = executor falha silenciosamente
  → Enum + switch com default

### Médios
- **Cron overlap** = race condition
  → Daily x:11, execute x:00, gap seguro

- **Knowledge base sem version** = decisão obsoleta
  → Adicionar version field

---

## 6. Recomendação: Expandir Gaia vs Novo Agente?

### EXPANDIR GAIA EXISTENTE (Recomendado)

**Justificativa:**

1. Arquitetura pronta: AgentDecision + workflow + cron
2. Knowledge base única: 17 rules, +5 vs zero
3. Dashboard unificado: decisions + knowledge
4. Execução unificada: gaia-execute-approved roda tudo
5. Audit trail coerente: mesma tabela

**Plano (4 semanas):**

Semana 1: Refatorar reviewAdSet → reviewPerformance() + reviewAudience() + reviewCreative()
Semana 2: Estender gaia-executor → updateAudienceTargeting() + updateCreative()
Semana 2-3: Knowledge base + UI → +5 seed entries, Growth Roadmap aba
Semana 3-4: Testes + Sandbox + Deploy

---

## 7. Script Pré-Pronto (Knowledge Base Seed)

**Arquivo:** `src/lib/gaia-knowledge-seed.ts` (257 linhas)

**O que faz:** Popula AgentKnowledge com 17 entradas pre-built

```typescript
const KNOWLEDGE_SEED = [
  {
    kind: "philosophy",
    title: "Start Small Test Aggressive",
    body: "Campaigns start broad targeting + tight budget...",
    source: "gaia-persona"
  },
  {
    kind: "rule",
    title: "Kill Criteria",
    body: "Spent > 3x without conversions for 24h...",
    source: "gaia-review.ts"
  }
];

export async function seedGaiaKnowledge() {
  for (const entry of KNOWLEDGE_SEED) {
    await prisma.agentKnowledge.upsert({...});
  }
}
```

**Para Growth Operator:** Adicionar rules tipo "Broad Targeting + Advantage+", "Creative Rotation Signals", "Funnel Leak Detection"

---

**Conclusão:** Gaia é sólido e pronto para expansão. Phase 1 nesta semana = Growth Operator semana que vem.
