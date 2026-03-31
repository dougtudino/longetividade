"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question:
      "Ja comprei outros ebooks e nao funcionaram. Por que esse seria diferente?",
    answer:
      "Entendo completamente. A maioria dos ebooks de emagrecimento foca so em alimentacao -- te da um cardapio e pronto. O Metodo S.E.M e diferente porque trabalha os 3 pilares que realmente importam: como voce come, como voce se sente e como voce se move. Nao adianta ter o cardapio perfeito se voce come por ansiedade. O S.E.M trata isso.",
  },
  {
    question: "Nao tenho tempo pra ler.",
    answer:
      "O ebook tem 20-30 paginas de leitura direta e objetiva. Da pra ler em 1 hora. E a aplicacao leva 5 minutos por dia. Foi feito pra quem nao tem tempo -- inclusive pra ler.",
  },
  {
    question: "Funciona pra quem tem mais de 35 anos?",
    answer:
      "Sim. Na verdade, o Metodo S.E.M e especialmente eficaz para mulheres acima de 30, porque nao depende de metabolismo acelerado ou treinos intensos. Ele trabalha com habitos simples que funcionam em qualquer fase da vida.",
  },
  {
    question: "Preciso ir na academia?",
    answer:
      "Nao. O Pilar 3 (Movimento) e baseado em movimento integrado a rotina: caminhar, subir escada, brincar com os filhos. 15 minutos por dia, sem sair de casa, sem trocar de roupa.",
  },
  {
    question: "Isso e mais uma dieta disfarçada?",
    answer:
      'Nao. Zero restricao alimentar. Zero alimento proibido. Zero contagem de calorias. O Metodo S.E.M te ensina a comer com inteligencia, nao com restricao. Voce vai comer chocolate, pao, arroz -- e emagrecer.',
  },
  {
    question: "E se nao funcionar pra mim?",
    answer:
      "Voce tem 7 dias de garantia incondicional. Se nao gostar, nao sentir valor ou simplesmente mudar de ideia, e so pedir o reembolso. Devolvemos 100% sem perguntas.",
  },
  {
    question: "Esse ebook substitui nutricionista?",
    answer:
      "Nao. O ebook e um guia pratico de habitos alimentares, emocionais e de movimento. Se voce tem condicoes medicas especificas, continue com seu profissional. O ebook complementa qualquer acompanhamento.",
  },
  {
    question: "Como recebo o ebook?",
    answer:
      "Imediatamente apos a confirmacao do pagamento, voce recebe o link de acesso por email. O download e instantaneo. Voce pode ler no celular, tablet ou computador. Se preferir, pode imprimir.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="py-12 md:py-20" style={{backgroundColor: 'var(--shimmer)'}}>
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="font-heading font-bold text-2xl md:text-4xl text-center mb-10 md:mb-14" style={{color: 'var(--text-primary)'}}>
          Perguntas Frequentes
        </h2>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{backgroundColor: 'var(--bg-card)'}}>
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
              >
                <span className="font-body font-semibold text-sm md:text-base pr-4" style={{color: 'var(--text-primary)'}}>
                  &ldquo;{item.question}&rdquo;
                </span>
                <svg
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  style={{color: 'var(--accent)'}}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96 pb-5" : "max-h-0"
                }`}
              >
                <p className="font-body text-sm md:text-base leading-relaxed px-5" style={{color: 'var(--text-secondary)'}}>
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
