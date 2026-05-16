# Checklist manual Hotmart — Order Bump & Upsell

> ⚠️ Esta config **não pode** ser feita via API/código. Doug, faz no painel Hotmart seguindo passo a passo abaixo.
> Tempo estimado: ~30 minutos.

**Produto:** Emagreça Sem Dieta (Hotmart Product ID: `7474328`)
**Produto code:** `H105141835Q`

---

## Offer codes atuais

| Plano | Preço | Offer code | Link checkout |
|---|---|---|---|
| Básico | R$ 67 | `zxq5tgew` | https://pay.hotmart.com/H105141835Q?off=zxq5tgew |
| Completo | R$ 147 | `uzvdkzkf` | https://pay.hotmart.com/H105141835Q?off=uzvdkzkf |
| VIP | R$ 297 | `h84hak4e` | https://pay.hotmart.com/H105141835Q?off=h84hak4e |

---

## Passo 1 — Order bump no Básico (R$ 67)

1. Logar em https://app-vlc.hotmart.com → Produtos → Emagreça Sem Dieta
2. **Ofertas** → editar offer `zxq5tgew` (Básico)
3. Aba **Order Bump** → ativar
4. Adicionar oferta secundária:
   - **Título exibido:** "Adicione o Plano Transformação por apenas +R$ 80"
   - **Subtítulo:** "Cardápio premium, planner, audiobook e mais"
   - **Preço adicional:** R$ 80,00
   - **Cobrança total no checkout:** R$ 147,00 (será exibido pro comprador como "R$ 67 + R$ 80 = R$ 147")
5. Salvar. Testar comprando em modo anônimo no celular: deve aparecer checkbox abaixo dos dados de pagamento.

---

## Passo 2 — Upsell 1-click pós-compra Básico

1. Em **Ofertas** → editar `zxq5tgew` → aba **Upsell / Cross-sell**
2. Adicionar upsell:
   - **Tipo:** Upsell 1-click (compra com mesmo cartão, sem pedir dados de novo)
   - **Oferta de destino:** `h84hak4e` (VIP)
   - **Preço promocional:** R$ 297,00 (sem ancoragem falsa de "de R$ X por R$ Y" — usar preço cheio)
   - **Headline:** "Garanta o plano VIP com R$ 297 — sem cobrança adicional de frete ou taxa"
   - **CTA:** "SIM, quero o VIP"
3. **Página de redirect pós-upsell:** `https://www.longetividade.com.br/obrigado?plan=vip&transaction={transaction_id}`

---

## Passo 3 — Order bump no Completo (R$ 147)

1. **Ofertas** → editar `uzvdkzkf` (Completo)
2. Aba **Order Bump** → ativar
3. Adicionar oferta secundária:
   - **Título:** "Upgrade pra VIP +R$ 150 — App vitalício + grupo VIP"
   - **Subtítulo:** "App de acompanhamento + WhatsApp direto com a Bárbara"
   - **Preço adicional:** R$ 150,00
   - **Cobrança total:** R$ 297,00

---

## Passo 4 — Página de obrigado

1. Em cada uma das 3 ofertas (`zxq5tgew`, `uzvdkzkf`, `h84hak4e`):
2. Aba **Configurações** → **Página de obrigado**
3. URL: `https://www.longetividade.com.br/obrigado?plan=<PLANO>&transaction={transaction_id}`
   - Para `zxq5tgew` (básico): `?plan=basico`
   - Para `uzvdkzkf` (completo): `?plan=completo`
   - Para `h84hak4e` (vip): `?plan=vip`
4. **Importante:** `{transaction_id}` é variável da Hotmart — ela vai substituir pelo ID real (HP...). Esse ID vira o `eventID` do Purchase pixel pra deduplicar com o CAPI server-side.

---

## Passo 5 — Validar webhook está ativo

1. **Configurações** → **Notificações** → **Webhook**
2. URL deve apontar pra: `https://www.longetividade.com.br/api/webhooks/hotmart`
3. Eventos ativos:
   - ✅ Compra aprovada (`PURCHASE_APPROVED`)
   - ✅ Compra completa (`PURCHASE_COMPLETE`)
   - ✅ Reembolso (`PURCHASE_REFUNDED`)
   - ✅ Chargeback (`PURCHASE_CHARGEBACK`)
4. **Hottok (assinatura):** confirmar que bate com `HOTMART_WEBHOOK_SECRET` no Railway. Se trocar no Hotmart, trocar no Railway também.

---

## Passo 6 — (Opcional) Garantia estendida no VIP

A LP atual mostra **7 dias de garantia incondicional** em todos os planos. Spec da STORY-002 mencionou 30 dias.

Se quiser mudar:
1. Hotmart → Produto → **Política de garantia**
2. Mudar pra "30 dias" (refund window real cobrado pelo Hotmart)
3. Avisar o agente Funil pra atualizar copy da LP: `src/components/landing/pricing-section.tsx` linha 134-140 + `src/app/emagreca-sem-dieta/page.tsx` linha 1017 + secção GARANTIA

> Decisão atual: **manter 7 dias** (escolhido por Doug em 2026-05-15). Reabrir quando produto/marketing decidirem mudar política.

---

## Verificação final

Depois de aplicar tudo acima, testar manualmente em modo anônimo no celular:

- [ ] Clicar no botão "MAIS ESCOLHIDO" da LP (Plano Completo)
- [ ] Confirmar que abre checkout do Hotmart com preço R$ 147
- [ ] Confirmar que aparece order bump "Upgrade pra VIP +R$ 150"
- [ ] Fechar sem comprar
- [ ] Repetir com botão do Básico → deve ver "Upgrade pra Completo +R$ 80"
- [ ] Repetir com botão do VIP → confirmar que abre direto a R$ 297

---

## Como o tracking se conecta

```
Cliente clica botão "Plano Completo" na LP
   │
   ▼
PlanCTAButton.handleClick()
   │ ├── navigator.sendBeacon('/api/track/cta-click', {...}) → tabela CtaClick (banco)
   │ ├── fbq('track', 'InitiateCheckout', {value: 147})    → Pixel client-side
   │ ├── POST /api/meta-capi {InitiateCheckout}            → CAPI server-side
   │ └── window.open(hotmart_url_com_utm_e_sck)
   ▼
Hotmart checkout (com sck=utm_source|medium|campaign)
   │
   │ Compra aprovada
   ▼
Hotmart envia webhook → /api/webhooks/hotmart
   ├── Cria Order no banco
   ├── Envia email de entrega
   └── sendPurchaseEvent() → CAPI Purchase server-side
       └── Loga em MetaCapiEvent (banco)
   │
   ▼
Hotmart redireciona usuário → /obrigado?plan=completo&transaction=HP...
   └── trackPurchase() client-side com eventID=purchase_HP... (mesmo ID do server)
       → Meta deduplica: 1 conversão registrada
```
