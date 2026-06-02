# Arquitetura — Fábrica de Workspaces (multi-produto)

> Objetivo: transformar o Longetividade de "máquina de 1 landing page" numa **fábrica** onde cada produto/low-ticket vive num workspace isolado, com logins próprios. Primeiro alvo: o LT de documentação para corretores.

## Diagnóstico do estado atual (verificado no código)

| Camada | Hoje | Pronto p/ multi-produto? |
|---|---|---|
| **Auth admin** | JWT cookie `admin-token` (HMAC), `AdminUser` global, `requireAdmin()` retorna payload | 🟡 base boa; falta workspace na sessão. Google OAuth e invite-token (schema) já existem, invite sem fluxo |
| **Roles** | `manager`/`owner` no schema, **sem enforcement** | 🟡 dá pra reaproveitar como role-por-workspace |
| **Config produto** | `config/plans.ts` (Hotmart `H105141835Q` + offers + preços hardcoded), `config/app-brand.ts` (domínio, marca; env-overridable) | 🔴 hardcoded num produto |
| **Landing pages** | 70% código TSX por rota, 30% data-driven (`LpAsset`/`SocialProofItem` por `lpSlug`) | 🟡 `lpSlug` já existe, mas `LP_SLUG` hardcoded nos componentes |
| **Webhook Hotmart** | Cria `Order`, roteia plano por `offer_code` (global em `AppSetting`) | 🔴 não sabe a qual produto a venda pertence |
| **Crons** | 14/18 processam dados globais (1 conta Meta, 1 calendário social, todos Leads) | 🔴 assumem 1 produto |
| **Data layer** | 128/181 rotas usam `prisma.` direto, sem service layer, ~267 imports | 🔴 filtro de tenant teria que entrar em ~500 queries |
| **Singletons** | `AppSetting` (key/val global), `AppVipSlot` (id="singleton") | 🔴 globais por natureza |

**Conclusão:** não existe conceito de tenant. Migrar tudo de uma vez = ~500 queries + 14 crons + webhook + configs → a leitura "3-4 semanas" do relatório. **Não é o caminho.**

## Princípio diretor: Strangler, não Big-Bang

Não reescrever. Introduzir a **costura** (seam) de workspace, declarar o produto atual como `workspace #1` (backfill), e construir o **LT novo já 100% workspace-aware** como implementação de referência. As ~500 queries legadas ganham fallback pro workspace default e são apertadas **oportunisticamente** (quando você encostar na rota). O emagrecimento continua rodando intacto como workspace default o tempo todo.

> Regra de ouro: **código novo nasce workspace-aware; código velho só migra quando for tocado.**

## Modelo de dados (novos modelos)

```prisma
model Workspace {
  id        String   @id @default(uuid())
  slug      String   @unique          // "longetividade" | "corretor-blindado"
  name      String
  status    String   @default("active") // active | paused | archived
  // resolução pública por domínio
  domains   String[] @default([])      // ["corretorblindado.com.br"]
  // config de produto (antes hardcoded em config/*)
  brandName       String
  metaPixelId     String?
  hotmartProductId String?
  adAccountId     String?
  businessManagerId String?
  fromEmail       String?
  settings        Json?                // resto flexível
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships WorkspaceMembership[]
  plans       WorkspacePlan[]
}

model WorkspaceMembership {           // substitui "AdminUser global vê tudo"
  id          String @id @default(uuid())
  adminId     String
  workspaceId String
  role        String @default("manager") // owner | manager | editor (POR workspace)
  createdAt   DateTime @default(now())
  admin       AdminUser @relation(fields: [adminId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([adminId, workspaceId])
}

model WorkspacePlan {                 // substitui config/plans.ts hardcoded
  id            String @id @default(uuid())
  workspaceId   String
  planKey       String                // "basico" | "completo" | "vip" | "lt" | "bump" | "upsell"
  label         String
  priceCents    Int
  hotmartOffer  String                // offer code → usado pelo webhook pra rotear
  checkoutUrl   String
  features      Json?
  active        Boolean @default(true)
  orderIndex    Int     @default(0)
  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, planKey])
  @@unique([hotmartOffer])            // offer code globalmente único → roteamento determinístico
}
```

Modelos existentes ganham `workspaceId String?` (nullable na migração → backfill p/ longetividade → não-null depois). **Prioridade por fase, não todos juntos** (ver Roadmap).

