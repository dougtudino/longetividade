const BULLET_GROUPS = [
  {
    title: "Alimentacao sem restricao",
    bullets: [
      "Como montar refeicoes que ajudam a emagrecer sem precisar pesar nada, contar caloria ou seguir cardapio complicado",
      "O alimento \"saudavel\" que pode estar sabotando seu emagrecimento sem voce desconfiar (pagina 23)",
      "Como cozinhar UMA refeicao pra familia inteira e ainda emagrecer -- sem fazer comida separada",
      "Por que \"comer menos\" e exatamente o que esta impedindo voce de emagrecer (e o que fazer em vez disso)",
      "A lista de compras estrategica que voce faz em 20 minutos e que favorece o emagrecimento naturalmente",
      "Por que voce NAO precisa eliminar carboidrato, acucar ou gluten pra perder peso de forma saudavel",
    ],
  },
  {
    title: "Controle emocional",
    bullets: [
      "Como controlar a fome da noite sem forca de vontade -- usando uma tecnica simples que leva 3 minutos",
      "Como parar de comer por ansiedade sem se privar dos alimentos que voce gosta",
      "O pilar que 99% dos programas de emagrecimento ignoram completamente (e sem ele, nenhuma dieta sustenta)",
      "A razao real pelo qual voce sente fome descontrolada a partir das 17h -- e o ajuste simples que resolve",
    ],
  },
  {
    title: "Movimento pratico",
    bullets: [
      "Como encaixar movimento no seu dia sem pisar numa academia e sem acordar as 5h da manha",
      "O tipo de movimento que queima mais gordura que 1 hora de esteira -- e voce ja faz sem perceber",
      "15 minutos por dia: a rotina minima de movimento que funciona pra mulheres que nao tem tempo pra mais nada",
    ],
  },
  {
    title: "Verdades que mudam tudo",
    bullets: [
      "Por que a forca de vontade NAO e o fator que separa quem emagrece de quem nao emagrece -- e qual e",
      "Por que mulheres acima de 30 tem MAIS dificuldade com dietas tradicionais -- e a abordagem que funciona pra essa fase",
      "A razao cientifica pela qual dietas restritivas fazem voce ENGORDAR a medio prazo",
      "Os 3 sinais que realmente indicam progresso (e nenhum deles e o numero na balanca)",
    ],
  },
];

const TOOLS = [
  "Plano de 7 dias com cardapio",
  "Lista de compras pronta",
  "Checklist diario imprimivel",
  "Tabela de substituicoes",
  "10 atalhos de aceleracao",
];

function CheckIcon() {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-light flex items-center justify-center mt-0.5">
      <svg className="w-4 h-4 text-olive" fill="currentColor" viewBox="0 0 20 20">
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
    <section className="py-12 md:py-20 bg-cream-white">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="font-heading font-bold text-charcoal text-2xl md:text-4xl text-center mb-10 md:mb-14">
          Dentro do ebook, voce vai descobrir:
        </h2>

        <div className="space-y-8 md:space-y-10">
          {BULLET_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="font-body font-bold text-olive text-lg md:text-xl mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckIcon />
                    <span className="font-body text-charcoal text-sm md:text-base leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-14">
          <h3 className="font-body font-bold text-olive text-lg text-center mb-6">
            Ferramentas praticas inclusas:
          </h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {TOOLS.map((tool) => (
              <div
                key={tool}
                className="bg-white border border-light-gray rounded-xl px-4 py-3 text-center"
              >
                <span className="font-body text-charcoal text-sm font-medium">
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
