# STORY-MAYA-002: Setup completo da Bárbara

**Agente:** Maya (IA no painel admin)
**Prioridade:** P1
**Status:** [x] Done (2026-04-11)
**Contexto:** Bárbara precisa de uma estrutura profissional completa para
gerir o projeto Longetividade de forma autônoma.

## Acceptance Criteria

- [x] AC-01: Maya tem checklist de setup para a Bárbara no dashboard
  Items detectados automaticamente do estado real do sistema:
  - Email profissional contato@longetividade.com.br (Registro.br) → manual flag
  - Conta Brevo (BREVO_API_KEY em AppSetting)
  - Business Manager Meta + Conta de Anuncios (META_ADS_ACCOUNT_ID)
  - Pixel Meta proprio (NEXT_PUBLIC_META_PIXEL_ID)
  - Token Meta Ads API (META_ADS_ACCESS_TOKEN)
  - Compra teste (Order com status=approved no DB)

- [x] AC-02: Maya guia cada passo com instruções detalhadas
  Pagina /admin/setup expande cada item com instrucoes em portugues,
  links diretos para Brevo, Registro.br, Meta, Hotmart, e botoes para
  abrir Configuracoes na aba certa (#meta, #brevo).

- [x] AC-03: Configuração DNS email (instruções para Registro.br)
  Item "email_pro" em /admin/setup mostra registros MX/TXT/SPF/DKIM/DMARC
  para Zoho Mail (gratis), com link direto pro painel do Registro.br.

- [x] AC-04: Integração Brevo
  - Endpoint /api/admin/test-brevo (chama /v3/account)
  - Campo BREVO_API_KEY em /admin/configuracoes#brevo
  - Botao "Testar Conexao" mostra email/nome/creditos da conta
  - Erros humanizados (401 = chave invalida, etc.)

- [x] AC-05: Maya monitora progresso
  - /admin/setup mostra barra de progresso (X / total %)
  - Maya context ja recebe a lista atualizada via /api/admin/maya/context
  - Pendencias dinamicas substituem o DEFAULT_CHECKLIST estatico
  - Item "Setup" no sidebar admin

## File List

- [x] `src/app/admin/setup/page.tsx` — pagina nova com checklist guiado e progresso
- [x] `src/app/api/admin/test-brevo/route.ts` — endpoint de validacao Brevo
- [x] `src/app/api/admin/maya/context/route.ts` — refactor: buildSetupChecklist() dinamico
- [x] `src/app/admin/configuracoes/page.tsx` — secao Brevo + botao testar
- [x] `src/components/admin/AdminSidebar.tsx` — link "Setup" no sidebar

## Notas técnicas

- Cada item do checklist e derivado de estado real (AppSetting + DB), nao mais hardcoded
- `EMAIL_PRO_DNS_OK=true` e a unica flag manual (Bárbara marca quando configurar DNS)
- `purchase_test` marca como feito quando existe pelo menos 1 Order com status=approved
- Pendencias servem tanto pro PendingChecklist do dashboard quanto pro contexto da Maya
- Maya nao chama API Anthropic direto na pagina /admin/setup — instrucoes sao estaticas
  (nao gasta credito, melhora performance, evita dependencia da chave que ainda nao esta no Railway)
