"use client";

import { useState } from "react";

const FAQ = [
  {
    q: "Por que 21 dias?",
    a: "21 dias e o tempo que um habito leva pra comecar a ficar automatico. Nao e magica, e repeticao. Voce nao precisa de forca de vontade pra escovar os dentes hoje — e a mesma logica.",
  },
  {
    q: "Funciona pra quem nunca conseguiu seguir nada?",
    a: "Sim. O calendario foi pensado pra quem desiste no dia 4. Cada dia tem 3-4 tarefinhas pequenas. Nao tem como ficar grande demais.",
  },
  {
    q: "Preciso fazer academia?",
    a: "Nao. O movimento do calendario cabe em 15 minutos por dia, em casa, sem trocar de roupa.",
  },
  {
    q: "E se eu errar 1 dia?",
    a: "Marca o proximo. O calendario nao e prova de moral, e guia. Errar 1 dia nao desfaz os 20 outros.",
  },
  {
    q: "Isso e dieta?",
    a: "Nao. Zero restricao. Zero alimento proibido. O foco e no que voce faz, nao no que voce corta.",
  },
  {
    q: "Funciona pra quem tem 35+?",
    a: "Sim, especialmente. O calendario nao depende de metabolismo acelerado. Foi feito pra mulheres com rotina real.",
  },
  {
    q: "Quanto tempo tenho de acesso?",
    a: "O plano Digital e Kit Detox tem acesso por 1 ano. O VIP e vitalicio. O calendario fica seu pra sempre — voce pode imprimir e usar quantas vezes quiser.",
  },
  {
    q: "E se eu nao gostar?",
    a: "Voce tem 7 dias de garantia. Pediu reembolso, devolvemos 100%. Sem perguntas.",
  },
];

export function DetoxFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center mb-12">
          <span
            className="font-body text-xs md:text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            Perguntas frequentes
          </span>
          <h2
            className="font-heading font-bold text-3xl md:text-4xl mt-2"
            style={{ color: "var(--text-primary)" }}
          >
            A gente ja ouviu essas
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left font-body font-bold text-base md:text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  <span>{item.q}</span>
                  <span
                    className="flex-shrink-0 transition-transform"
                    style={{
                      transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                      color: "var(--accent)",
                    }}
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    >
                      <path d="M10 4v12M4 10h12" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div
                    className="px-5 md:px-6 pb-5 md:pb-6 font-body text-sm md:text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