## Resolução de contexto (quem é o workspace deste request?)

| Origem do request | Como resolve | Helper |
|---|---|---|
| **LP / checkout / obrigado** (público) | por **domínio** (host) no `middleware.ts` → injeta `x-workspace-id` | `getWorkspaceFromHost()` |
| **Admin** (`/admin/*`, `/api/admin/*`) | **workspace ativo na sessão** (JWT ganha `activeWorkspaceId`) + switcher na sidebar | `requireAdminWorkspace()` |
| **Webhook Hotmart** | `offer_code` → `WorkspacePlan.hotmartOffer` → workspace | lookup no banco |
| **Crons** | parametrizado por workspace (loop nos ativos ou `?workspace=`) | fase tardia |

### Nuance de domínio (importante)
- **LPs públicas** vão pra domínios próprios por produto (ex: `corretorblindado.com.br`) → bom pra isolar Pixel/marca, e o `middleware` resolve por host.
- **Admin é single-domain** (ex: fica no domínio do longetividade). Cookie `admin-token` não cruza apex domains diferentes — então o painel mora num domínio só e troca de workspace pela sessão, não pelo host. (Lembrar: cookie cross-subdomain usa `Domain=.longetividade.com.br`.)

## Restrições do projeto a respeitar
- **`prisma db push` no Railway não é confiável** → cada tabela nova (`Workspace`, `WorkspaceMembership`, `WorkspacePlan`) precisa de **SQL idempotente em `lib/db-migrations.ts`** + rodar `POST /api/admin/migrate/schema` pós-deploy.
- **Railway não embeda `NEXT_PUBLIC_*`** no build (Nixpacks+Turbopack) → config pública (pixel, marca, domínio) tem que vir do **banco em runtime** (Workspace), não de env de build. Isso reforça pôr config no `Workspace`.

## Roadmap faseado

### Fase 0 — Costura (foundation, não vende nada ainda)
1. Modelos `Workspace` + `WorkspaceMembership` + `WorkspacePlan` (+ SQL idempotente em `db-migrations.ts`).
2. Seed `workspace: longetividade` com a config atual (pixel/hotmart/marca de hoje) + backfill `workspaceId` nos modelos de venda/LP.
3. `AdminUser` → cria membership de todos os admins atuais no longetividade (role owner pro Doug).
4. Sessão: `signAdminToken` ganha `activeWorkspaceId`; `requireAdminWorkspace(req)` helper; rota `POST /api/admin/workspace/switch`.
5. Middleware público: `getWorkspaceFromHost()` (default longetividade se host desconhecido).
6. Switcher de workspace na `AdminSidebar`.

### Fase 1 — LT corretores ao vivo (o que prova a fábrica)
1. Refatorar `config/plans.ts` → ler `WorkspacePlan` do workspace em contexto. `social-proof-block.tsx` → `lpSlug` por contexto, não hardcode. Checkout → planos do workspace.
2. Webhook Hotmart → rotear `offer_code → workspace` e gravar `Order.workspaceId`.
3. Escopar por workspace os modelos do funil de venda: `Order`, `Lead`, `AbandonedCheckout`, `LpAsset`, `SocialProofItem`, `CtaClick`, `MetaCapiEvent`, `PageView`.
4. Criar workspace `corretor-blindado`: config + planos (LT R$27, order bump, upsell) + domínio.
5. Construir a LP do LT (rota nova reusando componentes `landing/`, alimentada pela config do workspace) + checkout + página obrigado.
6. Funil de email do LT (templates por workspace; remetente próprio).

### Fase 2+ — Escala (sob demanda, por produto)
- Ads (`Campaign`, `LaunchBlueprint`, `Creative*`) por workspace.
- Social/Luna/Blotato/Video-Intelligence por workspace (multi-calendário, multi-conta).
- Agentes (Gaia/Maya/AgentKnowledge/AgentDecision) por workspace.
- Logins de parceiros com escopo (Barbara num workspace, parceiro do LT em outro).
- (Opcional, tardio) Builder de LP no-code — só se a velocidade de criar produto exigir.

---

# Modo SaaS — vender a assinatura pra outros criadores

> Reframe (2026-06-02): o objetivo final não é só rodar o portfólio do Doug — é **vender acesso à plataforma pra outros criadores de low-ticket**. Workspace deixa de ser "um produto meu" e vira **a conta de um cliente pagante externo**. Isso endurece a fronteira de confiança: isolamento vira requisito de segurança, não de conveniência.

