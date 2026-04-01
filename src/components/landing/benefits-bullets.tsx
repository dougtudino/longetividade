const BULLET_GROUPS = [
  {
    title: "Alimentação sem restrição",
    bullets: [
      "Como montar refeições que ajudam a emagrecer sem precisar pesar nada, contar caloria ou seguir cardápio complicado",
      "O alimento \"saudável\" que pode estar sabotando seu emagrecimento sem você desconfiar (página 23)",
      "Como cozinhar UMA refeição pra família inteira e ainda emagrecer -- sem fazer comida separada",
      "Por que \"comer menos\" é exatamente o que está impedindo você de emagrecer (e o que fazer em vez disso)",
      "A lista de compras estratégica que você faz em 20 minutos e que favorece o emagrecimento naturalmente",
      "Por que você NÃO precisa eliminar carboidrato, açúcar ou glúten pra perder peso de forma saudável",
    ],
  },
  {
    title: "Controle emocional",
    bullets: [
      "Como controlar a fome da noite sem força de vontade -- usando uma técnica simples que leva 3 minutos",
      "Como parar de comer por ansiedade sem se privar dos alimentos que você gosta",
      "O pilar que 99% dos programas de emagrecimento ignoram completamente (e sem ele, nenhuma dieta sustenta)",
      "A razão real pelo qual você sente fome descontrolada a partir das 17h -- e o ajuste simples que resolve",
    ],
  },
  {
    title: "Movimento prático",
    bullets: [
      "Como encaixar movimento no seu dia sem pisar numa academia e sem acordar às 5h da manhã",
      "O tipo de movimento que queima mais gordura que 1 hora de esteira -- e você já faz sem perceber",
      "15 minutos por dia: a rotina mínima de movimento que funciona pra mulheres que não têm tempo pra mais nada",
    ],
  },
  {
    title: "Verdades que mudam tudo",
    bullets: [
      "Por que a força de vontade NÃO é o fator que separa quem emagrece de quem não emagrece -- e qual é",
      "Por que mulheres acima de 30 têm MAIS dificuldade com dietas tradicionais -- e a abordagem que funciona pra essa fase",
      "A razão científica pela qual dietas restritivas fazem você ENGORDAR a médio prazo",
      "Os 3 sinais que realmente indicam progresso (e nenhum deles é o número na balança)",
    ],
  },
];

const TOOLS = [
  "Plano de 7 dias com cardápio",
  "Lista de compras pronta",
  "Checklist diário imprimível",
  "Tabela de substituições",
  "10 atalhos de aceleração",
];

function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5" style={{backgroundColor: 'var(--accent-soft)'}}>
      <svg className="w-4 h-4" style={{color: 'var(--accent)'}} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

export function BenefitsBullets() {
  return (
    <section className="py-12 md:py-20" style={{backgroundColor: 'var(--bg-card)'}}>
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="font-heading font-bold text-2xl md:text-4xl text-center mb-10 md:mb-14" style={{color: 'var(--text-primary)'}}>
          Dentro do ebook, você vai descobrir:
        </h2>

        <div className="space-y-8 md:space-y-10">
          {BULLET_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="font-body font-bold text-lg md:text-xl mb-4" style={{color: 'var(--accent)'}}>
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-sm md:text-base leading-relaxed" style={{color: 'var(--text-primary)'}}>
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-14">
          <h3 className="font-body font-bold text-lg text-center mb-6" style={{color: 'var(--accent)'}}>
            Ferramentas práticas inclusas:
          </h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {TOOLS.map((tool) => (
              <div
                key={tool}
                className="border rounded-xl px-4 py-3 text-center"
                style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-default)'}}
              >
                <span className="font-body text-sm font-medium" style={{color: 'var(--text-primary)'}}>
                  {tool}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
