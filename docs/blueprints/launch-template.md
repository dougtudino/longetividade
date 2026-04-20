# LAUNCH-[NUMERO] [PRODUTO]

> Use este template ao criar nova LAUNCH. Copie este arquivo para
> `docs/blueprints/launch-[numero]-[slug].md` e preencha cada campo
> marcado com [MAIUSCULAS].
>
> Placeholders obrigatorios de preencher: [PRODUTO], [PRECO], [URL],
> [IDADE_MIN], [IDADE_MAX], [INTERESSES], [BUDGET_TOTAL], etc.
>
> Se nao souber algum campo, escreva "LACUNA — precisa pesquisa" e
> marque a secao com tag [PENDENTE].

---

## 1. Produto e estrategia

### Identidade

- **Nome do produto:** [PRODUTO]
- **Preco:** R$ [PRECO]
- **Landing URL:** [URL] (ex: `https://www.longetividade.com.br/[SLUG]`)
- **Hotmart product ID:** [HOTMART_PRODUCT_ID]
- **Hotmart offer ID:** [HOTMART_OFFER_ID]

### Infra Meta

- **Pixel ID:** [PIXEL_ID]
- **Dataset name:** [DATASET_NAME]
- **Ad account ID:** [AD_ACCOUNT_ID] (ex: `act_XXXXXXXXXXXXXXX`)
- **Business Manager ID:** [BM_ID]

### Proposta de valor

- **Tagline:** [TAGLINE]
- **Proposta central:** [PROPOSTA]
- **Diferencial primario:** [DIFERENCIAL]

---

## 2. Persona primaria e secundaria

### Persona primaria

- **Demografia:** [IDADE_MIN]-[IDADE_MAX] anos, [GENERO], [LOCALIZACAO]
- **Pain points principais:**
  - [PAIN_1]
  - [PAIN_2]
  - [PAIN_3]
- **Avatar quote:** &ldquo;[QUOTE_PERSONA]&rdquo;
- **Contexto (trabalho, estagio de vida):** [CONTEXTO]

### Persona secundaria (opcional)

- **Demografia:** [IDADE_MIN]-[IDADE_MAX] anos, [GENERO], [LOCALIZACAO]
- **Pain points principais:** [PAINS_SECUNDARIA]
- **Avatar quote:** &ldquo;[QUOTE_SECUNDARIA]&rdquo;
- **Contexto:** [CONTEXTO_SECUNDARIA]

---

## 3. Arquitetura de campanha (cold/warm/hot)

### Numero de ad sets por camada

- **Cold:** [N_COLD] ad sets
- **Warm (lookalike):** [N_WARM] ad sets
- **Hot (retargeting):** [N_HOT] ad sets
- **Total:** [N_TOTAL]

### Justificativa da arquitetura

[JUSTIFICATIVA — por que essa distribuicao? Referencias a best practices?]

### Referencias a best practices Meta usadas

- [REFERENCIA_1]
- [REFERENCIA_2]

---

## 4. Distribuicao de budget e ads

### Budget total diario

R$ [BUDGET_TOTAL]/dia

### Budget por ad set

| Ad set | Camada | Budget/dia | Ativa em |
|---|---|---|---|
| [ASET-01-NOME] | [cold/warm/hot] | R$ [X] | [day_1/day_5/manual] |
| [ASET-02-NOME] | [cold/warm/hot] | R$ [X] | [day_1/day_5/manual] |
| ...            |                |          |                     |

**Total Day 1 (ad sets ativos de largada):** R$ [TOTAL_D1]/dia
**Total Day 5+ (apos warm/hot ativarem):** R$ [TOTAL_D5]/dia

### Justificativa da distribuicao

[JUSTIFICATIVA — por camada de funil? Uniforme? Outro criterio?]

### Numero de ads por ad set

| Ad set | # ads | Angles cobertos |
|---|---|---|
| [ASET-01-NOME] | [N] | [angles] |
| [ASET-02-NOME] | [N] | [angles] |

### Rationale do numero de ads

[JUSTIFICATIVA — 5 ads = Meta recomenda 3-5 pra learning phase? Outro motivo?]

