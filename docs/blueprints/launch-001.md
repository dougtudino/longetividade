# LAUNCH-001 Longetividade — Emagreca Sem Dieta

Campanha pioneira do Longetividade. Primeira LAUNCH validada em producao.
Status atual: `draft` no banco (aguarda decisao final de Doug sobre budget).

---

## 1. Produto e estrategia

### Identidade

- **Nome do produto:** Longetividade — Emagreca Sem Dieta (Metodo S.E.M)
  [AGENTES CONFIRMARAM — seed + landing]
- **Preco:** R$ 37 (anchor R$ 97, desconto 72%) [AGENTES CONFIRMARAM — landing `page.tsx:349-351`]
- **Landing URL:** `https://www.longetividade.com.br/emagreca-sem-dieta` [AGENTES CONFIRMARAM — launch-001.ts:13, seed]
- **Hotmart product ID:** `7474328` [INFERIDO DO CODIGO — seed atual]
- **Hotmart offer ID:** [LACUNA — nao consta em nenhuma fonte consultada]

### Infra Meta

- **Pixel ID:** `953736244279938` (Dados de Longetividade) [AGENTES CONFIRMARAM — launch-plan step 1 + seed]
- **Dataset name:** `Dados de Longetividade` [AGENTES CONFIRMARAM — launch-plan step 5]
- **Ad account ID:** `act_837047967961012` [AGENTES CONFIRMARAM — launch-plan step 1]
- **Business Manager ID:** `1892655711045175` [INFERIDO DO CODIGO — seed atual; nao consta no launch-plan original]

### Proposta de valor

- **Tagline:** &ldquo;Voce nao precisa de mais uma dieta. Precisa de um metodo que funcione na sua vida real.&rdquo; [AGENTES CONFIRMARAM — landing hero]
- **Proposta central:** Metodo S.E.M — 3 pilares simples pra mulheres ocupadas emagrecerem sem cortar alimentos, sem academia e sem culpa. [AGENTES CONFIRMARAM — landing `page.tsx:340-342`]
- **Diferencial primario:** Trabalha os 3 pilares (alimentacao, emocional, movimento) — foca em reeducacao alimentar real, sem restricao extrema, sem contar calorias. [AGENTES CONFIRMARAM — landing FAQ `page.tsx:105`]

---

## 2. Persona primaria e secundaria

### Persona primaria — Mulher que "ja tentou tudo"

- **Demografia:** 30-50 anos, feminino, Brasil [AGENTES CONFIRMARAM — launch-001.ts ASET-01, launch-plan ASET-01/02]
- **Pain points principais:**
  - Cansada de dietas que nao funcionam [AGENTES CONFIRMARAM — COPY-A texto]
  - Culpa no cafe da manha, frustracao acumulada com metodos anteriores [AGENTES CONFIRMARAM — COPY-A, COPY-C]
  - Rotina corrida (trabalho, familia) incompativel com dietas restritivas [AGENTES CONFIRMARAM — landing `page.tsx:340-342`]
- **Avatar quote:** &ldquo;Eu achava que o problema era eu. Falta de disciplina. O S.E.M me mostrou que era a estrategia. Em 3 semanas ja sentia diferenca na roupa.&rdquo; [AGENTES CONFIRMARAM — landing depoimento `page.tsx:150`]
- **Contexto:** mulher ocupada com rotina real, provavelmente com filhos ou trabalho exigente, que ja investiu tempo/dinheiro em programas anteriores e se frustrou.

### Persona secundaria — Mae pos-parto

- **Demografia:** 28-42 anos, feminino, Brasil [AGENTES CONFIRMARAM — seed ASET-03, launch-001.ts ASET-03]
- **Pain points principais:**
  - Adaptacao corporal pos-parto, sem restricao durante amamentacao [INFERIDO — nao ha copy dedicada, so targeting por interesse Maternidade/Bebes/Amamentacao]
  - Culpa pela prioridade da rotina bebê vs autocuidado [LACUNA — copies atuais nao falam especificamente disso]
