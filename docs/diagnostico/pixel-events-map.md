# Pixel Events Map — Longetividade

**Pixel ID:** `953736244279938`
**Última atualização:** 2026-05-15 (STORY-FUNIL-001)

Mapa completo dos eventos do Meta Pixel disparados pela aplicação. Cada evento tem disparo **client-side** (browser) e **server-side mirror** (Conversions API) via `eventID` pra dedup.

## Arquitetura

```
┌─────────────┐        ┌────────────────┐         ┌──────────────┐
│   Browser   │──fbq──▶│  Meta Pixel    │────────▶│  Meta Events │
│  (cliente)  │        │ connect.fb.net │         │   Manager    │
└──────┬──────┘        └────────────────┘         └──────▲───────┘
       │                                                  │
       │ navigator.sendBeacon                             │
       ▼                                                  │
┌──────────────┐       ┌────────────────┐                │
│ /api/meta-capi │────▶│ Conversions API│────────────────┘
│   (server)   │       │   graph.fb.com │
└──────┬───────┘       └────────────────┘
       │
       ▼ prisma.metaCapiEvent.create
┌──────────────┐
│ MetaCapiEvent │ ← log auditável local pra debugar dedup
│   (banco)    │
└──────────────┘
```

## Eventos disparados

| Evento | Onde dispara | Trigger | Params | EventID prefix |
|---|---|---|---|---|
| **PageView** | `src/components/tracking/FacebookPixel.tsx:30` | Inline script no `<head>` | — | (auto fbq) |
| **PageView** (mirror) | `src/components/tracking/TrackPageView.tsx:32` | useEffect a cada pathname change | page, referrer, utm_* | (server log) |
| **ViewContent** | `src/lib/tracking.ts:122` → `pixelTrack` | `trackViewContent()` em LPs | content_name, content_category, content_ids, content_type, value, currency | `viewcontent_<uuid>` |
| **InitiateCheckout** | `src/lib/tracking.ts:134` | `trackInitiateCheckout()` no CTA click | content_name, value=67, currency=BRL, num_items=1 | `initiatecheckout_<uuid>` |
| **AddToCart** | `src/lib/tracking.ts:147` | `trackAddToCart()` no CTA click (junto com IC) | content_name, value, currency | `addtocart_<uuid>` |
| **Purchase** (client) | `src/lib/tracking.ts:161` | `trackPurchase()` em `/obrigado` `useEffect` | content_name=Plano, value=67/147/297, currency, num_items | `purchase_<txnId>` |
| **Purchase** (server CAPI) | `src/lib/meta-capi.ts:142` → `sendPurchaseEvent` | Webhook Hotmart `PURCHASE_APPROVED`/`PURCHASE_COMPLETE` | email hash, phone hash, IP, UA, value, currency, content_name, order_id | `purchase_<txnId>` (mesmo do client → **dedup**) |

## Callers de cada helper

### `trackViewContent`
- `src/app/c/[slug]/page.tsx:95` — variant landing
- `src/app/emagreca-sem-dieta/page.tsx:266` — LP principal
- `src/app/emagreca-sem-dieta-v2/page.tsx:259` — LP v2
- `src/app/c/instagram/InstagramLP.tsx:418` — `w.fbq("track", "ViewContent", ...)` direto (legacy)

### `trackInitiateCheckout` + `trackAddToCart`
Disparados juntos via `fireCheckoutAndGo()` (`src/lib/tracking.ts:180`) que aguarda 150ms antes do redirect.

- `src/app/emagreca-sem-dieta/page.tsx:46-47` — nav, hero, final CTAs (LP principal)
- `src/app/emagreca-sem-dieta-v2/page.tsx:39-40` — LP v2
- `src/app/c/[slug]/page.tsx:101` — variant LP
- `src/components/landing/plan-cta-button.tsx:34` — botões na seção pricing (3 planos)

### `trackPurchase`
- `src/app/obrigado/page.tsx:30` — useEffect onMount, usa `?transaction=` da URL como eventID

### `sendPurchaseEvent` (server CAPI)
- `src/app/api/webhooks/hotmart/route.ts:107` — disparado em `PURCHASE_APPROVED`/`PURCHASE_COMPLETE`

## Deduplicação Pixel ↔ CAPI

O Meta deduplica eventos client-side e server-side via `eventID`. Convenção do projeto:

- Para Purchase: `purchase_<transactionId>` (transactionId vem do Hotmart)
- Para outros eventos client-side: `<eventname>_<crypto.randomUUID()>`

Ambos os lados usam o mesmo `eventID`:
- Pixel: `fbq("track", "Purchase", {...}, { eventID: "purchase_HP1292733571" })`
- CAPI: `event_id: "purchase_HP1292733571"` no payload

→ Meta recebe os dois, deduplica, conta como 1 conversão.

## Otimizações aplicadas (STORY-FUNIL-001)

| AC | Mudança | Impacto esperado |
|---|---|---|
| AC-04 | Pixel script movido do `<body>` pro `<head>` (já estava — commit 2a2b1e0) | PageView dispara antes do body renderizar → reduz perda em mobile lento |
| AC-04 | `<link rel="preconnect" href="https://connect.facebook.net">` adicionado no `<head>` | Handshake TLS antecipado, economia ~150-300ms em 3G/4G fraco |
| AC-04 | `dns-prefetch` como fallback pra browsers antigos | Reduz lookup DNS em ~20-50ms |
| AC-05 | `appendUTMs()` agora injeta `sck=` (Hotmart Source Code) no link de checkout | Hotmart passa a mostrar "Origem: utm_source\|medium\|campaign" em vez de "Não identificada" |
| AC-02 | CAPI log persistido em `MetaCapiEvent` (banco) | Auditoria local pra "por que esse Purchase não apareceu no Events Manager?" |

## Como testar Purchase via Pixel Helper

1. Instalar [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) no Chrome
2. Comprar um plano via Hotmart sandbox (ou Doug fazer compra real pra teste e estornar)
3. Após redirect pra `/obrigado?plan=basico&transaction=HP123`:
   - Pixel Helper deve mostrar `Purchase` com value=67, currency=BRL, eventID=`purchase_HP123`
4. Abrir Events Manager → Events → buscar pelo eventID:
   - Deve mostrar **1 evento** (não 2) → dedup funcionou
   - Detalhes mostram fonte "Server + Browser"

## Como verificar no Events Manager

1. `business.facebook.com/events_manager2/list/pixel/953736244279938`
2. Tab **Test Events**: usar `META_TEST_EVENT_CODE` no `.env` pra ver eventos em real-time sem afetar otimização
3. Tab **Overview**: contagem agregada por evento nos últimos 7 dias
4. Tab **Diagnostics**: erros de match quality, parâmetros faltando, eventos duplicados

## Match quality alvo

Meta Pixel + CAPI deveria atingir **8-10/10** com os campos atuais:

- ✅ Email hash (SHA256 lowercase trim)
- ✅ Phone hash (SHA256, dígitos apenas)
- ✅ First/Last name hash
- ✅ Client IP (header `x-forwarded-for`)
- ✅ Client UA (header `user-agent`)
- ✅ fbp / fbc (cookies do Pixel)

Se o match score estiver baixo, conferir:
- Cookies `_fbp` / `_fbc` chegando no webhook (Hotmart redireciona, pode perder cookie)
- Email do buyer chegando do payload Hotmart
