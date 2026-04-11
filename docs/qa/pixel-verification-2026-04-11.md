# QA — Verificacao Meta Pixel end-to-end

**Data:** 2026-04-11
**Story:** STORY-TRACK-001
**Pixel ID:** `953736244279938` (Dados de Longetividade)
**QA:** _(preencher: Barbara / Doug)_

---

## Pre-requisitos

- [ ] Meta Pixel Helper instalado no Chrome — https://chromewebstore.google.com/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
- [ ] Logado na BM da Barbara para visualizar o Events Manager
- [ ] `NEXT_PUBLIC_META_PIXEL_ID=953736244279938` em producao (Railway)

---

## AC-01 — PageView em todas as rotas publicas

Para cada rota: abrir no Chrome, clicar no icone do Pixel Helper, validar
que aparece **1 evento PageView** com **0 erros** e **0 warnings**.

| Rota | PageView | Erros | Warnings | OK? |
|---|---|---|---|---|
| `/` | [ ] | [ ] 0 | [ ] 0 | [ ] |
| `/emagreca-sem-dieta` | [ ] | [ ] 0 | [ ] 0 | [ ] |
| `/c/instagram` | [ ] | [ ] 0 | [ ] 0 | [ ] |
| `/c/facebook` | [ ] | [ ] 0 | [ ] 0 | [ ] |
| `/c/whatsapp` | [ ] | [ ] 0 | [ ] 0 | [ ] |
| `/obrigado` | [ ] | [ ] 0 | [ ] 0 | [ ] |
| `/sono-profundo` | [ ] | [ ] 0 | [ ] 0 | [ ] |

---

## AC-02 — InitiateCheckout em cada CTA de plano

Em `/emagreca-sem-dieta`, rolar ate a `PricingSection` e clicar no CTA
de cada plano. O Pixel Helper deve mostrar **InitiateCheckout** com os
campos abaixo. **Nao concluir a compra** — fechar a aba do Hotmart depois
do disparo.

| Plano | InitiateCheckout disparou? | content_name | value | currency | OK? |
|---|---|---|---|---|---|
| Basico | [ ] | Basico | 37 | BRL | [ ] |
| Completo | [ ] | Completo | 67 | BRL | [ ] |
| VIP | [ ] | VIP | 97 | BRL | [ ] |

---

## AC-03 — Purchase em /obrigado por plano

Abrir as 3 URLs abaixo e validar que o Pixel Helper mostra **Purchase**
com o valor correto. Valores canonical em `src/config/plans.ts`.

| URL | Purchase value esperado | value real | OK? |
|---|---|---|---|
| `/obrigado?plan=basico` | 37 | [ ] | [ ] |
| `/obrigado?plan=completo` | 67 | [ ] | [ ] |
| `/obrigado?plan=vip` | 97 | [ ] | [ ] |

> Nota: a story original (TRACK-001 v1) listava VIP=147. Foi corrigido para
> 97 em 2026-04-11 — fonte unica em `src/config/plans.ts`.

---

## AC-04 — Validacao no Events Manager

Abrir https://business.facebook.com/events_manager2 → selecionar dataset
**Dados de Longetividade** (953736244279938) → aba **Visao geral**.

- [ ] PageView aparece com volume > 0 nas ultimas 24h
- [ ] InitiateCheckout aparece com volume > 0
- [ ] Purchase aparece com volume > 0
- [ ] Aba **Diagnostico**: 0 erros criticos
- [ ] Aba **Eventos de teste**: cole o ID de teste do navegador e confirme
      que cada evento chega em < 5s

---

## Erros encontrados

_(preencher se houver)_

---

## Acoes corretivas

_(preencher se houver)_

---

## Conclusao

- [ ] Tudo OK — pixel pronto para producao e ROAS confiavel
- [ ] Bloqueios encontrados — abrir nova story de correcao
