"use client";

import { useState } from "react";

const FAQ = [
  {
    q: "Por que 21 dias?",
    a: "21 dias é o tempo que um hábito leva pra começar a ficar automático. Não é mágica, é repetição. Você não precisa de força de vontade pra escovar os dentes hoje — é a mesma lógica.",
  },
  {
    q: "Funciona pra quem nunca conseguiu seguir nada?",
    a: "Sim. O calendário foi pensado pra quem desiste no dia 4. Cada dia tem 3 a 4 tarefinhas pequenas. Não tem como ficar grande demais.",
  },
  {
    q: "Preciso fazer academia?",
    a: "Não. O movimento do calendário cabe em 15 minutos por dia, em casa, sem trocar de roupa.",
  },
  {
    q: "E se eu errar um dia?",
    a: "Você não errou. Só não marcou. No dia seguinte, você abre o calendário e continua de onde parou. A regra aqui é simples: continuar vale mais que recomeçar.",
  },
  {
    q: "Isso é dieta?",
    a: "Não. Zero restrição. Zero alimento proibido. O foco é no que você faz, não no que você corta.",
  },
  {
    q: "Funciona pra quem tem 35+?",
    a: "Sim, especialmente. O calendário não depende de metabolismo acelerado. Foi feito pra mulheres com rotina real.",
  },
  {
    q: "Quanto tempo tenho de acesso?",
    a: "O Digital e o Kit Detox têm acesso por 1 ano. O VIP é vitalício. O calendário fica seu pra sempre — você pode imprimir e usar quantas vezes quiser.",
  },
  {
    q: "E se eu não gostar?",
    a: "Você tem 7 dias de garantia. Pediu reembolso, devolvemos 100%. Sem perguntas.",
  },
];

export function DetoxFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="py-20 md:py-28"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center mb-12 md:mb-14">
          <span
            className="inline-block font-body text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: "var(--accent)" }}
          >
            Perguntas frequentes
          </span>
          <h2
            className="font-heading font-extrabold text-3xl md:text-4xl lg:text-5xl leading-[1.1]"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            A gente já ouviu essas
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
