"use client";

import { trackCtaClick } from "@/lib/cta-tracking";
import { MockupAppDetox } from "@/components/mockups/mockup-app-detox";

const QUOTES = [
  {
    text: "Nao acreditei que ia conseguir 21 dias. No dia 18 nem pensava mais — ja era automatico.",
    name: "Camila R.",
  },
  {
    text: "Marcar o calendario virou meu momento do dia. E bobo, mas funciona.",
    name: "Patricia M.",
  },
  {
    text: "Nao emagreci 10kg. Emagreci 4kg e parei de odiar segunda-feira.",
    name: "Fernanda B.",
  },
];

export function DetoxProgress() {
  function handleCtaClick() {
    trackCtaClick({ ctaId: "progress-primary", destinationUrl: "#pricing" });
  }

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-body text-xs md:text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            Pequenas vitorias
          </span>
          <h2
            className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mt-2 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Pequenas vitorias criam resultados reais.
          </h2>
          <p
            className="font-body text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Cada habito marcado e um passo. 21 passos depois, voce esta em
            outro lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          <div className="flex justify-center">
            <MockupAppDetox />
          </div>

          <div className="space-y-5">
            {QUOTES.map((q, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <p
                  className="font-body text-base md:text-lg leading-relaxed mb-3 italic"
                  style={{ color: "var(--text-primary)" }}
                >
                  &ldquo;{q.text}&rdquo;
                </p>
                <p
                  className="font-body text-sm font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  — {q.name}
                </p>
              </div>
            ))}

            <div className="pt-4">
              <a
                href="#pricing"
                onClick={handleCtaClick}
                data-cta="progress-primary"
                className="inline-flex items-center justify-center gap-3 rounded-2xl py-4 px-7 text-base md:text-lg font-bold text-white transition-all hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(145deg, var(--accent), var(--accent-hover))",
                  boxShadow: "0 10px 32px -8px var(--accent-soft)",
                }}
              >
                Comecar meus 21 dias
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
