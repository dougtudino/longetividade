# Diagnostico Longetividade — 2026-04-10

> Auditoria completa do site `longetividade.com.br` rodando em Railway
> (project `2b773d39`, service `446feb69`).
> Repo: `dougtudino/longetividade` — branch `main`.

---

## Estrutura do projeto

**Stack:** Next.js 16.2.1 (App Router) + React 19 + Prisma 7 (Postgres) +
Tailwind v4. Pacote unico `site/` (sem monorepo).

```
site/
  middleware.ts                   # admin auth + roteamento por subdominio
  prisma/schema.prisma            # 22 modelos (Order, AppUser, AppProfile, ...)
  public/manifest.json            # PWA manifest (start_url=/app/home)
  src/
    app/
      layout.tsx                  # carrega TrackingScripts (FB Pixel + GA4)
      page.tsx                    # homepage com grid de produtos
      emagreca-sem-dieta/page.tsx # SALES PAGE principal (Metodo S.E.M)
      obrigado/page.tsx           # thank you (dispara Purchase pixel)
      app/                        # PWA VIP (5+ telas)
        layout.tsx                #   metadata.manifest = /manifest.json
        page.tsx                  #   redirect onboarding/home/login
        login/                    #   /app/login (form de email)
        onboarding/               #   onboarding 5 steps
        home/  agua/  habitos/    #   tabs do app
        progresso/  conquistas/
        emocional/  movimento/
        receitas/  desafio/  perfil/
      api/
        webhooks/hotmart/route.ts # webhook Hotmart (POST/GET)
        webhook/mercadopago/      # legacy MP
        app/                      # APIs do PWA (auth, profile, water, etc)
        admin/                    # area admin
        leads/  checkout/  download/
      c/[slug]/                   # campaign landings (UTM-aware)
      admin/                      # painel admin (auth via cookie)
    components/
      tracking/  FacebookPixel + GoogleAnalytics + TrackingScripts
      landing/   hero / pricing-section / vip-banner / sticky / final-cta
      app/       components do PWA
    config/plans.ts               # 3 planos com offerIds Hotmart
    lib/
      app-auth.ts                 # cookie app_email -> AppUser
      tracking.ts                 # trackEvent / ViewContent / IC / Purchase
      utm.ts                      # captureUTMs / appendUTMs (localStorage)
      settings.ts                 # getSetting() banco com fallback env
      vip-slots.ts  email.ts  download.ts  prisma.ts
```

**Banco (Prisma):** Order, AbandonedCheckout, Campaign/CampaignMetric, PageView,
AppUser, AppProfile, AppCheckin, AppWaterLog, AppWeightLog, AppMoodLog,
AppAchievement/UserAchievement/UserLevel, AppRecipe/FavoriteRecipe,
AppChallenge, AppMeasurement, AppVipSlot, AppSetting.

---

## Status de cada item

| Item                        | Status     | Observacao |
|----------------------------|-----------|-----------|
| Webhook Hotmart            | CORRIGIDO | Diferenciava plano so por valor; agora usa offer_code (Basico/Completo/VIP) com fallback por valor. |
| Meta Pixel                 | OK + CORRIGIDO | PageView ja disparado no `<head>`. Adicionado `InitiateCheckout` por plano nos CTAs do `PricingSection`. |
| Pagina /obrigado           | CORRIGIDO | Existia mas hardcoded a Basico R$37. Agora le `?plan=` da URL e dispara `Purchase` com valor correto + bloco VIP linkando para `/app/login`. |
| Protecao PWA VIP           | OK        | `getAppUser()` via cookie em todas as APIs `/api/app/*`. Pagina `/app` faz fetch + redirect para `/app/login` em 401. Sem middleware-level guard, mas suficiente. |
| UTM tracking               | CORRIGIDO | So existia em `/c/[slug]`. Adicionado `UTMCapture` no `layout.tsx` (captura global) + `appendUTMs` nos botoes do `PricingSection`. |
| CTAs landing page          | OK + CORRIGIDO | Links Hotmart corretos por offer (Basico=`zxq5tgew`, Completo=`uzvdkzkf`, VIP=`h84hak4e`). CTAs agora disparam `InitiateCheckout` por plano e anexam UTMs. |
| VIP scarcity (100 vagas)   | OK        | `VipBanner` busca `/api/app/slots` e mostra contador + barra. |
| /obrigado fires Purchase   | OK        | Via `trackPurchase` (Pixel + GA4). Recomendado complementar com Conversion API server-side a partir do webhook. |
| manifest.json PWA          | OK (parcial) | Existe e referencia `icon-192.png`/`icon-512.png` mas **estes arquivos NAO estao em `/public`** — adicionar para PWA install funcionar. |
| Service Worker             | AUSENTE   | Sem `sw.js`. App instala mas nao tem cache offline. Considerar `next-pwa` se quiser offline. |

---

## Variaveis de ambiente necessarias (Railway)

### Obrigatorias
```
DATABASE_URL                       # Postgres (Railway plugin)
NEXT_PUBLIC_APP_URL                # https://longetividade.com.br
NEXT_PUBLIC_DOMAIN                 # longetividade.com.br (para metadata + middleware)
NEXT_PUBLIC_APP_NAME               # Longetividade

# Hotmart
HOTMART_WEBHOOK_SECRET             # Hottok do produto (header x-hotmart-hottok)
HOTMART_OFFER_BASICO               # zxq5tgew (default ja no codigo)
HOTMART_OFFER_COMPLETO             # uzvdkzkf (default ja no codigo)
HOTMART_OFFER_VIP                  # h84hak4e (default ja no codigo)

# Tracking
NEXT_PUBLIC_META_PIXEL_ID          # ID do Pixel Meta
NEXT_PUBLIC_GA4_MEASUREMENT_ID     # G-XXXXXXXXXX

# Email
BREVO_API_KEY                      # entrega de ebook + leads
EMAIL_FROM                         # noreply@longetividade.com.br

# Download token
EBOOK_DOWNLOAD_SECRET              # uuid

# Admin
ADMIN_PASSWORD                     # senha do painel /admin
ADMIN_SECRET                       # opcional (default longetividade-admin-2024)
```

