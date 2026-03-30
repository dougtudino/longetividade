import { PLANS } from "@/config/plans";

const ANCHOR_ITEMS = [
  { item: "Consulta com nutricionista", value: "R$ 200 - R$ 400" },
  { item: "Programa online (mensal)", value: "R$ 97 - R$ 297" },
  { item: "Academia que voce nao vai", value: "R$ 80 - R$ 150/mes" },
  { item: "Fast food sem planejamento", value: "R$ 300 - R$ 600/mes" },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-12 md:py-20 bg-white scroll-mt-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="font-heading font-bold text-charcoal text-2xl md:text-4xl text-center mb-8">
          Quanto vale transformar sua relacao com comida?
        </h2>

        <div className="mx-auto max-w-lg mb-10">
          <div className="space-y-2">
            {ANCHOR_ITEMS.map((a) => (
              <div
                key={a.item}
                className="flex justify-between font-body text-sm md:text-base text-dark-gray"
              >
                <span>{a.item}</span>
                <span className="font-medium text-charcoal">{a.value}</span>
              </div>
            ))}
          </div>
          <p className="font-body text-charcoal text-base md:text-lg font-medium mt-4 text-center">
            Facilmente voce gasta mais de{" "}
            <strong>R$ 800 por mes</strong> tentando resolver de formas que nao
            funcionam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 md:p-8 border-2 transition-transform ${
                plan.highlighted
                  ? "border-sage bg-white md:scale-105 shadow-xl"
                  : "border-light-gray bg-white"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage text-white font-body font-bold text-xs uppercase tracking-wider px-4 py-1 rounded-full">
                  MAIS ESCOLHIDO
                </span>
              )}

              <h3 className="font-body font-bold text-charcoal text-lg text-center mb-1">
                {plan.name}
              </h3>
              <div className="text-center mb-4">
                <span className="font-heading font-extrabold text-charcoal text-4xl">
                  R$ {plan.price}
                </span>
                <p className="font-body text-medium-gray text-sm mt-1">
                  ou {plan.installments}
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-sage flex-shrink-0 mt-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-body text-dark-gray text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={`/checkout?plan=${plan.id}`}
                className={`block w-full text-center font-body font-bold text-base py-3.5 rounded-xl transition-colors ${
                  plan.highlighted
                    ? "bg-sage hover:bg-olive text-white"
                    : "border-2 border-sage text-sage hover:bg-sage hover:text-white"
                }`}
              >
                {plan.ctaLabel}
              </a>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-10 md:mt-14 mx-auto max-w-xl bg-sage-light border-2 border-dashed border-sage rounded-xl p-6 md:p-8 text-center">
          <svg
            className="w-10 h-10 text-olive mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          <h3 className="font-body font-bold text-olive text-lg mb-2">
            GARANTIA INCONDICIONAL DE 7 DIAS
          </h3>
          <p className="font-body text-dark-gray text-sm leading-relaxed">
            Risco zero. Se nao gostar, devolvemos 100% do seu dinheiro. Sem
            perguntas. Sem burocracia.
          </p>
        </div>
      </div>
    </section>
  );
}