- **Avatar quote:** [LACUNA — nao existe copy dedicada a essa persona]
- **Contexto:** [INFERIDO] recem-maes com janela de atencao curta e alta sensibilidade a mensagens de culpa.

---

## 3. Arquitetura de campanha (cold/warm/hot)

### Numero de ad sets por camada

- **Cold:** 3 ad sets (ASET-01, ASET-02, ASET-03) [AGENTES CONFIRMARAM — launch-plan steps 5-7]
- **Warm (lookalike):** 1 ad set (ASET-04) [AGENTES CONFIRMARAM — launch-plan ASET-04 pausado Day 5]
- **Hot (retargeting):** 1 ad set (ASET-05) [AGENTES CONFIRMARAM — launch-plan ASET-05 pausado Day 5]
- **Total:** 5

### Justificativa da arquitetura

[AGENTES CONFIRMARAM — launch-001.ts linha 4-9 e launch-plan]

Filosofia: **start small, test aggressive, scale what works**. 3 cold rodam de largada pra descobrir qual angulo + persona converte. Warm+Hot ativados Day 5 quando o pixel ja tem dados suficientes (pageviews acumulados) pra alimentar lookalike e retargeting. Evita gastar budget em retargeting quando ainda nao tem ninguem pra retargetar.

Pos-mortem LONG-AQ-01 (2026-04-19) reforca a arquitetura: landing antiga vazia fez o tráfego nao converter, pixel nao acumulou sinal. Comeco "sem overlap" entre ad sets (ja exclui compradores) pra nao canibalizar.

### Referencias a best practices Meta usadas

- Learning phase Meta = 50 compras/semana por ad set → ad set precisa ter budget suficiente pra escalar ate o aprendizado. [INFERIDO DO CODIGO — gaia knowledge menciona learning phase mas nao amarra calculo aqui]
- 3-5 criativos por ad set em rotacao dinamica. [AGENTES CONFIRMARAM — launch-plan step 6]
- CBO desligado — budget controlado por ad set pra isolar experimentos. [AGENTES CONFIRMARAM — launch-plan step 4]

---

## 4. Distribuicao de budget e ads

### Budget total diario

**Nao ha consenso unico.** Duas versoes existem:

### Budget por ad set — OPCAO A (agentes originais)

[AGENTES CONFIRMARAM — launch-plan/page.tsx ASETS array, linhas 60-96]

| Ad set | Camada | Budget/dia | Ativa em |
|---|---|---|---|
| ASET-01-Interesse-Emagrecimento-Amplo | cold | R$ 30 | Day 1 |
| ASET-02-Interesse-Reeducacao | cold | R$ 30 | Day 1 |
| ASET-03-Maes-Pos-parto | cold | R$ 30 | Day 1 |
| ASET-04-LAL-1pct-Engaged | warm | R$ 30 | Day 5 |
| ASET-05-Retargeting-PageViews | hot | R$ 30 | Day 5 |

- **Total Day 1:** R$ 90/dia (3 cold × R$30)
- **Total Day 5+:** R$ 150/dia (5 ad sets × R$30)

Rationale dos agentes: [LACUNA — agentes nao documentaram por que uniforme. Possivelmente simplificacao pra MVP ou decisao de "todo ad set merece chance igual no teste inicial" — mas isso nao esta escrito em lugar nenhum.]

### Budget por ad set — OPCAO B (seed atual codigo)

[INFERIDO DO CODIGO — seed `src/app/api/admin/campaigns/blueprint/seed/route.ts`]

| Ad set | Camada | Budget/dia | Ativa em |
|---|---|---|---|
| ASET-01-Cold-Interesses-3050 | cold | R$ 25 | Day 1 |
| ASET-02-Cold-Broad-3050 | cold | R$ 15 | Day 1 |
| ASET-03-Cold-Maes-Pos-Parto | cold | R$ 25 | Day 1 |
| ASET-04-LAL-1pct-Pageview | warm | R$ 15 | Day 5 |
| ASET-05-RT-Pageview-7d | hot | R$ 15 | Day 5 |

