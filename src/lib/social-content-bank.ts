// Banco de conteúdo pré-gerado pela Luna (@social) com base nos
// pilares S.E.M. Cada post segue a regra 80/20 (valor/promo) e
// foi validado contra Meta Ad Policy (sem claims de peso/timeframe).
//
// Usado pra seed inicial + inspiração no calendário semanal.

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
  // PILAR S — SIMPLICIDADE (Nutrição)
  // ═══════════════════════════════════════════════════════
  {
    title: "A regra dos 3 pratos coloridos",
    content: `Você não precisa de dieta complicada.\n\nPrecisa de 3 cores no prato.\n\n🟢 Verde (folhas, brócolis, pepino)\n🟠 Laranja/vermelho (cenoura, tomate, abóbora)\n🟤 Marrom/bege (arroz integral, feijão, frango)\n\nSe seu prato tem 3 cores, você já está no caminho certo.\n\nIsso é reeducação alimentar. Simples assim.\n\n#MétodoSEM #Longetividade`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#reeducacaoalimentar #alimentacaosaudavel #semdieta #metodosem #longetividade #mulheresreais #vidapratica #comerbem",
    imageBriefing: "Carrossel 3 slides: cada slide 1 cor de alimento com fundo clean. Paleta verde-oliva do site. Título no 1º slide: '3 cores = prato perfeito'",
  },
  {
    title: "O que comer no café da manhã (sem culpa)",
    content: `Café da manhã não precisa ser:\n❌ Só fruta\n❌ Só ovo\n❌ Só pão\n\nPrecisa ter COMBINAÇÃO:\n✅ 1 carboidrato (pão integral, tapioca, aveia)\n✅ 1 proteína (ovo, queijo, iogurte)\n✅ 1 fruta\n\nMix simples. Sustenta até o almoço. Sem fome das 10h.\n\n#MétodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#cafedamanha #alimentacao #reeducacao #semfome #metodosem #longetividade #dicadesaude",
    imageBriefing: "Carrossel 4 slides: slide 1 título, slides 2-3 errado vs certo, slide 4 CTA. Fotos de comida real, paleta quente.",
  },
  {
    title: "Lista de compras inteligente (7 itens)",
    content: `Sua lista de compras não precisa ter 30 itens.\n\nCom esses 7, você monta refeições pra semana inteira:\n\n1. Ovos (12)\n2. Arroz integral\n3. Feijão\n4. Frango (peito)\n5. Banana + 1 fruta da estação\n6. Brócolis ou espinafre\n7. Aveia\n\nTotal: ~R$ 80\nRefeições: café + almoço + jantar + 2 lanches x 7 dias\n\nComplicar é opcional. Simplificar é estratégia.\n\n#MétodoSEM #Longetividade`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#listadecompras #alimentacao #economizar #comerbem #metodosem #reeducacao #praticidade",
    imageBriefing: "Carrossel visual: lista estilo checklist com fotos dos 7 itens. Fundo bege do site. Último slide: total R$80.",
  },

  // ═══════════════════════════════════════════════════════
  // PILAR E — EQUILÍBRIO (Emocional)
  // ═══════════════════════════════════════════════════════
  {
    title: "Você come por fome ou por emoção?",
    content: `Antes de abrir a geladeira, para e pergunta:\n\n"Estou com fome de verdade ou estou tentando resolver algo?"\n\nFome real:\n→ Cresce aos poucos\n→ Qualquer comida resolve\n→ Para quando satisfeita\n\nFome emocional:\n→ Aparece de repente\n→ Pede algo específico (doce, salgado)\n→ Não para quando satisfeita\n\nNão é fraqueza. É um sinal.\nO Método S.E.M te ensina a ouvir esse sinal.\n\n#MétodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "e",
    hashtags: "#fomeemocional #equilibrioemocional #autoconhecimento #semculpa #metodosem #longetividade #saudemental",
    imageBriefing: "Carrossel 5 slides: comparativo visual fome real vs emocional. Cores suaves, tom acolhedor. Sem imagens de corpo.",
  },
  {
    title: "Parar de se culpar depois de comer",
    content: `Comeu um pedaço de bolo na festa?\n\nNão precisa:\n❌ "Compensar" no dia seguinte\n❌ Pular o jantar\n❌ Correr 40 min na esteira\n❌ Se odiar no espelho\n\nPrecisa:\n✅ Respirar\n✅ Lembrar que 1 refeição não define nada\n✅ Voltar pro próximo prato com consciência\n\nReeducação alimentar não é perfeição.\nÉ progresso com gentileza.\n\n#MétodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#semculpa #aceitacao #progressonaoperfeicao #reeducacao #metodosem #longetividade #amorproprio",
    imageBriefing: "Imagem única com frase destaque: 'Reeducação não é perfeição. É progresso com gentileza.' Fundo verde suave, tipografia Nunito.",
  },
  {
    title: "Stories: Como você está hoje?",
    content: `[STORIES INTERATIVO]\n\nSlide 1: "Como você acordou hoje?"\nEnquete: 😊 Bem | 😐 Mais ou menos | 😔 Difícil\n\nSlide 2: "Independente da resposta..."\nTexto: "Você já fez a coisa mais importante: acordou e escolheu tentar."\n\nSlide 3: "Sua missão pro dia:"\nTexto: "Beber 1 copo de água AGORA. Só isso. O resto vem."\n\nSlide 4: CTA\n"Quer mais dicas assim? Link na bio 👆"`,
    platform: "stories",
    format: "stories",
    pillar: "e",
    hashtags: "",
    imageBriefing: "4 slides de Stories (1080x1920). Slide 1: enquete com emojis. Slide 2: frase motivacional fundo verde. Slide 3: missão do dia fundo bege. Slide 4: CTA link na bio.",
  },

  // ═══════════════════════════════════════════════════════
  // PILAR M — MOVIMENTO
  // ═══════════════════════════════════════════════════════
  {
    title: "5 alongamentos pra fazer AGORA (no sofá)",
    content: `Não precisa de academia.\nNão precisa de roupa de ginástica.\nNão precisa nem levantar do sofá.\n\n5 alongamentos em 3 minutos:\n\n1. Pescoço: inclina pro lado, 15s cada\n2. Ombros: roda pra frente, 10x\n3. Tronco: gira sentada, 10x cada lado\n4. Pernas: estica uma, puxa o pé, 15s\n5. Respiração: inspira 4s, segura 4s, solta 4s\n\n3 minutos. Sem desculpa.\nSeu corpo agradece.\n\n#MétodoSEM #Movimento`,
    platform: "instagram",
    format: "reels",
    pillar: "m",
    hashtags: "#alongamento #movimento #semacademia #exercicioemcasa #metodosem #longetividade #15minutos #bemestar",
    imageBriefing: "Reels: demonstração dos 5 alongamentos no sofá. Câmera fixa, roupa casual, ambiente de casa real. Texto overlay em cada exercício. 30-45 segundos.",
  },
  {
    title: "Caminhada consciente: 15 min que mudam o dia",
    content: `Caminhada consciente não é "ir andar".\n\nÉ prestar atenção:\n🦶 No peso de cada passo\n🌬️ Na respiração entrando e saindo\n🌳 No que você vê ao redor\n📵 SEM celular\n\n15 minutos.\nVocê volta diferente.\n\nNão é sobre calorias.\nÉ sobre clareza mental.\n\n#MétodoSEM #Movimento`,
    platform: "instagram",
    format: "imagem",
    pillar: "m",
    hashtags: "#caminhada #mindfulness #movimento #saudemental #metodosem #longetividade #bemestar #vidaativa",
    imageBriefing: "Imagem: silhueta de mulher caminhando ao ar livre, luz dourada. Frase overlay: '15 minutos de presença'. Paleta verde-dourado.",
  },

  // ═══════════════════════════════════════════════════════
  // PILAR PROMO — SOFT SELL (max 1x/semana)
  // ═══════════════════════════════════════════════════════
  {
    title: "Depoimento: Barbara, a criadora",
    content: `"Eu criei o Método S.E.M porque vivi tudo que você está vivendo.\n\nDieta atrás de dieta. Frustração. Culpa.\n\nAté que entendi: o problema não era eu. Era o método.\n\nHoje como com prazer, me movimento com alegria, e me olho no espelho com gentileza.\n\nSe eu consegui, você também consegue."\n\n— Barbara, criadora do Longetividade\n\n🔗 Link na bio`,
    platform: "instagram",
    format: "imagem",
    pillar: "promo",
    hashtags: "#depoimento #metodosem #longetividade #reeducacao #transformacao #mulheresreais #semdieta",
    imageBriefing: "Foto da Barbara (ou silhueta) com frase em overlay. Fundo verde escuro, texto branco. Tom pessoal e acolhedor.",
  },
  {
    title: "O que vem no Método S.E.M (sem vender)",
    content: `Muita gente pergunta: "O que exatamente eu recebo?"\n\nEntão vou mostrar:\n\n📖 Ebook completo (12 capítulos)\n📋 Plano de 7 dias com cardápio\n🛒 Lista de compras estratégica\n✅ Checklist diário imprimível\n🔄 Tabela de substituições\n⚡ 10 atalhos de aceleração\n\nTudo isso por menos que um delivery.\n\nSem assinatura. Acesso pra sempre.\n\n🔗 Link na bio`,
    platform: "instagram",
    format: "carrossel",
    pillar: "promo",
    hashtags: "#metodosem #ebook #reeducacaoalimentar #longetividade #infoproduto #saudedamulher",
    imageBriefing: "Carrossel: cada slide mostra 1 entregável com ícone bonito. Último slide: preço + CTA. Paleta verde do site.",
  },
  // ═══════════════════════════════════════════════════════
  // SEMANA 3-4 — MAIS CONTEÚDO DE VALOR
  // ═══════════════════════════════════════════════════════
  {
    title: "Mito: carboidrato engorda",
    content: `MITO: "Carboidrato engorda"\n\nVERDADE: O que engorda é o EXCESSO — de qualquer coisa.\n\nCarboidrato é combustível. Seu cérebro PRECISA dele pra funcionar.\n\nO problema não é o pão. É comer o pão inteiro de uma vez porque ficou 6h sem comer nada.\n\nSolução S.E.M: coma a cada 3h. Inclua carb em TODA refeição. Seu corpo agradece.\n\n#MétodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#mitos #carboidrato #reeducacao #semdieta #metodosem #longetividade #nutricao",
    imageBriefing: "Carrossel 5 slides: slide 1 MITO vs VERDADE grande. Slides 2-4 explicação. Slide 5 CTA salva.",
  },
  {
    title: "3 lanches de 2 minutos",
    content: `Fome das 16h? Não caia na armadilha do biscoito.\n\n3 lanches em 2 minutos:\n\n🍌 Banana + 1 colher de pasta de amendoim\n🥚 1 ovo cozido + 3 castanhas\n🫙 Iogurte natural + 1 colher de aveia\n\nTodos cabem na bolsa. Todos sustentam até o jantar.\n\nSimplicidade é estratégia.\n\n#MétodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#lanche #alimentacao #pratico #semdieta #metodosem #longetividade #dicadesaude",
    imageBriefing: "Carrossel 4 slides: cada lanche com foto real e tempo (2 min). Fundo bege.",
  },
  {
    title: "Reels: O que eu como num dia",
    content: `[REELS 30s]\n\nTexto overlay:\n"O que eu como num dia seguindo o Método S.E.M"\n\n7h — Café: pão integral + ovo + banana\n10h — Lanche: castanhas + fruta\n12h — Almoço: arroz + feijão + frango + salada\n15h — Lanche: iogurte + aveia\n19h — Jantar: sopa de legumes + pão\n21h — Chá de camomila\n\n"Sem contar caloria. Sem passar fome. Sem culpa."\n\nÁudio: trending calm/cooking\n\n#MétodoSEM`,
    platform: "instagram",
    format: "reels",
    pillar: "s",
    hashtags: "#oqueeucomo #rotinaalimentar #comidadeverdade #metodosem #longetividade #reeducacao",
    imageBriefing: "Reels: sequência de pratos reais filmados de cima. Texto overlay em cada corte. 30s, música calma trending.",
  },
  {
    title: "Você não precisa ser perfeita",
    content: `Leia isso devagar:\n\nVocê não precisa comer perfeitamente.\nVocê não precisa malhar todo dia.\nVocê não precisa ter o corpo da capa de revista.\n\nVocê precisa:\n✅ Comer com consciência\n✅ Se mover com prazer\n✅ Dormir sem culpa\n\nProgresso > perfeição.\nSempre.\n\n#MétodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#progressonaoperfeicao #amorproprio #autocompaixao #metodosem #longetividade #semculpa",
    imageBriefing: "Imagem única fundo verde suave. Frase destaque: 'Progresso > Perfeição'. Tipografia grande, clean.",
  },
  {
    title: "Stories: Verdadeiro ou Falso",
    content: `[STORIES INTERATIVO — QUIZ]\n\nSlide 1: "Verdadeiro ou Falso? 🤔"\nTexto: "Pular o café da manhã ajuda a emagrecer"\n\nSlide 2: RESULTADO\n"FALSO ❌ — Pular refeição desacelera o metabolismo e aumenta a fome no almoço. Melhor comer algo leve do que nada."\n\nSlide 3: Quiz 2\n"Beber água com limão em jejum emagrece"\n\nSlide 4: RESULTADO\n"FALSO ❌ — Limão é ótimo mas não tem poder mágico. O que emagrece é a rotina alimentar completa."\n\nSlide 5: CTA\n"Quer mais verdades? Segue @longetividade"`,
    platform: "stories",
    format: "stories",
    pillar: "s",
    hashtags: "",
    imageBriefing: "5 slides Stories. Slide 1+3: fundo verde com pergunta grande. Slide 2+4: resultado com emoji. Slide 5: CTA verde.",
  },
  {
    title: "A arte de dizer NÃO pro prato de sobremesa",
    content: `Você não precisa dizer NÃO.\n\nVocê pode dizer:\n\n"Sim, um pedaço pequeno."\n"Sim, mas vou saborear devagar."\n"Sim, porque hoje é especial."\n"Não agora, obrigada."\n\nTodas as respostas estão certas.\n\nO que NÃO está certo é comer escondida, comer com culpa, ou se punir depois.\n\nReeducação é LIBERDADE de escolha.\nNão prisão.\n\n#MétodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#liberdade #semculpa #reeducacao #equilibrio #metodosem #longetividade #compaixao",
    imageBriefing: "Imagem com fundo bege quente. Lista visual das 4 opções. Tom acolhedor, sem imagem de comida.",
  },
  {
    title: "Reels: 60 segundos de alongamento matinal",
    content: `[REELS TUTORIAL 45s]\n\nTexto overlay:\n"Acorda, abre esse vídeo, faz junto comigo"\n\n1. Espreguiça na cama (10s)\n2. Gira o pescoço devagar (10s)\n3. Levanta e toca os pés (10s)\n4. 3 respirações profundas (15s)\n\n"Pronto. Dia começou diferente."\n\nÁudio: som de manhã, pássaros ou lo-fi suave\n\n#MétodoSEM #Movimento`,
    platform: "instagram",
    format: "reels",
    pillar: "m",
    hashtags: "#alongamento #matinal #rotina #movimento #metodosem #longetividade #bemestar #exercicio",
    imageBriefing: "Reels tutorial: pessoa fazendo 4 movimentos simples na cama/quarto. Luz natural, roupa de dormir. Texto overlay cada exercício.",
  },
  {
    title: "O poder de 1 copo de água ao acordar",
    content: `Antes do café.\nAntes de olhar o celular.\nAntes de qualquer coisa.\n\n1 copo de água.\n\nO que acontece no seu corpo:\n💧 Reidrata após 8h de sono\n🧠 Acorda o cérebro (sim, ele precisa de água pra funcionar)\n🔥 Ativa o metabolismo\n🌿 Ajuda na digestão do café da manhã\n\nCusto: R$ 0\nTempo: 30 segundos\nImpacto: enorme\n\n#MétodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#agua #hidratacao #habito #manha #rotina #metodosem #longetividade #saudesimples",
    imageBriefing: "Carrossel 4 slides: slide 1 copo de água com fundo azul claro. Slides 2-3 benefícios com ícones. Slide 4 CTA.",
  },
  {
    title: "Carta aberta pra você que já desistiu 10 vezes",
    content: `Pra você que começou a dieta segunda e desistiu quarta.\nPra você que comprou 3 livros de nutrição e não leu nenhum.\nPra você que olha no espelho e pensa "de novo não".\n\nEu te entendo. De verdade.\n\nMas quero te dizer uma coisa:\n\nVocê não desistiu 10 vezes.\nVocê TENTOU 10 vezes.\n\nE tentar é o oposto de desistir.\n\nO Método S.E.M não é a 11ª tentativa.\nÉ a primeira vez que o método é feito PRA VOCÊ.\n\nSem prazo. Sem perfeição. No seu ritmo.\n\n💚\n\n#MétodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#motivacao #recomecar #amorproprio #tentardenovo #metodosem #longetividade #mulherforte",
    imageBriefing: "Imagem fundo verde escuro, texto branco. Frase principal: 'Você não desistiu 10 vezes. Você TENTOU 10 vezes.' Tom pessoal.",
  },
  {
    title: "Domingo de reflexão: o que deu certo essa semana?",
    content: `Todo domingo, faça esse exercício:\n\n📝 Escreva 3 coisas que deram certo essa semana.\n\nNão precisa ser grande.\n\n"Bebi mais água que o normal."\n"Comi fruta no lanche."\n"Caminhei 10 minutos terça."\n\nPequenas vitórias constroem grandes transformações.\n\nE aí, quais foram as suas 3?\nComenta aqui embaixo 👇\n\n#MétodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#reflexao #domingo #vitorias #gratidao #metodosem #longetividade #habitos #progresso",
    imageBriefing: "Imagem fundo bege, ícone de caderno. Texto: '3 vitórias dessa semana'. CTA: comenta aqui. Tom reflexivo.",
  },
  {
    title: "Reels: Troca inteligente que muda tudo",
    content: `[REELS 15s — formato TREND]\n\nTexto overlay rápido:\n\n❌ Refrigerante → ✅ Água com limão e hortelã\n❌ Biscoito recheado → ✅ Banana com pasta de amendoim\n❌ Pão branco → ✅ Pão integral\n❌ Suco de caixinha → ✅ Fruta inteira\n\n"Não é dieta. É escolha inteligente."\n\nÁudio: trending sound (beat drop no reveal)\n\n#MétodoSEM`,
    platform: "instagram",
    format: "reels",
    pillar: "s",
    hashtags: "#troca #alimentacao #escolhainteligente #semdieta #metodosem #longetividade #reeducacao",
    imageBriefing: "Reels 15s: side-by-side rápido de cada troca. Texto grande, cortes rápidos no beat. Trending audio.",
  },
  {
    title: "Stories: Enquete semanal do pilar",
    content: `[STORIES SEMANAL — ENGAJAMENTO]\n\nSlide 1: "Qual pilar você mais precisa essa semana?"\nEnquete:\n🥗 Simplicidade (nutrição)\n💚 Equilíbrio (emocional)\n🏃 Movimento\n\nSlide 2: Resultado + dica do pilar mais votado\n"Maioria votou Equilíbrio! Então a dica de hoje é..."\n\nSlide 3: Dica do pilar vencedor\n\nSlide 4: CTA\n"Volta amanhã pra mais dicas do pilar [X]"`,
    platform: "stories",
    format: "stories",
    pillar: "e",
    hashtags: "",
    imageBriefing: "4 slides Stories. Slide 1: enquete 3 opções com emojis de pilar. Slide 2: resultado. Slide 3: dica. Slide 4: CTA.",
  },
  {
    title: "5 alimentos que você ACHA que são saudáveis (mas não são)",
    content: `Cuidado com as armadilhas do "saudável":\n\n1️⃣ Granola industrializada — mais açúcar que chocolate\n2️⃣ Suco de frutas natural — perde a fibra, sobra o açúcar\n3️⃣ Barra de cereal — a maioria é doce disfarçado\n4️⃣ Peito de peru — ultraprocessado, cheio de sódio\n5️⃣ Adoçante em excesso — pode aumentar vontade de doce\n\nSolução: COMIDA DE VERDADE.\nFruta inteira. Aveia. Castanhas. Ovo.\n\nSimples > "saudável de marketing"\n\n#MétodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#alimentossaudaveis #mitos #ultraprocessados #comidadeverdade #metodosem #longetividade #nutricao",
    imageBriefing: "Carrossel 7 slides: cada alimento com foto + X vermelho + explicação curta. Último slide: alternativas. Visual impactante.",
  },
  {
    title: "Você sabia? O sono afeta o peso",
    content: `Dormir mal faz você comer mais no dia seguinte.\n\nNão é falta de disciplina. É HORMÔNIO.\n\n😴 Menos sono = mais grelina (hormônio da fome)\n😴 Menos sono = menos leptina (hormônio da saciedade)\n😴 Menos sono = mais cortisol (estoque de gordura)\n\nDica S.E.M pra dormir melhor:\n✅ Jantar leve 2h antes de deitar\n✅ Celular no silencioso às 21h\n✅ Chá de camomila (de verdade funciona)\n\nCuidar do sono é cuidar da alimentação.\n\n#MétodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#sono #hormonios #emagrecer #descanso #metodosem #longetividade #saudeintegral",
    imageBriefing: "Carrossel educativo: slides com ícones de hormônio + dicas de sono. Paleta azul-noturno + verde.",
  },
  {
    title: "Desafio: 7 dias bebendo 8 copos de água",
    content: `Desafio da semana:\n\n💧 Beber 8 copos de água por dia. 7 dias seguidos.\n\nRegras:\n1. Um copo ao acordar (antes do café)\n2. Um copo antes de cada refeição\n3. Um copo antes de dormir\n4. O resto distribui ao longo do dia\n\nDica: coloque alarme no celular até virar hábito.\n\nQuem topa? Comenta 💧 e me marca no stories fazendo!\n\n#MétodoSEM #DesafioSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "m",
    hashtags: "#desafio #agua #hidratacao #7dias #habito #metodosem #longetividade #desafiosem",
    imageBriefing: "Imagem com visual de desafio (tipo checklist 7 dias). Fundo azul água. Ícone de copo. CTA: comenta 💧.",
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

// Horários otimizados por plataforma (BRT)
export const BEST_TIMES = {
  instagram_feed: ["11:00", "12:30", "18:00", "19:30"],
  instagram_stories: ["08:00", "09:00", "20:00", "21:30"],
  facebook: ["13:00", "15:00", "16:00"],
  reels: ["12:00", "18:00", "20:00"],
};
