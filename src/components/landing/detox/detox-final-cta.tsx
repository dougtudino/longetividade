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
      className="relative overflow-hidden py-24 md:py-36"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      {/* Backdrop sage decorativo */}
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle at center, var(--accent-soft) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <span
          className="inline-block font-body text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] mb-4"
          style={{ color: "var(--accent)" }}
        >
          Ultimo passo
        </span>

        <h2
          className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.05] mb-8"
          style={{
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Daqui 21 dias voce vai ter um calendario inteiro marcado.
        </h2>

        <ul
          className="font-body text-base md:text-lg leading-relaxed mb-8 space-y-2 max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          <li>Da pra continuar adiando pra segunda.</li>
          <li>Ou abrir o calendario hoje e marcar a primeira coisinha.</li>
        </ul>

        <p
          className="font-body text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Sao 5 minutos por dia.{" "}
          <strong style={{ color: "var(--text-primary)" }}>R$67</strong> uma vez
          so. Voce ja gastou mais em coisas que nem lembra mais.
        </p>

        <a
          href={PLAN_BASICO.checkoutUrl}
          onClick={handleCtaClick}
          data-cta="final-detox"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-3 rounded-2xl py-6 px-12 text-lg md:text-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(145deg, var(--accent), var(--accent-hover))",
            boxShadow:
              "0 18px 56px -14px var(--accent-soft), 0 8px 20px -6px rgba(0,0,0,0.2)",
          }}
        >
          Quero meu calendario detox
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>

        <p
          className="mt-6 font-body text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Garantia de 7 dias · Pagamento seguro · Acesso imediato
        </p>

        <div
          aria-hidden
          className="mx-auto max-w-xs my-12 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--border-default), transparent)",
          }}
        />

        <p
          className="font-body text-sm md:text-base italic max-w-xl mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          P.S. Se ta pensando &ldquo;comeco semana que vem&rdquo; — quantas
          semanas que vem ja passaram?
        </p>
      </div>
    </section>
  );
}
