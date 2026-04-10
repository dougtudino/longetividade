# STORY-MAYA-002: Setup completo da Bárbara

**Agente:** Maya (IA no painel admin)
**Prioridade:** P1
**Contexto:** Bárbara precisa de uma estrutura profissional completa para
gerir o projeto Longetividade de forma autônoma.

## Acceptance Criteria

- [ ] AC-01: Maya tem checklist de setup para a Bárbara no dashboard
  Items:
  - Email profissional barbara@longetividade.com.br (DNS no Registro.br)
  - Conta Brevo com email profissional
  - Business Manager Meta com email profissional
  - Pixel Meta próprio vinculado ao longetividade.com.br
  - Conta de anúncios Meta
  - Token Meta Ads API inserido em /admin/configuracoes

- [ ] AC-02: Maya guia cada passo com instruções detalhadas
  Quando Bárbara clicar em um item pendente, Maya explica como fazer
  com links diretos e passo a passo em português

- [ ] AC-03: Configuração DNS email (instruções para Registro.br)
  Maya mostra os registros MX/TXT que precisam ser adicionados
  no DNS do domínio longetividade.com.br no Registro.br

- [ ] AC-04: Integração Brevo
  Após Bárbara criar conta Brevo, campo para inserir BREVO_API_KEY
  em /admin/configuracoes → Maya testa a conexão automaticamente

- [ ] AC-05: Maya monitora progresso
  Percentual de conclusão do setup visível no dashboard
  Maya menciona pendências na saudação diária
