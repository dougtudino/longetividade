# Mapa Total do Projeto — Longetividade (fábrica de workspaces)

> Next.js 15 (App Router) + PostgreSQL/Prisma + Railway + Cloudflare R2.
> ~180 rotas de API, ~85 libs, 48 modelos Prisma. Multi-tenant (workspaces).

## 1. Camadas do sistema

```
PÚBLICO (funil)         ADMIN (operação)          APP VIP (cliente)
  LPs → checkout          painel multi-módulo        PWA de hábitos
  → obrigado → entrega    por workspace              (só emagrecimento)
        │                        │                         │
        └──────────── PostgreSQL (Prisma) ─────────────────┘
                   R2 (imagens) · Brevo (email) · Meta · Hotmart
```

## 2. O FUNIL DE VENDAS (o que te interessa)

### Fluxo atual (emagrecimento = referência)
```
1. LP pública            /emagreca-sem-dieta (+ detox, jejum, sono, movimento, /c/[slug])
2. Pricing (3 planos)     botão → pay.hotmart.com/<produto>?off=<offer>   [WorkspacePlan]
3. CHECKOUT              Hotmart (externo) — aqui rolam order bump + upsell NATIVOS do Hotmart
4. Webhook               /api/webhooks/hotmart → cria Order (roteia workspace por offer)
                         → claimVipSlot (se VIP) → email entrega → Meta CAPI Purchase
5. Redirect              Hotmart → /obrigado?plan=X&transaction=Y
6. OBRIGADO              /obrigado — pixel Purchase + acesso App VIP + próximos passos + upsell
7. ENTREGA               email (Brevo) com link /api/download?token=<downloadToken>
8. APP VIP               /app (só plano vip) — login por email/Google
```

### Páginas do funil (rotas reais)
| Rota | Papel | Observação |
|---|---|---|
| `/emagreca-sem-dieta` `-v2` | LP principal | 70% código, 30% data (LpAsset/SocialProofItem) |
| `/detox-mental` `/jejum-inteligente` `/sono-profundo` `/movimento-vital` | LPs alternativas | inline/hardcoded |
| `/c/[slug]` | LP por canal (meta/instagram/...) | VARIANTS hardcoded |
| `/corretor-blindado` | **LP do LT corretores** | workspace-aware (lê WorkspacePlan) ✅ |
| `/checkout` | checkout interno (CheckoutForm) | hoje aponta emagrecimento |
| `/obrigado` | thank-you + upsell + entrega VIP | **hardcoded emagrecimento** |
| `/api/download?token=` | entrega do arquivo | token em Order |
| `/link-expirado` `/privacidade` | suporte | — |

### ⚠️ NÃO existe (a "mais páginas de vendas")
- **Sem páginas de upsell/downsell PAGAS próprias** — o bump+upsell vivem no checkout Hotmart.
- O `/obrigado` tem 1 bloco de upsell, mas é **lead-capture** (lista VIP de produto futuro), não venda 1-clique.

## 3. ADMIN — agora organizado por MÓDULO (enabledModules por workspace)

| Módulo | Itens do menu | Rotas |
|---|---|---|
| **plataforma** (sempre) | Workspaces, Admins, Ecossistema, App Icon, Setup, Manual, Demo, Config | `/admin/...` |
| **sales** | Dashboard, Vendas, Abandonos, Funil, Email Marketing | escopados por workspace ✅ |
| **lp** | LPs, LP Assets, Galeria social | LpAsset/SocialProofItem |
| **ads** | Campanhas, Criativos, Gaia 🌱, Blueprint, Tráfego | Meta Ads + agente Gaia |
| **social** | Social Media (Luna 🌙), Video Intel 🎬 | Blotato, Apify, Gemini |
| **app** | Clientes App, App Icon | App VIP (emagrecimento) |

Longetividade = todos. Corretor = `sales+lp+ads`.