## O que MUDA com tenant externo

| Pilar | Fábrica pessoal (antes) | SaaS p/ criadores (agora) |
|---|---|---|
| **Isolamento** | Leniente — cai no default se faltar membership | **Deny-by-default.** Vazar dado entre tenants = breach. Precisa enforcement sistemático (Postgres RLS ou Prisma client extension que injeta `workspaceId` SEMPRE) |
| **Onboarding** | Eu crio o workspace | **Self-serve**: criador se cadastra → cria workspace + membership owner automático → trial |
| **Hotmart** | offer_code → workspace (eu donos das offers) | **URL/secret de webhook único por tenant** (`/api/webhooks/hotmart/[token]`). Cada criador cola no painel Hotmart DELE |
| **Meta/Pixel** | Minha conta hardcoded | **OAuth connect por workspace** — guarda ad account / pixel / tokens do criador |
| **Domínio** | Meus domínios | **Custom domain por tenant** (verificação + SSL). Enquanto não: subdomínio `criador.suaplataforma.com` |
| **Email** | Meu Brevo | Sub-conta / remetente verificado por tenant |
| **Billing** | Não existe | **Assinatura da plataforma** (você cobra o criador). Tiers que liberam features/limites |
| **LP authoring** | Templates em código (eu monto) | Médio prazo vira **builder no-code** — criador monta sozinho. "Código" só escala como done-for-you |

## O que SE MANTÉM da Fase 0
`Workspace` / `WorkspaceMembership` / `WorkspacePlan` continuam a base certa. Resolução por host (agora central p/ custom domain). Sessão com `activeWorkspaceId` + switcher. Strangler ainda vale: emagrecimento + corretores viram os 2 primeiros tenants **internos** (dogfood) antes de abrir self-serve.

## O que é NOVO (camadas a adicionar)
1. **Enforcement de isolamento** — RLS no Postgres e/ou Prisma extension. Remover a leniência da Fase 0 ANTES de qualquer tenant externo.
2. **Subscription/billing** — model `Subscription` + provedor (Stripe / Hotmart / Kiwify) + feature gating por tier.
3. **Signup self-serve** — cadastro de criador (não invite-only).
4. **Integrações BYO** — connect flows (Hotmart secret, Meta OAuth, domínio, email) no onboarding do tenant.
5. **Custom domain infra** — verificação + SSL automático.
6. **LP builder no-code** — deixa de ser "opcional/tardio" e vira requisito do produto.

## ⚠️ Dívida de segurança consciente (Fase 0)
A Fase 0 é **deliberadamente leniente** (`adminCanAccessWorkspace` cai no default sem membership; `resolveActiveWorkspaceId` idem). Isso é seguro ENQUANTO só existem tenants meus. **Bloqueador de go-to-market:** trocar pra deny-by-default + enforcement sistemático antes do primeiro criador externo entrar.

## Faseamento (decisões travadas 2026-06-02)
Decisões do Doug: **dogfood primeiro** · billing **Stripe** · LP futura = **builder no-code**.

- **Fase 1 — Dogfood:** corretores como 2º tenant interno. LP em **código** (rápido — o builder é pra depois). Prova a fábrica de ponta a ponta com produto seu.
- **Fase 2 — Hardening:** isolamento **deny-by-default** + RLS/Prisma extension; webhook per-tenant; backfill 100% scopado. (Bloqueador antes de qualquer externo.)
- **Fase 3 — Self-serve:** signup de criador + billing **Stripe** (tiers/limites/dunning + portal) + integrações BYO (Hotmart secret, Meta OAuth, email) + subdomínio.
- **Fase 4 — Produto self-serve:** **LP builder no-code** (o que destrava criador montar sozinho), custom domain (verificação+SSL), feature gating por tier, multi-conta Meta/social.

> Durante dogfood (Fase 1), autoria de LP é código/done-by-Doug; o builder no-code (Fase 4) é o que troca isso quando criadores externos entram.

## O que NÃO fazer agora
- Não migrar os 47 modelos nem as 500 queries de uma vez.
- Não escopar o App VIP (`AppUser` e família) — emagrecimento-only por enquanto; o LT corretores provavelmente nem tem app.
- Não construir builder de LP no-code (over-engineering pro estágio atual).
- Não refatorar os 14 crons globais agora — eles seguem longetividade-only; crons do LT entram só quando o LT precisar.