### Opcionais / legacy
```
RESEND_API_KEY                     # alternativa ao Brevo
MERCADOPAGO_ACCESS_TOKEN           # legacy (ainda referenciado)
MERCADOPAGO_PUBLIC_KEY
MERCADOPAGO_WEBHOOK_SECRET
```

> Os offer codes podem ser sobrescritos via `AppSetting` (admin no banco) que
> tem prioridade sobre as env vars (ver `src/lib/settings.ts`).

---

## Arquivos modificados nesta sessao

1. **`src/app/api/webhooks/hotmart/route.ts`** — webhook agora resolve plano
   por `offer_code` consultando `HOTMART_OFFER_BASICO`/`COMPLETO`/`VIP` em
   `AppSetting` (fallback env var, fallback por valor).

2. **`src/components/landing/plan-cta-button.tsx`** *(novo)* — client component
   que dispara `InitiateCheckout` com nome+valor por plano e anexa UTMs do
   localStorage no link Hotmart no momento do clique.

3. **`src/components/landing/pricing-section.tsx`** — substitui o `<a>` cru
   pelo novo `<PlanCTAButton>`.

4. **`src/app/obrigado/page.tsx`** — le `?plan=basico|completo|vip` da URL,
   dispara `Purchase` com valor correto, e exibe bloco VIP com link
   `/app/login` quando aplicavel.

5. **`src/app/emagreca-sem-dieta/page.tsx`** — adicionado `captureUTMs(...)`
   no `useEffect` ao lado do `trackViewContent` existente.

6. **`src/components/tracking/UTMCapture.tsx`** *(novo)* — client component
   "fire-and-forget" que captura UTMs em qualquer pagina sem precisar
   converter Server Components.

7. **`src/app/layout.tsx`** — monta `<UTMCapture />` no `<body>` para captura
   global em toda navegacao (inclui homepage que e Server Component).

---

## O que ainda falta fazer manualmente

### Hotmart (no painel)
1. Confirmar que os 3 offer_codes batem com o codigo:
   - Basico = `zxq5tgew`
   - Completo = `uzvdkzkf`  *(o usuario achava que estava pendente — ja existe em `src/config/plans.ts:30`. Validar no painel Hotmart)*
   - VIP = `h84hak4e`
2. Configurar a URL de pagina de obrigado por oferta apontando para:
   - `https://longetividade.com.br/obrigado?plan=basico`
   - `https://longetividade.com.br/obrigado?plan=completo`
   - `https://longetividade.com.br/obrigado?plan=vip`
3. Configurar webhook em `https://longetividade.com.br/api/webhooks/hotmart`
   com Hottok salvo em `HOTMART_WEBHOOK_SECRET` no Railway.
4. Testar com **compra de teste gratuita** (cupom 100% off) — verificar:
   - Webhook retorna 200 e cria `Order` no banco
   - VIP cria `AppUser` e desconta `AppVipSlot`
   - Email de entrega chega via Brevo
   - `/obrigado?plan=vip` mostra botao "Acessar meu App VIP"

### Railway (vars de ambiente)
1. Setar todas as variaveis listadas na secao acima.
2. Em particular: `HOTMART_WEBHOOK_SECRET`, `NEXT_PUBLIC_META_PIXEL_ID`,
   `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_DOMAIN`.

### PWA
1. Adicionar arquivos `public/icon-192.png` e `public/icon-512.png` (referenciados
   em `manifest.json` mas ausentes).
2. *(Opcional)* Considerar `next-pwa` para gerar `sw.js` com cache offline.

### Conversion API (recomendado, nao bloqueante)
- O `Purchase` event hoje so dispara client-side em `/obrigado`. Para resiliencia
  contra ad blockers, implementar Meta Conversion API server-side dentro de
  `src/app/api/webhooks/hotmart/route.ts` (ja temos email + amount + plan).

### Pendencias menores
- `src/app/api/app/demo-login/route.ts` cria `AppUser` admin sem checar nada —
  remover ou proteger antes de produzao.
- Banner "Oferta por tempo limitado — R$37" no nav de `/emagreca-sem-dieta` esta
  hardcoded; se subir o preco, atualizar manualmente.
- `trackPurchase` em `/obrigado` nao envia `event_id` — sem dedup com Conversion API.

---

## Notas tecnicas

- O webhook usa `getSetting()` que **le do banco** (`AppSetting`) com cache
  de 60s e cai pra env var como fallback. Isso permite trocar offer codes
  sem redeploy via painel admin.
- O `LeadCapture` em `/obrigado` ja captura email para upsell do "Sono Profundo".
- `VipBanner` em `PricingSection` ja consome `/api/app/slots` para mostrar
  contador real de vagas (modelo `AppVipSlot`).
- O middleware `middleware.ts` faz roteamento por subdominio
  (`emagrecer.longetividade.com.br -> /emagreca-sem-dieta`) e protege `/admin`,
  mas **nao** intercepta `/app/*` — protecao do app e feita pelas API routes.
