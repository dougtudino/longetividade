# STORY-CREATIVE-001 — Criativos para Meta Ads (atualizado)

**Epic:** Campanhas & Tráfego
**Substitui:** STORY-06 (sprint-campanhas) — pricing desatualizado
**Agente responsável:** @dev (briefing @ux-design-expert Uma)
**Prioridade:** P0 (bloqueia execução de campanhas reais)
**Status:** [x] Done (2026-04-11)
**Data criação:** 2026-04-11

---

## Contexto

Sem criativos, toda a infraestrutura de tracking + pixel + dashboard + Maya é inútil — não há ads para rodar. STORY-06 original (sprint 2026-03-30) assumia produto único a R$27. O produto evoluiu para 3 planos (Basico R$37 / Completo R$67 / VIP R$97), então a copy precisa refletir uma escada de valor, não desconto.

A persona-alvo (Uma): mulher 30-50 anos, frustrada com dietas restritivas, já tentou métodos. Quer acolhimento antes de venda.

## Acceptance Criteria

- [x] **AC-01:** 6 componentes React em `src/components/creatives/` renderizando os criativos com dimensões pixel-perfect:
  - `creative-feed-dor.tsx` (1080x1080)
  - `creative-feed-prova.tsx` (1080x1080)
  - `creative-feed-objecao.tsx` (1080x1080)
  - `creative-story-stat.tsx` (1080x1920)
  - `creative-story-cta.tsx` (1080x1920)
  - `creative-banner-display.tsx` (1200x628)
- [x] **AC-02:** Cada criativo usa a paleta do site (verde `#7A9E7E`, `#3D5A3E`, `#9EBF9E`, bege `#FAF8F5`) e tipografia Nunito (já no projeto).
- [x] **AC-03:** Headlines seguem briefing Uma:
  - Dor: "Você não engorda porque come muito."
  - Prova: "+1.000 mulheres descobriram o Método S.E.M"
  - Objeção: "Não é dieta. É reeducação. Sem fome."
  - Stat: "30 dias. -4kg. Sem academia."
  - CTA: "Comece hoje por R$ 37"
  - Banner: "Emagreça Sem Dieta — Método S.E.M"
- [x] **AC-04:** Página `/admin/criativos` exibe grid de preview de todos os 6 criativos com:
  - Renderização real (não mockup)
  - Dimensões mostradas como label
  - Botão **Baixar PNG** por criativo
- [x] **AC-05:** Download PNG funciona via `html-to-image` (já que client-side é o caminho mais simples sem adicionar Puppeteer).
- [x] **AC-06:** Item "Criativos" no `AdminSidebar`.

## Technical Notes

- **Framework de imagem client-side:** `html-to-image` (~30kb gzipped). Alternativa: `dom-to-image-more`. Escolhido `html-to-image` porque tem melhor suporte SVG + Tailwind.
- Componentes devem usar **inline styles ou Tailwind**, não CSS modules — html-to-image precisa estilo computado.
- Fontes precisam estar carregadas no momento da renderização — usar `font-display: swap` no Nunito (já no layout).
- Para máxima fidelidade, fundo dos criativos com cor sólida ou gradient simples, sem imagens externas (evita CORS).

## File List (a preencher)

- [x] `src/components/creatives/creative-feed-dor.tsx`
- [x] `src/components/creatives/creative-feed-prova.tsx`
- [x] `src/components/creatives/creative-feed-objecao.tsx`
- [x] `src/components/creatives/creative-story-stat.tsx`
- [x] `src/components/creatives/creative-story-cta.tsx`
- [x] `src/components/creatives/creative-banner-display.tsx`
- [x] `src/app/admin/criativos/page.tsx`
- [x] `src/components/admin/AdminSidebar.tsx` (item Criativos adicionado)
- [x] `src/components/creatives/brand.ts` (tokens compartilhados)
- [x] `package.json` (dep `html-to-image` instalada)

## Definition of Done

- [ ] Todos os ACs marcados
- [ ] `npx tsc --noEmit` limpo
- [ ] Bárbara conseguiu baixar PNG dos 6 criativos sem erro
- [ ] Identidade visual aprovada por Doug (review manual)
- [ ] Pronto para subir no Meta Ads Manager
