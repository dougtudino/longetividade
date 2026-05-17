"use client";

import Image from "next/image";
import { trackCtaClick } from "@/lib/cta-tracking";
import { useLpAssets } from "@/lib/useLpAssets";
import { MockupCalendarDetox } from "@/components/mockups/mockup-calendar-detox";

// Headlines testadas. Default = "Pare de comecar dieta na segunda-feira".
// Variantes documentadas como constante pra trocar rapido em A/B sem PR.
const HEADLINE_VARIANTS = {
  A: {
    h1: "Pare de comecar dieta na segunda-feira.",
    sub: "Um calendario. 21 dias. Voce so marca o que ja fez. A gente cuidou do resto.",
  },
  B: {
    h1: "Um dia de cada vez.",
    sub: "Um calendario simples pra continuar quando voce sempre desistia.",
  },
  C: {
    h1: "O calendario que ajuda voce a finalmente continuar.",
    sub: "21 dias. Habitos pequenos. Sem cardapio fechado, sem culpa de domingo.",
  },
};

const ACTIVE = HEADLINE_VARIANTS.A;

export function DetoxHero() {
  // Foto editavel via /admin/lp-assets slot "hero.calendar" — 3:4 vertical.
  const { resolveAsset } = useLpAssets("emagreca-sem-dieta");
  const calendarPhotoUrl = resolveAsset("hero.calendar", "");

  function handleCtaClick() {
    trackCtaClick({ ctaId: "hero-detox", destinationUrl: "#pricing" });
  }

  return (
    <section
      className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      {/* Backdrop sage — circulo gigante no canto pra profundidade */}
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(circle at center, var(--accent-soft) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Coluna texto */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <span
              className="inline-flex items-center gap-2 font-body text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full mb-7"
              style={{
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              <span className="text-sm">📅</span>
              21 dias · 1 calendario · resultados que ficam
            </span>

            <h1
              className="font-heading font-extrabold text-[2.5rem] sm:text-5xl lg:text-[3.75rem] leading-[1.05] mb-6"
              style={{
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {ACTIVE.h1}
            </h1>

            <p
              className="font-body text-base md:text-lg lg:text-xl leading-relaxed mb-9 max-w-xl mx-auto lg:mx-0"
              style={{ color: "var(--text-secondary)" }}
            >
              {ACTIVE.sub}
            </p>

            {/* 3 micro-promessas — bullets enxutos com check icon */}
            <ul className="space-y-3.5 mb-10 max-w-xl mx-auto lg:mx-0">
              {[
                "Um habito por dia. So isso.",
                "Marca na geladeira. Marca no app. Continua.",
                "No dia 21 voce olha pra tras e ja virou rotina.",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 font-body text-[15px] md:text-base"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full"
                    style={{
                      backgroundColor: "var(--accent-soft)",
                      color: "var(--accent)",
                    }}
                  >
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 6L5 9L10 3" />
                    </svg>
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col items-center lg:items-start gap-3">
              <a
                href="#pricing"
                onClick={handleCtaClick}
                data-cta="hero-detox"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl py-5 px-9 text-base md:text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                style={{
                  background:
                    "linear-gradient(145deg, var(--accent), var(--accent-hover))",
                  boxShadow:
                    "0 14px 44px -10px var(--accent-soft), 0 6px 16px -4px rgba(0,0,0,0.18)",
                }}
              >
                Quero meu calendario detox
                <span className="transition-transform group-hover:translate-y-0.5">↓</span>
              </a>

              <p
                className="font-body text-xs md:text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Acesso na hora · Garantia de 7 dias · Comeca hoje se quiser
              </p>
            </div>

            {/* Trust row */}
            <div
              className="mt-9 pt-6 border-t flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-2 font-body text-[13px] font-medium"
              style={{
                color: "var(--text-muted)",
                borderColor: "var(--border-default)",
              }}
            >
              <span className="flex items-center gap-1.5">
                <span style={{ color: "#E5A53C" }}>★★★★★</span> 4.9
              </span>
              <span>+12.400 mulheres ja marcaram o dia 1</span>
              <span>Garantia 7 dias</span>
            </div>
          </div>

          {/* Coluna foto — 3:4 com moldura, sombra, selo e tag flutuante */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            {calendarPhotoUrl ? (
              <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px]">
                {/* Selo redondo decorativo (atras da foto) */}
                <div
                  aria-hidden
                  className="absolute -top-5 -right-5 z-0 w-24 h-24 rounded-full hidden md:block"
                  style={{ backgroundColor: "var(--accent-soft)" }}
                />
                {/* Container da foto */}
                <div
                  className="relative z-10 aspect-[3/4] rounded-3xl overflow-hidden"
                  style={{
                    boxShadow:
                      "0 30px 80px -20px rgba(0,0,0,0.28), 0 12px 32px -12px rgba(0,0,0,0.12)",
                    border: "6px solid var(--bg-card)",
                  }}
                >
                  <Image
                    src={calendarPhotoUrl}
                    alt="Calendario Detox 21 Dias em uso"
                    fill
                    sizes="(min-width: 1024px) 420px, (min-width: 640px) 380px, 320px"
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>
                {/* Tag flutuante "21 dias" */}
                <div
                  className="absolute -bottom-4 -left-4 z-20 px-5 py-3 rounded-2xl hidden md:flex flex-col items-start"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "white",
                    boxShadow: "0 12px 32px -8px rgba(0,0,0,0.3)",
                  }}
                >
                  <span className="text-[10px] uppercase tracking-[0.15em] font-bold opacity-80">
                    Programa
                  </span>
                  <span className="text-2xl font-extrabold leading-none">21 dias</span>
                </div>
              </div>
            ) : (
              <MockupCalendarDetox markedDays={14} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
