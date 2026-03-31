export function FinalCTA() {
  return (
    <section className="py-12 md:py-20 text-white" style={{background: 'linear-gradient(to bottom right, var(--accent), #7A9E7E)'}}>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-heading font-bold text-2xl md:text-4xl mb-8">
          Voce tem duas opcoes agora.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
          <div className="opacity-60">
            <p className="font-body text-base md:text-lg leading-relaxed">
              <strong>Opcao 1:</strong> Fechar essa pagina, continuar fazendo o
              que sempre fez e esperar que algo mude. Comecar mais uma dieta na
              segunda. Desistir na quarta. Se sentir culpada na sexta. Repetir.
            </p>
          </div>
          <div>
            <p className="font-body text-base md:text-lg leading-relaxed font-medium">
              <strong>Opcao 2:</strong> Investir R$ 37 -- o preco de um delivery
              que voce pede quando esta estressada -- e dar uma chance pra um
              metodo que respeita sua rotina, seu corpo e suas emocoes. Com plano
              de 7 dias pronto. Com lista de compras. Com tudo que voce precisa
              pra comecar AMANHA.
            </p>
          </div>
        </div>

        <a
          href="#pricing"
          className="inline-block font-body font-bold text-base md:text-lg px-10 py-4 rounded-xl transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          style={{backgroundColor: 'var(--bg-card)', color: 'var(--accent)'}}
        >
          SIM, EU QUERO O METODO S.E.M -- R$ 37,00
        </a>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/80 text-xs md:text-sm">
          <span>Pagamento seguro</span>
          <span>|</span>
          <span>Acesso imediato</span>
          <span>|</span>
          <span>Garantia de 7 dias</span>
        </div>
      </div>
    </section>
  );
}
