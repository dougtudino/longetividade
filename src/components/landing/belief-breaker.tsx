export function BeliefBreaker() {
  return (
    <section className="py-12 md:py-20" style={{backgroundColor: 'var(--shimmer)'}}>
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="font-heading font-bold text-2xl md:text-4xl text-center mb-8" style={{color: 'var(--text-primary)'}}>
          Por que nada funcionou ate agora (e por que NAO e culpa sua)
        </h2>

        <div className="font-body text-base md:text-lg leading-[1.8] space-y-6" style={{color: 'var(--text-primary)'}}>
          <p>Voce ja parou pra pensar numa coisa?</p>

          <p>
            Se dietas funcionassem de verdade, a industria de emagrecimento nao
            faturaria bilhoes todo ano. Pense nisso: se o produto resolvesse o
            problema, voce nao precisaria voltar. Mas voce volta. E volta. E
            volta.
          </p>

          <p>
            Pesquisas mostram que{" "}
            <strong>
              mais de 93% das pessoas que fazem dieta restritiva recuperam todo o
              peso em ate 2 anos.
            </strong>{" "}
            Muitas recuperam com juros.
          </p>

          <p>
            Porque dietas restritivas trabalham CONTRA o seu corpo. Elas criam
            privacao. Privacao gera compulsao. Compulsao gera culpa. Culpa gera
            mais restricao. E o ciclo nao para nunca.
          </p>
        </div>

        <div className="mt-8 border-l-4 p-6 md:p-8 rounded-r-lg shadow-[0_4px_16px_rgba(0,0,0,0.06)]" style={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent)'}}>
          <p className="font-heading font-semibold text-xl md:text-2xl leading-snug" style={{color: 'var(--accent)'}}>
            &ldquo;O problema nunca foi disciplina. Foi estrategia.&rdquo;
          </p>
          <p className="font-body text-sm mt-3" style={{color: 'var(--text-muted)'}}>
            -- Metodo S.E.M
          </p>
        </div>

        <p className="font-body text-base md:text-lg leading-[1.8] mt-8" style={{color: 'var(--text-primary)'}}>
          Voce nao precisa de mais forca de vontade. Voce precisa de um metodo
          que trabalhe COM o seu corpo, COM a sua rotina e COM as suas emocoes.
          Nao contra elas.
        </p>
      </div>
    </section>
  );
}
