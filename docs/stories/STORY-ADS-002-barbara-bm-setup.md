# STORY-ADS-002 — Setup BM Bárbara

**Epic:** Campanhas & Gestão de Tráfego
**Agente responsável:** @dev (tela) + Bárbara (execução manual)
**Prioridade:** P0 (bloqueia STORY-ADS-001)
**Status:** [ ] Draft
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

- [ ] **AC-01:** Em `/admin/campanhas`, criar tab "Setup BM" com checklist
  dos passos que Bárbara precisa executar manualmente:
  1. Criar Business Manager no Facebook → `https://business.facebook.com/overview`
  2. Criar pixel novo dentro da BM (Eventos > Gerenciador de Eventos > Conectar fonte de dados > Web)
  3. Criar conta de anúncios dentro da BM (Configurações > Contas de anúncios > Adicionar)
  4. Gerar token de acesso Meta Ads API com permissão `read_insights`
     (via Graph API Explorer ou System User)
  5. Colar token e `act_{ACCOUNT_ID}` em `/admin/configuracoes`
  6. Verificar no painel o status "Conexão OK" (dispara API de teste)
- [ ] **AC-02:** Status visual por passo: `pendente` (círculo cinza),
  `em progresso` (azul), `feito` (verde). Persistir status em `AppSetting`
  com chave `barbara_bm_setup_step_N`.
- [ ] **AC-03:** Ao clicar no título do passo, expandir com instruções
  detalhadas em português e screenshot/link externo quando aplicável.
- [ ] **AC-04:** Último passo (validação) chama `/api/admin/test-meta-connection`
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

## File List (preencher ao executar)

- [ ] `src/app/admin/campanhas/setup-bm/page.tsx`
- [ ] `src/components/admin/setup-checklist.tsx`
- [ ] `src/app/api/admin/test-meta-connection/route.ts`

## Definition of Done

- [ ] Todos os ACs marcados como `[x]`
- [ ] Bárbara conseguiu seguir o checklist sem precisar de suporte
- [ ] Status "Conexão OK" aparece em verde após setup completo
