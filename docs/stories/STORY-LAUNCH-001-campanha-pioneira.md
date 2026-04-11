# STORY-LAUNCH-001 — Campanha Meta Pioneira

**Epic:** Lançamento de Tráfego Pago
**Agente responsável:** @growth (Gaia) — desenho · Bárbara — execução manual no Meta Ads Manager
**Prioridade:** P0
**Status:** [x] Blueprint pronto (2026-04-11) · [ ] Execução pendente
**Data criação:** 2026-04-11

---

## Contexto

Primeira campanha real do Longetividade. Toda a infraestrutura está pronta:
pixel, landing pages, criativos, webhook Hotmart, sequência de email, dashboard
Meta Ads. O que falta é colocar tráfego no ar de forma controlada e
mensurável, gerando os primeiros dados reais pra tomar decisões.

A filosofia da Gaia: **start small, test aggressive, scale what works**.

---

## Filosofia da campanha

- **Não é uma campanha — é um experimento.** Estamos coletando dados, não buscando lucro imediato.
- **Budget conservador.** R$30/dia por ad set, total R$150/dia. Em 7 dias = R$1.050. É o investimento de aprendizado.
- **Múltiplas hipóteses simultâneas.** 5 ad sets = 5 hipóteses sendo testadas.
- **Mata rápido.** O que não converte em 72h morre. Sem apego.
- **Escala horizontal.** Vencedor não é "subir budget", é "duplicar conjunto vencedor".
- **Meta única do experimento:** identificar **1 vencedor** (1 ad set + 1 criativo) com ROAS ≥ 1.5 em 7 dias.

---

## Blueprint completo

### Campanha 01 — Aquisição Conversão

| Campo | Valor |
|---|---|
| **Nome** | `LONG-AQ-01-Conversao-Pioneer-Mar2026` |
| **Objetivo** | Vendas (Sales / Conversions) |
| **Tipo de compra** | Leilão |
| **Otimização** | Conversões → Purchase event |
| **Atribuição** | 7 dias clique / 1 dia visualização |
| **Orçamento** | Diário, R$ 150 (CBO desligado — budget no ad set) |
| **Estratégia de lance** | Custo mais baixo (sem cost cap no início) |
| **Período** | 14 dias (de hoje + 14) |
| **Pixel** | Dados de Longetividade (`953736244279938`) |
| **Conta** | CA01- BM Barbara Oliveira (`act_837047967961012`) |

---

### Ad Sets (5 conjuntos paralelos)

#### 🎯 ASET-01 — Interesse Amplo: "Emagrecimento"

| Campo | Valor |
|---|---|
| Nome | `ASET-01-Interesse-Emagrecimento-Amplo` |
| Budget | R$ 30/dia |
| Idade | 30-50 |
| Gênero | Mulheres |
| Localização | Brasil — todo |
| Idioma | Português |
| Interesses | Emagrecimento OU Dieta OU Vida saudável OU Nutrição |
| Comportamentos | — |
| Exclusões | Compradores recentes (custom audience: emails do `Order` aprovado) |
| Posicionamentos | Manual: Feed IG + Feed FB + Stories IG |
| Dispositivos | Todos |
| Otimização | Conversão (Purchase) |

#### 🎯 ASET-02 — Interesse Específico: "Reeducação Alimentar"

| Campo | Valor |
|---|---|
| Nome | `ASET-02-Interesse-Reeducacao` |
| Budget | R$ 30/dia |
| Idade | 30-50 |
| Gênero | Mulheres |
| Interesses | Reeducação alimentar OU Low carb OU Paleolítica OU Nutrigenômica |
| Posicionamentos | Manual: Feed IG + Feed FB |
| Resto | igual ASET-01 |

#### 🎯 ASET-03 — Maternidade Pós-parto

| Campo | Valor |
|---|---|
| Nome | `ASET-03-Maes-Pos-parto` |
| Budget | R$ 30/dia |
| Idade | 28-42 |
| Gênero | Mulheres |
| Interesses | Maternidade OU Bebês OU Família + (Emagrecimento OU Saúde) |
| Comportamentos | Mães |
| Posicionamentos | Manual: Feed IG + Stories IG |
| Resto | igual ASET-01 |

#### 🎯 ASET-04 — Lookalike Inicial (cold)

| Campo | Valor |
|---|---|
| Nome | `ASET-04-LAL-1pct-Engaged` |
| Budget | R$ 30/dia |
| Source | Lookalike 1% Brasil de "engajamento da página" (a criar quando tiver ≥ 100 engajamentos) |
| Idade | 30-50 |
| Gênero | Mulheres |
| Posicionamentos | Manual: Feed IG + Feed FB |
| **Obs:** | Pode ficar pausado nos primeiros 3 dias até gerar audiência base. Inicia depois. |