- **Total Day 1:** R$ 65/dia (3 cold ativos)
- **Total Day 5+:** R$ 95/dia (5 ad sets)

Rationale: **proposta em discussao 20/04/2026** (Claude Code durante seed da Sprint 3). A distribuicao desigual privilegia cold interesse-especifico (R$25) sobre cold broad (R$15), e reduz warm/hot porque dependem de volume de pixel que ainda nao foi construido. **Nao validado por agentes AIOX.**

### Decisao tomada — 2026-04-20

**ADOTADA: Opcao B (seed atual, R$95/dia)**

Doug decidiu 2026-04-20: "vamos entao criar com esse de 95 pra comecar a
funcionar depois escalamos conforme as analises dos agentes".

Rationale (alinhado com [feedback Doug: budget minimo pra testar ferramenta]):
- Fase 1 (validacao): R$95/d roda ferramenta end-to-end, valida tracking
  Pixel/CAPI, infra Meta, fluxo Gaia review. Aceita-se que ad sets
  fiquem em learning phase — objetivo nao e ROAS confiavel ainda.
- Fase 2 (Day 4): primeiro `*review` da Gaia identifica winners/losers
  com dados reais (mesmo com ruido estatistico).
- Fase 3 (pos-Day 4): escalar os 1-2 vencedores pra R$150-300/dia por ad
  set, a partir do AGENTES ciclo AIOX que vai analisar os resultados.

**Nao confundir:** budget de validacao (R$95/d) nao e budget de operacao.
Decisoes de ROAS/escala definitivas vem da Fase 3, nao da Fase 1.

### Numero de ads por ad set

[INFERIDO DO CODIGO — seed]

| Ad set | # ads | Angles cobertos |
|---|---|---|
| ASET-01-Cold-Interesses-3050 | 5 | dor, prova, objecao, promessa, cta |
| ASET-02-Cold-Broad-3050 | 3 | dor, prova, cta |
| ASET-03-Cold-Maes-Pos-Parto | 4 | dor, prova, objecao, cta |
| ASET-04-LAL-1pct-Pageview | 2 | prova, cta |
| ASET-05-RT-Pageview-7d | 2 | cta, objecao |

**Versao dos agentes originais:** 2-3 ads por ad set em rotacao dinamica. [AGENTES CONFIRMARAM — launch-plan step 6]

### Rationale do numero de ads

[LACUNA — nenhuma fonte justifica a distribuicao entre 2-5 ads. Best practice Meta (3-5 na learning phase) nao foi citada explicitamente.]

---

## 5. Criativos e copies

### Angles obrigatorios

- [x] **Dor** — COPY-A Identificacao
- [x] **Prova social** — COPY-B
- [x] **Quebra de objecao** — COPY-C
- [x] **CTA direto** — COPY-D (Story curto)
- [ ] **Promessa** — [LACUNA — nao existe copy dedicada. Angle mencionado no seed mas sem texto master]

### Formatos

- [x] Feed 1080x1080 — `feed_dor`, `feed_prova`, `feed_objecao`
- [x] Stories 1080x1920 — `story_stat`, `story_cta`
- [x] Banner 1200x628 — `banner_display`
- [ ] Reel — [LACUNA — nao previsto no LAUNCH-001 original]

### Copies master por angle

[AGENTES CONFIRMARAM — launch-plan COPIES array + launch-001.ts copies]

#### COPY-A · Dor/Identificacao

```
Cansada de dietas que nao funcionam?

O problema nao e voce. E o metodo.

O S.E.M propoe uma nova relacao com a alimentacao:
✓ Sem restricao extrema
✓ Sem contar calorias
✓ Sem culpa no cafe da manha

Reeducacao alimentar real, feita pra mulher com rotina de verdade.

👉 Conheca o metodo
```

#### COPY-B · Prova social

