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
  // ═══════════════════════════════════════════════════════
  // SEMANA 3-4 — MAIS CONTEUDO DE VALOR
  // ═══════════════════════════════════════════════════════
  {
    title: "Mito: carboidrato engorda",
    content: `MITO: "Carboidrato engorda"\n\nVERDADE: O que engorda e o EXCESSO — de qualquer coisa.\n\nCarboidrato e combustivel. Seu cerebro PRECISA dele pra funcionar.\n\nO problema nao e o pao. E comer o pao inteiro de uma vez porque ficou 6h sem comer nada.\n\nSolucao S.E.M: coma a cada 3h. Inclua carb em TODA refeicao. Seu corpo agradece.\n\n#MetodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#mitos #carboidrato #reeducacao #semdieta #metodosem #longetividade #nutricao",
    imageBriefing: "Carrossel 5 slides: slide 1 MITO vs VERDADE grande. Slides 2-4 explicacao. Slide 5 CTA salva.",
  },
  {
    title: "3 lanches de 2 minutos",
    content: `Fome das 16h? Nao caia na armadilha do biscoito.\n\n3 lanches em 2 minutos:\n\n🍌 Banana + 1 colher de pasta de amendoim\n🥚 1 ovo cozido + 3 castanhas\n🫙 Iogurte natural + 1 colher de aveia\n\nTodos cabem na bolsa. Todos sustentam ate o jantar.\n\nSimplicidade e estrategia.\n\n#MetodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#lanche #alimentacao #pratico #semdieta #metodosem #longetividade #dicadesaude",
    imageBriefing: "Carrossel 4 slides: cada lanche com foto real e tempo (2 min). Fundo bege.",
  },
  {
    title: "Reels: O que eu como num dia",
    content: `[REELS 30s]\n\nTexto overlay:\n"O que eu como num dia seguindo o Metodo S.E.M"\n\n7h — Cafe: pao integral + ovo + banana\n10h — Lanche: castanhas + fruta\n12h — Almoco: arroz + feijao + frango + salada\n15h — Lanche: iogurte + aveia\n19h — Jantar: sopa de legumes + pao\n21h — Cha de camomila\n\n"Sem contar caloria. Sem passar fome. Sem culpa."\n\nAudio: trending calm/cooking\n\n#MetodoSEM`,
    platform: "instagram",
    format: "reels",
    pillar: "s",
    hashtags: "#oqueeucomo #rotinaalimentar #comidadeverdade #metodosem #longetividade #reeducacao",
    imageBriefing: "Reels: sequencia de pratos reais filmados de cima. Texto overlay em cada corte. 30s, musica calma trending.",
  },
  {
    title: "Voce nao precisa ser perfeita",
    content: `Leia isso devagar:\n\nVoce nao precisa comer perfeitamente.\nVoce nao precisa malhar todo dia.\nVoce nao precisa ter o corpo da capa de revista.\n\nVoce precisa:\n✅ Comer com consciencia\n✅ Se mover com prazer\n✅ Dormir sem culpa\n\nProgresso > perfeicao.\nSempre.\n\n#MetodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#progressonaoperfeicao #amorproprio #autocompaixao #metodosem #longetividade #semculpa",
    imageBriefing: "Imagem unica fundo verde suave. Frase destaque: 'Progresso > Perfeicao'. Tipografia grande, clean.",
  },
  {
    title: "Stories: Verdadeiro ou Falso",
    content: `[STORIES INTERATIVO — QUIZ]\n\nSlide 1: "Verdadeiro ou Falso? 🤔"\nTexto: "Pular o cafe da manha ajuda a emagrecer"\n\nSlide 2: RESULTADO\n"FALSO ❌ — Pular refeicao desacelera o metabolismo e aumenta a fome no almoco. Melhor comer algo leve do que nada."\n\nSlide 3: Quiz 2\n"Beber agua com limao em jejum emagrece"\n\nSlide 4: RESULTADO\n"FALSO ❌ — Limao e otimo mas nao tem poder magico. O que emagrece e a rotina alimentar completa."\n\nSlide 5: CTA\n"Quer mais verdades? Segue @longetividade"`,
    platform: "stories",
    format: "stories",
    pillar: "s",
    hashtags: "",
    imageBriefing: "5 slides Stories. Slide 1+3: fundo verde com pergunta grande. Slide 2+4: resultado com emoji. Slide 5: CTA verde.",
  },
  {
    title: "A arte de dizer NAO pro prato de sobremesa",
    content: `Voce nao precisa dizer NAO.\n\nVoce pode dizer:\n\n"Sim, um pedaco pequeno."\n"Sim, mas vou saborear devagar."\n"Sim, porque hoje e especial."\n"Nao agora, obrigada."\n\nTodas as respostas estao certas.\n\nO que NAO esta certo e comer escondida, comer com culpa, ou se punir depois.\n\nReeducacao e LIBERDADE de escolha.\nNao prisao.\n\n#MetodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#liberdade #semculpa #reeducacao #equilibrio #metodosem #longetividade #compaixao",
    imageBriefing: "Imagem com fundo bege quente. Lista visual das 4 opcoes. Tom acolhedor, sem imagem de comida.",
  },
  {
    title: "Reels: 60 segundos de alongamento matinal",
    content: `[REELS TUTORIAL 45s]\n\nTexto overlay:\n"Acorda, abre esse video, faz junto comigo"\n\n1. Espreguica na cama (10s)\n2. Gira o pescoco devagar (10s)\n3. Levanta e toca os pes (10s)\n4. 3 respiracoes profundas (15s)\n\n"Pronto. Dia comecou diferente."\n\nAudio: som de manha, passaros ou lo-fi suave\n\n#MetodoSEM #Movimento`,
    platform: "instagram",
    format: "reels",
    pillar: "m",
    hashtags: "#alongamento #matinal #rotina #movimento #metodosem #longetividade #bemestar #exercicio",
    imageBriefing: "Reels tutorial: pessoa fazendo 4 movimentos simples na cama/quarto. Luz natural, roupa de dormir. Texto overlay cada exercicio.",
  },
  {
    title: "O poder de 1 copo de agua ao acordar",
    content: `Antes do cafe.\nAntes de olhar o celular.\nAntes de qualquer coisa.\n\n1 copo de agua.\n\nO que acontece no seu corpo:\n💧 Reidrata apos 8h de sono\n🧠 Acorda o cerebro (sim, ele precisa de agua pra funcionar)\n🔥 Ativa o metabolismo\n🌿 Ajuda na digestao do cafe da manha\n\nCusto: R$ 0\nTempo: 30 segundos\nImpacto: enorme\n\n#MetodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#agua #hidratacao #habito #manha #rotina #metodosem #longetividade #saudesimples",
    imageBriefing: "Carrossel 4 slides: slide 1 copo de agua com fundo azul claro. Slides 2-3 beneficios com icones. Slide 4 CTA.",
  },
  {
    title: "Carta aberta pra voce que ja desistiu 10 vezes",
    content: `Pra voce que comecou a dieta segunda e desistiu quarta.\nPra voce que comprou 3 livros de nutricao e nao leu nenhum.\nPra voce que olha no espelho e pensa "de novo nao".\n\nEu te entendo. De verdade.\n\nMas quero te dizer uma coisa:\n\nVoce nao desistiu 10 vezes.\nVoce TENTOU 10 vezes.\n\nE tentar e o oposto de desistir.\n\nO Metodo S.E.M nao e a 11a tentativa.\nE a primeira vez que o metodo e feito PRA VOCE.\n\nSem prazo. Sem perfeicao. No seu ritmo.\n\n💚\n\n#MetodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#motivacao #recomecar #amorproprio #tentardenovo #metodosem #longetividade #mulherforte",
    imageBriefing: "Imagem fundo verde escuro, texto branco. Frase principal: 'Voce nao desistiu 10 vezes. Voce TENTOU 10 vezes.' Tom pessoal.",
  },
  {
    title: "Domingo de reflexao: o que deu certo essa semana?",
    content: `Todo domingo, faca esse exercicio:\n\n📝 Escreva 3 coisas que deram certo essa semana.\n\nNao precisa ser grande.\n\n"Bebi mais agua que o normal."\n"Comi fruta no lanche."\n"Caminhei 10 minutos terça."\n\nPequenas vitorias constroem grandes transformacoes.\n\nE ai, quais foram as suas 3?\nComenta aqui embaixo 👇\n\n#MetodoSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "e",
    hashtags: "#reflexao #domingo #vitorias #gratidao #metodosem #longetividade #habitos #progresso",
    imageBriefing: "Imagem fundo bege, icone de caderno. Texto: '3 vitorias dessa semana'. CTA: comenta aqui. Tom reflexivo.",
  },
  {
    title: "Reels: Troca inteligente que muda tudo",
    content: `[REELS 15s — formato TREND]\n\nTexto overlay rapido:\n\n❌ Refrigerante → ✅ Agua com limao e hortela\n❌ Biscoito recheado → ✅ Banana com pasta de amendoim\n❌ Pao branco → ✅ Pao integral\n❌ Suco de caixinha → ✅ Fruta inteira\n\n"Nao e dieta. E escolha inteligente."\n\nAudio: trending sound (beat drop no reveal)\n\n#MetodoSEM`,
    platform: "instagram",
    format: "reels",
    pillar: "s",
    hashtags: "#troca #alimentacao #escolhainteligente #semdieta #metodosem #longetividade #reeducacao",
    imageBriefing: "Reels 15s: side-by-side rapido de cada troca. Texto grande, cortes rapidos no beat. Trending audio.",
  },
  {
    title: "Stories: Enquete semanal do pilar",
    content: `[STORIES SEMANAL — ENGAJAMENTO]\n\nSlide 1: "Qual pilar voce mais precisa essa semana?"\nEnquete:\n🥗 Simplicidade (nutricao)\n💚 Equilibrio (emocional)\n🏃 Movimento\n\nSlide 2: Resultado + dica do pilar mais votado\n"Maioria votou Equilibrio! Entao a dica de hoje e..."\n\nSlide 3: Dica do pilar vencedor\n\nSlide 4: CTA\n"Volta amanha pra mais dicas do pilar [X]"`,
    platform: "stories",
    format: "stories",
    pillar: "e",
    hashtags: "",
    imageBriefing: "4 slides Stories. Slide 1: enquete 3 opcoes com emojis de pilar. Slide 2: resultado. Slide 3: dica. Slide 4: CTA.",
  },
  {
    title: "5 alimentos que voce ACHA que sao saudaveis (mas nao sao)",
    content: `Cuidado com as armadilhas do "saudavel":\n\n1️⃣ Granola industrializada — mais acucar que chocolate\n2️⃣ Suco de frutas natural — perde a fibra, sobra o acucar\n3️⃣ Barra de cereal — a maioria e doce disfarçado\n4️⃣ Peito de peru — ultraprocessado, cheio de sodio\n5️⃣ Adocante em excesso — pode aumentar vontade de doce\n\nSolucao: COMIDA DE VERDADE.\nFruta inteira. Aveia. Castanhas. Ovo.\n\nSimples > "saudavel de marketing"\n\n#MetodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#alimentossaudaveis #mitos #ultraprocessados #comidadeverdade #metodosem #longetividade #nutricao",
    imageBriefing: "Carrossel 7 slides: cada alimento com foto + X vermelho + explicacao curta. Ultimo slide: alternativas. Visual impactante.",
  },
  {
    title: "Voce sabia? O sono afeta o peso",
    content: `Dormir mal faz voce comer mais no dia seguinte.\n\nNao e falta de disciplina. E HORMONIO.\n\n😴 Menos sono = mais grelina (hormonio da fome)\n😴 Menos sono = menos leptina (hormonio da saciedade)\n😴 Menos sono = mais cortisol (estoque de gordura)\n\nDica S.E.M pra dormir melhor:\n✅ Jantar leve 2h antes de deitar\n✅ Celular no silencioso as 21h\n✅ Cha de camomila (de verdade funciona)\n\nCuidar do sono e cuidar da alimentacao.\n\n#MetodoSEM`,
    platform: "instagram",
    format: "carrossel",
    pillar: "s",
    hashtags: "#sono #hormonios #emagrecer #descanso #metodosem #longetividade #saudeintegral",
    imageBriefing: "Carrossel educativo: slides com icones de hormonio + dicas de sono. Paleta azul-noturno + verde.",
  },
  {
    title: "Desafio: 7 dias bebendo 8 copos de agua",
    content: `Desafio da semana:\n\n💧 Beber 8 copos de agua por dia. 7 dias seguidos.\n\nRegras:\n1. Um copo ao acordar (antes do cafe)\n2. Um copo antes de cada refeicao\n3. Um copo antes de dormir\n4. O resto distribui ao longo do dia\n\nDica: coloque alarme no celular ate virar habito.\n\nQuem topa? Comenta 💧 e me marca no stories fazendo!\n\n#MetodoSEM #DesafioSEM`,
    platform: "instagram",
    format: "imagem",
    pillar: "m",
    hashtags: "#desafio #agua #hidratacao #7dias #habito #metodosem #longetividade #desafiosem",
    imageBriefing: "Imagem com visual de desafio (tipo checklist 7 dias). Fundo azul agua. Icone de copo. CTA: comenta 💧.",
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
