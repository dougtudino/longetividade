"use client";

import { useState } from "react";

const ITEMS = [
  "Voce ja comecou uma dieta na segunda e desistiu antes de sexta",
  "Voce come bem o dia inteiro, mas \"perde o controle\" a noite",
  "Voce sabe exatamente o que deveria comer, mas na hora nao consegue",
  "Ja tentou low carb, jejum, sopa, shake -- e nenhum se sustentou",
  "Voce nao tem tempo pra academia e se sente culpada por isso",
  "Voce pesa mais HOJE do que antes da ultima dieta que fez",
  "Voce evita espelhos, fotos e roupas justas",
  "Voce se compara com amigas que parecem \"conseguir\" sem esforco",
  "Voce desconta o estresse na comida e depois se pune por isso",
  "Voce ja gastou dinheiro em produtos de emagrecimento que nao funcionaram",
];

export function IdentificationChecklist() {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(ITEMS.length).fill(false)
  );

  const checkedCount = checked.filter(Boolean).length;

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="font-heading font-bold text-charcoal text-2xl md:text-4xl text-center mb-8 md:mb-12">
          Me diz se voce ja viveu pelo menos 3 dessas situacoes:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ITEMS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={`flex items-start gap-3 text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                checked[i]
                  ? "bg-sage-light border-sage"
                  : "bg-white border-light-gray hover:border-sage"
              }`}
            >
              <span
                className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${
                  checked[i]
                    ? "bg-sage border-sage text-white"
                    : "border-light-gray bg-white"
                }`}
              >
                {checked[i] && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <span className="font-body text-charcoal text-sm md:text-base leading-relaxed">
                {item}
              </span>
            </button>
          ))}
        </div>

        <div
          className={`mt-8 text-center transition-all duration-500 ${
            checkedCount >= 3
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <p className="font-body font-bold text-charcoal text-lg md:text-xl">
            Se marcou 3 ou mais, continue lendo.
          </p>
          <p className="font-body text-sage text-base mt-2">
            O que vou te mostrar agora pode mudar a forma como voce enxerga
            emagrecimento -- pra sempre.
          </p>
        </div>
      </div>
    </section>
  );
}