```
+1.000 mulheres ja conheceram o Metodo S.E.M esse mes.

Barbara, 38 anos:
"Achei que ia ser mais um metodo. Era diferente. Eu como, estou feliz,
e me sinto bem no meu corpo de novo."

Um jeito diferente de se relacionar com a comida.

👉 Comece hoje a partir de R$ 37
```

#### COPY-C · Quebra de objecao

```
"Eu ja tentei tudo."

Sei como e. Um metodo novo por mes, resultado que nao dura, frustracao.

O problema nao e voce. E a abordagem.

Reeducacao alimentar nao e dieta — e aprender a comer com prazer,
sem culpa e sem o peso emocional da balanca.

👉 Conheca o S.E.M
```

#### COPY-D · Story curto

```
Uma nova relacao com a comida.
Sem dieta. Sem culpa.

Metodo S.E.M.
👆 Arraste pra cima
```

### Headline + description (Meta Ad)

[AGENTES CONFIRMARAM — launch-001.ts + launch-plan step 6]

- **Headline:** `Metodo S.E.M — Reeducacao alimentar`
- **Description:** `A partir de R$ 37 · Sem restricao extrema`
- **CTA button:** `Saiba mais` (LEARN_MORE)

### Collection name em /admin/criativos

`launch-001-pioneer` [INFERIDO DO CODIGO — seed atual]

A collection real no banco atual usa outro slug que precisa ser verificado em `/admin/criativos`. [LACUNA — seed referencia `launch-001-pioneer` mas nenhuma `CreativeCollection` foi criada com esse slug automaticamente; o seed inicial de criativos usa slug diferente.]

---

## 6. Audiences planejadas

### Custom Audiences (evento + retencao)

[AGENTES CONFIRMARAM — launch-plan step 3 (4 CAs) + INFERIDO DO CODIGO — seed adiciona 2 extras]

| Key | Evento | Retencao | Uso | Origem |
|---|---|---|---|---|
| ca_compradores | Purchase | 180 dias | exclusao de todos ad sets | [AGENTES] |
| ca_pageview_7d | PageView | 7 dias | retargeting ASET-05 | [AGENTES] |
| ca_pageview_30d | PageView | 30 dias | source do lookalike | [AGENTES] |
| ca_inicheck_30d | InitiateCheckout | 30 dias | exclusao retargeting | [INFERIDO] (agentes originais tinham `LONG-CA-IC-7d` com 7d, seed usa 30d) |
| ca_leads_30d | Lead | 30 dias | segmentacao futura | [INFERIDO] (nao prevista pelos agentes originais) |

**Discrepancia:** agentes originais planejaram 4 CAs com `IC-7d` (janela 7d). Seed atual tem 5 CAs + `inicheck_30d` (janela 30d) e adicionou `leads_30d` que nao estava no plano. [PENDENTE — Doug decide se mantem expansao do seed ou volta ao plano original.]

### Lookalike Audiences (source + ratio + country)

[INFERIDO DO CODIGO — seed adicionou, plano original mencionou "source para Lookalike futuro" mas nao definiu LAL no LAUNCH-001]

| Key | Source | Ratio | Country |
|---|---|---|---|
| lal_1pct_pageview_30d | ca_pageview_30d | 0.01 (1%) | BR |

Rationale da escolha 1%: [LACUNA — padrao Meta e 1%, 3%, 5% ou 10%. Agentes nao documentaram por que 1%. 1% = publico mais parecido (tipicamente ~2M no BR), bom pra comeco; 3-5% = maior volume mas menor precisao.]

### Regras de exclusao

[INFERIDO DO CODIGO — seed]

- **Cold ad sets (01, 02, 03):** excluem `ca_compradores`
- **Warm ad set (04):** exclui `ca_compradores`
- **Hot ad set (05):** exclui `ca_compradores` + `ca_inicheck_30d` (retargeting NAO deve re-mostrar ad pra quem ja tava checando out)

**Divergencia da opcao A:** plano original mencionou apenas `LONG-CA-Compradores` como exclusao. Seed expandiu exclusoes no hot ad set pra evitar waste.

---

## 7. Criterios de sucesso e kill triggers

