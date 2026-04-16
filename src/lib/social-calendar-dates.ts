// Calendario de datas comemorativas e sazonais relevantes pro nicho
// wellness/saude/emagrecimento feminino no Brasil (mulheres 30-55).
// Luna usa pra planejar conteudo do ano inteiro.
//
// Suporta:
// - Datas fixas (MM-DD) — ex: Dia da Mulher 08-03
// - Datas moveis calculadas por ano — ex: Pascoa, Maes, Pais, Black Friday
// - Meses tematicos com multiplos dias-chave — ex: Outubro Rosa
// - Enriquecimento rico opcional (hook/keyPoints/body) pras principais
// - Templates de Story dedicados (poll/question/sequence) pras principais

export type Priority = "high" | "normal" | "low";

export type StoryTemplate =
  | { type: "poll"; question: string; optionA: string; optionB: string }
  | { type: "question"; question: string; subtitle?: string }
  | { type: "sequence"; slides: Array<{ text: string; emoji?: string }> };

export type CommemorativeDate = {
  date: string; // MM-DD
  name: string;
  pillar: "s" | "e" | "m" | "promo" | "geral";
  postIdea: string;
  hashtags: string;
  priority?: Priority; // default "normal"
  // Enriquecimento opcional — se presente, buildFromCommemorative monta copy rica
  hook?: string;
  keyPoints?: string[];
  body?: string;
  preferredFormat?: "carrossel" | "imagem" | "reels" | "stories";
  // Se presente e o slot for story estruturado, usa esse template em vez do bank random
  storyTemplate?: StoryTemplate;
};

export type MovableDate = Omit<CommemorativeDate, "date"> & {
  // Funcao que retorna MM-DD dada o ano
  compute: (year: number) => string;
  // ID estavel pra deduplicar (ex: "easter", "mothers-day")
  dateId: string;
};

// ═══════════════════════════════════════════════════════════
// CALCULO DE DATAS MOVEIS
// ═══════════════════════════════════════════════════════════

// Algoritmo de Meeus/Jones/Butcher (Pascoa Gregoriana)
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function nthWeekdayOfMonth(year: number, month: number, dayOfWeek: number, n: number): number {
  const first = new Date(year, month - 1, 1);
  const firstDow = first.getDay();
  const offset = (dayOfWeek - firstDow + 7) % 7;
  return 1 + offset + (n - 1) * 7;
}

function lastWeekdayOfMonth(year: number, month: number, dayOfWeek: number): number {
  const lastDay = new Date(year, month, 0).getDate();
  const lastDate = new Date(year, month - 1, lastDay);
  const lastDow = lastDate.getDay();
  const offset = (lastDow - dayOfWeek + 7) % 7;
  return lastDay - offset;
}

function easterPlus(year: number, offsetDays: number): { month: number; day: number } {
  const easter = easterSunday(year);
  const d = new Date(year, easter.month - 1, easter.day + offsetDays);
  return { month: d.getMonth() + 1, day: d.getDate() };
}

const pad = (n: number) => String(n).padStart(2, "0");
const mmdd = (m: number, d: number) => `${pad(m)}-${pad(d)}`;

// ═══════════════════════════════════════════════════════════
// DATAS MOVEIS
// ═══════════════════════════════════════════════════════════

export const MOVABLE_DATES: MovableDate[] = [
  {
    dateId: "carnaval",
    compute: (y) => { const { month, day } = easterPlus(y, -47); return mmdd(month, day); },
    name: "Carnaval",
    pillar: "e",
    priority: "normal",
    postIdea: "Carnaval nao eh dieta nem academia. Eh suor, musica, movimento natural. Aproveita. Segunda volta pro ritmo, sem culpa.",
    hashtags: "#carnaval #movimento #semculpa",
    hook: "Carnaval eh descanso ativo. Dancar, caminhar na rua, rir — tudo isso eh movimento.",
    keyPoints: [
      "4 dias de folia queimam mais caloria que 1 semana de academia",
      "Beber agua entre cervejas: cada 1 copo de agua pra cada bebida",
      "Sem regra de comer so 'saudavel' — aproveita com consciencia",
    ],
  },
  {
    dateId: "pascoa",
    compute: (y) => { const { month, day } = easterSunday(y); return mmdd(month, day); },
    name: "Pascoa",
    pillar: "e",
    priority: "high",
    postIdea: "Pascoa nao eh sobre quantos bombons voce evitou. Eh sobre celebrar em familia, sem culpa, com presenca.",
    hashtags: "#pascoa #semculpa #equilibrio",
    hook: "Chocolate na Pascoa nao arruina nada. Culpa depois sim.",
    keyPoints: [
      "Come o que quiser no domingo. Volta pro ritmo na segunda",
      "Ovo de chocolate amargo (>70%) tem menos acucar e mais antioxidante",
      "Um ovo em familia vale mais que 10 escondidos",
    ],
    body: "Pascoa eh data pra estar junto. Se voce se cobrar e evitar a mesa, perde o essencial. Come com presenca, saboreia devagar, conversa com quem voce ama. Isso sim eh reeducacao — nao dieta, eh equilibrio com alegria.",
    storyTemplate: {
      type: "question",
      question: "Qual sua lembranca favorita de Pascoa em familia?",
      subtitle: "Responde na caixinha — lembrar de momentos bons faz bem pra mente.",
    },
  },
  {
    dateId: "corpus-christi",
    compute: (y) => { const { month, day } = easterPlus(y, 60); return mmdd(month, day); },
    name: "Corpus Christi",
    pillar: "e",
    priority: "low",
    postIdea: "Feriado eh descanso. Descanso de verdade. Sem culpa de nao fazer nada 'produtivo'.",
    hashtags: "#feriado #descanso #autocuidado",
  },
  {
    dateId: "mothers-day",
    compute: (y) => mmdd(5, nthWeekdayOfMonth(y, 5, 0, 2)), // 2 domingo de maio
    name: "Dia das Maes",
    pillar: "e",
    priority: "high",
    postIdea: "Mae cuida de todo mundo — inclusive de voce mesma. Hoje eh sobre receber cuidado sem culpa.",
    hashtags: "#diadasmaes #mae #autocuidado",
    hook: "A maioria das maes come por ultimo, dorme menos e se esquece no meio do dia.",
    keyPoints: [
      "Voce nao precisa terminar o prato do filho — se tem fome, se serve primeiro",
      "Dormir 7h nao eh luxo, eh base do corpo funcionar",
      "Culpa de cuidar de si mesma eh o maior ladrao de saude da mae",
    ],
    body: "Ser mae eh dar. Mas voce nao consegue dar de um reservatorio vazio. Comer sentada. Dormir o suficiente. Caminhar 15min sozinha. Isso nao eh egoismo — eh combustivel. Maes que se cuidam criam filhos que sabem o que eh cuidar de si.",
    preferredFormat: "carrossel",
    storyTemplate: {
      type: "question",
      question: "O que sua mae te ensinou sobre cuidar de si?",
      subtitle: "Responde na caixinha — a gente vai compartilhar as melhores respostas.",
    },
  },
  {
    dateId: "fathers-day",
    compute: (y) => mmdd(8, nthWeekdayOfMonth(y, 8, 0, 2)), // 2 domingo agosto
    name: "Dia dos Pais",
    pillar: "e",
    priority: "high",
    postIdea: "Os homens da sua vida — pai, marido, filho — tambem merecem cuidado. Mostra pra eles que saude eh pra toda a familia.",
    hashtags: "#diadospais #saudedafamilia #autocuidado",
    hook: "Homem medio vai no medico so quando algo doi muito. Isso custa vida.",
    keyPoints: [
      "Check-up anual reduz mortalidade cardiovascular em 25%",
      "Depressao masculina eh mascarada (irritacao, alcool) — olha os sinais",
      "Cozinhar junto eh um ato de cuidado que muitos pais nao recebem",
    ],
    body: "Dia dos Pais eh sobre reconhecer quem te criou. E quem voce cria. Se seu pai ainda esta aqui, pergunta como ele esta de saude — de verdade. Se voce eh pai, mostra pros seus filhos que cuidar de si nao eh 'coisa de mulher'. Saude masculina mudou — e comeca com quem voce ama.",
    preferredFormat: "carrossel",
    storyTemplate: {
      type: "poll",
      question: "Seu pai (ou o pai dos seus filhos) cuida da saude?",
      optionA: "Sim, faz check-up",
      optionB: "Precisa de incentivo",
    },
  },
  {
    dateId: "black-friday",
    compute: (y) => mmdd(11, lastWeekdayOfMonth(y, 11, 5)), // ultima sexta novembro
    name: "Black Friday",
    pillar: "promo",
    priority: "high",
    postIdea: "Se voce for investir em algo essa Black Friday, invista em voce. Metodo SEM — reeducacao que dura pra sempre.",
    hashtags: "#blackfriday #investaemvoce #metodosem",
    preferredFormat: "imagem",
    storyTemplate: {
      type: "poll",
      question: "Vai usar a Black Friday pra investir em voce?",
      optionA: "Sim, ja decidi",
      optionB: "Ainda to pensando",
    },
  },
];