## 4. APP VIP (`/app/*`) — só emagrecimento
PWA de hábitos: home, jornada (ciclos 21d), descobrir, eu, receitas, progresso, onboarding, notificações, login/cadastro. Modelos `App*` (AppUser, AppCycle, AppCheckin, Broto, etc). **Não usado pelo corretores.**

## 5. DADOS (modelos Prisma, agrupados)
- **Venda/funil:** Order, AbandonedCheckout, Lead, PageView, CtaClick, MetaCapiEvent *(todos com `workspaceId` ✅)*
- **Workspaces:** Workspace, WorkspaceMembership, WorkspacePlan
- **LP:** LpAsset, SocialProofItem *(por `lpSlug` + `workspaceId`)*
- **Ads:** Campaign, CampaignMetric, LaunchBlueprint(+Audience/AdSet), Creative(+Copy/Collection)
- **Social/Agentes:** SocialPost(+Image), AgentKnowledge, AgentDecision(+ChecklistItem), VideoCompetitor/Analysis, MayaMessage
- **App VIP:** AppUser + ~18 tabelas App*
- **Admin:** AdminUser

## 6. LIBS/SERVIÇOS (núcleo)
- **Funil:** hotmart, download, email, email-sequence, email-post-purchase, email-abandoned, meta-capi, pixel, tracking, cta-tracking, utm
- **Workspaces:** workspace, workspace-plans, db-migrations
- **Pagamento:** mercadopago (legado), settings
- **Ads:** meta-ads, meta-launcher, blueprint-launcher, gaia-*
- **Social:** social-*, blotato-*, video-*, agents/* (uma, quinn)
- **App:** app-auth, app-token, app-session, cycles, broto, gamification, streaks, notifications-engine, push
- **Infra:** prisma, r2, image-pipeline, tz, rate-limit, logger, server-url

## 7. CRONS (`/api/cron/*`) — hoje todos emagrecimento/global
email-sequence (D+2/D+5), post-purchase (D+1/7/21), abandoned-cart, sync-hotmart, notifications-dispatcher, social-* (gerar/postar/trends/engagement), blotato-*, gaia-review/execute, maya-daily-report, video-intelligence.
→ Pro corretores precisariam virar por-workspace (Fase posterior).

---

## 8. FUNIL DO CORRETORES — tem vs precisa

### ✅ Já tem
- LP `/corretor-blindado` (workspace-aware, lê planos do banco, hero com foto editável)
- WorkspacePlan: lt R$27 / bump R$17 / upsell R$197 *(offers PLACEHOLDER)*
- Webhook roteia Order pro workspace pela offer
- Vendas/Dashboard/Funil escopados por workspace

### 🔲 Precisa (as "mais páginas de vendas")
1. **Produto na Hotmart** + trocar offers placeholder pelos reais (na tela Workspaces)
2. **Estratégia de checkout/upsell** — DECISÃO:
   - **(A) Hotmart-native (recomendado p/ LT):** bump + upsell 1-clique configurados NO Hotmart. Zero páginas novas. Mais rápido pra subir.
   - **(B) Páginas próprias:** checkout custom + página de upsell/downsell próprias (mais controle, mais trabalho).
3. **Página de obrigado/entrega do corretores** — hoje `/obrigado` é do emagrecimento. Opções:
   - `/corretor-blindado/obrigado` dedicada, OU
   - tornar `/obrigado` workspace-aware (lê marca/produto do workspace)
4. **Entrega do produto** — LT é digital (PDF/área). Definir: email com link de download (igual hoje) ou área de membros simples.
5. **Funil de email do corretores** (templates próprios, remetente próprio) — opcional no início.

### Recomendação de sequência
Subir rápido com **(A) Hotmart-native**: cria produto+bump+upsell no Hotmart → troca offers na tela Workspaces → cria `/corretor-blindado/obrigado` (entrega via email) → liga tráfego. Páginas próprias de upsell só se a conversão pedir.
