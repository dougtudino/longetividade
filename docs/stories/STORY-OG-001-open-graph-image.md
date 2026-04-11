# STORY-OG-001 — Open Graph Image dinâmico

**Epic:** SEO & Compartilhamento
**Substitui:** STORY-02 parcial (sprint-campanhas) — falta OG image estática
**Agente responsável:** @dev
**Prioridade:** P1
**Status:** [x] Done (2026-04-11)
**Data criação:** 2026-04-11

## Contexto

STORY-02 original pedia OG image estática 1200x630 em `/public/og/`. Em vez
disso, o projeto já tinha `opengraph-image.tsx` em `/emagreca-sem-dieta/` usando
`next/og` (ImageResponse) — gerado dinamicamente no edge runtime, melhor que
asset estático. Faltava: corrigir copy enganosa de "desconto R$97→R$37" e criar
OG para a homepage `/`.

## Acceptance Criteria

- [x] **AC-01:** OG image da página de vendas (`/emagreca-sem-dieta`) corrigida:
  - Removido riscado R$97 (sugeria desconto inexistente)
  - Substituído por "a partir de R$37" (factual)
  - Alt text também corrigido (sem o "De R$97 por R$37")
- [x] **AC-02:** OG image da homepage (`/`) criada via `src/app/opengraph-image.tsx`
  - Tagline "Viva mais. Viva melhor."
  - Subline mencionando emagrecimento + sono + jejum
  - Domínio visível
  - Identidade visual consistente (paleta verde-oliva + bege)
- [x] **AC-03:** Next.js detecta automaticamente os arquivos
  `opengraph-image.tsx` (convenção do App Router) — não precisa configurar
  metadata manualmente.

## Technical Notes

- `next/og` ImageResponse roda no edge runtime — geração rápida e sem custo de storage
- Cada rota com `opengraph-image.tsx` na pasta gera sua própria OG image
- Twitter card também é coberto automaticamente pelo Next 14+

## File List

- [x] `src/app/emagreca-sem-dieta/opengraph-image.tsx` — copy corrigida
- [x] `src/app/opengraph-image.tsx` — homepage OG criada

## Validação manual (pós-deploy)

1. Abra https://developers.facebook.com/tools/debug/
2. Cole `https://www.longetividade.com.br/` → veja a nova OG da home
3. Cole `https://www.longetividade.com.br/emagreca-sem-dieta` → veja a OG da venda
4. Se mostrar versão antiga (cache do FB), clica "Scrape Again"
5. Mesmo procedimento em https://www.opengraph.xyz/ ou cards.dev

## Definition of Done

- [x] Todos os ACs marcados
- [x] `npx tsc --noEmit` limpo
- [ ] Validado em Facebook Sharing Debugger pós-deploy
- [ ] Validado compartilhamento WhatsApp (preview correto)