// ═══════════════════════════════════════════════════════════
// DATAS FIXAS (MM-DD)
// ═══════════════════════════════════════════════════════════

export const COMMEMORATIVE_DATES: CommemorativeDate[] = [
  // ═══ JANEIRO ═══
  {
    date: "01-01", name: "Ano Novo", pillar: "e", priority: "high",
    postIdea: "Nao faca dieta em janeiro. Faca pazes com a comida. O ano inteiro eh seu.",
    hashtags: "#anonovo #recomeco #semdieta",
    hook: "Todo janeiro milhoes de mulheres comecam dieta. Em marco, quase nenhuma continua.",
    keyPoints: [
      "Dieta restritiva tem 95% de falha em 1 ano",
      "Reeducacao eh mudanca gradual — nao eh 'comecar segunda'",
      "O corpo que voce quer pede consistencia, nao punicao",
    ],
    body: "Janeiro nao eh linha de largada. Eh mais um dia na sua jornada. O metodo que funciona nao eh o mais restritivo — eh o que voce consegue manter em marco, junho, outubro. Comeca simples: 1 copo de agua ao acordar, 3 refeicoes com presenca, 15min de movimento. Isso dura. Dieta, nao.",
    preferredFormat: "carrossel",
    storyTemplate: {
      type: "question",
      question: "Qual 1 habito pequeno voce quer construir esse ano?",
      subtitle: "Pequeno eh chave. Grande nao dura.",
    },
  },

  // Janeiro Branco — meses tematicos espalhados (dias-chave)
  {
    date: "01-06", name: "Janeiro Branco — Abertura", pillar: "e", priority: "high",
    postIdea: "Janeiro Branco: um mes dedicado a saude mental. Comeca aqui. Sua mente merece tanto cuidado quanto seu corpo.",
    hashtags: "#janeirobranco #saudemental #autocuidado",
  },
  {
    date: "01-13", name: "Janeiro Branco — Ansiedade", pillar: "e", priority: "normal",
    postIdea: "Ansiedade nao se combate com dieta. Se cuida com sono, movimento, terapia, e comida de verdade. Tudo junto.",
    hashtags: "#janeirobranco #ansiedade #saudemental",
  },
  {
    date: "01-20", name: "Janeiro Branco — Autoestima", pillar: "e", priority: "normal",
    postIdea: "Autoestima nao vem do espelho. Vem de como voce se trata quando ninguem tah olhando.",
    hashtags: "#janeirobranco #autoestima #amorproprio",
  },
  {
    date: "01-27", name: "Janeiro Branco — Terapia", pillar: "e", priority: "normal",
    postIdea: "Terapia eh investimento, nao despesa. Sua mente merece o mesmo cuidado que voce da pra sua alimentacao.",
    hashtags: "#janeirobranco #terapia #psicologia",
  },
  {
    date: "01-31", name: "Dia da Solidariedade", pillar: "e", priority: "low",
    postIdea: "Manda essa mensagem pra uma amiga que precisa ouvir: voce eh suficiente. Do jeito que voce eh.",
    hashtags: "#solidariedade #amizade #empatia",
  },

  // ═══ FEVEREIRO ═══
  {
    date: "02-04", name: "Dia Mundial do Cancer", pillar: "geral", priority: "high",
    postIdea: "Prevencao comeca no prato. Alimentacao rica em vegetais, pouco ultraprocessado, menos alcool — isso eh remedio diario.",
    hashtags: "#diamundialdocancer #prevencao #alimentacao",
    keyPoints: [
      "30-50% dos cancros sao preveniveis com estilo de vida",
      "Vegetais crucíferos (brocolis, couve-flor) sao protetores",
      "Acucar em excesso e ultraprocessados aumentam risco",
    ],
    storyTemplate: {
      type: "poll",
      question: "Voce ja teve alguem proximo com cancer?",
      optionA: "Sim, na familia",
      optionB: "Nao, mas me cuido",
    },
  },
  {
    date: "02-14", name: "Dia de Sao Valentim", pillar: "e", priority: "normal",
    postIdea: "O primeiro amor que precisa de atencao eh o amor por voce mesma. Sem ele, nenhum outro sustenta.",
    hashtags: "#saovalentim #amorproprio #autoestima",
  },

  // ═══ MARCO ═══
  {
    date: "03-04", name: "Dia Mundial da Obesidade", pillar: "s", priority: "high",
    postIdea: "Obesidade nao eh falta de forca de vontade. Eh genetica + ambiente + hormonio + emocao. Culpar nao resolve — metodo resolve.",
    hashtags: "#obesidade #saude #reeducacao",
    hook: "A OMS considera obesidade uma doenca cronica — e nao eh sobre 'comer menos'.",
    keyPoints: [
      "50% das mulheres brasileiras estao com sobrepeso",
      "Restricao severa aumenta ganho de peso a longo prazo",
      "Sono ruim, stress e ultraprocessados sao drivers invisiveis",
    ],
    body: "A narrativa de que 'basta fechar a boca' eh cruel e errada. Obesidade eh multifatorial — envolve hormonio, microbiota, ambiente obesogeniço, historia emocional, sono, stress. O metodo que funciona trabalha tudo isso junto: alimentacao acolhedora, movimento que cabe, sono, gestao emocional. Sem julgamento. Com consistencia.",
    storyTemplate: {
      type: "poll",
      question: "Obesidade eh falta de forca de vontade?",
      optionA: "Nao — eh multifatorial",
      optionB: "Sim, mas sem julgar",
    },
  },
  {
    date: "03-08", name: "Dia Internacional da Mulher", pillar: "e", priority: "high",
    postIdea: "Pra todas as mulheres que estao tentando — voce ja eh extraordinaria. Parabens por existir.",
    hashtags: "#diainternacionaldamulher #mulheres #empoderamento",
    hook: "Pra cada mulher que ja comecou dieta segunda e desistiu quarta.",
    keyPoints: [
      "Voce nao desistiu — voce tentou. Isso ja eh coragem",
      "Corpo de mulher muda todo mes, toda decada, toda gestacao",
      "Nenhuma revista mostra o corpo real de 10 em cada 10 mulheres",
    ],
    body: "Hoje eh sobre reconhecer: voce ja faz muito. Voce trabalha, cuida, aguenta, tenta, chora, levanta. E ainda se cobra um corpo de revista. Essa cobranca precisa parar. Seu corpo eh o veiculo que te trouxe ate aqui. Ele merece gratidao antes de reforma. Isso nao eh resignacao — eh ponto de partida saudavel pra qualquer mudanca.",
    preferredFormat: "carrossel",
    storyTemplate: {
      type: "sequence",
      slides: [
        { text: "Pra toda mulher que ja tentou tudo", emoji: "💚" },
        { text: "Voce nao eh fraca — o metodo eh que era errado", emoji: "🌱" },
        { text: "Reeducacao nao eh punir. Eh acolher e escolher melhor", emoji: "🍽" },
        { text: "Comeca hoje. Um copo de agua. Um prato colorido. Um passo.", emoji: "✨" },
      ],
    },
  },
  {
    date: "03-10", name: "Digital Detox", pillar: "m", priority: "normal",
    postIdea: "Desafio: 1 refeicao por dia SEM celular na mesa. Voce come com mais consciencia — e menos, naturalmente.",
    hashtags: "#digitaldetox #mindfulness #presenca",
  },
  {
    date: "03-17", name: "Dia Mundial do Sono", pillar: "s", priority: "high",
    postIdea: "Dormir mal faz voce comer mais no dia seguinte. Nao eh falta de forca de vontade — eh hormonio.",
    hashtags: "#dormirbem #sono #saude",
    hook: "Noite mal dormida = +200 kcal no dia seguinte. Sem voce perceber.",
    keyPoints: [
      "Pouco sono aumenta grelina (fome) e reduz leptina (saciedade)",
      "Jantar leve 2h antes de deitar melhora sono profundo",
      "Celular no silencioso as 21h eh o unico 'detox' que funciona",
    ],
    body: "Cuidar do sono eh cuidar da alimentacao. Quando voce dorme menos de 6h, seu corpo pede mais carboidrato, mais acucar, mais estoque. Nao eh capricho — eh sobrevivencia. O metodo que funciona inclui sono como base. Nao adianta comer perfeito e dormir mal: o corpo te trai.",
    storyTemplate: {
      type: "poll",
      question: "Quantas horas voce dormiu ontem?",
      optionA: "Menos de 6",
      optionB: "7 ou mais",
    },
  },
  {
    date: "03-20", name: "Dia Mundial da Felicidade", pillar: "e", priority: "normal",
    postIdea: "Felicidade nao eh o numero na balanca. Eh comer sem culpa, se mover com prazer, dormir em paz.",
    hashtags: "#diamundialdafelicidade #bemestar #felicidade",
  },
  {
    date: "03-22", name: "Dia Mundial da Agua", pillar: "s", priority: "high",
    postIdea: "8 copos por dia. Todo dia. Simples assim — e muda tudo.",
    hashtags: "#diamundialdaagua #hidratacao #agua",
    hook: "A maioria das mulheres vive desidratada e pensa que esta com fome.",
    keyPoints: [
      "Sede eh confundida com fome em 40% das vezes",
      "1 copo ao acordar (antes do cafe) ativa metabolismo",
      "Agua com rodela de limao eh otimo — mas nao eh magico",
    ],
    body: "Seu corpo eh 60% agua. Cada orgao — rim, pele, cerebro, intestino — precisa de agua pra funcionar. A conta eh simples: 35ml por kg de peso. Uma mulher de 70kg precisa de 2,4L. Isso nao eh meta de atleta — eh basico. Coloca alarme no celular ate virar habito. Em 2 semanas seu corpo pede sozinho.",
    storyTemplate: {
      type: "poll",
      question: "Voce bebe 8 copos de agua por dia?",
      optionA: "Sim, todo dia",
      optionB: "Nem perto disso",
    },
  },
  {
    date: "03-24", name: "Dia Mundial da Tuberculose", pillar: "geral", priority: "low",
    postIdea: "Saude respiratoria comeca por dentro: alimentacao anti-inflamatoria, nao fumar, movimento diario.",
    hashtags: "#sauderespiratoria #prevencao",
  },
  {
    date: "03-31", name: "Dia da Saude e Nutricao", pillar: "s", priority: "normal",
    postIdea: "Nutricao nao eh restricao. Eh escolher bem, sem culpa, com prazer.",
    hashtags: "#nutricao #reeducacao #saude",
  },

  // ═══ ABRIL ═══
  {
    date: "04-02", name: "Dia Mundial do Autismo", pillar: "geral", priority: "normal",
    postIdea: "Alimentacao de crianca autista precisa de paciencia, texturas, rotina. Cada familia acha seu ritmo. Sem julgamento.",
    hashtags: "#autismo #aceitacao #alimentacao",
  },
  {
    date: "04-07", name: "Dia Mundial da Saude", pillar: "geral", priority: "high",
    postIdea: "Saude nao eh ausencia de doenca. Eh ter energia, disposicao, e paz com o espelho.",
    hashtags: "#diamundialdassaude #saude #bemestar",
    hook: "A OMS define saude como 'bem-estar fisico, mental e social' — nao 'magreza'.",
    keyPoints: [
      "Mulheres ativas vivem em media 7 anos a mais",
      "Saude mental impacta saude fisica diretamente",
      "Pequenos habitos diarios > dieta milagrosa",
    ],
    storyTemplate: {
      type: "poll",
      question: "Como esta sua saude hoje?",
      optionA: "Bem, cuidando",
      optionB: "Precisa de atencao",
    },
  },
  {
    date: "04-19", name: "Dia dos Povos Indigenas", pillar: "s", priority: "low",
    postIdea: "Mandioca, milho, acai, castanha — alimentos nativos brasileiros que sao ouro nutricional.",
    hashtags: "#povosindigenas #alimentosnativos #brasil",
  },
  {
    date: "04-22", name: "Dia da Terra", pillar: "s", priority: "low",
    postIdea: "Cuidar do seu prato eh cuidar do planeta. Comida de verdade, local, sazonal — bom pra voce e pra Terra.",
    hashtags: "#diadaterra #alimentacaosustentavel #sustentabilidade",
  },

  // ═══ MAIO ═══
  {
    date: "05-01", name: "Dia do Trabalho", pillar: "m", priority: "normal",
    postIdea: "Pra quem trabalha o dia inteiro: 5 alongamentos pra fazer na cadeira. Seu corpo agradece.",
    hashtags: "#diadotrabalho #ergonomia #movimento",
  },
  {
    date: "05-12", name: "Dia Internacional da Enfermagem", pillar: "geral", priority: "low",
    postIdea: "Quem cuida de todo mundo precisa lembrar de cuidar de si. Pra enfermeiras que passam turno sem comer: isso nao eh normal.",
    hashtags: "#enfermagem #autocuidado",
  },
  {
    date: "05-15", name: "Dia Internacional da Familia", pillar: "e", priority: "low",
    postIdea: "Comer em familia melhora nutricao, vocabulario de crianca, e saude mental de todo mundo. Sem milagre — eh ciencia.",
    hashtags: "#familia #refeicoesemfamilia",
  },
  {
    date: "05-17", name: "Dia Mundial da Hipertensao", pillar: "s", priority: "high",
    postIdea: "Hipertensao eh silenciosa. Reduzir sodio, dormir bem, e se movimentar previne antes de precisar de remedio.",
    hashtags: "#hipertensao #pressaoalta #prevencao",
    keyPoints: [
      "30% das mulheres adultas tem pressao alta (muitas sem saber)",
      "Excesso de sal nos ultraprocessados eh o grande viloi",
      "30min de caminhada diaria reduz pressao em media 5mmHg",
    ],
    storyTemplate: {
      type: "poll",
      question: "Voce sabe sua pressao arterial?",
      optionA: "Sim, meco",
      optionB: "Nao, nunca medi",
    },
  },
  {
    date: "05-28", name: "Dia Internacional de Acao pela Saude da Mulher", pillar: "e", priority: "high",
    postIdea: "Saude da mulher vai muito alem de ginecologista. Eh sono, alimentacao, movimento, saude mental, e apoio social.",
    hashtags: "#saudedamulher #autocuidado #bemestarfeminino",
    body: "Mulher passa anos cuidando de filho, marido, trabalho, casa. E esquece de si. Dor cronica, fadiga, ansiedade — tudo isso tem sinal antes. Cuidar de voce nao eh luxo, eh necessidade. Comeca com 15min por dia so pra voce. Pra respirar, caminhar, tomar um cha. Isso eh saude da mulher.",
    storyTemplate: {
      type: "question",
      question: "O que voce precisa deixar de fazer pelos outros pra cuidar de voce?",
      subtitle: "Responde na caixinha. Ningem eh egoista por se cuidar.",
    },
  },
  {
    date: "05-31", name: "Dia Mundial Sem Tabaco", pillar: "geral", priority: "normal",
    postIdea: "Largar o cigarro E a dieta restritiva tem algo em comum: precisa de metodo, nao de forca de vontade.",
    hashtags: "#semtabaco #sauderespiratoria #habitos",
  },

  // ═══ JUNHO ═══
  {
    date: "06-05", name: "Dia Mundial do Meio Ambiente", pillar: "s", priority: "low",
    postIdea: "Comer mais vegetal, menos carne, menos ultraprocessado — ganha sua saude e o planeta.",
    hashtags: "#meioambiente #alimentacaosustentavel",
  },
  {
    date: "06-12", name: "Dia dos Namorados", pillar: "e", priority: "normal",
    postIdea: "O melhor presente pro seu corpo: parar de brigar com ele.",
    hashtags: "#diadosnamorados #amorproprio",
  },
  {
    date: "06-21", name: "Dia Internacional do Yoga", pillar: "m", priority: "high",
    postIdea: "Yoga nao eh flexibilidade. Eh presenca. E qualquer mulher pode comecar hoje, em casa, com 10min.",
    hashtags: "#yoga #movimento #mindfulness",
    hook: "Yoga nao eh sobre tocar o pe. Eh sobre habitar o corpo.",
    keyPoints: [
      "10min/dia de yoga reduz cortisol em 14%",
      "Melhora digestao, sono e dor lombar",
      "Nenhuma postura avancada — basta respirar e se mexer",
    ],
    body: "Yoga no Brasil virou coisa de academia chique com roupa cara. Mas yoga eh agachar ao acordar, torcer o tronco na cadeira do escritorio, respirar fundo 3 vezes antes de comer. Eh pausa, consciencia, conexao. Nao precisa de tapete de R$300 nem professor certificado — precisa de 10 minutos e vontade de voltar pra dentro de voce.",
    preferredFormat: "reels",
    storyTemplate: {
      type: "poll",
      question: "Voce se movimenta com prazer ou obrigacao?",
      optionA: "Com prazer",
      optionB: "Quase sempre obrigacao",
    },
  },

  // ═══ JULHO ═══
  {
    date: "07-07", name: "Dia Mundial do Chocolate", pillar: "s", priority: "normal",
    postIdea: "Chocolate amargo (>70%) tem antioxidante, magnesio e pouco acucar. Uma mini-barra por dia eh ate protetora.",
    hashtags: "#chocolate #semculpa #equilibrio",
  },
  {
    date: "07-10", name: "Dia da Pizza", pillar: "s", priority: "normal",
    postIdea: "Dia da pizza! Comer pizza nao arruina nada. O que arruina eh a culpa depois.",
    hashtags: "#pizza #semculpa #reeducacao",
  },
  {
    date: "07-14", name: "Ferias Escolares", pillar: "s", priority: "low",
    postIdea: "Ferias das criancas = rotina diferente. Aproveita pra cozinhar com elas — comer saudavel vira diversao.",
    hashtags: "#ferias #cozinhacomcriancas",
  },
  {
    date: "07-25", name: "Dia da Mulher Negra Latino-Americana e Caribenha", pillar: "e", priority: "high",
    postIdea: "Mulher negra enfrenta carga dupla — trabalho, cuidado, racismo estrutural, sistema de saude que nao escuta. Saude da mulher negra eh prioridade.",
    hashtags: "#mulhernegra #tereza #resistencia",
    keyPoints: [
      "Mulher negra morre 62% mais de parto que a branca",
      "Pressao alta, diabetes e obesidade tem prevalencia maior",
      "Representatividade em saude importa — escolha profissionais que te escutam",
    ],
    storyTemplate: {
      type: "question",
      question: "Seu medico/medica te escuta de verdade?",
      subtitle: "Representatividade importa. Procure quem acolhe.",
    },
  },

  // ═══ AGOSTO ═══
  {
    date: "08-01", name: "Semana Mundial do Aleitamento", pillar: "e", priority: "normal",
    postIdea: "Amamentar eh doacao extrema. Mae que amamenta precisa comer mais, dormir mais, receber apoio. Nao romantize o cansaco.",
    hashtags: "#aleitamento #maternidadereal #apoio",
  },
  {
    date: "08-11", name: "Dia do Estudante", pillar: "s", priority: "low",
    postIdea: "Pra quem estuda: comer a cada 3h mantem a concentracao. Seu cerebro precisa de combustivel.",
    hashtags: "#estudante #concentracao #nutricao",
  },
  {
    date: "08-22", name: "Dia do Folclore", pillar: "s", priority: "low",
    postIdea: "Cada regiao do Brasil tem superalimentos incriveis. Acai no norte, pinhao no sul, pequi no cerrado.",
    hashtags: "#folclore #comidabrasileira",
  },
  {
    date: "08-27", name: "Dia do Psicologo", pillar: "e", priority: "high",
    postIdea: "Terapia nao eh so pra crise. Eh manutencao. Como ir no dentista ou academia — preventivo importa mais.",
    hashtags: "#psicologia #terapia #saudemental",
    keyPoints: [
      "Brasil eh o pais mais ansioso do mundo (OMS)",
      "Terapia online democratizou acesso — muitas por R$ 80-150",
      "Convenio cobre ate 40 sessoes/ano em quase todos os planos",
    ],
    storyTemplate: {
      type: "poll",
      question: "Voce faz terapia?",
      optionA: "Sim, faco",
      optionB: "Ainda nao comecei",
    },
  },
  {
    date: "08-31", name: "Dia do Nutricionista (BR)", pillar: "s", priority: "normal",
    postIdea: "Se voce pode, consulte um nutricionista. O Metodo SEM complementa — nunca substitui.",
    hashtags: "#nutricionista #profissionaldesaude",
  },

  // ═══ SETEMBRO ═══
  {
    date: "09-01", name: "Dia do Educador Fisico", pillar: "m", priority: "low",
    postIdea: "15 minutos de movimento por dia. Eh tudo. O Metodo SEM nao exige academia — exige intencao.",
    hashtags: "#educacaofisica #movimento",
  },

  // Setembro Amarelo — 4 dias-chave
  {
    date: "09-10", name: "Setembro Amarelo — Dia Mundial de Prevencao", pillar: "e", priority: "high",
    postIdea: "Se voce esta em sofrimento, fala com alguem. Ligue 188 (CVV, gratuito, 24h). Voce nao esta sozinha.",
    hashtags: "#setembroamarelo #cvv188 #saudemental",
    hook: "Em 2024 o Brasil registrou 16 mil suicidios. A maioria em silencio.",
    keyPoints: [
      "CVV 188 eh gratuito, 24h, sigiloso",
      "Falar sobre dor mental NAO incentiva — protege",
      "Ouvir sem julgar eh mais importante que ter solucao",
    ],
    body: "Setembro Amarelo existe porque a gente precisa falar. Mulher sofre em silencio. Mae nao pode 'pirar'. Profissional nao pode 'fraquejar'. Essa narrativa mata. Se voce esta em sofrimento, liga 188. Se voce conhece alguem, pergunta: 'Como voce esta de verdade?' Escuta sem consertar. As vezes, presenca eh tudo.",
    storyTemplate: {
      type: "question",
      question: "Como voce esta de verdade hoje?",
      subtitle: "Responde em caixa de pergunta ou pra si mesma. Nao precisa estar bem.",
    },
  },
  {
    date: "09-17", name: "Setembro Amarelo — Rede de Apoio", pillar: "e", priority: "normal",
    postIdea: "Rede de apoio salva vida. Amiga, terapeuta, grupo, familia. Liste 3 pessoas que voce pode ligar as 3h da manha.",
    hashtags: "#setembroamarelo #redeapoio #saudemental",
  },
  {
    date: "09-24", name: "Setembro Amarelo — Autocuidado", pillar: "e", priority: "normal",
    postIdea: "Autocuidado nao eh spa. Eh dormir. Eh terapia. Eh dizer nao. Eh comer. Eh existir sem pedir desculpa.",
    hashtags: "#setembroamarelo #autocuidado #saudemental",
  },

  {
    date: "09-21", name: "Dia da Arvore", pillar: "m", priority: "low",
    postIdea: "Caminhar na natureza por 15min reduz cortisol e ansiedade. Nao eh exercicio — eh remedio.",
    hashtags: "#natureza #caminhada #bemestar",
  },
  {
    date: "09-29", name: "Dia Mundial do Coracao", pillar: "s", priority: "high",
    postIdea: "Doenca cardiovascular eh a maior causa de morte de mulher no Brasil — mais que cancer. Prevencao comeca no prato.",
    hashtags: "#coracao #saudecardiovascular #prevencao",
    keyPoints: [
      "1 em cada 3 mulheres morre de doenca cardiaca — mais que cancer",
      "Menopausa aumenta risco por queda de estrogenio",
      "Gordura abdominal eh mais perigosa que peso total",
    ],
    storyTemplate: {
      type: "poll",
      question: "Ja fez check-up cardiaco esse ano?",
      optionA: "Sim, ja fiz",
      optionB: "Ainda nao",
    },
  },

  // ═══ OUTUBRO ═══
  // Outubro Rosa — 5 dias-chave
  {
    date: "10-01", name: "Outubro Rosa — Abertura", pillar: "geral", priority: "high",
    postIdea: "Outubro Rosa comeca. Prevencao do cancer de mama comeca com autoconhecimento do proprio corpo.",
    hashtags: "#outubrorosa #prevencao #cancerdemama",
    hook: "1 em cada 12 brasileiras desenvolvera cancer de mama ao longo da vida.",
    keyPoints: [
      "Autoexame mensal + mamografia anual depois dos 40",
      "Alimentacao rica em vegetais reduz risco em 20%",
      "Alcool em excesso aumenta risco mais do que muitas mulheres sabem",
    ],
    body: "Outubro Rosa eh sobre prevencao — e prevencao nao eh so mamografia. Eh como voce se alimenta, dorme, se movimenta, bebe, fuma ou nao. 40% dos cancros de mama sao preveniveis por estilo de vida. Isso nao anula a mamografia — soma. Cuidar de si todo dia eh o melhor seguro.",
    storyTemplate: {
      type: "question",
      question: "Quando foi seu ultimo autoexame?",
      subtitle: "Sem julgamento. Agenda pra amanha se nao lembrar.",
    },
  },
  {
    date: "10-08", name: "Outubro Rosa — Autoexame", pillar: "geral", priority: "normal",
    postIdea: "Autoexame mensal eh 5 minutos. No banho, no espelho, na cama. Quanto mais voce conhece seu corpo, mais cedo nota mudanca.",
    hashtags: "#outubrorosa #autoexame #prevencao",
  },
  {
    date: "10-16", name: "Outubro Rosa — Alimentacao Protetora", pillar: "s", priority: "normal",
    postIdea: "Alimentos que protegem: brocolis, cha verde, frutas vermelhas, peixe, sementes de linhaca. Constancia vence dose.",
    hashtags: "#outubrorosa #alimentacao #prevencao",
  },
  {
    date: "10-22", name: "Outubro Rosa — Movimento e Prevencao", pillar: "m", priority: "normal",
    postIdea: "30 minutos de movimento por dia reduz risco de cancer de mama em 25%. Caminhar conta.",
    hashtags: "#outubrorosa #movimento #prevencao",
  },
  {
    date: "10-29", name: "Outubro Rosa — Fechamento", pillar: "e", priority: "normal",
    postIdea: "Cuide das mulheres da sua vida. Liga pra sua mae, sua amiga, sua tia — pergunta se ja fez mamografia. As vezes eh esse empurrao que salva.",
    hashtags: "#outubrorosa #rededeapoio #mulheres",
  },

  {
    date: "10-10", name: "Dia Mundial da Saude Mental", pillar: "e", priority: "high",
    postIdea: "Saude mental nao eh 'estar feliz o tempo todo'. Eh saber pedir ajuda, chorar quando precisa, e procurar apoio.",
    hashtags: "#saudemental #mentalhealth #terapia",
    hook: "Voce sabe o que comeu ontem. Sabe como dormiu. Mas sabe como sua mente esta?",
    keyPoints: [
      "Mulher eh 2x mais propensa a ansiedade e depressao que homem",
      "Menopausa e pre-menstrual impactam humor fortemente",
      "Terapia + movimento + sono eh o triple que funciona",
    ],
    body: "Saude mental da mulher eh uma emergencia silenciosa. Entre TPM, gestacao, pos-parto, perimenopausa e menopausa, o corpo da mulher oscila hormonalmente o tempo todo. Isso impacta humor, energia, desejo. Nao eh frescura — eh biologia. E tratamento existe: terapia, apoio, as vezes medicacao. Pedir ajuda eh forca, nao fraqueza.",
    storyTemplate: {
      type: "question",
      question: "O que pesa mais na sua mente agora?",
      subtitle: "Responde na caixinha — ou so pra voce. Nomear ja alivia.",
    },
  },
  {
    date: "10-11", name: "Dia Internacional da Menina", pillar: "e", priority: "normal",
    postIdea: "Menina nao precisa aprender a fazer dieta com 12 anos. Precisa aprender que seu corpo eh dela — pra habitar, nao pra corrigir.",
    hashtags: "#diadamenina #empoderamento #autoestima",
  },
  {
    date: "10-12", name: "Dia das Criancas", pillar: "e", priority: "low",
    postIdea: "Crianca que come bem foi ensinada — nao nasceu assim. Sem bronca, sem premio, sem pressao. Comendo junto, escolhendo junto.",
    hashtags: "#diadascriancas #alimentacaoinfantil",
  },
  {
    date: "10-16", name: "Dia Mundial da Alimentacao", pillar: "s", priority: "normal",
    postIdea: "Comer eh ato de amor. Por voce, pela sua familia, pelo planeta. Escolha com consciencia.",
    hashtags: "#diamundialdaalimentacao #alimentacaoconsciente",
  },
  {
    date: "10-18", name: "Dia Mundial da Menopausa", pillar: "e", priority: "high",
    postIdea: "Menopausa nao eh fim — eh transicao. E o corpo pede novos cuidados: mais forca, mais proteina, mais sono, mais apoio.",
    hashtags: "#menopausa #saudedamulher #climacterio",
    keyPoints: [
      "Calor, insonia, humor oscilando — tudo tem explicacao hormonal",
      "Forca muscular se torna prioridade (osteoporose)",
      "Gordura abdominal aumenta — nao eh 'falha sua', eh hormonio",
    ],
    body: "A menopausa eh cercada de silencio. Mulher chega nos 45-55 e comeca a sentir: calor, insonia, mente mais lenta, gordura abdominal que nao sai com nada, libido em baixa. Isso nao eh 'envelhecer mal' — eh o corpo se reorganizando. Precisa de novos habitos: mais forca (peso), mais proteina, sono protegido, reposicao hormonal (quando indicada). Conversar com ginecologista eh essencial. Voce nao esta sozinha.",
    storyTemplate: {
      type: "poll",
      question: "Ja conversou com ginecologista sobre menopausa?",
      optionA: "Sim, acompanho",
      optionB: "Ainda nao",
    },
  },
  {
    date: "10-29", name: "Dia Mundial do AVC", pillar: "geral", priority: "normal",
    postIdea: "AVC em mulher eh subdiagnosticado — sintomas diferem. Alimentacao e pressao sob controle previnem.",
    hashtags: "#avc #prevencao #saude",
  },
  {
    date: "10-31", name: "Halloween", pillar: "s", priority: "low",
    postIdea: "A unica coisa assustadora na cozinha eh nao ter um plano.",
    hashtags: "#halloween #planejamento #semdieta",
  },

  // ═══ NOVEMBRO ═══
  // Novembro Azul — 4 dias-chave
  {
    date: "11-01", name: "Novembro Azul — Abertura", pillar: "geral", priority: "normal",
    postIdea: "Novembro Azul comeca. Saude masculina eh assunto de mulher tambem — pai, marido, filho. Cuide de quem voce ama.",
    hashtags: "#novembroazul #saudedohomem",
  },
  {
    date: "11-10", name: "Novembro Azul — Alimentacao e Prostata", pillar: "s", priority: "normal",
    postIdea: "Alimentos que protegem a prostata: tomate, brocolis, chia, oleaginosas. Faz diferenca a partir dos 40.",
    hashtags: "#novembroazul #alimentacao #prostata",
  },
  {
    date: "11-17", name: "Novembro Azul — Check-up", pillar: "geral", priority: "normal",
    postIdea: "Hoje eh dia de mandar mensagem pro homem da sua vida: 'ja fez check-up esse ano?' Mulher cuida mesmo quando nao deveria ser sua conta.",
    hashtags: "#novembroazul #saudepreventiva",
  },
  {
    date: "11-24", name: "Novembro Azul — Saude Mental Masculina", pillar: "e", priority: "normal",
    postIdea: "Homem tambem sofre de depressao, ansiedade, burnout. A diferenca eh que fala menos. Abre espaco, escuta, encoraja terapia.",
    hashtags: "#novembroazul #saudementalmasculina",
  },

  {
    date: "11-14", name: "Dia Mundial do Diabetes", pillar: "s", priority: "high",
    postIdea: "Diabetes tipo 2 eh preveni­vel em 80% dos casos. Nao eh 'azar' — eh estilo de vida. E eh reversivel nas fases iniciais.",
    hashtags: "#diabetes #prevencao #habitos",
    hook: "1 em cada 10 brasileiros tem diabetes — metade sem saber.",
    keyPoints: [
      "Gordura abdominal eh o maior marcador de risco",
      "Reeducacao alimentar + movimento reverte pre-diabetes",
      "Ultraprocessados sao o combustivel da epidemia",
    ],
    body: "Diabetes tipo 2 nao aparece do nada. Leva anos de pre-diabetes silenciosa. Sinais: cansaco apos refeicoes, vontade intensa de doce, aumento de circunferencia abdominal. Exame de hemoglobina glicada (HbA1c) uma vez por ano depois dos 35 eh o que salva. Prevencao ainda eh o melhor remedio: movimento, fibras, menos acucar livre. Simples — mas precisa ser consistente.",
    storyTemplate: {
      type: "poll",
      question: "Ja fez exame de glicada (HbA1c) esse ano?",
      optionA: "Sim, fiz",
      optionB: "Nao lembro ou nunca fiz",
    },
  },
  {
    date: "11-20", name: "Dia da Consciencia Negra", pillar: "e", priority: "high",
    postIdea: "Racismo afeta saude — da pressao alta ao acesso a cuidado. Cuide-se. Exija ser ouvida.",
    hashtags: "#consciencianegra #saudedamulhernegra",
    storyTemplate: {
      type: "question",
      question: "Voce se sente escutada no sistema de saude?",
      subtitle: "Se nao, procure outra profissional. Voce merece.",
    },
  },
  {
    date: "11-25", name: "Dia Internacional pela Eliminacao da Violencia Contra a Mulher", pillar: "e", priority: "high",
    postIdea: "Violencia deixa marca no corpo e na mente. Se voce sofre, nao esta sozinha. Ligue 180. Conte pra quem voce confia. Voce merece seguranca.",
    hashtags: "#25denovembro #violencia #180",
    body: "1 em cada 3 brasileiras ja sofreu violencia fisica, psicologica ou sexual. Isso mexe com sono, apetite, auto-imagem, saude mental e fisica por anos. Se voce esta nessa situacao: ligue 180 (gratuito, sigiloso, 24h). Se voce saiu dela: terapia ajuda a reconstruir. Se voce conhece alguem: escuta sem julgar. Saude da mulher passa por seguranca.",
    storyTemplate: {
      type: "sequence",
      slides: [
        { text: "Se voce sofre violencia", emoji: "💜" },
        { text: "Ligue 180 — gratuito, sigiloso, 24h", emoji: "📞" },
        { text: "Terapia ajuda a reconstruir", emoji: "🌱" },
        { text: "Voce nao esta sozinha", emoji: "🤝" },
      ],
    },
  },

  // ═══ DEZEMBRO ═══
  {
    date: "12-01", name: "Dia Mundial de Luta Contra a AIDS", pillar: "geral", priority: "normal",
    postIdea: "Saude sexual eh saude. Teste, PrEP, preservativo, conversa aberta. Sem tabu.",
    hashtags: "#aids #saudesexual #prevencao",
  },
  {
    date: "12-10", name: "Dia dos Direitos Humanos", pillar: "geral", priority: "low",
    postIdea: "Acesso a saude eh direito humano. Alimentacao adequada, cuidado mental, dignidade no SUS — isso eh luta diaria.",
    hashtags: "#direitoshumanos #saudepublica",
  },
  {
    date: "12-21", name: "Comeco do Verao", pillar: "m", priority: "normal",
    postIdea: "Verao: a melhor epoca pra caminhar de manha, beber mais agua, e comer frutas da estacao.",
    hashtags: "#verao #vidasaudavel",
  },
  {
    date: "12-25", name: "Natal", pillar: "e", priority: "high",
    postIdea: "Natal eh pra comer em familia sem culpa. Amanha voce volta pro seu ritmo. Hoje, aproveite.",
    hashtags: "#natal #semculpa #familia",
    hook: "Metade das mulheres passa a ceia de Natal se cobrando pelo que comeu.",
    keyPoints: [
      "1 dia de 'liberdade' nao engorda — habitos diarios engordam",
      "Come com presenca, nao com ansiedade",
      "Dia 26 nao precisa de 'detox' — precisa de rotina normal",
    ],
    body: "Natal eh sobre estar. Sobre a mesa cheia que demorou o ano todo pra acontecer. Sobre gente que voce so ve em dezembro. Ninguem vai lembrar se voce comeu ou nao comeu a rabanada. Vao lembrar se voce estava presente ou contando carbo. Escolha presente. Segunda-feira voce volta pro copo de agua ao acordar, pra salada no almoco, pra caminhada. A rotina te espera — sem punir.",
    storyTemplate: {
      type: "poll",
      question: "Vai aproveitar a ceia sem culpa?",
      optionA: "Sim, com presenca",
      optionB: "Ainda me cobro demais",
    },
  },
  {
    date: "12-31", name: "Reveillon", pillar: "e", priority: "high",
    postIdea: "Antes de fazer promessas de ano novo, agradeça o corpo que te trouxe ate aqui. Ele merece gentileza.",
    hashtags: "#anonovo #gratidao #reflexao",
    hook: "Voce passou 365 dias nesse corpo. Ele te carregou por cada um.",
    keyPoints: [
      "Em vez de 'emagrecer 10kg em 2026', experimenta 'me cuidar todo dia'",
      "Meta boa eh comportamental, nao resultado",
      "Gratidao eh ponto de partida — nao chegada",
    ],
    storyTemplate: {
      type: "question",
      question: "3 vitorias que voce teve nesse ano?",
      subtitle: "Pode ser pequeno. Pequeno conta.",
    },
  },
];

