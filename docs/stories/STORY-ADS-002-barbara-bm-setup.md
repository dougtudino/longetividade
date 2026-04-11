# STORY-ADS-002 — Setup BM Bárbara

**Epic:** Campanhas & Gestão de Tráfego
**Agente responsável:** @dev (tela) + Bárbara (execução manual)
**Prioridade:** P0 (bloqueia STORY-ADS-001)
**Status:** [x] Done (2026-04-11)
**Data criação:** 2026-04-10

---

## Contexto

Bárbara precisa criar sua própria Business Manager (BM) no Meta para gerenciar
as campanhas do Longetividade. Hoje não existe BM dedicada — o projeto depende
de acesso compartilhado. A criação da BM, do pixel, da conta de anúncios e a
geração do token de API são passos manuais que precisam ser feitos por ela
(infra pessoal/legal). Nossa parte é entregar um checklist interativo
dentro do admin com cada passo explicado, status visual e link direto para
a próxima ação.

---

## Acceptance Criteria

- [x] **AC-01:** Em `/admin/campanhas`, criar tab "Setup BM" com checklist
  dos passos que Bárbara precisa executar manualmente:
  1. Criar Business Manager no Facebook → `https://business.facebook.com/overview`
  2. Criar pixel novo dentro da BM (Eventos > Gerenciador de Eventos > Conectar fonte de dados > Web)
  3. Criar conta de anúncios dentro da BM (Configurações > Contas de anúncios > Adicionar)
  4. Gerar token de acesso Meta Ads API com permissão `read_insights`
     (via Graph API Explorer ou System User)
  5. Colar token e `act_{ACCOUNT_ID}` em `/admin/configuracoes`
  6. Verificar no painel o status "Conexão OK" (dispara API de teste)
- [x] **AC-02:** Status visual por passo: `pendente` (círculo cinza),
  `em progresso` (azul), `feito` (verde). Persistir status em `AppSetting`
  com chave `barbara_bm_setup_step_N`.
- [x] **AC-03:** Ao clicar no título do passo, expandir com instruções
  detalhadas em português e screenshot/link externo quando aplicável.
- [x] **AC-04:** Último passo (validação) chama `/api/admin/test-meta-connection`
  que faz `GET` básico na Meta Ads API e retorna ok/erro com mensagem
  legível.

---

## Technical Notes

- Usar `AppSetting` para persistir o progresso (cada step vira uma key)
- Não armazenar token em localStorage — apenas no banco (AppSetting)
- Endpoint de teste deve retornar erro humanizado: "Token inválido",
  "Sem permissão read_insights", "Account ID não encontrado", etc.

## Dependencies

- Nenhuma técnica. Bloqueada apenas pela execução manual da Bárbara.

## File List

- [x] `src/app/admin/campanhas/setup-bm/page.tsx` — página com tab nav, checklist e box de teste de conexão
- [x] `src/components/admin/setup-checklist.tsx` — componente reutilizável (progresso, expansão, status)
- [x] `src/app/api/admin/test-meta-connection/route.ts` — GET → Meta Graph v21.0 com erros humanizados
- [x] `src/app/admin/configuracoes/page.tsx` — seção Meta Business / Ads API + botão Testar Conexão (account ID pré-preenchido com `837047967961012`)
- [x] `src/app/admin/campanhas/page.tsx` — tab nav apontando para Setup BM

## Notas técnicas da execução

- Account ID pré-preenchido: `837047967961012` (CA01- BM Barbara Oliveira) — já criado e conectado em 2026-04-11
- `META_KEYS` em `configuracoes/page.tsx` define os 3 campos: account ID, token, pixel ID
- `STEP_KEYS` (`barbara_bm_setup_step_1..6`) persistidos via `/api/admin/settings`
- Endpoint usa Graph API `v21.0`, retorna `account_status` traduzido (Ativa, Desativada, etc.)
- Erros tratados: 401/code 190 (token), 200 (permissão), 404 (account ID), 400 genérico
- Passo 6 marca como `feito` automaticamente quando o teste retorna `ok: true`

## Definition of Done

- [x] Todos os ACs marcados como `[x]`
- [ ] Bárbara conseguiu seguir o checklist sem precisar de suporte (validar em uso)
- [ ] Status "Conexão OK" aparece em verde após setup completo (depende do token gerado por Bárbara)
