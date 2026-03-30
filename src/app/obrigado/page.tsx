export default function ObrigadoPage() {
  return (
    <div className="min-h-screen bg-cream-white flex items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="w-16 h-16 bg-sage-light rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-olive"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h1 className="font-heading font-bold text-charcoal text-3xl mb-4">
          Parabens pela sua decisao!
        </h1>

        <p className="font-body text-dark-gray text-lg leading-relaxed mb-6">
          Seu pagamento foi confirmado. Voce deu o primeiro passo para uma
          relacao mais saudavel com a comida e com seu corpo.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="font-body font-bold text-charcoal text-lg mb-4">
            Proximo passo:
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-sage rounded-full flex items-center justify-center text-white font-body font-bold text-xs">
                1
              </span>
              <p className="font-body text-charcoal text-sm leading-relaxed">
                <strong>Verifique seu email</strong> (inclusive a pasta de spam)
                -- voce recebera o link de download em poucos minutos.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-sage rounded-full flex items-center justify-center text-white font-body font-bold text-xs">
                2
              </span>
              <p className="font-body text-charcoal text-sm leading-relaxed">
                <strong>Baixe o ebook</strong> e leia a Introducao e o Capitulo 1
                hoje (15 minutos).
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-sage rounded-full flex items-center justify-center text-white font-body font-bold text-xs">
                3
              </span>
              <p className="font-body text-charcoal text-sm leading-relaxed">
                <strong>Imprima o checklist diario</strong> e cole na geladeira.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-sage rounded-full flex items-center justify-center text-white font-body font-bold text-xs">
                4
              </span>
              <p className="font-body text-charcoal text-sm leading-relaxed">
                <strong>Amanha, comece o Dia 1 do plano.</strong> Nao espere a
                segunda-feira.
              </p>
            </div>
          </div>
        </div>

        <p className="font-body text-medium-gray text-sm">
          Duvidas? Entre em contato:{" "}
          <a
            href="mailto:contato@longetividade.com.br"
            className="text-sage underline"
          >
            contato@longetividade.com.br
          </a>
        </p>
      </div>
    </div>
  );
}
