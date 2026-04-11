# STORY-ADS-001 — Dashboard Meta Ads para Bárbara

**Epic:** Campanhas & Gestão de Tráfego
**Agente responsável:** @dev
**Prioridade:** P0
**Status:** [x] Done (2026-04-11)
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

- [x] **AC-01:** `/admin/campanhas` exibe métricas reais via Meta Ads API:
  - Hoje / Ontem / 7 dias / 30 dias (filtros por preset)
  - Impressões, Cliques, CTR, CPM
  - Gasto total, Compras, Receita, ROAS (com cor verde/vermelho)
  - Cache server-side de 60s para reduzir chamadas
  - Por conta agregada (campanhas individuais via fetchCampaignsWithInsights — usado no sync)
- [x] **AC-02:** `/admin/configuracoes` tem campos para salvar credenciais
  no modelo `AppSetting` (key/value no banco):
  - `META_ADS_ACCESS_TOKEN` (token com `read_insights` + `ads_read`)
  - `META_ADS_ACCOUNT_ID` (sem prefixo `act_`)
  - `NEXT_PUBLIC_META_PIXEL_ID` (Pixel/Dataset)
  - Validação: botão "Testar conexão" → `/api/admin/test-meta-connection`
- [x] **AC-03:** Endpoint `/api/admin/sync-meta-ads` (POST) puxa insights
  do dia e persiste em `CampaignMetric` via upsert (campaignId+date).
  Auto-cria/atualiza Campaign local via `metaCampaignId` único.
  Pode ser chamado manualmente (botão "↻ Sincronizar") ou via cron Railway.
  > Cron 4h não foi configurado nesta story — fica como follow-up no Railway scheduler.
- [x] **AC-04:** Bloco "Sugestão do Dia" em `/admin/campanhas` baseado em
  regras simples sobre os insights agregados:
  - Sem dados → "Hora de começar"
  - Gasto sem conversão → "Reveja segmentação"
  - ROAS ≥ 2 → "Escala 20%"
  - ROAS ≥ 1 → "Saudável"
  - CTR < 1% com >1k impressões → "Criativos cansados"
  - Componente isolado em `src/components/admin/sugestao-do-dia.tsx`
  - Pode ser substituído por chamada Claude no futuro (atualmente regras locais)
- [x] **AC-05:** Proteção de rota: middleware ja exige cookie admin
  para `/admin/*` e `/api/admin/*` (exceto `/api/admin/auth/*` e `/migrate`).
  Endpoint sync e meta-insights herdam essa protecao automaticamente.

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

## File List

- [x] `src/lib/meta-ads.ts` — wrapper Graph API v21.0 com cache 60s, agregação de actions/action_values, presets de período
- [x] `src/app/api/admin/meta-insights/route.ts` — GET com `?preset=` e opcional `&campaigns=1`
- [x] `src/app/api/admin/sync-meta-ads/route.ts` — POST upsert Campaign + CampaignMetric do dia
- [x] `src/app/admin/campanhas/page.tsx` — bloco de métricas no topo, filtros de preset, botão Sincronizar
- [x] `src/components/admin/sugestao-do-dia.tsx` — sugestão Maya por regras
- [x] `prisma/schema.prisma` — Campaign ganhou `metaCampaignId` (unique opcional) + `lastSyncedAt`
- [ ] `src/components/admin/campaign-metrics-table.tsx` — não criado (métricas agregadas no card principal já cobrem o uso atual)

## Notas técnicas da execução

- Token validado em 2026-04-11 contra `act_837047967961012` — retorna `account_status=1` (Ativa)
- Insights por preset: today, yesterday, last_7d, last_30d (padrão last_7d)
- ROAS calculado como `purchaseValue / spend` (action_values do tipo purchase)
- Métrica zerada esperada no início — Bárbara ainda não rodou nenhuma campanha
- Cache in-memory 60s no `meta-ads.ts` evita rate limit ao trocar presets
- Permissão `business_management` ficou de fora do token atual (não bloqueia leitura de insights)
- Cron 4h não configurado — usar Railway scheduler ou cron externo no futuro

## Definition of Done

- [x] Todos os ACs marcados como `[x]` (AC-03 parcial: cron manual)
- [x] `npx tsc --noEmit` e `npx eslint` sem erros
- [ ] Testado manualmente com token válido em staging (próximo passo: Bárbara abrir /admin/campanhas e validar números)
- [ ] Bárbara validou a UI e a sugestão do dia (depende dela rodar primeira campanha)
