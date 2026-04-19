## Gotchas Conhecidos

Lições aprendidas em debugging real. Ler ANTES de atacar bugs de tracking
ou variáveis de ambiente.

### 1. Railway + Nixpacks + Next.js 16 Turbopack — NEXT_PUBLIC_* não embeda no bundle

**Data descoberta:** 19/04/2026
**Tempo perdido:** ~4h

**Sintoma:**
- Env var `NEXT_PUBLIC_X` configurada corretamente em Railway Variables
- `next.config.ts` com `env: { NEXT_PUBLIC_X: process.env.NEXT_PUBLIC_X }` explícito
- Build passa sem erro
- Em runtime no browser: `process.env.NEXT_PUBLIC_X` retorna `undefined`
- Console mostra warning de variável ausente apesar de estar no Railway

**Root cause:**
Combinação Railway Nixpacks + Next.js 16.2 + Turbopack tem quirk onde
variáveis `NEXT_PUBLIC_*` não são injetadas no bundle durante `npm run build`.
Valor existe no runtime do servidor mas não é hardcodado no JS do cliente.

**Solução pragmática (valores públicos):**
Usar fallback hardcoded. Valores como Pixel IDs, Analytics IDs e tokens
read-only públicos não são secretos (qualquer visitante do site vê no DevTools):

```typescript
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "953736244279938";
```

**Limitação:**
Não aplicável para valores que variam entre ambientes (dev/staging/prod).
Nesses casos, buscar via endpoint API server-side e passar para o client
via props, context ou SWR.

**Como diagnosticar:**
1. Abrir o site em produção
2. F12 → Console
3. Se houver warning tipo `[ComponentName] NEXT_PUBLIC_X ausente` → confirma o bug
4. Rodar `curl -s https://seu-dominio.com/pagina | grep "valor-esperado"` —
   se não retornar, env var não foi embedada

### 2. next/script + dangerouslySetInnerHTML não renderiza em SSR estático

**Data descoberta:** 19/04/2026
**Tempo perdido:** ~1h

**Sintoma:**
- Componente usa `<Script strategy="afterInteractive" dangerouslySetInnerHTML={{__html: "..."}} />` do next/script
- Código aparece no JS bundle mas NÃO no HTML servido pelo servidor
- Ferramentas externas (Pixel Helper, Tag Manager Validator) não detectam
  o script mesmo com ele supostamente carregado
- Console mostra que script "executou", mas HTML inicial não contém o trecho

**Root cause:**
Next.js 16.2 + Turbopack + App Router tem bug onde `next/script` com
`dangerouslySetInnerHTML` só é injetado via JavaScript após hidratação.
Ferramentas que inspecionam o HTML inicial (como Meta Pixel Helper) não
veem o código.

**Solução:**
Usar tag `<script>` nativa do React em vez de `<Script>` do next/script:

```tsx
// ❌ Não funciona em SSR estático
import Script from "next/script";
<Script strategy="afterInteractive" dangerouslySetInnerHTML={{__html: code}} />

// ✅ Funciona
<script dangerouslySetInnerHTML={{__html: code}} />
```

O componente precisa ter `"use client"` para que o React renderize no DOM.

**Como diagnosticar:**
1. Fazer `npm run build` local
2. Checar o arquivo HTML estático gerado:
```powershell
   Get-ChildItem -Path .next -Recurse -Filter *.html | Select-String "trecho-do-codigo"
```
3. Se não retornar matches → script não está no SSR

---

## Validação de Funnel End-to-End

Data última validação: 19/04/2026

### Funnel: Landing → Pagamento → Entrega → Rastreio

1. **Landing `/emagreca-sem-dieta`**
   - PageView dispara via Pixel (client-side)
   - ViewContent dispara via Pixel

2. **Click em "Comprar Agora"**
   - InitiateCheckout dispara via Pixel
   - Redirect para Hotmart

3. **Pagamento aprovado no Hotmart**
   - Hotmart envia webhook para `/api/webhooks/hotmart`
   - Handler valida `x-hotmart-hottok` com `HOTMART_WEBHOOK_SECRET`
   - Cria Order no Prisma (tabela `order`)
   - Gera download token assinado

4. **Entrega automática**
   - Email via Brevo com link de download do ebook
   - Se plano VIP, reserva vaga no app (`claimVipSlot`)
   - Purchase event dispara via CAPI para Meta

5. **Rastreio no Events Manager Meta**
   - Purchase aparece em até 30 min
   - Atribuição correta baseada em fbc/fbp cookies

### Comandos de verificação

```bash
# Ver se pixel está no HTML de produção
curl -s https://www.longetividade.com.br/emagreca-sem-dieta | grep -c "fbevents"
# Esperado: 1 ou mais

# Ver se Pixel ID está correto
curl -s https://www.longetividade.com.br/emagreca-sem-dieta | grep -c "953736244279938"
# Esperado: 2 ou mais (noscript + fbq init)
```

### Health check endpoint

`GET /api/admin/health` (protegido por ADMIN_TOKEN_COOKIE) retorna:
- `tracking_health.pixel_present` — env var presente
- `tracking_health.pixel_matches_expected` — valor esperado vs atual
- `tracking_health.warning` — mensagem se divergência

---

## Eventos Ativos no Pixel Meta

Pixel ID: 953736244279938 (Dados de Longetividade)
Business Manager: CA01-BM Barbara Oliveira (1892655711045175)
Conta Ads: act_837047967961012

### Rastreados via Navegador (Pixel client-side)
- PageView — toda navegação
- ViewContent — scroll/engajamento na landing
- InitiateCheckout — click no botão de compra
- Purchase — confirmação de pagamento

### Rastreados via CAPI (servidor)
- Lead — captura de email no newsletter popup
- Purchase — webhook Hotmart (duplica o cliente para melhor qualidade)

### Melhorias pendentes
- Qualidade do match do Lead via CAPI: 3.2/10 (baixa)
- Falta enviar: fbp, fbc, email hash, client_ip_address, client_user_agent
- Investigar se `sendPurchaseEvent` no webhook handler está sendo invocado
  corretamente (Purchase atual só vem do Navegador)

---

## Credenciais Expostas — PENDENTE ROTAÇÃO

**Data exposição:** 19/04/2026 (chat debug)
**Status:** usuário decidiu não rotacionar imediatamente

### Lista (rotacionar quando possível)

Prioridade ALTA (movem dinheiro):
- ANTHROPIC_API_KEY
- META_ACCESS_TOKEN
- FACEBOOK_PAGE_ACCESS_TOKEN
- ADMIN_PASSWORD
- HOTMART_WEBHOOK_SECRET

Prioridade MÉDIA:
- BREVO_API_KEY
- BLOTATO_API_KEY
- APIFY_API_TOKEN
- GEMINI_API_KEY
- CRON_SECRET
- EBOOK_DOWNLOAD_SECRET

### Fluxo de rotação
1. Gerar nova chave no provider
2. Atualizar no Railway Variables
3. Atualizar no .env.local
4. Revogar chave antiga
5. Testar que sistema continua funcional
