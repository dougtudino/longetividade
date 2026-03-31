const FOR_YOU = [
  "Voce e mulher entre 25 e 45 anos com rotina corrida",
  "Voce ja tentou varias dietas e nao conseguiu manter o resultado",
  "Voce quer emagrecer sem abrir mao da qualidade de vida",
  "Voce precisa de algo pratico, direto e aplicavel a partir de amanha",
  "Voce esta cansada de se sentir culpada por comer",
  "Voce nao tem tempo (nem vontade) pra academia",
  "Voce come por ansiedade ou emocao e quer entender por que",
];

const NOT_FOR_YOU = [
  "Voce busca resultado magico em 3 dias (isso nao existe)",
  "Voce quer mais um cardapio ultra-restritivo",
  "Voce nao esta disposta a fazer pequenas mudancas",
  "Voce quer substituir acompanhamento medico (este ebook complementa, nao substitui)",
  "Voce quer ouvir que existe pilula magica ou atalho sem esforco",
];

export function ForWho() {
  return (
    <section className="py-12 md:py-20" style={{backgroundColor: 'var(--shimmer)'}}>
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="font-heading font-bold text-2xl md:text-4xl text-center mb-10 md:mb-14" style={{color: 'var(--text-primary)'}}>
          Este ebook e pra voce?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="rounded-2xl p-6 md:p-8 border-2" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent)'}}>
            <h3 className="font-body font-bold text-lg mb-4" style={{color: 'var(--accent)'}}>
              Pra voce se:
            </h3>
            <ul className="space-y-3">
              {FOR_YOU.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{color: 'var(--accent)'}}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-body text-sm md:text-base leading-relaxed" style={{color: 'var(--text-primary)'}}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl p-6 md:p-8 border-2" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--danger, #C4787A)'}}>
            <h3 className="font-body font-bold text-lg mb-4" style={{color: 'var(--danger, #C4787A)'}}>
              NAO e pra voce se:
            </h3>
            <ul className="space-y-3">
              {NOT_FOR_YOU.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{color: 'var(--danger, #C4787A)'}}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-body text-sm md:text-base leading-relaxed" style={{color: 'var(--text-primary)'}}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
