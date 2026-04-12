// Calendario de datas comemorativas e sazonais relevantes pro nicho
// wellness/saude/emagrecimento feminino no Brasil.
// Luna usa pra planejar conteudo do ano inteiro.

export type CommemorativeDate = {
  date: string; // MM-DD
  name: string;
  pillar: "s" | "e" | "m" | "promo" | "geral";
  postIdea: string;
  hashtags: string;
};

export const COMMEMORATIVE_DATES: CommemorativeDate[] = [
  // ═══ JANEIRO ═══
  { date: "01-01", name: "Ano Novo", pillar: "e", postIdea: "Nao faca dietas em janeiro. Faca pazes com a comida. O ano inteiro e seu.", hashtags: "#anonovo #recomeço #semdieta" },
  { date: "01-31", name: "Dia da Solidariedade", pillar: "e", postIdea: "Mande essa mensagem pra uma amiga que precisa ouvir: voce e suficiente.", hashtags: "#solidariedade #amizade" },

  // ═══ FEVEREIRO ═══
  { date: "02-14", name: "Dia de Sao Valentim (internacional)", pillar: "e", postIdea: "O primeiro amor que precisa de atencao e o amor por voce mesma.", hashtags: "#amorproprio #autoestima" },

  // ═══ MARCO ═══
  { date: "03-08", name: "Dia Internacional da Mulher", pillar: "e", postIdea: "Pra todas as mulheres que estao tentando — voce ja e extraordinaria. Parabens por existir.", hashtags: "#diadamulher #mulheres #empoderamento" },
  { date: "03-10", name: "Dia do Telefone / Digital Detox", pillar: "m", postIdea: "Desafio: 1 refeicao por dia SEM celular na mesa. Voce come com mais consciencia.", hashtags: "#digitaldetox #mindfulness" },
  { date: "03-20", name: "Dia Mundial da Felicidade", pillar: "e", postIdea: "Felicidade nao e o numero na balanca. E comer sem culpa, se mover com prazer, dormir em paz.", hashtags: "#felicidade #bemestar" },
  { date: "03-22", name: "Dia Mundial da Agua", pillar: "s", postIdea: "8 copos. Todo dia. Seu corpo agradece. Simples assim.", hashtags: "#diamundialdaagua #hidratacao #agua" },
  { date: "03-31", name: "Dia da Saude e Nutricao", pillar: "s", postIdea: "Nutricao nao e restricao. E escolher bem, sem culpa, com prazer.", hashtags: "#nutricao #saudavel #reeducacao" },

  // ═══ ABRIL ═══
  { date: "04-07", name: "Dia Mundial da Saude", pillar: "geral", postIdea: "Saude nao e so ausencia de doenca. E ter energia, disposicao, e paz com o espelho.", hashtags: "#diamundialdassaude #saude #bemestar" },
  { date: "04-19", name: "Dia do Indio / Alimentos Nativos", pillar: "s", postIdea: "Mandioca, milho, acai, castanha — alimentos nativos brasileiros que sao ouro nutricional.", hashtags: "#alimentosnaturais #brasil #nutricao" },

  // ═══ MAIO ═══
  { date: "05-01", name: "Dia do Trabalho", pillar: "m", postIdea: "Pra quem trabalha o dia inteiro: 5 alongamentos pra fazer na cadeira do escritorio.", hashtags: "#trabalho #ergonomia #movimento" },
  { date: "05-11", name: "Dia das Maes", pillar: "e", postIdea: "Mae: voce cuida de todo mundo. Hoje o Metodo S.E.M cuida de voce. Feliz dia das maes.", hashtags: "#diadasmaes #mae #amordemae" },
  { date: "05-31", name: "Dia Mundial Sem Tabaco", pillar: "geral", postIdea: "Largar o cigarro E a dieta restritiva tem algo em comum: precisa de metodo, nao de forca de vontade.", hashtags: "#sauderespiratoria #habitos" },

  // ═══ JUNHO ═══
  { date: "06-01", name: "Dia do Nutricionista", pillar: "s", postIdea: "Se voce pode, consulte um nutricionista. O Metodo S.E.M complementa — nunca substitui.", hashtags: "#nutricionista #profissionaldesaude" },
  { date: "06-12", name: "Dia dos Namorados", pillar: "e", postIdea: "O melhor presente pro seu corpo: parar de brigar com ele.", hashtags: "#diadosnamorados #amorproprio" },

  // ═══ JULHO ═══
  { date: "07-10", name: "Dia da Pizza (BR)", pillar: "s", postIdea: "Dia da pizza! Comer pizza nao arruina nada. O que arruina e a CULPA depois.", hashtags: "#pizza #semculpa #reeducacao" },
  { date: "07-14", name: "Dia de Ferias Escolares", pillar: "s", postIdea: "Ferias das criancas = rotina diferente. Aproveita pra cozinhar COM elas — comer saudavel vira diversao.", hashtags: "#ferias #cozinhacomcriancas" },

  // ═══ AGOSTO ═══
  { date: "08-11", name: "Dia do Estudante", pillar: "s", postIdea: "Dica pra quem estuda: comer a cada 3h mantem a concentracao. Seu cerebro precisa de combustivel.", hashtags: "#estudante #concentracao #nutricao" },
  { date: "08-22", name: "Dia do Folclore / Alimentacao Regional", pillar: "s", postIdea: "Cada regiao do Brasil tem superalimentos incriveis. Acai no norte, pinhao no sul, pequi no cerrado.", hashtags: "#folclore #comidabrasileira" },

  // ═══ SETEMBRO ═══
  { date: "09-01", name: "Dia do Profissional de Ed. Fisica", pillar: "m", postIdea: "15 minutos de movimento por dia. E tudo. O Metodo S.E.M nao exige academia — exige intencao.", hashtags: "#educacaofisica #movimento" },
  { date: "09-10", name: "Dia Mundial de Prevencao ao Suicidio (Setembro Amarelo)", pillar: "e", postIdea: "Cuide da sua saude mental como cuida da alimentacao: com gentileza, rotina e apoio. Se precisar de ajuda, ligue 188.", hashtags: "#setembroamarelo #saudemental #cvv188" },
  { date: "09-21", name: "Dia da Arvore / Conexao com Natureza", pillar: "m", postIdea: "Caminhar na natureza por 15 minutos reduz cortisol e ansiedade. Nao e exercicio — e remedio.", hashtags: "#natureza #caminhada #bemestar" },

  // ═══ OUTUBRO ═══
  { date: "10-01", name: "Outubro Rosa (mes inteiro)", pillar: "geral", postIdea: "Outubro Rosa. A melhor prevencao comeca com autocuidado diario: alimentacao, movimento, sono. Cuide-se.", hashtags: "#outubrorosa #prevencao #autocuidado" },
  { date: "10-16", name: "Dia Mundial da Alimentacao", pillar: "s", postIdea: "Comer e um ato de amor. Por voce, pela sua familia, pelo planeta. Escolha com consciencia.", hashtags: "#diamundialdaalimentacao #alimentacaoconsciente" },
  { date: "10-31", name: "Dia das Bruxas / Halloween Fit", pillar: "s", postIdea: "A unica coisa assustadora na cozinha e nao ter um plano. Que tal montar a lista de compras pro mes?", hashtags: "#halloween #planejamento" },

  // ═══ NOVEMBRO ═══
  { date: "11-01", name: "Novembro Azul (mes inteiro)", pillar: "geral", postIdea: "Saude e pra todo mundo. Incentive os homens da sua vida a cuidarem da alimentacao tambem.", hashtags: "#novembroazul #saude" },
  { date: "11-14", name: "Dia Mundial do Diabetes", pillar: "s", postIdea: "Reeducacao alimentar previne diabetes tipo 2. Nao e dieta — e habito. Comecar e simples.", hashtags: "#diabetes #prevencao #habitos" },
  { date: "11-25", name: "Black Friday (semana)", pillar: "promo", postIdea: "Se voce investir R$37 em algo esse ano, invista em voce. Metodo S.E.M — reeducacao que dura.", hashtags: "#blackfriday #investaemvoce" },

  // ═══ DEZEMBRO ═══
  { date: "12-01", name: "Comeco do Verao", pillar: "m", postIdea: "Verao: a melhor epoca pra caminhar de manha, beber mais agua, e comer frutas da estacao.", hashtags: "#verao #vidasaudavel" },
  { date: "12-25", name: "Natal", pillar: "e", postIdea: "Natal e pra comer em familia SEM culpa. Amanha voce volta pro seu ritmo. Hoje, aproveite.", hashtags: "#natal #semculpa #familia" },
  { date: "12-31", name: "Reveillon / Reflexao", pillar: "e", postIdea: "Antes de fazer promessas de ano novo, agradeca o corpo que te trouxe ate aqui. Ele merece gentileza.", hashtags: "#anonovo #gratidao #reflexao" },
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
