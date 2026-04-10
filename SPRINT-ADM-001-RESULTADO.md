# SPRINT ADM-001 — Resultado

## Escopo entregue
- Multi-admin (AdminUser) com email + senha bcrypt + token HMAC (7 dias)
- Maya: model MayaMessage para histórico de conversas
- Página de login admin atualizada (email + senha)
- Middleware protegendo /admin/* via cookie `admin-token`
- Stories MAYA-002 (setup Bárbara) e MAYA-003 (relatório diário)

## Como acessar o painel
- URL: https://longetividade.com.br/admin/login
- Douglas: `dougtudino@gmail.com` / senha = `ADMIN_PASSWORD` do env (fallback `Z12a45q78()`)
- Bárbara: `babitudino@gmail.com` / senha = `babi123`

## Seed inicial (rodar uma vez em produção)
Após o deploy, rodar o script seed contra a URL de produção:
```bash
# Local (com server rodando em localhost:3000)
node scripts/seed-admin.js

# Produção
node scripts/seed-admin.js https://longetividade.com.br
```
Ou POSTar diretamente para `/api/admin/auth/seed` com `seedKey=LONGETIVIDADE2026`.

> IMPORTANTE: Prisma `db push` não rodou localmente (DB local offline).
> Em produção, o schema será aplicado via `prisma migrate deploy` ou `prisma db push`
> no pipeline de deploy do Railway.

## Arquivos criados
- `src/lib/admin-token.ts` — token HMAC edge-safe
- `src/lib/admin-auth.ts` — bcrypt hash/verify + re-export token helpers
- `src/app/api/admin/auth/login/route.ts`
- `src/app/api/admin/auth/logout/route.ts`
- `src/app/api/admin/auth/me/route.ts`
- `src/app/api/admin/auth/seed/route.ts`
- `scripts/seed-admin.js`
- `docs/stories/STORY-MAYA-002-setup-barbara.md`
- `docs/stories/STORY-MAYA-003-relatorio-diario.md`

## Arquivos modificados
- `prisma/schema.prisma` — models AdminUser, MayaMessage
- `middleware.ts` — usa verifyAdminToken
- `src/app/admin/login/page.tsx` — email + senha
- `package.json` — bcryptjs + @types/bcryptjs

## Env vars novas (opcionais)
- `JWT_SECRET` — secret do token admin (fallback: NEXTAUTH_SECRET → ADMIN_PASSWORD)
- `ADMIN_SEED_KEY` — chave da rota seed (default: `LONGETIVIDADE2026`)

## Quality gates
- `npx tsc --noEmit` → 0 erros
- `npm run lint` → 0 erros novos (pré-existentes em `celebration-overlay.tsx` e `FacebookPixel.tsx` intocados)

## Próximos passos
1. Deploy (Railway roda migrations automaticamente)
2. Rodar `node scripts/seed-admin.js https://longetividade.com.br` para criar Douglas + Bárbara
3. Implementar STORY-MAYA-001 (Maya chat — painel + integração LLM)
4. Implementar STORY-MAYA-002 (checklist setup Bárbara)
5. Implementar STORY-MAYA-003 (relatório diário)
