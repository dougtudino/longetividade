const BONUSES = [
  {
    number: 1,
    title: "Checklist Diario Imprimivel",
    description:
      "Imprima, cole na geladeira e siga todos os dias. Nos dias que voce nao quiser pensar, e so seguir a lista. Simples assim.",
    value: "R$ 19,90",
  },
  {
    number: 2,
    title: "Tabela de Substituicoes Alimentares",
    description:
      "Nao gosta de brocolis? Troque. Nao come peixe? Troque. Essa tabela te da flexibilidade total pra adaptar o cardapio ao SEU gosto.",
    value: "R$ 14,90",
  },
  {
    number: 3,
    title: 'Guia "10 Atalhos que Mulheres que Emagrecem Usam Todo Dia"',
    description:
      "Ajustes pequenos que aceleram seus resultados sem esforco extra. Nenhum deles exige dinheiro, tempo ou forca de vontade.",
    value: "R$ 24,90",
  },
  {
    number: 4,
    title: "Lista de Compras Estrategica",
    description:
      "Chegue no mercado, siga a lista, gaste 20 minutos e saia com tudo que precisa pra semana inteira. Sem improvisar, sem cair em tentacao.",
    value: "R$ 9,90",
  },
];

export function BonusSection() {
  return (
    <section className="py-12 md:py-20" style={{backgroundColor: 'var(--shimmer)'}}>
      <div className="mx-auto max-w-4xl px-4">
        <span className="block text-center mb-3">
          <span className="inline-block text-white font-body font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full" style={{backgroundColor: 'var(--danger, #C4787A)'}}>
            BONUS EXCLUSIVOS
          </span>
        </span>

        <h2 className="font-heading font-bold text-2xl md:text-4xl text-center mb-10 md:mb-14" style={{color: 'var(--text-primary)'}}>
          Voce ainda recebe tudo isso:
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {BONUSES.map((bonus) => (
            <div
              key={bonus.number}
              className="rounded-2xl p-6 border-t-4"
              style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--danger, #C4787A)'}}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-body font-bold text-sm mb-3" style={{backgroundColor: 'var(--danger, #C4787A)'}}>
                {bonus.number}
              </span>
              <h3 className="font-body font-bold text-base md:text-lg mb-2" style={{color: 'var(--text-primary)'}}>
                {bonus.title}
              </h3>
              <p className="font-body text-sm leading-relaxed mb-3" style={{color: 'var(--text-secondary)'}}>
                {bonus.description}
              </p>
              <p className="font-body text-sm">
                <span className="line-through" style={{color: 'var(--text-muted)'}}>
                  Valor: {bonus.value}
                </span>{" "}
                <span className="font-bold" style={{color: 'var(--accent)'}}>GRATIS</span>
              </p>
            </div>
          ))}
        </div>

        <p className="font-body text-base md:text-lg text-center mt-8 font-medium" style={{color: 'var(--text-primary)'}}>
          Valor total dos bonus:{" "}
          <span className="line-through" style={{color: 'var(--text-muted)'}}>R$ 69,60</span> --{" "}
          <span className="font-bold" style={{color: 'var(--accent)'}}>
            Hoje, tudo GRATIS com o ebook.
          </span>
        </p>
      </div>
    </section>
  );
}