#### 🎯 ASET-05 — Retargeting (warm)

| Campo | Valor |
|---|---|
| Nome | `ASET-05-Retargeting-PageViews` |
| Budget | R$ 30/dia |
| Source | Visitou `/emagreca-sem-dieta` nos últimos 7 dias E não comprou |
| Idade | Sem restrição (já é qualificado) |
| Posicionamentos | Manual: Feed IG + Stories IG + Feed FB |
| **Obs:** | Pausado por 3 dias até gerar tráfego de pageviews. Inicia depois. |

---

### Mapeamento Criativo → Ad Set

Os 6 criativos prontos em `/admin/criativos` se distribuem assim:

| Criativo | Formato | Ad Sets |
|---|---|---|
| Feed Dor (1080×1080) | Feed | ASET-01, ASET-02, ASET-03 |
| Feed Prova Social (1080×1080) | Feed | ASET-02, ASET-04 |
| Feed Objeção (1080×1080) | Feed | ASET-01, ASET-03 |
| Story Stat -4kg (1080×1920) | Story IG | ASET-01, ASET-03 |
| Story CTA Comece Hoje (1080×1920) | Story IG | ASET-05 (retargeting) |
| Banner Display (1200×628) | — (não usar nesta campanha; reservar pra Google Display futuro) | — |

**Cada ad set roda 2-3 criativos em rotação dinâmica.** O Meta vai escolher automaticamente o que performa melhor por audiência.

---

### Cópias dos anúncios (texto principal)

#### COPY-A — Identificação (para Feed Dor)
```
Você não precisa passar fome pra emagrecer.

Você precisa entender por que TUDO que você tentou até hoje
te trouxe de volta pro mesmo lugar.

O Método S.E.M é diferente:
✓ Sem dieta restritiva
✓ Sem cortar carboidrato
✓ Sem balança no banheiro

É reeducação alimentar real, pro seu corpo de mulher de verdade.

👉 Conhece o método aqui
```

#### COPY-B — Prova Social (para Feed Prova)
```
+1.000 mulheres já descobriram o Método S.E.M esse mês.

Bárbara, 38 anos, perdeu 4kg em 30 dias sem academia
e sem cortar pão do café.

"Achei que ia ser mais um método. Era diferente. Eu como, tô feliz, e tô emagrecendo."

Quer ser a próxima?
👉 Comece hoje a partir de R$ 37
```

#### COPY-C — Quebra de Objeção (para Feed Objeção)
```
"Eu já tentei TUDO."

Eu sei. Cetogênica, jejum, low carb, shake.
Funcionou? Por quanto tempo?

O problema não é você. É o método.

Reeducação alimentar não é dieta — é aprender a comer com prazer
sem culpa, sem fome e sem voltar pro mesmo lugar daqui 3 meses.

Conhece o S.E.M 👉
```

#### COPY-D — Story (para Story Stat e Story CTA)
```
-4kg em 30 dias.
Sem academia. Sem fome.

Método S.E.M.
👆 Arraste pra cima
```

---

### Targeting de URL

Cada ad set aponta pra uma URL diferente pra rastrear de qual conjunto veio a venda:

| Ad Set | URL de destino |
|---|---|
| ASET-01 | `https://www.longetividade.com.br/c/instagram?utm_source=meta&utm_medium=cpc&utm_campaign=long-aq-01&utm_content=interesse-amplo` |
| ASET-02 | `https://www.longetividade.com.br/c/instagram?utm_source=meta&utm_medium=cpc&utm_campaign=long-aq-01&utm_content=reeducacao` |
| ASET-03 | `https://www.longetividade.com.br/c/instagram?utm_source=meta&utm_medium=cpc&utm_campaign=long-aq-01&utm_content=maes-pos-parto` |
| ASET-04 | `https://www.longetividade.com.br/c/instagram?utm_source=meta&utm_medium=cpc&utm_campaign=long-aq-01&utm_content=lookalike` |
| ASET-05 | `https://www.longetividade.com.br/c/instagram?utm_source=meta&utm_medium=cpc&utm_campaign=long-aq-01&utm_content=retargeting` |

Os UTMs são capturados pelo `UTMCapture` e persistidos no `Order` quando vier a venda — assim a gente vê **exatamente qual ad set converteu**.

---

### Custom Audiences (criar antes de lançar ASET-04 e ASET-05)

