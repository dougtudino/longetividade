# CTA Tracking — Fonte da verdade interna

**Entregue:** STORY-FUNIL-003 (2026-05-15)

## Por quê

Antes desta sprint, o único registro de cliques no botão de compra estava no Hotmart, que mostrou "Origem: Não identificada" em 100% das vendas. O Pixel Meta ajuda mas é bloqueado em ~30% dos browsers mobile (adblock, ATT, in-app).

Solução: rastrear cliques no nosso próprio banco, antes do redirect pro Hotmart.

## Como funciona

```
Usuário clica botão (Hero, Pricing, Sticky, Final CTA, Nav, …)
   │
   ▼
trackCtaClick({ ctaId, planId, destinationUrl })  [src/lib/cta-tracking.ts]
   │
   ▼ navigator.sendBeacon (sobrevive a target=_blank/fechamento)
   │
   ▼
POST /api/track/cta-click  [src/app/api/track/cta-click/route.ts]
   │
   ▼
prisma.ctaClick.create({ ...payload, ipHash: SHA256(ip), utm* })
```

`sendBeacon` é crítico: cliques normais com `fetch` somem quando a aba abre nova janela e fecha a original.

## Schema do banco

```prisma
model CtaClick {
  id             String   @id @default(uuid())
  timestamp      DateTime @default(now())
  ctaId          String   // ver tabela abaixo
  planId         String?  // "basico" | "completo" | "vip"
  destinationUrl String
  userAgent      String?
  referrer       String?
  pathname       String?
  utmSource      String?
  utmCampaign    String?
  utmMedium      String?
  utmContent     String?
  utmTerm        String?
  ipHash         String?  // SHA256 do IP (32 chars, não-PII)
}
```

## ctaIds usados na LP principal

| ctaId | Local | Comportamento |
|---|---|---|
| `nav-primary` | Botão "Comprar Agora" na nav fixa | abre Hotmart básico |
| `hero-primary` | CTA do hero | abre Hotmart básico |
| `final-primary` | CTA final ("SIM, EU QUERO O MÉTODO S.E.M") | abre Hotmart básico |
| `emotional-primary`, `pillars-primary`, `bonus-primary` | InlineCTA entre seções | scroll-to #pricing |
| `pricing-basico` | Botão card básico R$ 67 | abre Hotmart básico |
| `pricing-completo` | Botão card completo R$ 147 | abre Hotmart completo |
| `pricing-vip` | Botão card VIP R$ 297 | abre Hotmart VIP |

## Como interpretar dados

Painel: `/admin/funil`

### Métricas-chave

- **Total cliques 7d:** soma de CtaClick últimos 7 dias
- **Cliques por ctaId:** mostra qual posição converte. Hero alto + Pricing baixo = pricing copy fraca. Pricing alto + Hero baixo = LP não engaja.
- **Cliques por planId:** distribuição de interesse Básico/Completo/VIP. Se VIP for muito baixo, badge "Primeiras 100 Vagas" não está vendendo.
- **Cliques por utmCampaign:** qual anúncio Meta traz quem clica de fato. Cruzar com Meta Ads Manager pra calcular CTR real.
- **Taxa LPV→Click:** PageView vs CtaClick na mesma janela. Esperado: 8-20% (se < 5%, copy fraca; se > 25%, copy boa).

### Comparativo com Hotmart

Hotmart só sabe quem CLICOU se chegou na página de checkout. Se a LP redireciona via JS após CtaClick, alguns cliques podem ser perdidos no Hotmart por:
- Adblock
- Ext que bloqueia abertura de nova aba
- Pop-up blocker
- Conexão lenta cortando antes do redirect

→ **CtaClick > Hotmart hits = saudável.** Se for inverso, algo está duplicando.

## Privacy

- IP nunca é gravado em texto plano. Só o SHA256 (primeiros 32 chars).
- UA é truncado pra 500 chars.
- Nenhum dado de usuário identificável (email, nome) é gravado nessa tabela.
- LGPD: cliques são dado de comportamento agregado, base legal "interesse legítimo" — não precisa de consentimento explícito.
