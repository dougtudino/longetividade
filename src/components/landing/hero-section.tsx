export function HeroSection() {
  return (
    <section className="pt-24 md:pt-32 pb-10 md:pb-16" style={{background: 'linear-gradient(to bottom right, var(--bg-card), var(--shimmer), var(--accent-soft))'}}>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-xs md:text-sm uppercase tracking-[0.1em] font-body font-semibold mb-4" style={{color: 'var(--danger, #C4787A)'}}>
          Para mulheres que ja tentaram de tudo pra emagrecer e estao cansadas
          de se sentir culpadas
        </p>

        <h1 className="font-heading font-extrabold text-3xl md:text-5xl leading-tight tracking-tight mb-6" style={{color: 'var(--text-primary)'}}>
          Voce Nao Precisa de Mais Uma Dieta. Precisa de um Metodo que Funcione
          na Sua Vida Real.
        </h1>

        <p className="font-body text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8" style={{color: 'var(--text-secondary)'}}>
          Descubra o Metodo S.E.M -- 3 pilares simples que estao ajudando
          mulheres ocupadas a emagrecerem sem cortar alimentos, sem academia e
          sem aquela culpa de todo dia. Inclui plano pratico de 7 dias com
          cardapio, lista de compras e checklist diario.
        </p>

        <a
          href="#pricing"
          className="inline-block text-white font-body font-bold text-base md:text-lg px-8 py-4 rounded-xl transition-colors shadow-lg hover:shadow-xl"
          style={{backgroundColor: 'var(--accent)'}}
        >
          QUERO COMECAR AGORA -- R$ 67,00
        </a>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6 text-xs md:text-sm" style={{color: 'var(--text-muted)'}}>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              style={{color: 'var(--accent)'}}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
            Acesso imediato
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              style={{color: 'var(--accent)'}}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Garantia 7 dias
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              style={{color: 'var(--accent)'}}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Pagamento seguro
          </span>
        </div>
      </div>
    </section>
  );
}