### Targets

[AGENTES CONFIRMARAM — gaia-knowledge-seed.ts + launch-plan step 8]

- **ROAS target:** >= 1.5x (para escalar) / >= 2.0x (para duplicar) [AGENTES — gaia regras]
- **CPA maximo aceitavel:** R$ 55 (considerar kill acima). Excelente < R$ 20, bom R$ 20-35. [AGENTES — gaia benchmark]
- **CPA ideal alvo:** < R$ 25 pra ticket R$ 37 (CPA/ticket < 0.7) [AGENTES CONFIRMARAM — launch-plan step 8]
- **CTR minimo saudavel:** >= 1.2% (abaixo disso, ad set entra em zona de risco; < 0.8% apos 5k impressoes = kill) [AGENTES — gaia benchmark]
- **CTR ideal alvo:** > 2% [AGENTES CONFIRMARAM — launch-plan step 8]

### Timeline de revisao

[AGENTES CONFIRMARAM — launch-plan step 8 e gaia knowledge]

- **Day 1-3:** NAO MEXER. Algoritmo em learning phase. [AGENTES — launch-plan step 7]
- **Day 4:** primeiro review da Gaia (`*review`). Analisa CTR, CPA, ROAS, identifica winner/loser. [AGENTES — launch-plan step 8]
- **Day 5:** ativacao de ASET-04 (warm) e ASET-05 (hot), se houver volume de pixel. [AGENTES — launch-plan]
- **Day 7:** decisao go/no-go (continua investindo vs pivot estrategico). [AGENTES — mencionado no mapa da campanha LAUNCH-001]
- **Day 14:** [LACUNA — nenhuma acao documentada especificamente pra Day 14]

### Regras de escala

[AGENTES CONFIRMARAM — gaia-knowledge-seed.ts linhas 49-54]

- ROAS >= 2.0x sustentado 3+ dias → DUPLICAR ad set (novo ID, mesma config)
- ROAS 1.5-2.0x → aumentar budget em +20% (nunca mais que 20% por ciclo)

### Regras de kill

[AGENTES CONFIRMARAM — gaia-knowledge-seed.ts]

- CTR < 0.8% apos 5k impressoes → kill (criativo/audiencia nao engaja)
- CPA > 1.5x ticket apos 3 dias de dados → kill (economicamente inviavel)
- Frequency > 3 com CTR caindo >20% semana sobre semana → kill (audiencia saturada)

---

## 8. Cronograma de ativacao

### Day 1 (publicacao)

[AGENTES CONFIRMARAM — launch-plan step 7]

- [x] ASET-01 (cold interesse) ATIVO
- [x] ASET-02 (cold broad/reeducacao) ATIVO
- [x] ASET-03 (cold maes pos-parto) ATIVO
- [ ] ASET-04 PAUSADO
- [ ] ASET-05 PAUSADO

### Day 5 (apos learning phase inicial)

[AGENTES CONFIRMARAM — launch-plan + seed activateOn=day_5]

- [x] ASET-04 (LAL 1%) ATIVAR — desde que ca_pageview_30d tenha acumulado ≥100 pageviews
- [x] ASET-05 (retargeting 7d) ATIVAR — desde que ca_pageview_7d tenha ≥1k pessoas

**Gate:** se volume de pixel nao for suficiente no Day 5, adiar ativacao pro Day 7 ou Day 10.

### Day 14+ (se sinal positivo)

[LACUNA — nenhum plano documentado explicitamente pra pos-Day 14]

Hipotese baseada nas regras da Gaia (nao confirmada pelos agentes no launch-plan):

- Se algum ad set estiver com ROAS >= 2 sustentado → DUPLICAR
- Se campanha como todo estiver ROAS >= 1.5 → abrir ad set novo com lookalike 3-5% (expansao de alcance)
- Se campanha estiver ROAS < 0.8 blended → considerar PROPOSE_ITERATION (repensar oferta/landing/persona)

---

## Lacunas criticas consolidadas

