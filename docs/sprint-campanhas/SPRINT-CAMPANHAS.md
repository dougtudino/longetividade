# Sprint: Campanhas e Criativos
**Início:** 2026-03-30
**Produto-foco:** Emagreça Sem Dieta (R$27)
**Objetivo:** Preparar toda a infraestrutura de campanhas para tráfego pago e orgânico

---

## Stories

### STORY-01: Pixel & Tracking Setup
**Prioridade:** P0 (bloqueante para ads)
**Assignee:** @dev

- [ ] Instalar Meta Pixel (Facebook/Instagram) via `<Script>` no layout.tsx
- [ ] Instalar Google Analytics 4 (GA4) / Google Tag via `<Script>`
- [ ] Instalar TikTok Pixel (se aplicável)
- [ ] Configurar eventos de conversão:
  - `PageView` na homepage e página de vendas
  - `ViewContent` na página `/emagreca-sem-dieta`
  - `InitiateCheckout` no clique do botão de compra
  - `Purchase` na página `/obrigado`
- [ ] Criar componente `src/components/tracking/pixels.tsx` reutilizável
- [ ] Testar com Meta Pixel Helper e GA4 DebugView

**Critérios de aceite:**
- Eventos disparando corretamente no Meta Events Manager
- GA4 recebendo pageviews e eventos customizados
- Sem impacto no LCP/CLS (scripts async/defer)

---

### STORY-02: Meta Tags & Open Graph
**Prioridade:** P0
**Assignee:** @dev

- [ ] Configurar `metadata` completo no layout.tsx (title, description, og:image, twitter:card)
- [ ] Criar OG Image estática (1200x630) para `/emagreca-sem-dieta`
  - Texto: "Emagreça Sem Dieta — Método SEM | De R$97 por R$27"
  - Fundo escuro com gradiente emerald (consistente com a página)
- [ ] Adicionar `metadata` específica na página de vendas com `generateMetadata`
- [ ] Testar compartilhamento no WhatsApp, Facebook, Twitter

**Critérios de aceite:**
- Link compartilhado mostra imagem, título e descrição corretos
- Validação OK no Facebook Sharing Debugger

---

### STORY-03: Landing Pages de Campanha (UTM-aware)
**Prioridade:** P1
**Assignee:** @dev

- [ ] Criar rota `/c/[slug]` para landing pages de campanha
- [ ] Implementar leitura de UTM params (`utm_source`, `utm_medium`, `utm_campaign`)
- [ ] Persistir UTMs em cookie/localStorage para atribuição na conversão
- [ ] Passar UTMs para os links de pagamento Hotmart/Kiwify como query params
- [ ] Criar 3 variantes iniciais:
  - `/c/meta-ads` — copy para Facebook/Instagram Ads
  - `/c/google` — copy para Google Ads (search intent)
  - `/c/organico` — copy para tráfego orgânico/WhatsApp

**Critérios de aceite:**
- UTMs persistidos e passados até o link de checkout
- Cada variante tem headline/copy diferente otimizado para a fonte

---

### STORY-04: Email Marketing — Sequência de Boas-Vindas (Brevo)
**Prioridade:** P1
**Assignee:** @dev

- [ ] Criar lista "Leads Emagreça Sem Dieta" no Brevo
- [ ] Criar lista "Compradores Emagreça Sem Dieta" no Brevo
- [ ] Configurar formulário de captura (lista VIP) na homepage para produtos "Em Breve"
- [ ] Criar template de email de boas-vindas no Brevo
- [ ] Criar automação: ao entrar na lista → sequência de 3 emails
  - Email 1 (D+0): Boas-vindas + link para página de vendas
  - Email 2 (D+2): Conteúdo de valor (dica de emagrecimento)
  - Email 3 (D+5): Urgência + oferta R$27
- [ ] Integrar captura via API Brevo (`/api/leads` endpoint)

**Critérios de aceite:**
- Lead capturado aparece no Brevo na lista correta
- Sequência automática dispara nos intervalos corretos
- Link de compra no email tem UTM `utm_source=brevo`

---

### STORY-05: Página de Obrigado com Upsell
**Prioridade:** P2
**Assignee:** @dev

- [ ] Redesign da página `/obrigado` com:
  - Mensagem de confirmação + instruções de acesso
  - Timer de urgência para upsell/order bump
  - Sugestão do próximo produto ("Sono Profundo — Lista VIP")
- [ ] Capturar email do comprador para lista "Compradores" no Brevo
- [ ] Disparar evento `Purchase` com valor para os pixels

**Critérios de aceite:**
- Página bonita e consistente com o design system
- Upsell visível e funcional
- Evento Purchase disparado corretamente

---

### STORY-06: Criativos para Ads (Assets)
**Prioridade:** P1
**Assignee:** @dev (gerar via código) + Doug (revisar)

- [ ] Gerar assets em `/public/ads/`:
  - 3 imagens estáticas (1080x1080) para feed Instagram/Facebook
  - 2 imagens stories (1080x1920) para Instagram Stories
  - 1 banner (1200x628) para Google Display
- [ ] Criar componente React que renderiza os criativos (para preview/iteração)
- [ ] Cada criativo deve ter:
  - Headline forte (dor → solução)
  - Preço riscado R$97 → R$27
  - CTA claro
  - Branding Longetividade

**Critérios de aceite:**
- Assets exportados em PNG/JPG otimizados
- Consistentes com identidade visual do site

---

## Ordem de Execução
1. **STORY-01** (Pixel & Tracking) — bloqueante
2. **STORY-02** (Meta Tags & OG) — bloqueante para compartilhamento
3. **STORY-03** (Landing Pages UTM)
4. **STORY-04** (Email Brevo)
5. **STORY-05** (Página Obrigado)
6. **STORY-06** (Criativos)

## Definition of Done
- Código commitado e deployado no Railway
- Pixels verificados com ferramentas de debug
- Links de pagamento funcionando com UTMs
