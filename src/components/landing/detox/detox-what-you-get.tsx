"use client";

import { trackCtaClick } from "@/lib/cta-tracking";
import { MockupCalendarDetox } from "@/components/mockups/mockup-calendar-detox";
import { MockupAppDetox } from "@/components/mockups/mockup-app-detox";
import { MockupChecklistPaper } from "@/components/mockups/mockup-checklist-paper";

// Cards-feature de "Veja o que voce recebe". Cada um e visual-first: imagem
// grande + label curta. Sem listar PDFs/bonus genericos.
const ITEMS = [
  {
    label: "Calendario A3 imprimivel",
    sub: "Pendura na geladeira, marca todo dia.",
    mockup: <MockupCalendarDetox markedDays={7} />,
  },
  {
    label: "App de acompanhamento",
    sub: "Seu streak, seus habitos, seu progresso.",
    mockup: <MockupAppDetox />,
  },
  {
    label: "Checklist diario",
    sub: "Beber agua, refeicao, movimento, sono.",
    mockup: <MockupChecklistPaper />,
  },
];

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
  function handleCtaClick() {
    trackCtaClick({ ctaId: "whatyouget-primary", destinationUrl: "#pricing" });
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
            Tudo ja organizado pra voce
          </span>
          <h2
            className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mt-2 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Veja o que chega na sua tela
          </h2>
          <p
            className="font-body text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Sem mil PDFs separados. Sem perder tempo organizando. Voce abre,
            segue, marca.
          </p>
        </div>

        {/* 3 mockups visuais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 max-w-5xl mx-auto mb-16 md:mb-20">
          {ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-5 flex items-end justify-center" style={{ minHeight: 320 }}>
                {item.mockup}
              </div>
              <h3
                className="font-body font-bold text-lg mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {item.label}
              </h3>
              <p
                className="font-body text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.sub}
              </p>
            </div>
          ))}
        </div>

        {/* 3 extras (icons) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {EXTRAS.map((e, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: "var(--bg-card)" }}
            >
              <div className="text-3xl mb-3">{e.icon}</div>
              <h3
                className="font-body font-bold text-base mb-2"
                style={{ color: "var(--text-primary)" }}
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
            className="inline-flex items-center justify-center gap-3 rounded-2xl py-4 px-7 text-base md:text-lg font-bold text-white transition-all hover:scale-[1.02]"
            style={{
              background:
                "linear-gradient(145deg, var(--accent), var(--accent-hover))",
              boxShadow: "0 10px 32px -8px var(--accent-soft)",
            }}
          >
            Quero receber meu kit
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