| Secao | Lacuna | Impacto |
|---|---|---|
| 1 | Hotmart offer ID ausente | Baixo — nao bloqueia launch, mas impede tracking fino por oferta |
| 2 | Copy dedicada persona secundaria (Maes) | Medio — ASET-03 roda mas sem copy especifica pra dor pos-parto |
| 3 | Rationale Meta learning phase nao amarrado em budget | Medio — decisao de budget vira empirica sem argumento solido |
| 4 | Rationale da distribuicao de budget (uniforme vs desigual) | **ALTO — bloqueia decisao Doug** |
| 4 | Rationale do numero de ads por ad set (2-5) | Baixo |
| 5 | Copy "Promessa" ausente | Medio — angle esta no seed mas sem texto |
| 5 | Collection name `launch-001-pioneer` nao existe automaticamente em /admin/criativos | Medio — bloqueia seed de ads via blueprint launcher |
| 6 | Discrepancia CA IC 7d vs 30d (agentes vs seed) | Baixo |
| 6 | LAL ratio 1% nao justificado | Baixo |
| 7 | Acoes Day 14 nao documentadas | Baixo |
| 8 | Gate de volume de pixel pra ativar Day 5 nao quantificado | Medio |

---

## Recomendacao: pode tomar decisao de budget com esse material?

**Parcialmente sim.**

Doug pode decidir:
- [x] Adotar Opcao A (agentes, R$150/dia) ou Opcao B (seed, R$95/dia) — material apresenta as duas claramente.
- [x] Validar que pixel + ad account + BM estao corretos (confirmados pelos agentes).
- [x] Validar copies A/B/C/D (estao completas e validadas pelos agentes originais).

Doug **nao** pode decidir sem pesquisa adicional:
- [ ] Se distribuicao desigual (B) faz sentido vs uniforme (A) — precisa rationale dos agentes ou pelo menos simulacao.
- [ ] Se 5 CAs do seed (incluindo leads + inicheck 30d) fica ou volta pras 4 originais — precisa decidir escopo.
- [ ] Se adicionar copy "Promessa" e copy dedicada Maes Pos-Parto antes do launch, ou seguir com o que tem.

**Proximo passo recomendado:** rodar um ciclo AIOX focado em resolver as 3 lacunas [ALTO/MEDIO] antes de lancar. Alternativa pragmatica: Doug escolhe Opcao A (padrao) ou B (minimalista) com base em tolerancia de gasto atual, lanca, e itera pos Day 4 com dados reais.

---

Compilado por: Claude Code
Data: 2026-04-20
Fontes consultadas:
- `src/lib/blueprints/launch-001.ts` (blueprint DEPRECATED mas com comentarios de rationale pos-mortem)
- `src/app/admin/campanhas/launch-plan/page.tsx` (tela antiga dos agentes com 8 passos + 5 ad sets + 4 copies)
- Banco (via seed `src/app/api/admin/campaigns/blueprint/seed/route.ts`): LaunchBlueprint, LaunchAudience, LaunchAdSet
- `src/lib/gaia-knowledge-seed.ts` (19 entries de knowledge da Gaia com benchmarks CTR/CPA/ROAS)
- `src/app/emagreca-sem-dieta/page.tsx` (landing, depoimentos, proposta de valor)

Versao: 1.0 (living document — atualizar apos cada sprint AIOX ou decisao de Doug)

Assinaturas AIOX: nenhuma ainda (aguarda proximo ciclo Atlas/Morgan/Pax para preencher lacunas e validar oficialmente)

Proximas acoes recomendadas:
1. Doug revisa launch-001.md e decide distribuicao de budget (Opcao A vs B vs pedir proposta C dos agentes)
2. Se houver muitas [LACUNA] criticas, rodar ciclo AIOX focado em cada uma (Morgan pra copy Promessa, Pax pra rationale de budget, Atlas pra gate de volume Day 5)
3. Atualizar seed do LaunchBlueprint pra bater com decisoes tomadas
4. Apos decisoes, adicionar assinaturas AIOX oficiais no rodape
