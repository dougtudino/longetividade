# LP Performance Audit — 2026-05-15

**Base URL:** https://www.longetividade.com.br
**User-Agent:** Mobile (Android Chrome simulado)

## Resumo

| URL | Status | TTFB | Total | HTML | JS chunks | Imgs (lazy/no-dim) | Preconnect FB | Pixel inline head |
|---|---|---|---|---|---|---|---|---|
| `/` | 200 | 882ms | 1115ms | 115.5 KB | 12 | 8 (6 lazy / 0 sem dim) | ❌ | ✅ |
| `/emagreca-sem-dieta` | 200 | 242ms | 334ms | 109.9 KB | 13 | 7 (5 lazy / 1 sem dim) | ❌ | ✅ |

## Detalhes por URL

### `https://www.longetividade.com.br/`

- **Status:** 200
- **TTFB:** 882 ms ⚠️ alto (>800ms)
- **Total response:** 1115 ms
- **HTML size:** 115.5 KB ⚠️ pesado (>100KB)
- **JS chunks:** 12 (estimativa de bytes nos atributos src: 754b)
- **Imagens:** 8 total / 6 com `loading=lazy` / 2 sem lazy / 0 sem width+height
- **Tracking head:** preconnect facebook.net ❌ | fbq inline ✅

### `https://www.longetividade.com.br/emagreca-sem-dieta`

- **Status:** 200
- **TTFB:** 242 ms ✅
- **Total response:** 334 ms
- **HTML size:** 109.9 KB ⚠️ pesado (>100KB)
- **JS chunks:** 13 (estimativa de bytes nos atributos src: 815b)
- **Imagens:** 7 total / 5 com `loading=lazy` / 2 sem lazy / 1 sem width+height
- **Tracking head:** preconnect facebook.net ❌ | fbq inline ✅

## Próximas otimizações sugeridas

- Se TTFB > 800ms: investigar SSR cold start no Railway (warm a função com cron a cada 5min)
- Se HTML > 100KB: considerar splitting do `<head>` (mover OG tags/JSON-LD pra footer)
- Se imagens sem dim > 5: garantir `width` + `height` em todo `<img>` (next/image faz automático)
- Verificar LCP via PageSpeed Insights: <https://pagespeed.web.dev/?url=https%3A%2F%2Fwww.longetividade.com.br%2Femagreca-sem-dieta>
