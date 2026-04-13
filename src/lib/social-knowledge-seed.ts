// Base de conhecimento da Luna (@social) — estratégias de growth,
// análise de público, referências de especialistas, táticas de
// engajamento pra Instagram/Facebook no nicho wellness Brasil.
//
// Persistida em AgentKnowledge com agentId="luna".
// Luna consulta essa base antes de criar conteúdo ou sugerir estratégia.

import type { SeedKnowledge } from "./gaia-knowledge-seed";

export const LUNA_KNOWLEDGE_SEED: SeedKnowledge[] = [
  // ═══════════════════════════════════════════════════════
  // PÚBLICO-ALVO — QUEM É A AUDIÊNCIA
  // ═══════════════════════════════════════════════════════
  {
    kind: "fact",
    title: "Persona primária: Mulher 30-50 anos BR",
    body: `Perfil da compradora ideal do Método S.E.M:

**Demografia:**
- Mulher, 30-50 anos
- Classe B/C, renda familiar R$3-8k/mês
- Mora em capitais ou cidades médias
- Mãe (muitas com filhos pequenos)
- Trabalha fora ou é autônoma

**Dores:**
- Frustrada com dietas que não funcionam
- Culpa após comer "errado"
- Falta de tempo pra cozinhar/exercitar
- Comparação com outras mulheres nas redes
- Pressão estética vs realidade da rotina

**Desejos:**
- Emagrecer SEM sofrimento
- Comer com prazer e sem culpa
- Rotina simples que caiba na vida
- Se sentir bem (não necessariamente "ficar magra")
- Pertencer a uma comunidade de apoio

**Comportamento digital:**
- Instagram é a rede principal (85% do tempo)
- Consome Stories antes de Feed
- Salva posts com dicas práticas
- Compartilha conteúdo motivacional
- Compra por impulso emocional (identificação > lógica)

**Gatilhos de compra:**
- Identificação ("isso sou eu!")
- Prova social ("se ela conseguiu...")
- Simplicidade ("só isso? consigo fazer")
- Urgência leve ("vagas limitadas")
- Garantia ("posso devolver se não gostar")`,
    source: "luna-persona-research",
  },
  {
    kind: "fact",
    title: "Horários de pico de engajamento Brasil",
    body: `Horários com maior engagement pra nicho wellness feminino BR:

**Instagram Feed:**
- Seg-Sex: 11h-13h (pausa almoço) e 19h-21h (pós-trabalho)
- Sábado: 10h-12h (manhã relaxada)
- Domingo: 18h-20h (preparação da semana)
- MELHOR DIA: quarta-feira (meio da semana, pico de engajamento)

**Instagram Stories:**
- 7h-9h (rotina matinal — café, transporte)
- 12h-13h (almoço)
- 20h-22h (antes de dormir — maior consumo)

**Instagram Reels:**
- 12h (almoço) e 18h-20h (pós-trabalho)
- Reels postados nesse horário têm 2-3x mais alcance

**Facebook:**
- 13h-16h (tarde, público mais velho)
- Posts orgânicos no FB têm 10-20% do alcance do IG

**Regra:** postar no horário de CONSUMO, não de produção.
A audiência consome de manhã e noite, produz de tarde.`,
    source: "social-media-research-2025",
  },

  // ═══════════════════════════════════════════════════════
  // ESTRATÉGIA DE GROWTH — COMO CRESCER
  // ═══════════════════════════════════════════════════════
  {
    kind: "rule",
    title: "Regra 80/20 — conteúdo de valor vs promocional",
    body: `80% dos posts devem ser VALOR PURO (educar, inspirar, entreter).
20% podem ser PROMOCIONAL (vender, CTA, oferta).

Distribuição semanal (6 posts):
- 2x educativo (Pilar S — nutrição)
- 2x emocional (Pilar E — conexão)
- 1x movimento (Pilar M — tutorial)
- 1x promocional (soft sell — max 1x/semana)

Se postar mais promo que 20%: engagement cai, followers param de
crescer, algoritmo penaliza. A audiência SENTE quando está sendo
vendida a cada post.

Exceção: lançamento (1 semana intensa de promo = ok, depois volta pro 80/20).`,
    source: "growth-best-practices",
  },
  {
    kind: "rule",
    title: "Estratégia de hashtags 2025 — menos é mais",
    body: `Instagram 2025: hashtags perderam relevância vs 2020. O que funciona:

**Quantidade:** 5-8 hashtags (não 30). Menos é mais.

**Mix ideal:**
- 2 de nicho grande (500k-2M posts): #reeducacaoalimentar #emagrecimento
- 2 de nicho médio (50k-500k): #metodosem #alimentacaosemdieta
- 2 de nicho pequeno (<50k): #longetividade #mulherreal
- 1 de comunidade: #mulheresqueinspiram

**Onde colocar:** no PRIMEIRO COMENTÁRIO (não na legenda).
Legenda limpa converte melhor. Hashtags no comentário têm mesmo efeito.

**Hashtags próprias do Longetividade:**
#metodosem #longetividade #emagrecessemdieta #pilarSEM

**Não usar:** hashtags genéricas demais (#fitness #gym #health).
Atraem bots e público errado.`,
    source: "instagram-hashtag-research-2025",
  },
  {
    kind: "rule",
    title: "Reels: o formato que mais cresce alcance em 2025",
    body: `Reels é o formato com MAIOR alcance orgânico no Instagram em 2025.

**Por quê:** Instagram prioriza Reels no algoritmo pra competir com TikTok.
Um Reel pode alcançar 10-50x mais pessoas que um post de feed.

**Regras pra Reels que performam:**
1. HOOK nos primeiros 3 segundos (pergunta, afirmação forte, visual impactante)
2. Duração: 15-30s (sweet spot). Até 60s se o conteúdo justificar.
3. Texto overlay: SEMPRE (90% assistem sem som)
4. Trending audio: usar música/som popular aumenta distribuição
5. CTA no final: "Salva pra ver depois" ou "Manda pra uma amiga"
6. Formato vertical: 1080x1920 (NUNCA horizontal)

**Reels pro Longetividade:**
- "3 trocas simples no café da manhã" (15s, com texto overlay)
- "Alongamento de 60 segundos no sofá" (tutorial, timer visual)
- "O que eu como num dia inteiro" (lifestyle, 30s)
- "Mito vs verdade sobre dieta" (trend format, 15s)

**Frequência ideal:** 3-4 Reels/semana. Mix com carrosséis (2-3) e Stories (diário).`,
    source: "reels-strategy-2025",
  },
  {
    kind: "rule",
    title: "Carrossel: o formato que mais SALVA e COMPARTILHA",
    body: `Carrosséis (posts com múltiplas imagens/slides) são o formato com:
- Maior taxa de SAVE (pessoas salvam pra ver depois)
- Maior taxa de SHARE (mandam pra amigas)
- Maior tempo de permanência (algoritmo valoriza)

**Estrutura ideal de carrossel (7-10 slides):**
Slide 1: HOOK forte (título que faz parar de scrollar)
Slide 2-3: Problema (identificação)
Slide 4-6: Solução (conteúdo de valor)
Slide 7: Resumo visual
Slide 8: CTA ("Salva esse post" ou "Manda pra uma amiga que precisa")

**Design:**
- Fundo consistente (usar paleta do site: verde-oliva + bege)
- Fonte legível (Nunito ou similar, min 24pt)
- 1 ideia por slide (não sobrecarregar)
- Seta ou indicador visual "deslize →" no slide 1

**Exemplo pro Longetividade:**
"5 sinais de que você come por emoção (e o que fazer)"
- Slide 1: título + "deslize →"
- Slides 2-6: um sinal por slide com dica
- Slide 7: resumo visual
- Slide 8: "Salva esse post pra lembrar 💚"`,
    source: "carousel-strategy-2025",
  },

  // ═══════════════════════════════════════════════════════
  // REFERÊNCIAS — CONTAS PRA ESTUDAR
  // ═══════════════════════════════════════════════════════
  {
    kind: "reference",
    title: "Contas de referência no nicho wellness BR",
    body: `Contas pra estudar estilo, formato, engagement e tom:

**Nutrição/Emagrecimento:**
- @drabarbarapina — nutricionista, posts educativos simples
- @saborcomvida — receitas práticas, carrosséis bonitos
- @nutritalitacamargo — reeducação alimentar, tom acolhedor

**Bem-estar/Lifestyle feminino:**
- @patriciadavidson — wellness holístico, alta produção visual
- @baborealfood — comida real, anti-dieta, comunidade forte
- @giaborelli — movimento + emocional, reels criativos

**Growth/Infoproduto:**
- @ladydark — growth hacking BR, estratégias de stories
- @hyfrancisco — reels virais, hooks poderosos
- @sobralfilho — tráfego pago + orgânico integrado

**O que estudar em cada conta:**
1. Tipo de conteúdo que mais engaja (ver posts com mais likes/comentários)
2. Formato predominante (reels vs carrossel vs imagem)
3. Tom de voz (formal vs casual vs humor)
4. Frequência de postagem
5. Como fazem CTA (call to action) sem parecer vendedor
6. Bio e destaques (como organizam)

**Não copiar:** adaptar pra voz da Barbara (pessoal, acolhedora, real).
O diferencial do Longetividade é ser HUMANO, não corporativo.`,
    source: "luna-competitor-research",
  },
  {
    kind: "reference",
    title: "Táticas de especialistas em growth Instagram",
    body: `Táticas validadas de especialistas em crescimento orgânico:

**Alex Hormozi (adaptado pra BR):**
- "Give away the WHAT, sell the HOW"
- Poste TUDO que você sabe de graça. Quem quer o passo-a-passo compra.
- Aplicação: posts educativos completos do S.E.M. Quem quer o ebook
  (organizado + cardápio + checklist) compra.

**Gary Vee (adaptado pra BR):**
- "Jab, jab, jab, right hook" = valor, valor, valor, venda.
- Nunca venda sem ter dado valor ANTES.
- Aplicação: 4-5 posts de valor, depois 1 promo.

**Rachel Hollis (adaptado pra nicho feminino):**
- Vulnerabilidade vende. Compartilhar fracassos (sem drama) gera conexão.
- "Eu também já passei por isso" é mais poderoso que "Siga esses 5 passos".
- Aplicação: Barbara compartilha jornada real (não números de peso).

**Sobral (tráfego BR):**
- Orgânico e pago devem ter a MESMA mensagem.
- Se o orgânico fala de "reeducação sem culpa", o ad também.
- Se mudar a mensagem, confunde a audiência.
- Aplicação: copies do Luna alinhadas com copies da Gaia.

**Estratégia "Comment First":**
- Antes de postar, vá em 10 contas do nicho e comente GENUINAMENTE.
- Não "lindo post 😍" — comente algo relevante (2-3 linhas).
- Isso traz seguidores orgânicos de qualidade (vieram pela interação, não pelo algoritmo).
- 15 min/dia de comentários = crescimento consistente.`,
    source: "growth-specialists-research",
  },

  // ═══════════════════════════════════════════════════════
  // ENGAGEMENT — COMO INTERAGIR
  // ═══════════════════════════════════════════════════════
  {
    kind: "rule",
    title: "Responder comentários: regras de ouro",
    body: `Regras pra responder comentários como Barbara:

**Tempo:** responder em < 2h (algoritmo favorece posts com respostas rápidas)

**Tom:** sempre acolhedor, nunca defensivo. "Obrigada por compartilhar!" mesmo pra críticas.

**Tamanho:** respostas de 2-3 frases (não 1 palavra, não 1 parágrafo).

**Perguntas:** SEMPRE fazer uma pergunta de volta.
- "Que legal! Qual dica você mais usa no dia a dia?"
- "Sim! Você já tentou trocar X por Y?"
- Perguntas geram mais replies = mais engagement = mais alcance.

**Emojis:** usar com moderação (1-2 por resposta). Não exagerar.

**DMs:** quando alguém comenta algo pessoal ou pergunta sobre preço,
responder na DM (mais íntimo, maior conversão).

**Comentários negativos:**
- Nunca deletar (exceto spam/hate)
- Responder com empatia: "Entendo seu ponto! O S.E.M pode não ser pra todo mundo, e tudo bem."
- Audiência vê como você trata crítica — profissionalismo converte.`,
    source: "engagement-best-practices",
  },
  {
    kind: "rule",
    title: "Stories interativos: o motor de engajamento",
    body: `Stories com interação (enquete, quiz, pergunta, slider) têm 2-3x mais
views que stories estáticos. O algoritmo Instagram prioriza contas
que USAM features de interação.

**Sequência ideal de Stories diários (5-7 por dia):**
1. Bom dia + enquete casual ("Como você acordou? 😊 / 😐 / 😴")
2. Dica do dia (texto + imagem do pilar do dia)
3. Bastidor (mostrando rotina real, comida real, casa real)
4. Pergunta aberta ("Qual sua maior dificuldade com alimentação?")
5. Resposta a uma pergunta que recebeu (print da DM com autorização)
6. CTA suave ("Link na bio pra conhecer o Método S.E.M")

**Features pra usar:**
- Enquete (2 opções): engajamento fácil, todo mundo clica
- Quiz (3-4 opções): educativo + divertido
- Slider (emoji): emocional, bom pra "quanto você concorda com..."
- Caixinha de perguntas: gera conteúdo (responde nos Stories seguintes)
- Contagem regressiva: pra lançamentos ou lives

**Horários:** postar 2-3 stories de manhã (8h-9h), 2-3 à noite (20h-22h).
Não postar tudo de uma vez — distribuir ao longo do dia.`,
    source: "stories-strategy-2025",
  },

  // ═══════════════════════════════════════════════════════
  // MÉTRICAS — O QUE ACOMPANHAR
  // ═══════════════════════════════════════════════════════
  {
    kind: "benchmark",
    title: "Métricas de referência pra conta <10k seguidores",
    body: `Benchmarks pra contas pequenas (< 10k) no nicho wellness BR:

**Engagement Rate (ER):**
- Excelente: > 6%
- Bom: 3-6%
- Médio: 1.5-3%
- Ruim: < 1.5%
- Cálculo: (likes + comments) / followers × 100

**Alcance por post (% dos seguidores):**
- Reels: 30-100% (pode ultrapassar seguidores)
- Carrossel: 15-30%
- Imagem única: 10-20%
- Stories: 5-15%

**Taxa de crescimento semanal:**
- Bom: +1-2% da base/semana
- Médio: +0.5-1%
- Ruim: <0.5% ou estagnado

**Saves e Shares (métricas que mais importam em 2025):**
- Salvar: 1-3% do alcance é bom
- Compartilhar: 0.5-2% do alcance é bom
- Esses sinais pesam MAIS que likes pro algoritmo

**O que acompanhar semanalmente:**
1. ER médio dos posts da semana
2. Melhor post (qual formato, pilar, horário)
3. Pior post (por que não engajou?)
4. Crescimento de seguidores (net new)
5. DMs recebidas (sinal de interesse quente)
6. Cliques no link da bio (proxy de intenção de compra)`,
    source: "social-metrics-benchmarks-2025",
  },

  // ═══════════════════════════════════════════════════════
  // COMPLIANCE — O QUE NÃO POSTAR
  // ═══════════════════════════════════════════════════════
  {
    kind: "policy",
    title: "O que NUNCA postar no Instagram do Longetividade",
    body: `Regras absolutas pra evitar ban + manter credibilidade:

**Nunca postar:**
1. Fotos antes/depois de corpo (viola políticas Meta + gera body shaming)
2. Números específicos de peso perdido ("perdi 4kg em 30 dias")
3. Promessas de resultado ("você VAI emagrecer")
4. Claims médicos ("cura ansiedade", "elimina gordura")
5. Linguagem de urgência tóxica ("ÚLTIMA CHANCE", "VOCÊ PRECISA")
6. Comparação com outras dietas de forma negativa
7. Screenshots de balança (triggers body image issues)
8. Conteúdo que possa ser interpretado como body shaming

**Sempre substituir por:**
- "4kg em 30 dias" → "se sentindo mais leve"
- "emagrecer" → "nova relação com a comida"
- "você VAI conseguir" → "cada passo conta"
- "antes e depois" → depoimento emocional (como se SENTE, não como PARECE)
- "dieta" → "reeducação" ou "método"

**Linguagem da marca Longetividade:**
Tom: acolhedor, como amiga de confiança
Voz: 1ª pessoa (Barbara), não corporativo
Emoção: empoderamento gentil, não pressão
Objetivo: fazer a pessoa se sentir BEM, não CULPADA`,
    source: "luna-compliance-rules",
  },
];