---

## 5. Criativos e copies

### Angles obrigatorios

- [ ] **Dor** — fala do problema / quebra ilusao
- [ ] **Prova social** — depoimento / resultado validado
- [ ] **Quebra de objecao** — "ja tentei tudo"
- [ ] **Promessa** — transformacao especifica
- [ ] **CTA direto** — chamada pra acao

### Formatos

- [ ] Feed 1080x1080 (1:1)
- [ ] Stories 1080x1920 (9:16)
- [ ] Banner 1200x628 (display)
- [ ] Reel (video vertical)

### Copies master por angle

#### COPY-A · Dor/Identificacao

```
[COPY_A_TEXTO]
```

#### COPY-B · Prova social

```
[COPY_B_TEXTO]
```

#### COPY-C · Quebra de objecao

```
[COPY_C_TEXTO]
```

#### COPY-D · Story curto (opcional)

```
[COPY_D_TEXTO]
```

### Collection name em /admin/criativos

`[COLLECTION_SLUG]` (ex: `launch-001-pioneer`)

---

## 6. Audiences planejadas

### Custom Audiences (evento + retencao)

| Key | Evento | Retencao | Uso |
|---|---|---|---|
| [ca_compradores] | Purchase | 180 dias | exclusao de todos ad sets |
| [ca_pageview_7d] | PageView | 7 dias | retargeting |
| [ca_pageview_30d] | PageView | 30 dias | source pro lookalike |
| [ca_inicheck_30d] | InitiateCheckout | 30 dias | exclusao do retargeting broad |
| [ca_leads_30d] | Lead | 30 dias | segmentacao futura |

### Lookalike Audiences (source + ratio + country)

| Key | Source | Ratio | Country |
|---|---|---|---|
| [lal_1pct_pageview_30d] | ca_pageview_30d | 0.01 | BR |

### Regras de exclusao

- Cold ad sets excluem: [LISTA_EXCLUSOES_COLD]
- Warm ad sets excluem: [LISTA_EXCLUSOES_WARM]
- Hot ad sets excluem: [LISTA_EXCLUSOES_HOT]

---

## 7. Criterios de sucesso e kill triggers

### Targets

- **ROAS target:** &gt;= [ROAS_TARGET]x
- **CPA maximo aceitavel:** R$ [CPA_MAX]
- **CTR minimo saudavel:** &gt;= [CTR_MIN]%

### Timeline de revisao

- **Day 3:** [ACAO_D3]
- **Day 5:** [ACAO_D5]
- **Day 7:** [ACAO_D7]
- **Day 14:** [ACAO_D14]

### Regras de escala

- ROAS &gt;= 2.0x sustentado 3+ dias → [ACAO_ESCALA_2X]
- ROAS 1.5-2.0x → [ACAO_ESCALA_1_5]

### Regras de kill

- CTR &lt; 0.8% apos 5k impressoes → [ACAO_KILL_CTR]
- CPA &gt; 1.5x ticket apos 3 dias → [ACAO_KILL_CPA]
- Frequency &gt; 3 com CTR caindo &gt;20% WoW → [ACAO_KILL_FREQ]

---

## 8. Cronograma de ativacao

### Day 1 (publicacao)

- [ ] [ASET_D1_1] ATIVO
- [ ] [ASET_D1_2] ATIVO
- [ ] [ASET_D1_N] ATIVO

### Day 5 (apos learning phase inicial)

- [ ] [ASET_D5_1] ATIVAR
- [ ] [ASET_D5_N] ATIVAR

### Day 14+ (se sinal positivo)

- [ ] [ASET_D14_1] ATIVAR / DUPLICAR / ESCALAR
- [ ] [ACAO_D14_N]

---

## Convencoes

- **Status:** `draft` | `ready` | `launched` | `paused` | `archived`
- **Placeholders:** sempre [MAIUSCULAS]
- **Lacunas:** marcar [PENDENTE] e descrever o que falta
- **Assinaturas:** rodape com Atlas/Morgan/Pax quando houver validacao AIOX
