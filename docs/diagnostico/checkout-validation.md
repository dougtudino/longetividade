# Checkout validation — Hotmart links

**Data:** 2026-05-15
**Status:** ✅ Os 3 links retornam HTTP 200

## Resultado da validação

| Plano | URL | HTTP | Status |
|---|---|---|---|
| Básico | `https://pay.hotmart.com/H105141835Q?off=zxq5tgew` | 200 | ✅ OK |
| Completo | `https://pay.hotmart.com/H105141835Q?off=uzvdkzkf` | 200 | ✅ OK |
| VIP | `https://pay.hotmart.com/H105141835Q?off=h84hak4e` | 200 | ✅ OK |

Comando usado:
```bash
curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0 ..." "<URL>"
```

## Como reproduzir

```bash
for url in \
  "https://pay.hotmart.com/H105141835Q?off=zxq5tgew" \
  "https://pay.hotmart.com/H105141835Q?off=uzvdkzkf" \
  "https://pay.hotmart.com/H105141835Q?off=h84hak4e"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0" "$url")
  echo "$status $url"
done
```

## Teste manual sugerido (modo anônimo no celular)

1. Abrir `/emagreca-sem-dieta` em modo anônimo
2. Clicar em cada botão e confirmar preço correto:
   - Hero/Final CTA → R$ 67 (básico)
   - Card "Mais Escolhido" → R$ 147 (completo)
   - Card "Primeiras 100 Vagas" → R$ 297 (VIP)
3. Após o sck= ser injetado (CAPI/UTM), abrir painel Hotmart Vendas e confirmar que "Origem" deixou de aparecer como "Não identificada"

## Próximos passos pendentes

- Doug aplicar order bumps via painel Hotmart (`docs/manual/hotmart-config.md`)
- Validar que `?transaction={id}` chega no `/obrigado` (necessário pro dedup do Purchase pixel ↔ CAPI)