| Audience | Source | Janela | Uso |
|---|---|---|---|
| `LONG-CA-Compradores` | Eventos Pixel: Purchase | 180 dias | Exclusão (não anunciar pra quem já comprou) |
| `LONG-CA-PageView-7d` | Eventos Pixel: PageView na URL `/emagreca-sem-dieta` | 7 dias | Source de ASET-05 (retargeting) |
| `LONG-CA-PageView-30d` | Eventos Pixel: PageView | 30 dias | Source futuro de Lookalike |
| `LONG-CA-IC-7d` | Eventos Pixel: InitiateCheckout sem Purchase | 7 dias | Retargeting de carrinho abandonado (futuro) |

---

## Cronograma de execução (14 dias)

### Dia 0 (hoje) — Lançamento
- [ ] Bárbara cria campanha no Meta Ads Manager seguindo blueprint
- [ ] Cria ASET-01, ASET-02, ASET-03 (os 3 cold)
- [ ] Sobe criativos e copies por ad set
- [ ] Cria as 4 custom audiences
- [ ] Ativa campanha às 12h BRT
- [ ] **Não mexe em nada por 72h** (fase de aprendizado do algoritmo)

### Dias 1-3 — Coleta de dados
- [ ] Não tocar em nada
- [ ] Acompanhar `/admin/campanhas` 1x por dia (sem ansiedade)
- [ ] Anotar: gasto, impressões, cliques, conversões por ad set
- [ ] Sprint email: confirmar que welcome email D+0 dispara na primeira venda

### Dia 4 — Primeiro Review (Gaia)
- [ ] Gaia roda `*review` analisando 72h de dados
- [ ] Decisão: matar ad sets com CPA > 1.5x ticket OU CTR < 0.8%
- [ ] Sobreviventes continuam

### Dia 5 — Lançar warm (se houver dados)
- [ ] Verificar se há ≥ 100 PageViews → criar `LONG-CA-PageView-7d`
- [ ] Ativar ASET-05 (retargeting) se a custom audience tiver tamanho viável (>1.000)

### Dia 7 — Review semanal completo
- [ ] Gaia identifica vencedor (ad set com melhor ROAS)
- [ ] Duplica vencedor em ASET-XX-V2 (mesma config, novo nome)
- [ ] Sobe budget do vencedor original em +20% (não +50%, evita reset)
- [ ] Considera lançar ASET-04 (lookalike) se houver source

### Dias 8-14 — Otimização
- [ ] Testa 2 criativos novos no ad set vencedor
- [ ] A/B test de copy: COPY-A vs COPY-C no mesmo ad set
- [ ] Mata o pior, escala o melhor

### Dia 14 — Sprint Review
- [ ] Decisão go/no-go: continuar essa campanha ou pivotar?
- [ ] Critério: ROAS final ≥ 1.0 (break-even) → continuar; < 0.5 → pivotar
- [ ] Briefing pra próxima sprint de otimização

---

## Métricas de sucesso (DoD)

- [ ] Campanha rodando há ≥ 7 dias com tracking funcionando
- [ ] Pelo menos 1 ad set com ROAS ≥ 1.5
- [ ] Pelo menos 1 venda atribuída via UTM
- [ ] Pixel Helper validou eventos sem erro (STORY-TRACK-001)
- [ ] Webhook Hotmart criando Order com `utm_content` correto
- [ ] Welcome email disparando na compra (lib/email-sequence)
- [ ] Maya relatório diário mostrando dados de conversão reais

---

## Riscos identificados (Gaia)

| Risco | Mitigação |
|---|---|
| Pixel não dispara Purchase corretamente | STORY-TRACK-001 manual antes de escalar |
| Audiência muito pequena | Brasil + 30-50 + mulheres = ~30M, sem risco |
| Criativos não performam | 6 criativos prontos, rotação dinâmica resolve |
| Brevo cai e sequência email para | Lead já fica salvo no DB local; cron retoma |
| Hotmart webhook falha | Order é criado mesmo via fallback; contagem manual no painel Hotmart |
| Bárbara executa errado | Blueprint detalhado + página `/admin/campanhas/launch-plan` |
| Budget queima sem retorno | Kill criteria automáticos; max R$1.050 em 7 dias |

---

## Próximas stories que podem nascer dessa

- **STORY-LAUNCH-002:** A/B test de copies sobre o vencedor do LAUNCH-001
- **STORY-LAUNCH-003:** Lançamento Google Ads (search intent)
- **STORY-RETARGET-001:** Carrinho abandonado via email + ad
- **STORY-LTV-001:** Sequência pós-compra (upsell Sono Profundo)
- **STORY-AUTO-CAMPAIGN:** Criação automatizada de campanhas via Marketing API (substitui Bárbara executando manual)

---

— Gaia, escalando o que funciona 📈
