// Calendário de datas comemorativas e sazonais relevantes pro nicho
// wellness/saúde/emagrecimento feminino no Brasil.
// Luna usa pra planejar conteúdo do ano inteiro.

export type CommemorativeDate = {
  date: string; // MM-DD
  name: string;
  pillar: "s" | "e" | "m" | "promo" | "geral";
  postIdea: string;
  hashtags: string;
};

export const COMMEMORATIVE_DATES: CommemorativeDate[] = [
  // ═══ JANEIRO ═══
  { date: "01-01", name: "Ano Novo", pillar: "e", postIdea: "Não faça dietas em janeiro. Faça pazes com a comida. O ano inteiro é seu.", hashtags: "#anonovo #recomeço #semdieta" },
  { date: "01-31", name: "Dia da Solidariedade", pillar: "e", postIdea: "Mande essa mensagem pra uma amiga que precisa ouvir: você é suficiente.", hashtags: "#solidariedade #amizade" },

  // ═══ FEVEREIRO ═══
  { date: "02-14", name: "Dia de São Valentim (internacional)", pillar: "e", postIdea: "O primeiro amor que precisa de atenção é o amor por você mesma.", hashtags: "#amorproprio #autoestima" },

  // ═══ MARÇO ═══
  { date: "03-08", name: "Dia Internacional da Mulher", pillar: "e", postIdea: "Pra todas as mulheres que estão tentando — você já é extraordinária. Parabéns por existir.", hashtags: "#diadamulher #mulheres #empoderamento" },
  { date: "03-10", name: "Dia do Telefone / Digital Detox", pillar: "m", postIdea: "Desafio: 1 refeição por dia SEM celular na mesa. Você come com mais consciência.", hashtags: "#digitaldetox #mindfulness" },
  { date: "03-20", name: "Dia Mundial da Felicidade", pillar: "e", postIdea: "Felicidade não é o número na balança. É comer sem culpa, se mover com prazer, dormir em paz.", hashtags: "#felicidade #bemestar" },
  { date: "03-22", name: "Dia Mundial da Água", pillar: "s", postIdea: "8 copos. Todo dia. Seu corpo agradece. Simples assim.", hashtags: "#diamundialdaagua #hidratacao #agua" },
  { date: "03-31", name: "Dia da Saúde e Nutrição", pillar: "s", postIdea: "Nutrição não é restrição. É escolher bem, sem culpa, com prazer.", hashtags: "#nutricao #saudavel #reeducacao" },

  // ═══ ABRIL ═══
  { date: "04-07", name: "Dia Mundial da Saúde", pillar: "geral", postIdea: "Saúde não é só ausência de doença. É ter energia, disposição, e paz com o espelho.", hashtags: "#diamundialdassaude #saude #bemestar" },
  { date: "04-19", name: "Dia dos Povos Indígenas / Alimentos Nativos", pillar: "s", postIdea: "Mandioca, milho, açaí, castanha — alimentos nativos brasileiros que são ouro nutricional.", hashtags: "#alimentosnaturais #brasil #nutricao" },

  // ═══ MAIO ═══
  { date: "05-01", name: "Dia do Trabalho", pillar: "m", postIdea: "Pra quem trabalha o dia inteiro: 5 alongamentos pra fazer na cadeira do escritório.", hashtags: "#trabalho #ergonomia #movimento" },
  { date: "05-11", name: "Dia das Mães", pillar: "e", postIdea: "Mãe: você cuida de todo mundo. Hoje o Método S.E.M cuida de você. Feliz dia das mães.", hashtags: "#diadasmaes #mae #amordemae" },
  { date: "05-31", name: "Dia Mundial Sem Tabaco", pillar: "geral", postIdea: "Largar o cigarro E a dieta restritiva têm algo em comum: precisa de método, não de força de vontade.", hashtags: "#sauderespiratoria #habitos" },

  // ═══ JUNHO ═══
  { date: "06-01", name: "Dia do Nutricionista", pillar: "s", postIdea: "Se você pode, consulte um nutricionista. O Método S.E.M complementa — nunca substitui.", hashtags: "#nutricionista #profissionaldesaude" },
  { date: "06-12", name: "Dia dos Namorados", pillar: "e", postIdea: "O melhor presente pro seu corpo: parar de brigar com ele.", hashtags: "#diadosnamorados #amorproprio" },

  // ═══ JULHO ═══
  { date: "07-10", name: "Dia da Pizza (BR)", pillar: "s", postIdea: "Dia da pizza! Comer pizza não arruína nada. O que arruína é a CULPA depois.", hashtags: "#pizza #semculpa #reeducacao" },
  { date: "07-14", name: "Dia de Férias Escolares", pillar: "s", postIdea: "Férias das crianças = rotina diferente. Aproveita pra cozinhar COM elas — comer saudável vira diversão.", hashtags: "#ferias #cozinhacomcriancas" },

  // ═══ AGOSTO ═══
  { date: "08-11", name: "Dia do Estudante", pillar: "s", postIdea: "Dica pra quem estuda: comer a cada 3h mantém a concentração. Seu cérebro precisa de combustível.", hashtags: "#estudante #concentracao #nutricao" },
  { date: "08-22", name: "Dia do Folclore / Alimentação Regional", pillar: "s", postIdea: "Cada região do Brasil tem superalimentos incríveis. Açaí no norte, pinhão no sul, pequi no cerrado.", hashtags: "#folclore #comidabrasileira" },

  // ═══ SETEMBRO ═══
  { date: "09-01", name: "Dia do Profissional de Ed. Física", pillar: "m", postIdea: "15 minutos de movimento por dia. É tudo. O Método S.E.M não exige academia — exige intenção.", hashtags: "#educacaofisica #movimento" },
  { date: "09-10", name: "Dia Mundial de Prevenção ao Suicídio (Setembro Amarelo)", pillar: "e", postIdea: "Cuide da sua saúde mental como cuida da alimentação: com gentileza, rotina e apoio. Se precisar de ajuda, ligue 188.", hashtags: "#setembroamarelo #saudemental #cvv188" },
  { date: "09-21", name: "Dia da Árvore / Conexão com Natureza", pillar: "m", postIdea: "Caminhar na natureza por 15 minutos reduz cortisol e ansiedade. Não é exercício — é remédio.", hashtags: "#natureza #caminhada #bemestar" },

  // ═══ OUTUBRO ═══
  { date: "10-01", name: "Outubro Rosa (mês inteiro)", pillar: "geral", postIdea: "Outubro Rosa. A melhor prevenção começa com autocuidado diário: alimentação, movimento, sono. Cuide-se.", hashtags: "#outubrorosa #prevencao #autocuidado" },
  { date: "10-16", name: "Dia Mundial da Alimentação", pillar: "s", postIdea: "Comer é um ato de amor. Por você, pela sua família, pelo planeta. Escolha com consciência.", hashtags: "#diamundialdaalimentacao #alimentacaoconsciente" },
  { date: "10-31", name: "Dia das Bruxas / Halloween Fit", pillar: "s", postIdea: "A única coisa assustadora na cozinha é não ter um plano. Que tal montar a lista de compras pro mês?", hashtags: "#halloween #planejamento" },

  // ═══ NOVEMBRO ═══
  { date: "11-01", name: "Novembro Azul (mês inteiro)", pillar: "geral", postIdea: "Saúde é pra todo mundo. Incentive os homens da sua vida a cuidarem da alimentação também.", hashtags: "#novembroazul #saude" },
  { date: "11-14", name: "Dia Mundial do Diabetes", pillar: "s", postIdea: "Reeducação alimentar previne diabetes tipo 2. Não é dieta — é hábito. Começar é simples.", hashtags: "#diabetes #prevencao #habitos" },
  { date: "11-25", name: "Black Friday (semana)", pillar: "promo", postIdea: "Se você investir R$37 em algo esse ano, invista em você. Método S.E.M — reeducação que dura.", hashtags: "#blackfriday #investaemvoce" },

  // ═══ DEZEMBRO ═══
  { date: "12-01", name: "Começo do Verão", pillar: "m", postIdea: "Verão: a melhor época pra caminhar de manhã, beber mais água, e comer frutas da estação.", hashtags: "#verao #vidasaudavel" },
  { date: "12-25", name: "Natal", pillar: "e", postIdea: "Natal é pra comer em família SEM culpa. Amanhã você volta pro seu ritmo. Hoje, aproveite.", hashtags: "#natal #semculpa #familia" },
  { date: "12-31", name: "Réveillon / Reflexão", pillar: "e", postIdea: "Antes de fazer promessas de ano novo, agradeça o corpo que te trouxe até aqui. Ele merece gentileza.", hashtags: "#anonovo #gratidao #reflexao" },
];

