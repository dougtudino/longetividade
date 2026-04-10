# SPRINT MAYA-001 — Resultado

## O que foi implementado

### Backend — API da Maya
- **`src/app/api/admin/maya/context/route.ts`** — `GET` retorna contexto de negócio
  da Maya: receita/vendas hoje, receita do mês, total de vendas, usuários VIP,
  check-ins hoje, pendências (com fallback para lista default caso `AppSetting`
  `admin_checklist` não exista) e data/hora em pt-BR.
  - Exporta também `buildMayaContext(adminName)` para ser reutilizada pelo
    endpoint de chat (evita duplicar a query).
  - Verifica cookie `admin-token` e retorna 401 se inválido.
- **`src/app/api/admin/maya/route.ts`** — `POST { message, history? }`
  - Autentica via `admin-token`, lê as últimas 10 mensagens da Maya no Postgres
    (`MayaMessage`) e monta o system prompt com os dados reais do negócio.
  - Chama `https://api.anthropic.com/v1/messages` com `claude-sonnet-4-20250514`
    e `max_tokens: 800`.
  - Persiste mensagens do usuário e da assistant em `MayaMessage`.
  - Suporta `message === "__init__"` para gerar saudação automática sem salvar
    no histórico.
  - Retorna `{ reply, context }` para que o front já receba os dados atualizados.

### Componentes
- **`src/components/admin/maya-chat.tsx`** — componente client com:
  - Auto-greeting na montagem (busca `/api/admin/maya/context` + dispara
    `__init__` para receber a saudação da Maya).
  - Bolhas de mensagem (Maya à esquerda em sage/verde-claro, gestora à direita
    em branco com borda), animação suave de entrada.
  - Indicador "Maya está digitando..." com pontinhos animados.
  - Input com `Enter` para enviar, scroll automático.
- **`src/components/admin/pending-checklist.tsx`** — lista de pendências com
  checkbox visual (não clicável nesta sprint), contagem de abertas/concluídas,
  itens concluídos com `line-through` e destaque verde.

### Dashboard
- **`src/app/admin/dashboard/page.tsx`** — nova linha grid no topo da página,
  antes dos KPIs:
  - Coluna esquerda (3fr ≈ 60%): `<MayaChat />`
  - Coluna direita (2fr ≈ 40%): `<PendingChecklist />` alimentado pelo contexto
    que a Maya devolve (`onContextLoaded`).
  - Colapsa para coluna única em `max-width: 768px`.

## Como testar

1. Acesse <https://longetividade.com.br/admin/login>.
2. Login: `babitudino@gmail.com` / `babi123`.
3. No dashboard, o card da Maya aparece no topo à esquerda com saudação
   automática e o resumo do dia; à direita, o card de pendências.
4. Envie uma pergunta no input (ex.: "Quantas vendas eu fiz hoje?") e confira
   que a resposta cita apenas os dados reais do contexto.

## ⚠️ ANTHROPIC_API_KEY no Railway

**A variável `ANTHROPIC_API_KEY` NÃO existe hoje no código/`.env` do projeto.**
Até que ela seja configurada no Railway, a Maya responderá com a mensagem:

> "(Maya está offline: variável ANTHROPIC_API_KEY não está configurada no
> Railway. Adicione a chave nas variáveis de ambiente para me ativar.)"

### Passos para ativar a Maya em produção

1. Acesse o painel do Railway → serviço do site.
2. Aba **Variables** → **New Variable**.
3. Adicione:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** (chave secreta da console.anthropic.com — começa com `sk-ant-…`)
4. Deploy o serviço (Railway re-deploya automaticamente ao salvar a variável).
5. Testar enviando "oi" no chat da Maya.

O código já está pronto: `src/app/api/admin/maya/route.ts` lê
`process.env.ANTHROPIC_API_KEY` e faz a chamada `fetch` com header `x-api-key`
+ `anthropic-version: 2023-06-01`.

## Quality gates

- `npx tsc --noEmit` → **zero erros**.
- `npm run lint` → arquivos novos/alterados sem erros/warnings. Os 29
  erros/warnings reportados são todos pré-existentes (`celebration-overlay.tsx`,
  `FacebookPixel.tsx` etc.) e fora do escopo da sprint.

## Próximo sprint — MAYA-002 (Setup Bárbara)

- Criar email profissional `barbara@longetividade.com.br`.
- Criar Business Manager e Pixel próprios no Meta Ads.
- Inserir Token Meta Ads em **Configurações**.
- Tornar o `PendingChecklist` editável (marcar/desmarcar persistindo em
  `AppSetting["admin_checklist"]`).
