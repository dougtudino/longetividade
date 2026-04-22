"use client";

import { useState } from "react";
import { InlineCTA } from "./inline-cta";

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
    <section className="py-12 md:py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="mx-auto max-w-3xl px-4">
        <h2
          className="font-heading font-bold text-2xl md:text-4xl text-center mb-8 md:mb-12"
          style={{ color: 'var(--text-primary)' }}
        >
          Me diz se voce ja viveu pelo menos 3 dessas situacoes:
        </h2>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Quantas situações você já viveu?
            </span>
            <span
              className="font-bold text-xl transition-colors duration-300"
              style={{ color: checkedCount >= 3 ? 'var(--accent)' : 'var(--text-secondary)' }}
            >
              {checkedCount}<span className="text-sm font-normal">/10</span>
            </span>
          </div>
          <div
            className="w-full rounded-full h-3 overflow-hidden"
            style={{ background: 'var(--border-default)' }}
          >
            <div
              className="h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(checkedCount / 10) * 100}%`,
                background: checkedCount >= 7 ? 'linear-gradient(90deg, #7A9E7E, #3D5A3E)' : '#7A9E7E',
              }}
            />
          </div>
          {checkedCount >= 3 && checkedCount < 7 && (
            <p className="text-sm font-semibold mt-2 flex items-center gap-1" style={{ color: '#7A9E7E' }}>
              <span>●</span> {checkedCount} marcadas — isso é para você, continue lendo
            </p>
          )}
          {checkedCount >= 7 && (
            <p className="font-bold text-sm mt-2 flex items-center gap-1" style={{ color: '#C4787A' }}>
              <span>●</span> Você marcou {checkedCount}/10 — o Método S.E.M foi criado exatamente para você
            </p>
          )}
        </div>

        {/* Checklist grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ITEMS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={`flex items-start gap-3 text-left p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                checked[i] ? 'scale-[1.02] shadow-sm' : 'hover:scale-[1.01]'
              }`}
              style={{
                backgroundColor: checked[i] ? 'var(--accent-soft)' : 'var(--bg-card)',
                borderColor: checked[i] ? 'var(--accent)' : 'var(--border-default)',
              }}
            >
              <span
                className="mt-0.5 flex-shrink-0 w-6 h-6 rounded flex items-center justify-center border-2 transition-colors duration-200"
                style={{
                  backgroundColor: checked[i] ? 'var(--accent)' : 'var(--bg-card)',
                  borderColor: checked[i] ? 'var(--accent)' : 'var(--border-default)',
                  color: checked[i] ? '#fff' : 'transparent',
                }}
              >
                <svg
                  className="w-4 h-4 transition-all duration-150"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  style={{
                    transform: checked[i] ? 'scale(1)' : 'scale(0)',
                    opacity: checked[i] ? 1 : 0,
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span
                className="font-body text-sm md:text-base leading-relaxed"
                style={{ color: 'var(--text-primary)' }}
              >
                {item}
              </span>
            </button>
          ))}
        </div>

        {/* Final message card */}
        <div
          className={`mt-8 transition-all duration-500 ${
            checkedCount >= 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div
            className="rounded-xl border-2 p-6 text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--accent)',
            }}
          >
            {checkedCount >= 7 ? (
              <>
                <p
                  className="font-body font-bold text-lg md:text-xl"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Você marcou {checkedCount} de 10. Isso não é coincidência.
                </p>
                <p className="font-body text-base mt-2" style={{ color: 'var(--accent)' }}>
                  O Método S.E.M foi criado exatamente para mulheres como você — que já tentaram de tudo e precisam de algo que finalmente funcione.
                </p>
              </>
            ) : (
              <p
                className="font-body text-base md:text-lg leading-relaxed"
                style={{ color: 'var(--text-primary)' }}
              >
                Se você marcou <strong>3 ou mais</strong>, não é falta de disciplina.
                É falta de um <span style={{ color: 'var(--accent)' }}>método que caiba na sua vida</span>.
              </p>
            )}
            <InlineCTA ctaKey="quiz-primary" label="Quero um método que funcione" size="md" />
          </div>
        </div>
      </div>
    </section>
  );
}
