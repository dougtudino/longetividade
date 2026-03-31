const PILLARS = [
  {
    icon: (
      <svg className="w-12 h-12" style={{color: 'var(--accent)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
      </svg>
    ),
    title: "SIMPLICIDADE",
    subtitle: "Pilar 1",
    description:
      "Voce vai aprender a montar refeicoes que ajudam a emagrecer sem pesar comida, sem contar caloria e sem eliminar nada do prato. Sem lista de \"proibido\". Sem culpa. Comer de verdade, emagrecer de verdade.",
  },
  {
    icon: (
      <svg className="w-12 h-12" style={{color: 'var(--accent)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: "EQUILIBRIO",
    subtitle: "Pilar 2",
    description:
      "Voce vai entender por que come quando nao tem fome, por que a ansiedade dispara a noite, e o que fazer de verdade quando isso acontece. Porque nao adianta ter o cardapio perfeito se as 21h seu cerebro nao quer salada -- quer conforto.",
  },
  {
    icon: (
      <svg className="w-12 h-12" style={{color: 'var(--accent)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    title: "MOVIMENTO",
    subtitle: "Pilar 3",
    description:
      "Esqueca academia. Esqueca acordar as 5h. Aqui voce vai aprender a integrar movimento no seu dia em 15 minutos, sem trocar de roupa, sem sair de casa, sem precisar de motivacao. Movimento que queima gordura e melhora seu humor.",
  },
];

export function MethodSEM() {
  return (
    <section className="py-12 md:py-20" style={{backgroundColor: 'var(--bg-card)'}}>
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="font-heading font-bold text-2xl md:text-4xl text-center mb-2" style={{color: 'var(--text-primary)'}}>
          Conheca o Metodo S.E.M
        </h2>
        <p className="font-body text-lg md:text-xl text-center mb-10 md:mb-14" style={{color: 'var(--text-secondary)'}}>
          Simplicidade. Equilibrio. Movimento.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl p-6 md:p-8 transition-shadow hover:shadow-lg"
              style={{backgroundColor: 'var(--shimmer)'}}
            >
              <div className="mb-4">{pillar.icon}</div>
              <p className="font-body text-xs uppercase tracking-widest mb-1" style={{color: 'var(--accent)'}}>
                {pillar.subtitle}
              </p>
              <h3 className="font-body font-bold text-xl mb-3" style={{color: 'var(--accent)'}}>
                {pillar.title}
              </h3>
              <p className="font-body text-sm md:text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        <p className="font-body text-base md:text-lg text-center mt-10 max-w-2xl mx-auto leading-relaxed" style={{color: 'var(--text-primary)'}}>
          Enquanto dietas tratam so a alimentacao, o Metodo S.E.M trata voce por
          inteiro: corpo, mente e rotina. Esse e o diferencial.
        </p>

        <div className="text-center mt-8">
          <a
            href="#pricing"
            className="inline-block text-white font-body font-bold text-base px-8 py-4 rounded-xl transition-colors"
            style={{backgroundColor: 'var(--accent)'}}
          >
            QUERO O METODO S.E.M -- R$ 37,00
          </a>
        </div>
      </div>
    </section>
  );
}
