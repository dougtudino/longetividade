# Technical debt

## Migration strategy em producao — prioridade media

Estado atual: mistura de tres sistemas:

- `railway.toml` com `prisma db push --accept-data-loss` — **NAO FUNCIONA**
  porque Railway detecta Dockerfile no repo e ignora o `buildCommand` do
  `railway.toml` (descoberto em 2026-04-20 ao debugar deploy do commit
  `7485242`).
- `Dockerfile` roda apenas `prisma generate` + `next build` — sem migration.
- Fallback manual via `/api/admin/migrate/schema` com statements SQL
  `IF NOT EXISTS` em `src/lib/db-migrations.ts` — **UNICO sistema que sempre
  funcionou em producao**. Acionado via botao "⚡ Migrar schema" em
  `/admin/criativos` ou hit direto na URL.

## Problemas

- Dupla fonte de verdade: `prisma/schema.prisma` (canonico do Prisma client)
  + `src/lib/db-migrations.ts` (canonico do que efetivamente roda em prod).
  Toda mudanca de schema precisa ser duplicada manualmente nos dois lugares.
- Risco de drift entre schema do Prisma (usado pelo client em runtime) e
  schema real do banco (gerado pelo fallback manual).
- Flag `--accept-data-loss` no `railway.toml` e perigosa (mesmo nao
  executando hoje, fica como armadilha se alguem trocar o Dockerfile).
- Depende de humano clicar botao manual apos cada deploy com mudanca de
  schema — facil esquecer e quebrar prod, exatamente o que aconteceu com
  os commits `c04f479` (Creative.archived) e `7485242`
  (AgentDecision.progressStatus + DecisionChecklistItem).

## Caminhos possiveis

1. **Migrar pra `prisma migrate deploy` formal no Dockerfile** — requer
   criar migrations SQL formais a partir do estado atual, garantir paridade
   inicial, depois usar `prisma migrate dev` localmente pra novas mudancas.
2. **Manter sistema manual mas automatizar via webhook pos-deploy** — Railway
   chama `/api/admin/migrate/schema` automaticamente quando deploy fica
   green. Resolve o "esquecer de clicar" mas nao a dupla fonte de verdade.
3. **Trocar Dockerfile por Nixpacks pra `railway.toml` voltar a funcionar** —
   `db push --accept-data-loss` continua perigoso e sujeito a falhas
   silenciosas, mas pelo menos volta pra um sistema so.

## Prioridade

Media. Nao urgente enquanto fallback funciona. Atacar quando tiver >1h sem
pressa, idealmente apos consolidar o que `db-migrations.ts` ja contem como
"snapshot de verdade" do schema atual.
