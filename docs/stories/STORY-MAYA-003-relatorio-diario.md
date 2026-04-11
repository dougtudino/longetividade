# STORY-MAYA-003: Relatório diário automático da Maya

**Agente:** Maya
**Prioridade:** P1
**Status:** [x] Done (2026-04-11)

## Acceptance Criteria

- [x] AC-01: Ao entrar no /admin/dashboard, Maya gera relatório do dia
  Busca dados reais: vendas 24h, receita, clientes VIP ativos
  > Implementado em STORY-MAYA-001 via /api/admin/maya/context.

- [x] AC-02: Saudação personalizada por horário
  Manhã (5-12): "Bom dia [nome]!"
  Tarde (12-18): "Boa tarde [nome]!"
  Noite (18-5): "Boa noite [nome]!"
  > Refinado em /api/admin/maya/route.ts — system prompt agora calcula
  > o bucket explicitamente e passa como instrucao. Tambem usado no
  > email diario via greetingByHour() em lib/maya-report.ts.

- [x] AC-03: Tom feminino, animado, focado em resultados
  > System prompt da Maya define personalidade. Email diario tem
  > "highlight" gerado por regras (ROAS, conversao, ritmo de vendas).

- [x] AC-04: Link rápido para pendências do checklist de setup
  > Email inclui contagem de pendencias com link pra /admin/setup.
  > Maya prompt menciona pendentes na saudacao.

- [x] AC-05: Histórico de conversa salvo em MayaMessage
  > Implementado em STORY-MAYA-001. Ultimas 10 mensagens carregadas.

## Bonus — relatório por email (entregue)

- [x] **lib/maya-report.ts** — `buildDailyReportData()` coleta vendas,
  receita, comparativo ontem/mes anterior, ticket medio, top plano,
  VIP, check-ins, pendencias e Meta Ads insights de ontem.
  `renderDailyReportHTML()` gera email responsivo com tom Maya.
- [x] **/api/admin/maya/daily-report** (auth admin) — manual trigger
  pelo painel. `?preview=1` retorna HTML, `?dry=1` simula sem enviar.
- [x] **/api/cron/maya-daily-report** (CRON_SECRET) — endpoint publico
  para cron externo (Railway scheduler ou cron-job.org). Header
  `x-cron-secret` ou query `?secret=` autoriza.
- [x] Botao **Enviar agora** + **Preview** em /admin/setup
- [x] Email enviado para todos AdminUser cadastrados via Brevo

## File List

- [x] `src/lib/maya-report.ts`
- [x] `src/app/api/admin/maya/daily-report/route.ts`
- [x] `src/app/api/cron/maya-daily-report/route.ts`
- [x] `src/app/api/admin/maya/route.ts` — refactor saudacao por bucket
- [x] `src/app/admin/setup/page.tsx` — botao Enviar/Preview

## Como agendar o cron diario

1. Gerar `CRON_SECRET` aleatorio:
   `openssl rand -hex 32` ou usar uuid
2. Adicionar como variavel no Railway: `CRON_SECRET=<valor>`
3. Configurar cron externo (cron-job.org gratis ou Railway scheduler)
   para chamar `GET https://www.longetividade.com.br/api/cron/maya-daily-report`
   com header `x-cron-secret: <CRON_SECRET>` todo dia as 8h BRT (= 11h UTC)
4. Cron expression: `0 11 * * *`

## Notas

- ANTHROPIC_API_KEY ainda nao esta no Railway — Maya chat continua respondendo offline
- Email diario NAO depende da Anthropic — usa apenas dados do DB e Meta API
- O relatorio funciona mesmo sem Maya online no chat
