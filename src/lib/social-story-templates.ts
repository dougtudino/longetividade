// Templates de content pra Stories (poll/question/sequence) por pilar.
// Luna usa quando gera conteudo pra slot STORY sem trend disponivel.
// Formato de content respeita o parser (\n---\n entre pecas).

import type { Pillar } from "./social-week-schedule";

type StoryTemplate = { title: string; content: string; hashtags: string };

// ═══════════════════════════════════════════════════════
// POLL (enquete 2 opcoes)
// ═══════════════════════════════════════════════════════
export const STORY_POLL_TEMPLATES: Record<Pillar, StoryTemplate[]> = {
  s: [
    { title: "Poll: café da manhã", content: "Você toma café da manhã todo dia?\n---\nSim, sempre\nPulo às vezes", hashtags: "#cafedamanha #nutricao #metodosem" },
    { title: "Poll: doce depois do almoço", content: "Doce depois do almoço é:\n---\nRitual delicioso\nArmadilha pra fome", hashtags: "#alimentacao #metodosem" },
    { title: "Poll: cozinha em casa", content: "Você cozinha em casa quantas vezes na semana?\n---\n4+ vezes\nQuase nunca", hashtags: "#cozinhar #rotina #metodosem" },
  ],
  e: [
    { title: "Poll: come por emoção", content: "Você come quando tá estressada?\n---\nSim, sempre\nEu percebo e paro", hashtags: "#fomeemocional #saudemental #metodosem" },
    { title: "Poll: peso na balança", content: "Subir na balança te deixa:\n---\nAnsiosa\nÉ só um número", hashtags: "#autoestima #amorproprio #metodosem" },
    { title: "Poll: relação com comida", content: "Sua relação com comida hoje é:\n---\nCheia de culpa\nEm paz", hashtags: "#saudemental #semculpa #metodosem" },
  ],
  m: [
    { title: "Poll: horário de treino", content: "Você treina melhor:\n---\nDe manhã\nÀ noite", hashtags: "#treino #movimento #metodosem" },
    { title: "Poll: caminhada ou academia", content: "Pra você funciona mais:\n---\nCaminhada na rua\nAcademia", hashtags: "#caminhada #academia #movimento" },
    { title: "Poll: segunda-feira", content: "Segunda é:\n---\nDia de começar tudo\nDia normal", hashtags: "#segundafeira #rotina #movimento" },
  ],
  promo: [
    { title: "Poll: reeducação", content: "Já tentou reeducação alimentar?\n---\nSim, várias vezes\nAinda não", hashtags: "#reeducacao #metodosem" },
    { title: "Poll: investir em você", content: "Se R$37 te fizesse mudar de vida, você investiria?\n---\nClaro que sim\nPreciso saber mais", hashtags: "#metodosem #investaemvoce" },
  ],
};

// ═══════════════════════════════════════════════════════
// QUESTION (caixa de pergunta aberta)
// ═══════════════════════════════════════════════════════
export const STORY_QUESTION_TEMPLATES: Record<Pillar, StoryTemplate[]> = {
  s: [
    { title: "Question: maior duvida nutricional", content: "Qual sua MAIOR dúvida sobre alimentação saudável?\n---\nVou responder todas nos stories amanhã 🙏", hashtags: "#alimentacao #metodosem" },
    { title: "Question: receita que deu certo", content: "Qual receita saudável virou seu xodó?\n---\nMe conta — quero testar aqui também!", hashtags: "#receitas #metodosem" },
  ],
  e: [
    { title: "Question: gatilho emocional", content: "Qual emoção te faz correr pra geladeira?\n---\nSem julgamento — só pra eu te ajudar melhor", hashtags: "#fomeemocional #metodosem" },
    { title: "Question: autoestima", content: "O que você gostaria de sentir sobre seu corpo hoje?\n---\nMe conta, sem pressa", hashtags: "#autoestima #metodosem" },
  ],
  m: [
    { title: "Question: exercício que odeia", content: "Qual exercício você faz OBRIGADA, mas odeia?\n---\nTenho alternativa pra quase todos 😅", hashtags: "#movimento #metodosem" },
    { title: "Question: barreira pro treino", content: "O que TE IMPEDE de treinar hoje?\n---\nVamos resolver juntas", hashtags: "#movimento #metodosem" },
  ],
  promo: [
    { title: "Question: o que espera do método", content: "Se o Método S.E.M fosse pra você, o que mais mudaria?\n---\nMe conta — quero entender sua realidade", hashtags: "#metodosem" },
  ],
};

// ═══════════════════════════════════════════════════════
// SEQUENCE (3-5 slides encadeados, tipo carrossel de stories)
// ═══════════════════════════════════════════════════════
export const STORY_SEQUENCE_TEMPLATES: Record<Pillar, StoryTemplate[]> = {
  s: [
    {
      title: "Sequence: 3 pratos coloridos",
      content: "🎨 3 cores no prato = refeição balanceada\n---\n🟢 VERDE: folhas, brócolis, pepino\n---\n🟠 LARANJA: cenoura, tomate, abóbora\n---\n🟤 MARROM: arroz, feijão, frango\n---\n✅ Simples assim. Salvou?",
      hashtags: "#reeducacaoalimentar #pratoscoloridos #metodosem",
    },
    {
      title: "Sequence: café da manhã perfeito",
      content: "☕ Café da manhã que sustenta até o almoço\n---\n🍞 1 carboidrato (pão, tapioca, aveia)\n---\n🥚 1 proteína (ovo, queijo, iogurte)\n---\n🍌 1 fruta\n---\n✅ Mix simples. Sem fome às 10h. 💾 Salva!",
      hashtags: "#cafedamanha #nutricao #metodosem",
    },
  ],
  e: [
    {
      title: "Sequence: 3 sinais de fome emocional",
      content: "🚨 3 sinais que você come por emoção\n---\n1️⃣ Aparece de REPENTE (fome real cresce aos poucos)\n---\n2️⃣ Pede algo ESPECÍFICO (doce, salgado crocante)\n---\n3️⃣ NÃO PARA quando satisfeita\n---\n💜 Não é fraqueza. É sinal. Comenta qual é o seu.",
      hashtags: "#fomeemocional #saudemental #metodosem",
    },
    {
      title: "Sequence: parar de brigar com o corpo",
      content: "💜 4 passos pra fazer as pazes com seu corpo\n---\n1️⃣ AGRADEÇA ele uma vez por dia\n---\n2️⃣ TIRE o peso da balança da rotina\n---\n3️⃣ VISTA roupas que CABEM hoje\n---\n4️⃣ FALE com ele como fala com sua melhor amiga",
      hashtags: "#autoestima #amorproprio #metodosem",
    },
  ],
  m: [
    {
      title: "Sequence: 15 min de movimento",
      content: "🚶‍♀️ 15 min de movimento por dia muda TUDO\n---\n5 min: caminhada ao acordar\n---\n5 min: alongamento no intervalo do trabalho\n---\n5 min: dança na cozinha antes do jantar\n---\n✅ Simples. Gradual. Sustentável.",
      hashtags: "#movimento #vidaativa #metodosem",
    },
  ],
  promo: [
    {
      title: "Sequence: por que o Método S.E.M",
      content: "🌿 Por que o Método S.E.M funciona\n---\nS — SIMPLICIDADE (sem contar caloria)\n---\nE — EQUILÍBRIO (emocional conta)\n---\nM — MOVIMENTO (15 min/dia)\n---\n✅ R$37 · resultado pra vida toda",
      hashtags: "#metodosem #reeducacao #longetividade",
    },
  ],
};

export function pickRandom<T>(list: T[]): T | null {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}
