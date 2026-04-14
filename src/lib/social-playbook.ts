// Biblia da Luna — playbook oficial do algoritmo Instagram 2026.
// Baseado em: docs Meta Creator Hub + Meta for Creators + metodo de 5 creators
// de referencia (Vaynerchuk, Hormozi, Jasmine Star, Neil Patel, Russell Brunson).
//
// Seed em AgentKnowledge(agentId="luna", kind="rule"|"reference") pra Luna
// consultar antes de gerar qualquer conteudo. Idempotente.

import { prisma } from "./prisma";

export type PlaybookEntry = {
  slug: string;
  kind: "rule" | "reference";
  title: string;
  body: string;
  source: string;
};

export const PLAYBOOK: PlaybookEntry[] = [
  // ═══════════════════════════════════════════════════════
  // REGRAS FUNDAMENTAIS DO ALGORITMO
  // ═══════════════════════════════════════════════════════
  {
    slug: "algo-core-2026",
    kind: "rule",
    title: "Instagram 2026: plataforma de atencao, nao rede social",
    body: `O Instagram em 2026 NAO e rede social. E plataforma de distribuicao de atencao baseada em RETENCAO e COMPARTILHAMENTO.

Papel de cada formato:
- REELS = alcance (descoberta) — bombou em 2023-2024, ainda e o motor de crescimento organico
- CARROSSEL = retencao (tempo de tela + saves) — melhor pra autoridade
- STORIES = relacionamento (prova social + confianca) — onde seguidor vira cliente
- FEED ESTATICO = autoridade/branding — baixo alcance, alto posicionamento

Regra de ouro: conteudo sem RETENCAO ou SHARE morre no algoritmo, independente de like.`,
    source: "luna-playbook",
  },
  {
    slug: "algo-metrics-priority",
    kind: "rule",
    title: "Metricas a otimizar (ordem de prioridade)",
    body: `Ordem de prioridade das metricas Meta 2026:

1. RETENCAO (principal) — % de pessoas que assistem ate o fim / leem carrossel completo
2. COMPARTILHAMENTOS — mais importante que like. Quando alguem compartilha, algoritmo entende que o conteudo "sai da bolha"
3. SALVAMENTOS — sinal forte de autoridade/utilidade. Carrossel ganha aqui
4. COMENTARIOS — especialmente os longos (>4 palavras) e com conversa entre usuarios
5. LIKES — sinal fraco, quase irrelevante sozinho

Nao otimize pra like. Otimize pra share + save.`,
    source: "luna-playbook",
  },
  {
    slug: "algo-hook-rule",
    kind: "rule",
    title: "Primeiros 3 segundos / primeira linha = tudo",
    body: `O primeiro frame (reel) / primeira linha (carrossel) / primeira palavra (story) decide se o post vive ou morre.

Estruturas de hook que funcionam:
- Pergunta incomoda: "Por que vc nao emagrece mesmo fazendo tudo certo?"
- Contra-senso: "Parar de contar caloria foi o que mais me fez emagrecer"
- Promessa especifica: "3 mudancas de 5 min que mudaram minha relacao com comida"
- Confissao vulneravel: "Ja chorei no provador. E hoje eu aceito meu corpo."
- Lista com numero: "5 sinais que voce come por emocao"

EVITAR: "Oi, gente! Tudo bem?", "Bora falar sobre...", abertura generica.`,
    source: "luna-playbook",
  },
  {
    slug: "algo-formato-uso",
    kind: "rule",
    title: "Quando usar cada formato",
    body: `REELS (alcance/descoberta):
- Duracao: 15-30s (sweet spot pra retencao)
- Audio trending (audio original vs lipsync — ambos funcionam)
- Texto na tela + voz — dupla leitura
- CTA no final: "Comenta X" ou "Salva pra nao esquecer"

CARROSSEL (retencao/autoridade):
- 5-10 slides (7 e o sweet spot)
- Slide 1 = hook visual + titulo promessa
- Slides intermediarios = cada um um ponto/passo
- Ultimo slide = CTA (comenta, salva, compartilha)
- Texto LEGIVEL no mobile — fonte >32pt

STORIES (relacionamento):
- Sequencia de 3-7 stories encadeados funciona melhor que 1 solo
- Formatos que bombam: enquete (2 opcoes), pergunta (caixa texto), teste (multi-escolha), slider emoji
- Bastidor + prova social + CTA "me manda DM"

FEED ESTATICO (autoridade):
- Foto do produto/marca + frase de impacto
- Usar esporadicamente — 1-2x/mes no maximo
- Baixo alcance, mas bom pra "branding visual"`,
    source: "luna-playbook",
  },

  // ═══════════════════════════════════════════════════════
  // CREATORS DE REFERENCIA (5)
  // ═══════════════════════════════════════════════════════
  {
    slug: "creator-gary-vaynerchuk",
    kind: "reference",
    title: "Gary Vaynerchuk — volume + sem frescura",
    body: `Principios pra adaptar:
- VOLUME MASSIVO: prefira 5 posts medios a 1 post perfeito. Algoritmo premia consistencia.
- CONTEUDO SEM FRESCURA: sem producao cara. Iphone + luz da janela > estudio caro.
- TESTE TUDO RAPIDO: varie hook, angulo, formato. O algoritmo te diz o que funciona em 48h.
- DOCUMENTAR > CRIAR: mostrar bastidor real e melhor que "conteudo polido".

Aplicar na Luna: gerar variacoes do mesmo topico. Nao travar esperando "o post perfeito".`,
    source: "luna-playbook",
  },
  {
    slug: "creator-alex-hormozi",
    kind: "reference",
    title: "Alex Hormozi — hook absurdo + clareza",
    body: `Principios pra adaptar:
- HOOK ABSURDO: "Eu fiz 100M em 4 anos fazendo isso de errado" — promessa grande + contra-senso
- CLAREZA > ESTETICA: fundo branco, letra preta, pontinha. Funcionamento.
- CONTEUDO DIRETO: sem enrolar, ponto por ponto, numerado.
- VALOR GRATIS EXCESSIVO: da a receita inteira, nao pedaco.

Aplicar na Luna: primeiro slide do carrossel deve ser uma promessa grande + quebra de expectativa.`,
    source: "luna-playbook",
  },
  {
    slug: "creator-jasmine-star",
    kind: "reference",
    title: "Jasmine Star — storytelling + calendario",
    body: `Principios pra adaptar:
- STORYTELLING PESSOAL: comeca com "eu vivi isso" antes de "o dado mostra".
- CALENDARIO ESTRATEGICO: tema do mes, arcos narrativos, nao posts soltos.
- ENGAJAMENTO HUMANO: responder comentarios como conversa (nao "obrigada!"), criar ida-e-volta.

Aplicar na Luna: comeca posts com historia da Barbara/clientes antes do conteudo tecnico. Planejar semana com arco narrativo.`,
    source: "luna-playbook",
  },
  {
    slug: "creator-neil-patel",
    kind: "reference",
    title: "Neil Patel — dados + SEO + consistencia",
    body: `Principios pra adaptar:
- DADOS SEMPRE: cita numero, pesquisa, benchmark real.
- SEO NO SOCIAL: palavras-chave no primeiro paragrafo, no alt-text, no caption.
- CONSISTENCIA: 3-5x/sem e melhor que "quando da".
- MEDIR O QUE IMPORTA: tempo de tela > like. Conversao > seguidor.

Aplicar na Luna: incluir numero/estatistica em 1 de cada 3 posts. Medir retencao do reel, nao so views.`,
    source: "luna-playbook",
  },
  {
    slug: "creator-russell-brunson",
    kind: "reference",
    title: "Russell Brunson — conteudo que vende + CTA invisivel",
    body: `Principios pra adaptar:
- CONTEUDO QUE VENDE: todo post e parte de um funil, mesmo os "so de valor".
- FUNIL DENTRO DO CONTEUDO: post "gratuito" ja planta a semente pro produto.
- CTA INVISIVEL: "Comenta X" ou "Salva isso" ja e CTA. Nao precisa ser "compra agora".
- ESCADARIA DE VALOR: conteudo leva a optin (email), optin leva a produto barato, produto barato leva a caro.

Aplicar na Luna: todo post de valor termina com CTA leve ("salva", "comenta X"). 1 em cada 5 posts pode ter CTA pro produto (20% regra 80/20).`,
    source: "luna-playbook",
  },

  // ═══════════════════════════════════════════════════════
  // FORMATOS DE STORY QUE FUNCIONAM (pra fase B de implementacao)
  // ═══════════════════════════════════════════════════════
  {
    slug: "story-format-enquete",
    kind: "rule",
    title: "Story: enquete de 2 opcoes",
    body: `Template de Story ENQUETE (alta conversao em relacionamento):

Linha 1 (pergunta punch): "Voce come cafe da manha?"
Linha 2 (enquete): [Sim todo dia] [Depende]

Objetivo: coletar dado da audiencia + iniciar conversa. Luna depois responde em novo story usando a metrica: "84% votaram X — isso muda tudo. Te mostro porque no proximo."

Copy <80 chars no total. Sem CTA de vendas.`,
    source: "luna-playbook",
  },
  {
    slug: "story-format-pergunta",
    kind: "rule",
    title: "Story: caixa de pergunta",
    body: `Template de Story PERGUNTA (gera conteudo pro proximo dia):

"Qual sua maior duvida sobre [tema]? Me conta aqui:"
[caixa de pergunta aberta]

Objetivo: (1) coleta doubt pra virar proximo post, (2) aumenta tempo de interacao, (3) transforma duvida em conteudo personalizado.

Regra: SEMPRE responder em story publico no dia seguinte, citando o @user. Isso vira prova social.`,
    source: "luna-playbook",
  },
  {
    slug: "story-format-sequencia",
    kind: "rule",
    title: "Story: sequencia tipo carrossel (3-5 slides)",
    body: `Template SEQUENCIA DE STORIES (imita carrossel, alto engajamento):

Story 1 (hook): pergunta/promessa "3 sinais que vc come por emocao"
Story 2-4 (conteudo): cada sinal 1 story
Story 5 (CTA): "Salvou? Me manda DM com qual foi o seu"

Objetivo: "segurar" pessoa dentro dos stories 3-5x mais tempo. Algoritmo recompensa.

Regra visual: fundo similar em todos, numero do slide visivel (1/5, 2/5...), letra grande.`,
    source: "luna-playbook",
  },
  {
    slug: "story-format-bastidor",
    kind: "rule",
    title: "Story: bastidor da Barbara (prova social + humanizacao)",
    body: `Template BASTIDOR:

Video rapido (5-10s) da Barbara fazendo algo cotidiano — cozinhando, fazendo exercicio leve, trabalhando no computador com cafe.
Legenda curta: "domingo planejando a semana de refeicoes. quem aqui tambem planeja?"

Objetivo: humanizar a marca. Seguidor passa a ver a Barbara como pessoa real, nao perfil. Essa familiaridade vira venda meses depois.

Frequencia: 2-3x/sem. Nunca sem intencao.`,
    source: "luna-playbook",
  },
];

// Seed idempotente — upsert por (agentId, source, title).
export async function seedPlaybook(): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const entry of PLAYBOOK) {
    const existing = await prisma.agentKnowledge.findFirst({
      where: { agentId: "luna", source: entry.source, title: entry.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.agentKnowledge.update({
        where: { id: existing.id },
        data: { body: entry.body, kind: entry.kind, metadata: { slug: entry.slug } },
      });
      updated++;
    } else {
      await prisma.agentKnowledge.create({
        data: {
          agentId: "luna",
          kind: entry.kind,
          title: entry.title,
          body: entry.body,
          source: entry.source,
          metadata: { slug: entry.slug },
        },
      });
      created++;
    }
  }

  return { created, updated };
}
