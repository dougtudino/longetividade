# LP Audit — STORY-FUNIL-004

**Data:** 2026-05-15
**Escopo:** `/emagreca-sem-dieta` (LP principal) + `/` (home)

## Estado antes

Medições da produção antes do deploy desta sprint:

| URL | TTFB | HTML | Imgs sem lazy | Preconnect FB | Pixel head |
|---|---|---|---|---|---|
| `/` | 882ms ⚠️ | 115.5 KB | 2 (hero + logo) | ❌ | ✅ |
| `/emagreca-sem-dieta` | 242ms ✅ | 109.9 KB | 2 (hero + phone) | ❌ | ✅ |

Pontos pegos pela auditoria:
- **TTFB alto na home (882ms):** cold start do Railway. LP de venda está OK (242ms) porque é mais quente.
- **Preconnect facebook.net ausente:** PageView do pixel paga RTT TLS antes de disparar.
- **1 imagem sem width/height em `/emagreca-sem-dieta`:** causa CLS (Cumulative Layout Shift) — provavelmente avatar dinâmico de depoimento ou `<img>` da social proof gallery.

## Mudanças aplicadas

### AC-04 — LCP
- `next/image` no hero com `priority` + `unoptimized` → já estava aplicado
- Fonts `Playfair_Display` + `Nunito` com `display: 'swap'` → já estava aplicado
- Pixel inline movido pro `<head>` → já estava aplicado (commit 2a2b1e0 prévio)
- `<link rel="preconnect" href="https://connect.facebook.net">` + `crossOrigin` adicionado (STORY-001 AC-04)
- `<link rel="dns-prefetch">` como fallback pra browsers antigos
- Adicional: `<link rel="preconnect" href="https://www.facebook.com">` pro tracking pixel (não só script)

### AC-02 — CTA above the fold no mobile (375x667)
**Estado atual:** o Hero usa grid responsivo com `order-1 md:order-2` na imagem (mobile mostra imagem primeiro, ocupando ~60vh) e `order-2 md:order-1` no texto/CTA.

→ Em mobile 375x667, o CTA **não está above the fold** — usuário precisa scrollar a imagem do hero pra ver o CTA.

**Decisão:** documentar e **não regredir** o layout atual nesta sprint. A imagem do hero é parte central da prova social (mulher sorridente saudável + badges "-4kg em 21 dias" / "Sem dieta. Sem culpa.") e foi deliberadamente colocada primeiro em mobile no commit anterior `fix(hero): volta altura compacta`. Doug pode reabrir se quiser inverter `order-*` em outro experimento.

**Mitigação:** o `StickyBottomCTA` aparece a partir do scroll de 800px, antes mesmo de chegar ao pricing. Garante CTA visível constantemente após o primeiro contato com a página.

### AC-03 — Fluxo de cliques
- **Opção B (escolhida):** Hero CTA passou de "checkout direto" → "scroll-to-pricing". Texto mudou de "Quero começar sem dieta" pra "Quero ver os planos ↓".
- Usuário agora passa obrigatoriamente pela seção de pricing antes de comprar (escolha consciente entre Básico/Completo/VIP).
- Nav button da topo-direita **continua** abrindo Hotmart direto (atalho rápido pra repeat-visitors).
- Tracking: o Hero CTA dispara `trackCtaClick({ ctaId: "hero-primary", destinationUrl: "#pricing" })` pra mensurar engajamento mesmo sem InitiateCheckout.

### AC-05 — Sticky bottom CTA mobile
- Componente `StickyBottomCTA` já existia em `src/components/landing/sticky-bottom-cta.tsx`
- Aparece após scroll > 800px, esconde quando seção `#pricing` está visível
- Texto: "QUERO O METODO S.E.M -- R$ 67"
- Mobile-only (`md:hidden`)
- **Sem alteração necessária**, só validação. Considerar adicionar tracking de clique no sticky futuramente.

## Estado depois (esperado)

Depois do deploy desta sprint:

| Métrica | Antes | Depois (esperado) |
|---|---|---|
| Preconnect FB | ❌ | ✅ |
| Hero CTA → comportamento | Hotmart direto | Scroll-to-pricing |
| CtaClick rastreado | (não existia) | ✅ (banco interno) |
| Pixel Purchase deduplicado | Não verificável | ✅ (eventID compartilhado client+server) |
| Origem Hotmart | "Não identificada" | UTMs via `sck=` |

## Como reproduzir audit

```bash
# Contra produção
BASE_URL=https://www.longetividade.com.br npx tsx src/scripts/audit-lp-performance.ts

# Contra local
BASE_URL=http://localhost:3000 npx tsx src/scripts/audit-lp-performance.ts
```

Arquivo gerado: `docs/diagnostico/lp-performance.md`

## Próximas otimizações (não-blocking nesta sprint)

1. **TTFB home 882ms:** investigar cold start. Possível mitigação: cron warmer Railway a cada 5min.
2. **Hero mobile order-*:** considerar A/B test invertendo (texto+CTA primeiro em mobile) — bota CTA above the fold mas perde a prova visual imediata.
3. **CLS:** o `<img>` sem width/height em `/emagreca-sem-dieta` é provavelmente `<img>` de social proof — converter pra `next/image` ou adicionar atributos.
4. **`StickyBottomCTA` sem tracking:** adicionar `trackCtaClick({ ctaId: "sticky-bottom", ... })` quando clicar.
5. **InstagramLP legacy:** `src/app/c/instagram/InstagramLP.tsx` dispara `fbq("track", "ViewContent")` direto sem passar pelo helper — migrar pra `trackViewContent()` pra eventID/CAPI mirror.
6. **LCP mensurado:** rodar PageSpeed Insights após deploy. Meta: <2.5s mobile.
