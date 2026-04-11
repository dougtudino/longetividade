# STORY-TRACK-001 — Verificar Pixel e eventos

**Epic:** Tracking & Observabilidade
**Agente responsável:** @dev + @qa
**Prioridade:** P0 (bloqueia medição de ROAS)
**Status:** [~] Code part done (2026-04-11) — falta execucao QA manual da Barbara
**Data criação:** 2026-04-10

---

## Contexto

O Meta Pixel já está instalado (`src/components/tracking/FacebookPixel.tsx` lê
`NEXT_PUBLIC_META_PIXEL_ID`). Eventos `InitiateCheckout` e `Purchase` estão
sendo disparados no código (via `PlanCTAButton` e `/obrigado`). Mas nunca foi
feita uma verificação end-to-end com Meta Pixel Helper para confirmar que
todos os eventos chegam corretamente no Meta Events Manager com os valores
corretos por plano. Sem essa verificação, o ROAS exibido no dashboard da
STORY-ADS-001 será inútil.

---

## Acceptance Criteria

- [ ] **AC-01:** Meta Pixel dispara `PageView` em todas as páginas públicas:
  - `/` (homepage)
  - `/emagreca-sem-dieta`
  - `/c/[slug]` (todas as variantes de campanha)
  - `/obrigado`
  Verificar com Meta Pixel Helper → 0 erros, 0 warnings.
- [ ] **AC-02:** `InitiateCheckout` dispara ao clicar em qualquer CTA de
  compra da `PricingSection` (os 3 planos: Básico, Completo, VIP).
  Evento deve conter:
  - `content_name` = nome do plano
  - `content_category` = "ebook" ou "vip"
  - `value` = preço do plano em BRL
  - `currency` = "BRL"
- [ ] **AC-03:** `Purchase` dispara em `/obrigado` com valor correto
  lido de `?plan=` na URL. Validar os 3 casos (valores canonical em `src/config/plans.ts`):
  - `/obrigado?plan=basico` → value 37
  - `/obrigado?plan=completo` → value 67
  - `/obrigado?plan=vip` → value 97
- [ ] **AC-04:** Abrir cada página com Meta Pixel Helper instalado
  no Chrome e registrar: **0 erros, 0 avisos**. Documentar prints em
  `docs/qa/pixel-verification-2026-04-10.md`.

---

## Technical Notes

- Usar `NEXT_PUBLIC_META_PIXEL_ID` válido no Railway antes de testar
- Em dev local, o pixel retorna `null` se var não estiver setada
  → criar `.env.local` com pixel de teste
- Se valor do plano estiver divergente entre `PlanCTAButton` e `/obrigado`,
  corrigir centralizando em `src/config/plans.ts`

## Dependencies

- `NEXT_PUBLIC_META_PIXEL_ID` configurado em produção
- Meta Pixel Helper instalado no navegador do QA

## File List (esperado)

- [ ] `docs/qa/pixel-verification-2026-04-10.md` (novo — relatório QA)
- [ ] Possíveis ajustes em `src/config/plans.ts` se valores divergirem
- [ ] Possíveis ajustes em `src/app/obrigado/page.tsx`

## Definition of Done

- [ ] Todos os ACs marcados como `[x]`
- [ ] Relatório de verificação commitado em `docs/qa/`
- [ ] 0 erros no Meta Pixel Helper para todas as rotas testadas
- [ ] Events Manager do Meta mostra os 3 tipos de evento com volume > 0
