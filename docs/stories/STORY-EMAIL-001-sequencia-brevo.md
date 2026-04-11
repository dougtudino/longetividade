# STORY-EMAIL-001 — Sequência de boas-vindas Brevo (D+0/D+2/D+5)

**Epic:** Email Marketing
**Substitui:** STORY-04 parcial (sprint-campanhas) — só captura sem sequência
**Agente responsável:** @dev
**Prioridade:** P0
**Status:** [x] Done (2026-04-11)
**Data criação:** 2026-04-11

## Contexto

`/api/leads` já capturava email no Brevo, mas a sequência automática prometida
em STORY-04 (3 emails escalonados) nunca foi implementada. Com Brevo agora
conectado e validado em produção (chave `xkeysib-...` no AppSetting), é hora
de fechar o loop.

## Acceptance Criteria

- [x] **AC-01:** Modelo `Lead` no Prisma com campos: email (unique), name,
  source, sequenceStep (0/1/2/-1), lastEmailAt, createdAt
- [x] **AC-02:** `/api/leads` refatorado para:
  - Persistir Lead local (idempotente via unique email)
  - Sync contato no Brevo (lista 6 "Leads Emagreca")
  - Disparar welcome email imediato (D+0) só para novos leads
  - Falha do Brevo não bloqueia salvamento local
- [x] **AC-03:** 3 templates HTML em `src/lib/email-sequence.ts`:
  - `welcomeEmail()` — D+0 boas-vindas + apresentação
  - `valueEmail()` — D+2 dica de valor (regra das 3 horas)
  - `offerEmail()` — D+5 oferta R$37 com urgência
  - Templates respondem ao nome (`firstName`) e usam paleta do site
- [x] **AC-04:** `/api/cron/email-sequence` (público, CRON_SECRET):
  - Busca leads `sequenceStep=0` com idade ≥ 2d → envia D+2, avança para 1
  - Busca leads `sequenceStep=1` com idade ≥ 5d → envia D+5, avança para 2
  - Batch limit 100 por execução
  - Idempotente (state machine via sequenceStep)
- [x] **AC-05:** Tracking UTM `utm_source=brevo&utm_medium=email&utm_campaign=...`
  em todos os links dos emails

## Technical Notes

- Templates de email não dependem de Anthropic — funcionam mesmo sem Maya online
- Sender padrão: `contato@longetividade.com.br` (via `lib/email.ts`)
- Lead.sequenceStep=-1 reservado para opt-out futuro (não implementado nesta story)
- O welcome agora dispara via nosso `sendEmail()` (Brevo /v3/smtp/email),
  não mais via Brevo Automation interna
- Brevo lista 6 continua sincronizada (compatibilidade com automações futuras)

## File List

- [x] `prisma/schema.prisma` — model `Lead` adicionado
- [x] `src/lib/email-sequence.ts` — 3 templates + wrap() helper
- [x] `src/app/api/leads/route.ts` — refatorado: DB + Brevo + welcome
- [x] `src/app/api/cron/email-sequence/route.ts` — cron D+2 e D+5

## Como agendar

```
CRON_SECRET=<string-aleatoria-longa>
0 12 * * *  curl https://www.longetividade.com.br/api/cron/email-sequence -H "x-cron-secret: $CRON_SECRET"
```

(9h BRT = 12h UTC, mesmo cron pode chamar `/api/cron/maya-daily-report` em paralelo)

## Definition of Done

- [x] Todos os ACs marcados
- [x] `npx tsc --noEmit` limpo
- [ ] Cron externo configurado (depende de CRON_SECRET no Railway)
- [ ] Teste manual: cadastrar email no formulário e verificar inbox