// Retorna datas dos proximos N dias
export function getUpcomingDates(days: number = 30): (CommemorativeDate & { fullDate: string })[] {
  const now = new Date();
  const year = now.getFullYear();
  const results: (CommemorativeDate & { fullDate: string })[] = [];

  for (const d of COMMEMORATIVE_DATES) {
    const [month, day] = d.date.split("-").map(Number);
    const dateThisYear = new Date(year, month - 1, day);
    const dateNextYear = new Date(year + 1, month - 1, day);

    // Checa se esta nos proximos N dias (este ano ou proximo)
    const diffThis = (dateThisYear.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    const diffNext = (dateNextYear.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);

    if (diffThis >= 0 && diffThis <= days) {
      results.push({ ...d, fullDate: dateThisYear.toISOString().slice(0, 10) });
    } else if (diffNext >= 0 && diffNext <= days) {
      results.push({ ...d, fullDate: dateNextYear.toISOString().slice(0, 10) });
    }
  }

  return results.sort((a, b) => a.fullDate.localeCompare(b.fullDate));
}

// Retorna todas as datas do mes
export function getDatesForMonth(month: number): CommemorativeDate[] {
  const mm = String(month).padStart(2, "0");
  return COMMEMORATIVE_DATES.filter((d) => d.date.startsWith(mm));
}
