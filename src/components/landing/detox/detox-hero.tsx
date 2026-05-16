"use client";

import { trackCtaClick } from "@/lib/cta-tracking";
import { MockupCalendarDetox } from "@/components/mockups/mockup-calendar-detox";

// Headlines testadas. Default = "Pare de comecar dieta na segunda-feira".
// Variantes documentadas como constante pra trocar rapido em A/B sem PR.
const HEADLINE_VARIANTS = {
  A: {
    h1: "Pare de comecar dieta na segunda-feira.",
    sub: "Siga um calendario simples de 21 dias para voltar ao controle — sem dieta maluca, sem culpa, sem recomecar do zero.",
  },
  B: {
    h1: "Um dia de cada vez.",
    sub: "Um calendario simples para mulheres que querem emagrecer sem radicalismo.",
  },
  C: {
    h1: "O calendario detox que ajuda voce a finalmente continuar.",
    sub: "21 dias. Habitos pequenos. Sem dieta. Sem culpa. Sem recomecar.",
  },
};

const ACTIVE = HEADLINE_VARIANTS.A;

export function DetoxHero() {
  function handleCtaClick() {
    trackCtaClick({ ctaId: "hero-detox", destinationUrl: "#pricing" });
  }

  return (
    <section
      className="relative overflow-hidden pt-24 pb-12 md:pt-32 md:pb-20"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Coluna texto */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <span
              className="inline-block font-body text-xs md:text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6"
              style={{
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              📅 21 dias · 1 calendario · Resultados que ficam
            </span>

            <h1
              className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight mb-5"
              style={{ color: "var(--text-primary)" }}
            >
              {ACTIVE.h1}
            </h1>

            <p
              className="font-body text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: "var(--text-secondary)" }}
            >
              {ACTIVE.sub}
            </p>

            {/* 3 micro-promessas */}
            <ul className="space-y-3 mb-9 max-w-xl mx-auto lg:mx-0">
              {[
                { icon: "📅", text: "Habitos simples, um dia de cada vez" },
                { icon: "✅", text: "Checklist diario pra colar na geladeira" },
                { icon: "📱", text: "Progresso visual no app — seu streak, sua jornada" },
              ].map((b, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 font-body text-sm md:text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="text-lg flex-shrink-0">{b.icon}</span>
                  <span>{b.text}</span>
                </li>
              ))}
            </ul>

            <a
              href="#pricing"
              onClick={handleCtaClick}
              data-cta="hero-detox"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl py-5 px-8 text-base md:text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              style={{
                background:
                  "linear-gradient(145deg, var(--accent), var(--accent-hover))",
                boxShadow:
                  "0 12px 40px -8px var(--accent-soft), 0 6px 16px -4px rgba(0,0,0,0.15)",
              }}
            >
              Quero meu calendario detox
              <span className="transition-transform group-hover:translate-y-0.5">↓</span>
            </a>

            <p
              className="mt-4 font-body text-xs md:text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Garantia de 7 dias · Pagamento seguro · Acesso imediato
            </p>

            {/* Trust row */}
            <div
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 font-body text-xs md:text-sm font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-amber-500">★★★★★</span> 4.9 / 5
              </span>
              <span>+12.400 aceitaram o desafio</span>
              <span>Garantia 7 dias</span>
            </div>
          </div>

          {/* Coluna mockup */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <MockupCalendarDetox markedDays={14} />
          </div>
        </div>
      </div>
    </section>
  );
}
