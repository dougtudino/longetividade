// Base de conhecimento da Luna (@social) — estrategias de growth,
// analise de publico, referencias de especialistas, taticas de
// engajamento pra Instagram/Facebook no nicho wellness Brasil.
//
// Persistida em AgentKnowledge com agentId="luna".
// Luna consulta essa base antes de criar conteudo ou sugerir estrategia.

import type { SeedKnowledge } from "./gaia-knowledge-seed";

export const LUNA_KNOWLEDGE_SEED: SeedKnowledge[] = [
  // ═══════════════════════════════════════════════════════
  // PUBLICO-ALVO — QUEM E A AUDIENCIA
  // ═══════════════════════════════════════════════════════
  {
    kind: "fact",
    title: "Persona primaria: Mulher 30-50 anos BR",
    body: `Perfil da compradora ideal do Metodo S.E.M:

**Demografia:**
- Mulher, 30-50 anos
- Classe B/C, renda familiar R$3-8k/mes
- Mora em capitais ou cidades medias
- Mae (muitas com filhos pequenos)
- Trabalha fora ou e autonoma

**Dores:**
- Frustrada com dietas que nao funcionam
- Culpa apos comer "errado"
- Falta de tempo pra cozinhar/exercitar
- Comparacao com outras mulheres nas redes
- Pressao estetica vs realidade da rotina

**Desejos:**
- Emagrecer SEM sofrimento
- Comer com prazer e sem culpa
- Rotina simples que caiba na vida
- Se sentir bem (nao necessariamente "ficar magra")
- Pertencer a uma comunidade de apoio

**Comportamento digital:**
- Instagram e a rede principal (85% do tempo)
- Consome Stories antes de Feed
- Salva posts com dicas praticas
- Compartilha conteudo motivacional
- Compra por impulso emocional (identificacao > logica)

**Gatilhos de compra:**
- Identificacao ("isso sou eu!")
- Prova social ("se ela conseguiu...")
- Simplicidade ("so isso? consigo fazer")
- Urgencia leve ("vagas limitadas")
- Garantia ("posso devolver se nao gostar")`,
    source: "luna-persona-research",
  },
  {
    kind: "fact",
    title: "Horarios de pico de engajamento Brasil",
    body: `Horarios com maior engagement pra nicho wellness feminino BR:

**Instagram Feed:**
- Seg-Sex: 11h-13h (pausa almoco) e 19h-21h (pos-trabalho)
- Sabado: 10h-12h (manha relaxada)
- Domingo: 18h-20h (preparacao da semana)
- MELHOR DIA: quarta-feira (meio da semana, pico de engajamento)

**Instagram Stories:**
- 7h-9h (rotina matinal — cafe, transporte)
- 12h-13h (almoco)
- 20h-22h (antes de dormir — maior consumo)

**Instagram Reels:**
- 12h (almoco) e 18h-20h (pos-trabalho)
- Reels postados nesse horario tem 2-3x mais alcance

**Facebook:**
- 13h-16h (tarde, publico mais velho)
- Posts organicos no FB tem 10-20% do alcance do IG

**Regra:** postar no horario de CONSUMO, nao de producao.
A audiencia consome de manha e noite, produz de tarde.`,
    source: "social-media-research-2025",
  },

  // ═══════════════════════════════════════════════════════
  // ESTRATEGIA DE GROWTH — COMO CRESCER
  // ═══════════════════════════════════════════════════════
  {
    kind: "rule",
    title: "Regra 80/20 — conteudo de valor vs promocional",
    body: `80% dos posts devem ser VALOR PURO (educar, inspirar, entreter).
20% podem ser PROMOCIONAL (vender, CTA, oferta).

Distribuicao semanal (6 posts):
- 2x educativo (Pilar S — nutricao)
- 2x emocional (Pilar E — conexao)
- 1x movimento (Pilar M — tutorial)
- 1x promocional (soft sell — max 1x/semana)

Se postar mais promo que 20%: engagement cai, followers param de
crescer, algoritmo penaliza. A audiencia SENTE quando esta sendo
vendida a cada post.

Excecao: lancamento (1 semana intensa de promo = ok, depois volta pro 80/20).`,
    source: "growth-best-practices",
  },
  {
    kind: "rule",
    title: "Estrategia de hashtags 2025 — menos e mais",
    body: `Instagram 2025: hashtags perderam relevancia vs 2020. O que funciona:

**Quantidade:** 5-8 hashtags (nao 30). Menos e mais.

**Mix ideal:**
- 2 de nicho grande (500k-2M posts): #reeducacaoalimentar #emagrecimento
- 2 de nicho medio (50k-500k): #metodosem #alimentacaosemdieta
- 2 de nicho pequeno (<50k): #longetividade #mulherreal
- 1 de comunidade: #mulheresqueinspiram

**Onde colocar:** no PRIMEIRO COMENTARIO (nao na legenda).
Legenda limpa converte melhor. Hashtags no comentario tem mesmo efeito.

**Hashtags proprias do Longetividade:**
#metodosem #longetividade #emagrecessemdieta #pilarSEM

**Nao usar:** hashtags genericas demais (#fitness #gym #health).
Atraem bots e publico errado.`,
    source: "instagram-hashtag-research-2025",
  },
  {
    kind: "rule",
    title: "Reels: o formato que mais cresce alcance em 2025",
    body: `Reels e o formato com MAIOR alcance organico no Instagram em 2025.

**Por que:** Instagram prioriza Reels no algoritmo pra competir com TikTok.
Um Reel pode alcancar 10-50x mais pessoas que um post de feed.

**Regras pra Reels que performam:**
1. HOOK nos primeiros 3 segundos (pergunta, afirmacao forte, visual impactante)
2. Duracao: 15-30s (sweet spot). Ate 60s se o conteudo justificar.
3. Texto overlay: SEMPRE (90% assistem sem som)
4. Trending audio: usar musica/som popular aumenta distribuicao
5. CTA no final: "Salva pra ver depois" ou "Manda pra uma amiga"
6. Formato vertical: 1080x1920 (NUNCA horizontal)

**Reels pro Longetividade:**
- "3 trocas simples no cafe da manha" (15s, com texto overlay)
- "Alongamento de 60 segundos no sofa" (tutorial, timer visual)
- "O que eu como num dia inteiro" (lifestyle, 30s)
- "Mito vs verdade sobre dieta" (trend format, 15s)

**Frequencia ideal:** 3-4 Reels/semana. Mix com carrosseis (2-3) e Stories (diario).`,
    source: "reels-strategy-2025",
  },
  {
    kind: "rule",
    title: "Carrossei: o formato que mais SALVA e COMPARTILHA",
    body: `Carrosseis (posts com multiplas imagens/slides) sao o formato com:
- Maior taxa de SAVE (pessoas salvam pra ver depois)
- Maior taxa de SHARE (mandam pra amigas)
- Maior tempo de permanencia (algoritmo valoriza)

**Estrutura ideal de carrossel (7-10 slides):**
Slide 1: HOOK forte (titulo que faz parar de scrollar)
Slide 2-3: Problema (identificacao)
Slide 4-6: Solucao (conteudo de valor)
Slide 7: Resumo visual
Slide 8: CTA ("Salva esse post" ou "Manda pra uma amiga que precisa")

**Design:**
- Fundo consistente (usar paleta do site: verde-oliva + bege)
- Fonte legivel (Nunito ou similar, min 24pt)
- 1 ideia por slide (nao sobrecarregar)
- Seta ou indicador visual "deslize →" no slide 1

**Exemplo pro Longetividade:**
"5 sinais de que voce come por emocao (e o que fazer)"
- Slide 1: titulo + "deslize →"
- Slides 2-6: um sinal por slide com dica
- Slide 7: resumo visual
- Slide 8: "Salva esse post pra lembrar 💚"`,
    source: "carousel-strategy-2025",
  },

  // ═══════════════════════════════════════════════════════
  // REFERENCIAS — CONTAS PRA ESTUDAR
  // ═══════════════════════════════════════════════════════
  {
    kind: "reference",
    title: "Contas de referencia no nicho wellness BR",
    body: `Contas pra estudar estilo, formato, engagement e tom:

**Nutricao/Emagrecimento:**
- @drabarbarapina — nutricionista, posts educativos simples
- @saborcomvida — receitas praticas, carrosseis bonitos
- @nutritalitacamargo — reeducacao alimentar, tom acolhedor

**Bem-estar/Lifestyle feminino:**
- @patriciadavidson — wellness holistic, alta producao visual
- @baborealfood — comida real, anti-dieta, comunidade forte
- @giaborelli — movimento + emocional, reels criativos

**Growth/Infoproduto:**
- @ladydark — growth hacking BR, estrategias de stories
- @hyfrancisco — reels virais, hooks poderosos
- @sobralfilho — trafego pago + organico integrado

**O que estudar em cada conta:**
1. Tipo de conteudo que mais engaja (ver posts com mais likes/comentarios)
2. Formato predominante (reels vs carrossel vs imagem)
3. Tom de voz (formal vs casual vs humor)
4. Frequencia de postagem
5. Como fazem CTA (call to action) sem parecer vendedor
6. Bio e destaques (como organizam)

**Nao copiar:** adaptar pra voz da Barbara (pessoal, acolhedora, real).
O diferencial do Longetividade e ser HUMANO, nao corporativo.`,
    source: "luna-competitor-research",
  },
  {
    kind: "reference",
    title: "Taticas de especialistas em growth Instagram",
    body: `Taticas validadas de especialistas em crescimento organico:

**Alex Hormozi (adaptado pra BR):**
- "Give away the WHAT, sell the HOW"
- Poste TUDO que voce sabe de graca. Quem quer o passo-a-passo compra.
- Aplicacao: posts educativos completos do S.E.M. Quem quer o ebook
  (organizado + cardapio + checklist) compra.

**Gary Vee (adaptado pra BR):**
- "Jab, jab, jab, right hook" = valor, valor, valor, venda.
- Nunca venda sem ter dado valor ANTES.
- Aplicacao: 4-5 posts de valor, depois 1 promo.

**Rachel Hollis (adaptado pra nicho feminino):**
- Vulnerabilidade vende. Compartilhar fracassos (sem drama) gera conexao.
- "Eu tambem ja passei por isso" e mais poderoso que "Siga esses 5 passos".
- Aplicacao: Barbara compartilha jornada real (nao numeros de peso).

**Sobral (trafego BR):**
- Organico e pago devem ter a MESMA mensagem.
- Se o organico fala de "reeducacao sem culpa", o ad tambem.
- Se mudar a mensagem, confunde a audiencia.
- Aplicacao: copies do Luna alinhadas com copies da Gaia.

**Estrategia "Comment First":**
- Antes de postar, va em 10 contas do nicho e comente GENUINAMENTE.
- Nao "lindo post 😍" — comente algo relevante (2-3 linhas).
- Isso traz seguidores organicos de qualidade (vieram pela interacao, nao pelo algoritmo).
- 15 min/dia de comentarios = crescimento consistente.`,
    source: "growth-specialists-research",
  },

  // ═══════════════════════════════════════════════════════
  // ENGAGEMENT — COMO INTERAGIR
  // ═══════════════════════════════════════════════════════
  {
    kind: "rule",
    title: "Responder comentarios: regras de ouro",
    body: `Regras pra responder comentarios como Barbara:

**Tempo:** responder em < 2h (algoritmo favorece posts com respostas rapidas)

**Tom:** sempre acolhedor, nunca defensivo. "Obrigada por compartilhar!" mesmo pra criticas.

**Tamanho:** respostas de 2-3 frases (nao 1 palavra, nao 1 paragrafo).

**Perguntas:** SEMPRE fazer uma pergunta de volta.
- "Que legal! Qual dica voce mais usa no dia a dia?"
- "Sim! Voce ja tentou trocar X por Y?"
- Perguntas geram mais replies = mais engagement = mais alcance.

**Emojis:** usar com moderacao (1-2 por resposta). Nao exagerar.

**DMs:** quando alguem comenta algo pessoal ou pergunta sobre preco,
responder na DM (mais intimo, maior conversao).

**Comentarios negativos:**
- Nunca deletar (exceto spam/hate)
- Responder com empatia: "Entendo seu ponto! O S.E.M pode nao ser pra todo mundo, e tudo bem."
- Audiencia ve como voce trata critica — profissionalismo converte.`,
    source: "engagement-best-practices",
  },
  {
    kind: "rule",
    title: "Stories interativos: o motor de engajamento",
    body: `Stories com interacao (enquete, quiz, pergunta, slider) tem 2-3x mais
views que stories estaticos. O algoritmo Instagram prioriza contas
que USAM features de interacao.

**Sequencia ideal de Stories diarios (5-7 por dia):**
1. Bom dia + enquete casual ("Como voce acordou? 😊 / 😐 / 😴")
2. Dica do dia (texto + imagem do pilar do dia)
3. Bastidor (mostrando rotina real, comida real, casa real)
4. Pergunta aberta ("Qual sua maior dificuldade com alimentacao?")
5. Resposta a uma pergunta que recebeu (print da DM com autorizacao)
6. CTA suave ("Link na bio pra conhecer o Metodo S.E.M")

**Features pra usar:**
- Enquete (2 opcoes): engajamento facil, todo mundo clica
- Quiz (3-4 opcoes): educativo + divertido
- Slider (emoji): emocional, bom pra "quanto voce concorda com..."
- Caixinha de perguntas: gera conteudo (responde nos Stories seguintes)
- Contagem regressiva: pra lancamentos ou lives

**Horarios:** postar 2-3 stories de manha (8h-9h), 2-3 a noite (20h-22h).
Nao postar tudo de uma vez — distribuir ao longo do dia.`,
    source: "stories-strategy-2025",
  },

  // ═══════════════════════════════════════════════════════
  // METRICAS — O QUE ACOMPANHAR
  // ═══════════════════════════════════════════════════════
  {
    kind: "benchmark",
    title: "Metricas de referencia pra conta <10k seguidores",
    body: `Benchmarks pra contas pequenas (< 10k) no nicho wellness BR:

**Engagement Rate (ER):**
- Excelente: > 6%
- Bom: 3-6%
- Medio: 1.5-3%
- Ruim: < 1.5%
- Calculo: (likes + comments) / followers × 100

**Alcance por post (% dos seguidores):**
- Reels: 30-100% (pode ultrapassar seguidores)
- Carrossel: 15-30%
- Imagem unica: 10-20%
- Stories: 5-15%

**Taxa de crescimento semanal:**
- Bom: +1-2% da base/semana
- Medio: +0.5-1%
- Ruim: <0.5% ou estagnado

**Saves e Shares (metricas que mais importam em 2025):**
- Salvar: 1-3% do alcance e bom
- Compartilhar: 0.5-2% do alcance e bom
- Esses sinais pesam MAIS que likes pro algoritmo

**O que acompanhar semanalmente:**
1. ER medio dos posts da semana
2. Melhor post (qual formato, pilar, horario)
3. Pior post (por que nao engajou?)
4. Crescimento de seguidores (net new)
5. DMs recebidas (sinal de interesse quente)
6. Cliques no link da bio (proxy de intencao de compra)`,
    source: "social-metrics-benchmarks-2025",
  },

  // ═══════════════════════════════════════════════════════
  // COMPLIANCE — O QUE NAO POSTAR
  // ═══════════════════════════════════════════════════════
  {
    kind: "policy",
    title: "O que NUNCA postar no Instagram do Longetividade",
    body: `Regras absolutas pra evitar ban + manter credibilidade:

**Nunca postar:**
1. Fotos antes/depois de corpo (viola politicas Meta + gera body shaming)
2. Numeros especificos de peso perdido ("perdi 4kg em 30 dias")
3. Promessas de resultado ("voce VAI emagrecer")
4. Claims medicos ("cura ansiedade", "elimina gordura")
5. Linguagem de urgencia toxica ("ULTIMA CHANCE", "VOcE PRECISA")
6. Comparacao com outras dietas de forma negativa
7. Screenshots de balanca (triggers body image issues)
8. Conteudo que possa ser interpretado como body shaming

**Sempre substituir por:**
- "4kg em 30 dias" → "se sentindo mais leve"
- "emagrecer" → "nova relacao com a comida"
- "voce VAI conseguir" → "cada passo conta"
- "antes e depois" → depoimento emocional (como se SENTE, nao como PARECE)
- "dieta" → "reeducacao" ou "metodo"

**Linguagem da marca Longetividade:**
Tom: acolhedor, como amiga de confianca
Voz: 1a pessoa (Barbara), nao corporativo
Emocao: empoderamento gentil, nao pressao
Objetivo: fazer a pessoa se sentir BEM, nao CULPADA`,
    source: "luna-compliance-rules",
  },
];
