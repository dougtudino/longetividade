// Base inicial de conhecimento da Gaia. Persistida em AgentKnowledge
// via /api/admin/agents/gaia/seed-knowledge.
//
// Filosofia: este e o ponto de partida. A Gaia pode aprender mais
// atraves de (a) novas entries criadas manualmente por Doug/Barbara,
// (b) observacoes geradas automaticamente apos reviews, (c) pesquisa
// em fontes externas via WebFetch (futuro).

export type SeedKnowledge = {
  kind: "fact" | "rule" | "benchmark" | "reference" | "learning" | "policy";
  title: string;
  body: string;
  source?: string;
  metadata?: Record<string, unknown>;
};

export const GAIA_KNOWLEDGE_SEED: SeedKnowledge[] = [
  // ═══════════════════════════════════════════════════════════
  // FILOSOFIA & REGRAS OPERACIONAIS
  // ═══════════════════════════════════════════════════════════
  {
    kind: "rule",
    title: "Start Small, Test Aggressive, Scale What Works",
    body: `Filosofia operacional da Gaia. Nunca lancar campanha grande sem dados.
Sempre comecar com R$30-50/dia por ad set. Testar 3-5 ad sets em paralelo
(hipoteses de audiencia). Matar os 2 piores em 72h sem apego emocional.
Escalar o vencedor via duplicacao horizontal (nao vertical de +50% que
reseta o aprendizado do algoritmo).`,
    source: "gaia-persona",
  },
  {
    kind: "rule",
    title: "Kill Criteria — quando matar um ad set",
    body: `Criterios cumulativos (basta um para matar):
1. Spend > 3x ticket medio sem 1 venda (ex: gastou R$111 com ticket R$37 = mata)
2. CTR < 0.8% apos 5.000 impressoes (criativo/audiencia nao engaja)
3. CPA > 1.5x ticket apos 3 dias de dados (economicamente inviavel)

Nao matar antes de R$15 de spend — dados insuficientes.
Nao hesitar em matar — apego emocional e o maior inimigo do ROAS.`,
    source: "gaia-persona",
  },
  {
    kind: "rule",
    title: "Scale Criteria — quando escalar",
    body: `Dois tipos de escala:

**Horizontal (preferido):**
ROAS >= 2.0x sustentado por 3+ dias → DUPLICAR o ad set (novo ID, mesma config).
Razao: evita reset do learning phase do algoritmo. Ad set novo comeca
aprendizado mas o original mantem momentum.

**Vertical (secundario):**
ROAS entre 1.5-2.0x → aumentar budget em +20% (nunca mais).
Subir +50% ou mais geralmente reseta o learning phase no Meta. +20% e o
sweet spot que a Meta tolera sem rebalancear.`,
    source: "gaia-persona",
  },
  {
    kind: "rule",
    title: "Fase de Aprendizado (Learning Phase)",
    body: `Nos primeiros 3-7 dias de um novo ad set, o algoritmo Meta esta em
"Learning Phase". Durante essa fase:

- NAO ALTERAR targeting, budget, creative, ou optimization goal
- Qualquer mudanca significativa reseta a fase e perde os dados coletados
- Aguardar 50 eventos de conversao antes de considerar escalar
- CPA e instavel no inicio — comparar com dia 4+ e nao dia 2

Regra: deixar dormir 72h antes do primeiro review.`,
    source: "meta-best-practices",
  },

  // ═══════════════════════════════════════════════════════════
  // BENCHMARKS — WEIGHT LOSS / WELLNESS BRASIL
  // ═══════════════════════════════════════════════════════════
  {
    kind: "benchmark",
    title: "CPA benchmark — ebook emagrecimento R$37-97 Brasil",
    body: `Faixa esperada de CPA para produtos digitais de wellness/emagrecimento
no Brasil (front-end R$37-97):

- Excelente: R$ 12 - R$ 20
- Saudavel:  R$ 20 - R$ 35
- Marginal:  R$ 35 - R$ 55
- Ruim:      > R$ 55 (considerar kill)

Fonte: observacoes de mercado brasileiro 2024-2025. Varia por sazonalidade
(janeiro = ano novo = CPA baixo; dezembro = concorrencia alta = CPA alto).`,
    source: "market-observation-2025",
    metadata: { vertical: "weight-loss", region: "BR", price_range: "37-97" },
  },
  {
    kind: "benchmark",
    title: "CTR benchmark — Feed Instagram/Facebook BR",
    body: `Click-through rate esperado em anuncios de feed BR:

- Excelente: > 2.5% (criativo muito relevante, audiencia quente)
- Saudavel:  1.5% - 2.5%
- Marginal:  0.8% - 1.5%
- Ruim:      < 0.8% (considerar kill apos 5k impressoes)

Stories costuma ser 0.3-0.5pp menor que Feed na mesma audiencia.`,
    source: "market-observation-2025",
  },
  {
    kind: "benchmark",
    title: "Frequency threshold — quando trocar criativo",
    body: `Frequencia (impressions / reach) indica cansaco de criativo:

- < 2.0: audiencia fresca, deixar rodar
- 2.0 - 3.0: comecando a saturar, preparar criativo novo
- 3.0 - 4.0: saturado, trocar criativo AGORA
- > 4.0: fadiga severa, pausar ad set e renovar

Em audiencias retargeting (warm), tolerancia e maior (ate ~5).`,
    source: "meta-best-practices",
  },

  // ═══════════════════════════════════════════════════════════
  // META AD POLICY — WEIGHT LOSS
  // ═══════════════════════════════════════════════════════════
  {
    kind: "policy",
    title: "Meta Ad Policy — triggers automaticos de rejeicao weight loss",
    body: `Palavras e conceitos que disparam revisao automatica e frequente rejeicao:

1. Numeros especificos de peso: "-4kg", "perca X quilos", "10kg em 30 dias"
2. Timeframes explicitos: "em 7 dias", "em 1 mes" (quando associado a resultado fisico)
3. Antes/depois: imagens comparativas (qualquer formato)
4. Body shaming: "gordura", "celulite", "barriga", "flacidez"
5. Body parts: "barriga chapada", "coxas magras" (foco em parte do corpo)
6. Quick fix: "milagroso", "instantaneo", "sem esforco"
7. Medical claims: "cura", "elimina", "cientificamente comprovado" (sem substancia)
8. Negative self-perception: "voce se odeia?", "vergonha do espelho"

SAFE: metodo, rotina, reeducacao, relacao com a comida, bem-estar, disposicao,
autocuidado, confianca, energia, qualidade de vida.`,
    source: "meta-advertising-standards-2024",
  },
  {
    kind: "policy",
    title: "Account scrutiny — contas novas vs antigas",
    body: `Contas novas (< 3 meses, sem historico) recebem scrutiny maior:

- Primeiras 10 campanhas passam por revisao manual (~15min-4h)
- Qualquer rejeicao vale "strike" — 3 strikes pode suspender a conta
- Evitar palavras risky nos primeiros 30 dias
- Preferir headlines safe mesmo que convertam menos

Contas estabelecidas (> 6 meses, historico limpo) tem auto-aprovacao
mais rapida (~5min) e toleram pushes maiores de copy.

Bárbara BM criada 2026-04-11 = scrutiny MAXIMO nos proximos 90 dias.`,
    source: "gaia-persona",
    metadata: { account_age_days: 0, stricture: "maximum" },
  },

  // ═══════════════════════════════════════════════════════════
  // OTIMIZACAO & AUDIENCIAS
  // ═══════════════════════════════════════════════════════════
  {
    kind: "fact",
    title: "Broad targeting + conversion optimization > interest targeting",
    body: `Desde 2023-2024, a Meta recomenda (e comprovou em testes) que
broad targeting (sem flexible_spec de interesse, so idade/genero/pais)
com otimizacao por Purchase event performa igual ou melhor que targeting
especifico de interesses.

Razao: o algoritmo ja tem dados suficientes do Pixel para encontrar
converters sem precisar de hints. Interest targeting ajuda em verticais
muito nichados (hobby ultra-especifico), nao em mass market como emagrecimento.

Aplicar: comecar amplo, deixar Meta otimizar.`,
    source: "meta-best-practices-2024",
  },
  {
    kind: "fact",
    title: "Advantage+ Audience — quando ligar",
    body: `Advantage+ Audience e o recurso onde Meta expande automaticamente
a segmentacao alem do que voce especificou (via IA).

Quando ligar (advantage_audience=1):
- Apos identificar ad set vencedor (ROAS >= 1.5 sustentado)
- Para ESCALAR alcance de criativos provados
- Quando audiencia base esta saturando (frequencia > 3)

Quando deixar desligado (advantage_audience=0):
- Primeiros 7 dias de TESTE (voce quer dados limpos por audiencia)
- Audiencia retargeting (warm, ja qualificada, expansao contamina)
- Quando voce esta aprendendo qual angulo converte`,
    source: "meta-best-practices-2024",
  },
  {
    kind: "fact",
    title: "Tamanho minimo de audiencia para lookalike",
    body: `Lookalike audiences precisam de uma source audience com pelo menos
100 eventos para funcionar, idealmente 1.000+.

No Longetividade (2026-04-11):
- Source "Compradores" = 0 (nao lancou ainda)
- Source "PageView 30d" = 0 (trafego zero)
- Source "Engaged Page" = ~27 fans (insuficiente)

Esperar ate ter pelo menos 500 PageView 30d OU 100 compradores para criar
lookalike 1%. Antes disso, broad targeting e superior.`,
    source: "gaia-observation-2026-04-11",
  },

  // ═══════════════════════════════════════════════════════════
  // GOOGLE ADS — EQUIVALENTES E DIFERENCAS
  // ═══════════════════════════════════════════════════════════
  {
    kind: "reference",
    title: "Google Ads equivalentes a Meta",
    body: `Quando expandir para Google Ads (story futura STORY-GADS-001):

| Meta                    | Google Ads                           |
|-------------------------|--------------------------------------|
| Campaign objective      | Campaign type (Search/Display/PMax)  |
| Ad set                  | Ad group                             |
| Audience (interests)    | Audience signals / In-market         |
| Custom audience         | Remarketing list / Customer Match    |
| Lookalike               | Similar audiences (deprecated 2023)  |
| Purchase optimization   | Conversion (Purchase) + tROAS        |
| CBO                     | Portfolio bidding                    |

Diferenca critica: Google Ads valoriza SEARCH INTENT (query) sobre
INTEREST. Para weight loss no Google, priorizar Search com keywords
de intencao ("como emagrecer", "metodo emagrecimento") e Performance Max
para expansao.`,
    source: "gaia-persona",
  },

  // ═══════════════════════════════════════════════════════════
  // LANDING PAGE & CONVERSAO
  // ═══════════════════════════════════════════════════════════
  {
    kind: "fact",
    title: "Sinal claro: CTR alto + conversion baixa = problema na landing",
    body: `Diagnostico rapido quando um ad set tem:
- CTR > 1.5% (anuncio chamativo, pessoas clicam)
- Conversion rate < 0.5% (chegam mas nao compram)
- Duracao media de sessao < 20s (bounce)

Problema nao e o criativo. E a LANDING PAGE.

Acoes:
1. Checar tempo de load (Core Web Vitals) — > 3s mata conversao
2. Checar consistencia: copy do anuncio bate com headline da landing?
3. Checar above-the-fold: preco visivel? CTA claro?
4. Checar mobile: 85% do trafego vem de mobile em BR

Delegar para @dev fixar a landing antes de mexer em creative.`,
    source: "gaia-persona",
  },

  // ═══════════════════════════════════════════════════════════
  // GROWTH OPERATOR (Sprint 1) — 5 regras novas
  // ═══════════════════════════════════════════════════════════
  {
    kind: "rule",
    title: "Broad + Advantage+ targeting > interest stacking",
    body: `Quando CTR cai com interest stacking (ex: ad set tem 3-5 interesses
empilhados), Meta best practice 2024+ diz: testar BROAD com Advantage+
Audience ANTES de matar.

Aplicacao Gaia:
- Se ad set com flexible_spec[interests] tem CTR < 1% mas frequency > 3
  → propor FIX_AUDIENCE removendo interests + ligando advantage_audience=1
- Manter geo, idade, genero como restricao base
- Aguardar 48-72h pra avaliar (learning phase reset)

Razao: o algoritmo Meta hoje encontra converters via Pixel data sozinho,
sem precisar de hints de interesse. Interest stacking restringe alcance
sem ganho de qualidade na maioria dos casos.`,
    source: "meta-best-practices-2024",
    metadata: { trigger_verdict: "FIX_AUDIENCE", priority: "high" },
  },
  {
    kind: "rule",
    title: "Creative rotation — quando trocar a arte",
    body: `Sinais que indicam fadiga de criativo (precisa FIX_CREATIVE):

1. Frequency > 2.5 em 7 dias E CTR caindo > 20% semana sobre semana
2. Quality_ranking = below_average_offers/35/20 com CTR ainda OK
3. Engagement_rate_ranking caiu de average pra below
4. Mesmo criativo rodando ha > 14 dias sem variacao

Regra: trocar criativo NAO pausa o ad — apenas substitui o creative_id.
Aprendizado da audiencia continua intacto.

Anti-pattern: trocar criativo + audiencia + budget juntos. Muda 1 coisa
por vez pra saber o que recuperou performance.`,
    source: "meta-best-practices-2024",
    metadata: { trigger_verdict: "FIX_CREATIVE", priority: "high" },
  },
  {
    kind: "learning",
    title: "Funnel leak detection — quando o problema esta fora do Meta",
    body: `Padrao classico:
- CTR > 1% (anuncio funciona)
- Spend > 3x ticket
- Conversoes = 0

Conclusao: o anuncio NAO e o problema. Investigar funil downstream.

Bottlenecks comuns por ordem de probabilidade:
1. **landing**: pixel nao dispara, headline nao bate, mobile quebrado
2. **offer**: preco/garantia/bonus nao convencem (PageView alto, IC zero)
3. **checkout**: friction Hotmart (parcelamento, taxa, etapa extra)
4. **top_of_funnel**: audiencia nao se qualifica (pouco InitiateCheckout)

Acao Gaia: criar DIAGNOSE_FUNNEL com bottleneck identificado e
recommendationText. NAO matar o ad set — o ad funciona. Delegar fix
pro Doug (@dev) ou Barbara (@offer).

Aprendizado historico (LAUNCH-001 abr/2026): R$597 gastos, 0 vendas,
CTR 1.77%. Bottleneck era top_of_funnel + landing — anuncio atraia
trafego mas oferta R$37 nao filtrava intencao real de compra.`,
    source: "gaia-launch-001-postmortem-2026-04",
    metadata: { trigger_verdict: "DIAGNOSE_FUNNEL", priority: "critical" },
  },
  {
    kind: "rule",
    title: "Audience expansion antes de KILL",
    body: `Antes de matar um ad set por CTR baixo, considerar:

- frequency >= 3.0 com impressions >= 10k = audiencia saturou (mesmo
  publico vendo o ad N vezes). Soluction: FIX_AUDIENCE (ampliar) NAO KILL.

- audience_saturation_score > 0.7 (quando Meta expoe esse campo) tambem
  indica saturacao.

Ordem de avaliacao da Gaia:
1. PROPOSE_ITERATION (campanha toda morreu)
2. DIAGNOSE_FUNNEL (anuncio bom, problema fora)
3. FIX_AUDIENCE (audiencia saturou)
4. FIX_CREATIVE (quality ranking ruim)
5. KILL (nada disso aplicou)

Razao: KILL eh terminal — perde aprendizado da audiencia, do creative,
do horario otimo. Correcao cirurgica preserva 80% do que funcionou.`,
    source: "gaia-persona",
    metadata: { trigger_verdict: "FIX_AUDIENCE", priority: "high" },
  },
  {
    kind: "reference",
    title: "Copy A/B — quando considerar FIX_COPY",
    body: `Sinal claro de que COPY (e nao audiencia/creative) eh o problema:

Se 2 ad sets compartilham:
- Mesma audiencia base
- Imagens diferentes
- Copies diferentes

E divergem em CTR > 50% (ex: ad set A 1.2% vs ad set B 0.6%), o fator
mais provavel eh COPY (porque audiencia + criativo sao testaveis
isoladamente em outras dimensions).

Acao: FIX_COPY no pior, mantendo imagem original. Briefing pra Uma:
adaptar tom/headline do vencedor. Nao trocar imagem (varia 2 coisas =
nao aprende nada).

Anti-pattern: julgar COPY isoladamente. Copy so importa se tudo mais
foi controlado.`,
    source: "gaia-persona",
    metadata: { trigger_verdict: "FIX_COPY", priority: "normal" },
  },
];
