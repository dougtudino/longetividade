# STORY-ADS-001 — Dashboard Meta Ads para Bárbara

**Epic:** Campanhas & Gestão de Tráfego
**Agente responsável:** @dev
**Prioridade:** P0
**Status:** [ ] Draft
**Data criação:** 2026-04-10

---

## Contexto

Bárbara é a gestora do projeto Longetividade e terá sua própria Business Manager
no Meta (Facebook/Instagram). Precisa de um dashboard dentro do `/admin` que
mostre as métricas reais das campanhas em tempo quase real, sem depender de
abrir o Gerenciador de Anúncios do Meta. Também precisa de um bloco de
análise automática que sugira ações do dia (otimizar, pausar, escalar).

Requisito derivado da Sprint de Campanhas (`docs/sprint-campanhas/SPRINT-CAMPANHAS.md`)
e do DIAGNOSTICO.md (2026-04-10).

---

## Acceptance Criteria

- [ ] **AC-01:** `/admin/campanhas` exibe métricas reais via Meta Ads API:
  - Impressões (24h / 7d / período custom)
  - Cliques e CTR
  - CPL (custo por lead) e CPA (custo por aquisição)
  - Valor gasto total e diário
  - ROAS (baseado em Purchase events do Pixel ou Order do banco)
  - Por campanha, conjunto e criativo
- [ ] **AC-02:** `/admin/configuracoes` tem campos para salvar credenciais
  no modelo `AppSetting` (key/value no banco):
  - `META_ADS_ACCESS_TOKEN` (token com `read_insights`)
  - `META_ADS_ACCOUNT_ID` (act_XXXXXXXXX)
  - Validação: botão "Testar conexão" que chama a API e retorna OK/erro
- [ ] **AC-03:** Cron de atualização a cada 4h que persiste snapshot em
  `CampaignMetric` (modelo já existente). Usar `node-cron` ou API route
  com endpoint `/api/admin/sync-meta-ads` disparado por scheduler Railway.
- [ ] **AC-04:** Bloco "Sugestão do Dia" em `/admin/campanhas` que,
  baseado nos dados das últimas 24h, exibe texto gerado por agente de
  análise (regras simples ou via API Claude) apontando: campanhas com
  CPL alto, criativos com CTR baixo, oportunidades de escala.
- [ ] **AC-05:** Proteção de rota: apenas admin autenticado
  (cookie `admin_auth`) acessa `/admin/campanhas` e o endpoint de sync.
  Retornar 401 caso contrário.

---

## Technical Notes

- Meta Ads API: `GET /v19.0/act_{ACCOUNT_ID}/insights` com `fields=impressions,clicks,spend,cpc,ctr,actions,action_values`
- Guardar snapshots em `CampaignMetric` para histórico e gráfico temporal
- Cache local (60s) para evitar rate limit ao abrir a página várias vezes
- ROAS calculado como `action_values.purchase / spend`
- Usar `getSetting()` (já existe em `src/lib/settings.ts`) para ler token do banco com fallback env

## Dependencies

- Bárbara precisa ter BM criada + token gerado (STORY-ADS-002)
- `CampaignMetric` já existe no schema Prisma
- `AppSetting` já existe no schema Prisma

## File List (preencher ao executar)

- [ ] `src/app/admin/campanhas/page.tsx`
- [ ] `src/app/admin/configuracoes/page.tsx`
- [ ] `src/app/api/admin/sync-meta-ads/route.ts`
- [ ] `src/lib/meta-ads.ts` (wrapper da API)
- [ ] `src/components/admin/campaign-metrics-table.tsx`
- [ ] `src/components/admin/sugestao-do-dia.tsx`

## Definition of Done

- [ ] Todos os ACs marcados como `[x]`
- [ ] `npm run lint` e `npm run build` sem erros
- [ ] Testado manualmente com token válido em staging
- [ ] Bárbara validou a UI e a sugestão do dia