// ═══════════════════════════════════════════════════════════
// RESOLUÇÃO DE DATAS (fixas + moveis)
// ═══════════════════════════════════════════════════════════

// Resolve moveis pra um ano especifico, retornando CommemorativeDate com fullDate
function resolveMovableForYear(year: number): Array<CommemorativeDate & { fullDate: string }> {
  return MOVABLE_DATES.map((m) => {
    const mmddStr = m.compute(year);
    const { compute: _compute, dateId: _id, ...rest } = m;
    void _compute; void _id;
    return {
      ...rest,
      date: mmddStr,
      fullDate: `${year}-${mmddStr}`,
    };
  });
}

// Retorna datas dos proximos N dias (mescla fixas + moveis do ano atual e proximo)
export function getUpcomingDates(days: number = 30): (CommemorativeDate & { fullDate: string })[] {
  const now = new Date();
  const year = now.getFullYear();
  const results: (CommemorativeDate & { fullDate: string })[] = [];

  // Fixas (checa este ano e proximo)
  for (const d of COMMEMORATIVE_DATES) {
    const [month, day] = d.date.split("-").map(Number);
    const dateThisYear = new Date(year, month - 1, day);
    const dateNextYear = new Date(year + 1, month - 1, day);

    const diffThis = (dateThisYear.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    const diffNext = (dateNextYear.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);

    if (diffThis >= -0.5 && diffThis <= days) {
      results.push({ ...d, fullDate: dateThisYear.toISOString().slice(0, 10) });
    } else if (diffNext >= 0 && diffNext <= days) {
      results.push({ ...d, fullDate: dateNextYear.toISOString().slice(0, 10) });
    }
  }

  // Moveis (resolve este ano e proximo, filtra pelos que caem na janela)
  for (const m of [...resolveMovableForYear(year), ...resolveMovableForYear(year + 1)]) {
    const d = new Date(m.fullDate + "T00:00:00");
    const diff = (d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
    if (diff >= -0.5 && diff <= days) {
      // Evita duplicata (ano atual + ano proximo vale so um)
      if (!results.some((r) => r.fullDate === m.fullDate && r.name === m.name)) {
        results.push(m);
      }
    }
  }

  return results.sort((a, b) => a.fullDate.localeCompare(b.fullDate));
}

// Retorna todas as datas fixas de um mes
export function getDatesForMonth(month: number): CommemorativeDate[] {
  const mm = String(month).padStart(2, "0");
  return COMMEMORATIVE_DATES.filter((d) => d.date.startsWith(mm));
}
