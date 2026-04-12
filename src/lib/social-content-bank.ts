// Banco de conteudo pre-gerado pela Luna (@social) com base nos
// pilares S.E.M. Cada post segue a regra 80/20 (valor/promo) e
// foi validado contra Meta Ad Policy (sem claims de peso/timeframe).
//
// Usado pra seed inicial + inspiracao no calendario semanal.

export type PostTemplate = {
  title: string;
  content: string;
  platform: string;
  format: string;
  pillar: "s" | "e" | "m" | "promo";
  hashtags: string;
  imageBriefing: string;
};

export const CONTENT_BANK: PostTemplate[] = [
  // ═══════════════════════════════════════════════════════
  // PILAR S — SIMPLICIDADE (Nutricao)
  // ═══════════════════════════════════════════════════════
  {
    title: "A regra dos 3 pratos coloridos",
    content: `Voce nao precisa de dieta complicada.\n\nPrecisa de 3 cores no prato.\n\n🟢 Verde (folhas, brocolis, pepino)\n🟠 Laranja/vermelho (cenoura, tomate, abobora)\n🟤 Marrom/bege (arroz integral, feijao, frango)\n\nSe seu prato tem 3 cores, voce ja esta no caminho certo.\n\nIsso e reeducacao alimentar. Simples assim.\n\n#MetodoSEM #Longetividade`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#reeducacaoalimentar #alimentacaosaudavel #semdieta #metodosem #longetividade #mulheresreais #vidapratica #comerbem",
    imageBriefing: "Carrossel 3 slides: cada slide 1 cor de alimento com fundo clean. Paleta verde-oliva do site. Titulo no 1o slide: '3 cores = prato perfeito'",
  },
  {
    title: "O que comer no cafe da manha (sem culpa)",
    content: `Cafe da manha nao precisa ser:\n❌ So fruta\n❌ So ovo\n❌ So pao\n\nPrecisa ter COMBINACAO:\n✅ 1 carboidrato (pao integral, tapioca, aveia)\n✅ 1 proteina (ovo, queijo, iogurte)\n✅ 1 fruta\n\nMix simples. Sustenta ate o almoco. Sem fome das 10h.\n\n#MetodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#cafedamanha #alimentacao #reeducacao #semfome #metodosem #longetividade #dicadesaude",
    imageBriefing: "Carrossel 4 slides: slide 1 titulo, slides 2-3 errado vs certo, slide 4 CTA. Fotos de comida real, paleta quente.",
  },
  {
    title: "Lista de compras inteligente (7 itens)",
    content: `Sua lista de compras nao precisa ter 30 itens.\n\nCom esses 7, voce monta refeicoes pra semana inteira:\n\n1. Ovos (12)\n2. Arroz integral\n3. Feijao\n4. Frango (peito)\n5. Banana + 1 fruta da estacao\n6. Brocolis ou espinafre\n7. Aveia\n\nTotal: ~R$ 80\nRefeicoes: cafe + almoco + jantar + 2 lanches x 7 dias\n\nComplicar e opcional. Simplificar e estrategia.\n\n#MetodoSEM #Longetividade`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#listadecompras #alimentacao #economizar #comerbem #metodosem #reeducacao #praticidade",
    imageBriefing: "Carrossel visual: lista estilo checklist com fotos dos 7 itens. Fundo bege do site. Ultimo slide: total R$80.",
  },

  // ═══════════════════════════════════════════════════════
  // PILAR E — EQUILIBRIO (Emocional)
  // ═══════════════════════════════════════════════════════
  {
    title: "Voce come por fome ou por emocao?",
    content: `Antes de abrir a geladeira, para e pergunta:\n\n\"Estou com fome de verdade ou estou tentando resolver algo?\"\n\nFome real:\n→ Cresce aos poucos\n→ Qualquer comida resolve\n→ Para quando satisfeita\n\nFome emocional:\n→ Aparece de repente\n→ Pede algo especifico (doce, salgado)\n→ Nao para quando satisfeita\n\nNao e fraqueza. E um sinal.\nO Metodo S.E.M te ensina a ouvir esse sinal.\n\n#MetodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "e",
    hashtags: "#fomeemocional #equilibrioemocional #autoconhecimento #semculpa #metodosem #longetividade #saudemental",
    imageBriefing: "Carrossel 5 slides: comparativo visual fome real vs emocional. Cores suaves, tom acolhedor. Sem imagens de corpo.",
  },
  {
    title: "Parar de se culpar depois de comer",
    content: `Comeu um pedaco de bolo na festa?\n\nNao precisa:\n❌ \"Compensar\" no dia seguinte\n❌ Pular o jantar\n❌ Correr 40 min na esteira\n❌ Se odiar no espelho\n\nPrecisa:\n✅ Respirar\n✅ Lembrar que 1 refeicao nao define nada\n✅ Voltar pro proximo prato com consciencia\n\nReeducacao alimentar nao e perfeicao.\nE progresso com gentileza.\n\n#MetodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#semculpa #aceitacao #progressonaoperfeicao #reeducacao #metodosem #longetividade #amorproprio",
    imageBriefing: "Imagem unica com frase destaque: 'Reeducacao nao e perfeicao. E progresso com gentileza.' Fundo verde suave, tipografia Nunito.",
  },
  {
    title: "Stories: Como voce esta hoje?",
    content: `[STORIES INTERATIVO]\n\nSlide 1: \"Como voce acordou hoje?\"\nEnquete: 😊 Bem | 😐 Mais ou menos | 😔 Dificil\n\nSlide 2: \"Independente da resposta...\"\nTexto: \"Voce ja fez a coisa mais importante: acordou e escolheu tentar.\"\n\nSlide 3: \"Sua missao pro dia:\"\nTexto: \"Beber 1 copo de agua AGORA. So isso. O resto vem.\"\n\nSlide 4: CTA\n\"Quer mais dicas assim? Link na bio 👆\"`,
    platform: "stories",
    format: "stories",
    pillar: "e",
    hashtags: "",
    imageBriefing: "4 slides de Stories (1080x1920). Slide 1: enquete com emojis. Slide 2: frase motivacional fundo verde. Slide 3: missao do dia fundo bege. Slide 4: CTA link na bio.",
  },

  // ═══════════════════════════════════════════════════════
  // PILAR M — MOVIMENTO
  // ═══════════════════════════════════════════════════════
  {
    title: "5 alongamentos pra fazer AGORA (no sofa)",
    content: `Nao precisa de academia.\nNao precisa de roupa de ginastica.\nNao precisa nem levantar do sofa.\n\n5 alongamentos em 3 minutos:\n\n1. Pescoco: inclina pro lado, 15s cada\n2. Ombros: roda pra frente, 10x\n3. Tronco: gira sentada, 10x cada lado\n4. Pernas: estica uma, puxa o pe, 15s\n5. Respiracao: inspira 4s, segura 4s, solta 4s\n\n3 minutos. Sem desculpa.\nSeu corpo agradece.\n\n#MetodoSEM #Movimento`,
    platform: "instagram",
    format: "reels",
    pillar: "m",
    hashtags: "#alongamento #movimento #semacademia #exercicioemcasa #metodosem #longetividade #15minutos #bemestar",
    imageBriefing: "Reels: demonstracao dos 5 alongamentos no sofa. Camera fixa, roupa casual, ambiente de casa real. Texto overlay em cada exercicio. 30-45 segundos.",
  },
  {
    title: "Caminhada consciente: 15 min que mudam o dia",
    content: `Caminhada consciente nao e \"ir andar\".\n\nE prestar atencao:\n🦶 No peso de cada passo\n🌬️ Na respiracao entrando e saindo\n🌳 No que voce ve ao redor\n📵 SEM celular\n\n15 minutos.\nVoce volta diferente.\n\nNao e sobre calorias.\nE sobre clareza mental.\n\n#MetodoSEM #Movimento`,
    platform: "instagram",
    format: "imagem",
    pillar: "m",
    hashtags: "#caminhada #mindfulness #movimento #saudemental #metodosem #longetividade #bemestar #vidaativa",
    imageBriefing: "Imagem: silhueta de mulher caminhando ao ar livre, luz dourada. Frase overlay: '15 minutos de presenca'. Paleta verde-dourado.",
  },

  // ═══════════════════════════════════════════════════════
  // PILAR PROMO — SOFT SELL (max 1x/semana)
  // ═══════════════════════════════════════════════════════
  {
    title: "Depoimento: Barbara, a criadora",
    content: `\"Eu criei o Metodo S.E.M porque vivi tudo que voce esta vivendo.\n\nDieta atras de dieta. Frustracao. Culpa.\n\nAte que entendi: o problema nao era eu. Era o metodo.\n\nHoje como com prazer, me movimento com alegria, e me olho no espelho com gentileza.\n\nSe eu consegui, voce tambem consegue.\"\n\n— Barbara, criadora do Longetividade\n\n🔗 Link na bio`,
    platform: "instagram",
    format: "imagem",
    pillar: "promo",
    hashtags: "#depoimento #metodosem #longetividade #reeducacao #transformacao #mulheresreais #semdieta",
    imageBriefing: "Foto da Barbara (ou silhueta) com frase em overlay. Fundo verde escuro, texto branco. Tom pessoal e acolhedor.",
  },
  {
    title: "O que vem no Metodo S.E.M (sem vender)",
    content: `Muita gente pergunta: \"O que exatamente eu recebo?\"\n\nEntao vou mostrar:\n\n📖 Ebook completo (12 capitulos)\n📋 Plano de 7 dias com cardapio\n🛒 Lista de compras estrategica\n✅ Checklist diario imprimivel\n🔄 Tabela de substituicoes\n⚡ 10 atalhos de aceleracao\n\nTudo isso por menos que um delivery.\n\nSem assinatura. Acesso pra sempre.\n\n🔗 Link na bio`,
    platform: "instagram",
    format: "carrossel",
    pillar: "promo",
    hashtags: "#metodosem #ebook #reeducacaoalimentar #longetividade #infoproduto #saudedamulher",
    imageBriefing: "Carrossel: cada slide mostra 1 entregavel com icone bonito. Ultimo slide: preco + CTA. Paleta verde do site.",
  },
];

// Hashtag groups pra reusar
export const HASHTAG_GROUPS = {
  core: "#metodosem #longetividade #reeducacaoalimentar",
  nutricao: "#alimentacaosaudavel #comerbem #semdieta #nutricao",
  emocional: "#saudemental #autoconhecimento #semculpa #amorproprio",
  movimento: "#exercicio #bemestar #vidaativa #saudedamulher",
  engagement: "#mulheresreais #rotina #praticidade #mamae #mulherforte",
};

// Horarios otimizados por plataforma (BRT)
export const BEST_TIMES = {
  instagram_feed: ["11:00", "12:30", "18:00", "19:30"],
  instagram_stories: ["08:00", "09:00", "20:00", "21:30"],
  facebook: ["13:00", "15:00", "16:00"],
  reels: ["12:00", "18:00", "20:00"],
};
