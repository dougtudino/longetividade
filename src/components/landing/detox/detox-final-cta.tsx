"use client";

import { trackInitiateCheckout, trackAddToCart } from "@/lib/tracking";
import { trackCtaClick } from "@/lib/cta-tracking";
import { appendUTMs } from "@/lib/utm";
import { PLAN_BASICO } from "@/config/plans";

export function DetoxFinalCta() {
  function handleCtaClick() {
    const href = appendUTMs(PLAN_BASICO.checkoutUrl);
    trackInitiateCheckout("Calendario Detox 21 Dias", PLAN_BASICO.price);
    trackAddToCart("Calendario Detox 21 Dias", PLAN_BASICO.price);
    trackCtaClick({
      ctaId: "final-detox",
      planId: "basico",
      destinationUrl: href,
    });
  }

  return (
    <section
      className="py-20 md:py-28"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2
          className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          Voce tem 21 dias pela frente.
        </h2>

        <p
          className="font-body text-base md:text-lg leading-relaxed mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          A escolha e simples:
        </p>

        <ul
          className="font-body text-base md:text-lg leading-relaxed mb-8 space-y-2 max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          <li>Continuar comecando segunda-feira que nunca termina,</li>
          <li>
            ou abrir o calendario no dia 1 e marcar a primeira tarefa.
          </li>
        </ul>

        <p
          className="font-body text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Custa <strong style={{ color: "var(--text-primary)" }}>R$67</strong>.
          Demora 5 minutos por dia. Voce ja gastou mais que isso em coisas que
          nao funcionaram.
        </p>

        <a
          href={PLAN_BASICO.checkoutUrl}
          onClick={handleCtaClick}
          data-cta="final-detox"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-3 rounded-2xl py-5 px-10 text-base md:text-lg font-bold text-white transition-all hover:scale-[1.02]"
          style={{
            background:
              "linear-gradient(145deg, var(--accent), var(--accent-hover))",
            boxShadow:
              "0 12px 40px -8px var(--accent-soft), 0 6px 16px -4px rgba(0,0,0,0.15)",
          }}
        >
          Quero meu calendario detox
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>

        <p
          className="mt-5 font-body text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Garantia de 7 dias · Pagamento seguro · Acesso imediato
        </p>

        <p
          className="mt-12 font-body text-sm md:text-base italic max-w-xl mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          P.S. Se voce esta pensando &ldquo;talvez depois&rdquo; — quantas
          segundas-feiras voce ja adiou?
        </p>
      </div>
    </section>
  );
}
