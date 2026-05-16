"use client";

import Image from "next/image";
import { trackCtaClick } from "@/lib/cta-tracking";
import { useLpAssets } from "@/lib/useLpAssets";
import { MockupCalendarDetox } from "@/components/mockups/mockup-calendar-detox";
import { MockupAppDetox } from "@/components/mockups/mockup-app-detox";
import { MockupChecklistPaper } from "@/components/mockups/mockup-checklist-paper";

// Wrapper visual unificado pra fotos reais (substitui mockups SVG quando
// admin cadastra foto via /admin/lp-assets).
function PhotoCard({ src, alt, aspect = "4/5" }: { src: string; alt: string; aspect?: string }) {
  return (
    <div
      className="relative w-full max-w-[280px] rounded-2xl overflow-hidden"
      style={{
        aspectRatio: aspect,
        boxShadow: "0 18px 40px -16px rgba(0,0,0,0.22)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 280px, 90vw"
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

const EXTRAS = [
  {
    icon: "🍳",
    label: "Receitas praticas",
    sub: "Pratos simples que dao pra fazer em 15 min, com ingredientes do dia a dia.",
  },
  {
    icon: "🛒",
    label: "Lista de compras",
    sub: "Semana inteira em 1 pagina, organizada por categoria. Sem improvisar.",
  },
  {
    icon: "📖",
    label: "Cartilha de habitos",
    sub: "O que fazer quando der vontade de desistir. Estrategia pra cada cenario.",
  },
];

export function DetoxWhatYouGet() {
  // Fotos editaveis via /admin/lp-assets. Substituem o mockup SVG quando
  // existem; caso contrario o SVG fallback continua sendo usado.
  const { resolveAsset } = useLpAssets("emagreca-sem-dieta");
  const kitPhotoUrl = resolveAsset("product.kit-physical", "");
  const appPhotoUrl = resolveAsset("hero.phone", "");
  const checklistPhotoUrl = resolveAsset("product.checklist-paper", "");

  const items = [
    {
      label: "Calendario A3 imprimivel",
      sub: "Pendura na geladeira, marca todo dia.",
      visual: kitPhotoUrl ? (
        <PhotoCard src={kitPhotoUrl} alt="Kit Detox fisico" aspect="1/1" />
      ) : (
        <MockupCalendarDetox markedDays={7} />
      ),
    },
    {
      label: "App de acompanhamento",
      sub: "Seu streak, seus habitos, seu progresso.",
      visual: appPhotoUrl ? (
        <PhotoCard src={appPhotoUrl} alt="App de acompanhamento" aspect="3/4" />
      ) : (
        <MockupAppDetox />
      ),
    },
    {
      label: "Checklist diario",
      sub: "Beber agua, refeicao, movimento, sono.",
      visual: checklistPhotoUrl ? (
        <PhotoCard src={checklistPhotoUrl} alt="Checklist impresso" aspect="4/5" />
      ) : (
        <MockupChecklistPaper />
      ),
    },
  ];

  function handleCtaClick() {
    trackCtaClick({ ctaId: "whatyouget-primary", destinationUrl: "#pricing" });
  }

  return (
    <section
      className="py-20 md:py-28"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-14 md:mb-20 max-w-3xl mx-auto">
          <span
            className="inline-block font-body text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: "var(--accent)" }}
          >
            Tudo ja organizado pra voce
          </span>
          <h2
            className="font-heading font-extrabold text-3xl md:text-[2.5rem] lg:text-5xl leading-[1.1] mb-5"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Veja o que chega na sua tela
          </h2>
          <p
            className="font-body text-base md:text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Sem mil PDFs separados. Sem perder tempo organizando. Voce abre,
            segue, marca.
          </p>
        </div>

        {/* 3 mockups/fotos visuais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto mb-16 md:mb-24">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center"
            >
              <div
                className="mb-6 flex items-end justify-center w-full"
                style={{ minHeight: 340 }}
              >
                {item.visual}
              </div>
              <h3
                className="font-heading font-bold text-lg md:text-xl mb-1.5"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.label}
              </h3>
              <p
                className="font-body text-sm md:text-[15px] leading-relaxed max-w-[280px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Divider sutil */}
        <div
          aria-hidden
          className="mx-auto max-w-2xl mb-12 md:mb-16 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--border-default), transparent)",
          }}
        />

        {/* 3 extras — cards mais polidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-14">
          {EXTRAS.map((e, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 text-center transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                boxShadow: "0 4px 18px -8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl text-2xl mb-4"
                style={{ backgroundColor: "var(--accent-soft)" }}
              >
                {e.icon}
              </div>
              <h3
                className="font-heading font-bold text-base md:text-lg mb-2"
                style={{
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                }}
              >
                {e.label}
              </h3>
              <p
                className="font-body text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {e.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#pricing"
            onClick={handleCtaClick}
            data-cta="whatyouget-primary"
            className="group inline-flex items-center justify-center gap-3 rounded-2xl py-4 px-8 text-base md:text-lg font-bold text-white transition-all hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(145deg, var(--accent), var(--accent-hover))",
              boxShadow:
                "0 12px 36px -10px var(--accent-soft), 0 4px 12px -3px rgba(0,0,0,0.12)",
            }}
          >
            Quero receber meu kit
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
