import { PLANS } from "@/config/plans";
import { VipBanner } from "./vip-banner";

const ANCHOR_ITEMS = [
  { item: "Consulta com nutricionista", value: "R$ 200 - R$ 400" },
  { item: "Programa online (mensal)", value: "R$ 97 - R$ 297" },
  { item: "Academia que voce nao vai", value: "R$ 80 - R$ 150/mes" },
  { item: "Fast food sem planejamento", value: "R$ 300 - R$ 600/mes" },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-12 md:py-20 scroll-mt-16" style={{backgroundColor: 'var(--bg-card)'}}>
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="font-heading font-bold text-2xl md:text-4xl text-center mb-8" style={{color: 'var(--text-primary)'}}>
          Quanto vale transformar sua relacao com comida?
        </h2>

        <div className="mx-auto max-w-lg mb-10">
          <div className="space-y-2">
            {ANCHOR_ITEMS.map((a) => (
              <div
                key={a.item}
                className="flex justify-between font-body text-sm md:text-base"
                style={{color: 'var(--text-secondary)'}}
              >
                <span>{a.item}</span>
                <span className="font-medium" style={{color: 'var(--text-primary)'}}>{a.value}</span>
              </div>
            ))}
          </div>
          <p className="font-body text-base md:text-lg font-medium mt-4 text-center" style={{color: 'var(--text-primary)'}}>
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
                  ? "md:scale-105 shadow-xl"
                  : ""
              }`}
              style={{
                borderColor: plan.highlighted ? 'var(--accent)' : 'var(--border-default)',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white font-body font-bold text-xs uppercase tracking-wider px-4 py-1 rounded-full" style={{backgroundColor: 'var(--accent)'}}>
                  MAIS ESCOLHIDO
                </span>
              )}
              {plan.id === "vip" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-body font-bold text-xs uppercase tracking-wider px-4 py-1 rounded-full" style={{backgroundColor: '#639922', color: 'white'}}>
                  Inclui App Vitalicio
                </span>
              )}

              <h3 className="font-body font-bold text-lg text-center mb-1" style={{color: 'var(--text-primary)'}}>
                {plan.name}
              </h3>
              <div className="text-center mb-4">
                <span className="font-heading font-extrabold text-4xl" style={{color: 'var(--text-primary)'}}>
                  R$ {plan.price}
                </span>
                <p className="font-body text-sm mt-1" style={{color: 'var(--text-muted)'}}>
                  ou {plan.installments}
                </p>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0 mt-1"
                      style={{color: 'var(--accent)'}}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-body text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center font-body font-bold text-base py-3.5 rounded-xl transition-colors ${
                  plan.highlighted
                    ? "text-white"
                    : "border-2"
                }`}
                style={
                  plan.highlighted
                    ? {backgroundColor: 'var(--accent)'}
                    : {borderColor: 'var(--accent)', color: 'var(--accent)'}
                }
              >
                {plan.ctaLabel}
              </a>
            </div>
          ))}
        </div>

        {/* VIP Banner */}
        <VipBanner />

        {/* Guarantee */}
        <div className="mt-10 md:mt-14 mx-auto max-w-xl border-2 border-dashed rounded-xl p-6 md:p-8 text-center" style={{backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)'}}>
          <svg
            className="w-10 h-10 mx-auto mb-3"
            style={{color: 'var(--accent)'}}
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
          <h3 className="font-body font-bold text-lg mb-2" style={{color: 'var(--accent)'}}>
            GARANTIA INCONDICIONAL DE 7 DIAS
          </h3>
          <p className="font-body text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
            Risco zero. Se nao gostar, devolvemos 100% do seu dinheiro. Sem
            perguntas. Sem burocracia.
          </p>
        </div>
      </div>
    </section>
  );
}
