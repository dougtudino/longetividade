export default function LinkExpiradoPage() {
  return (
    <div className="min-h-screen bg-cream-white flex items-center justify-center px-4">
      <div className="mx-auto max-w-lg text-center">
        <div className="w-16 h-16 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-rose"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="font-heading font-bold text-charcoal text-3xl mb-4">
          Link expirado
        </h1>

        <p className="font-body text-dark-gray text-lg leading-relaxed mb-8">
          Este link de download expirou ou ja foi utilizado o numero maximo de
          vezes. Se voce precisa de um novo link, entre em contato com nosso
          suporte.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <p className="font-body text-charcoal text-sm mb-3">
            <strong>Precisa de ajuda?</strong>
          </p>
          <p className="font-body text-dark-gray text-sm leading-relaxed">
            Envie um email para{" "}
            <a
              href="mailto:contato@longetividade.com.br"
              className="text-sage font-medium underline"
            >
              contato@longetividade.com.br
            </a>{" "}
            informando o email usado na compra. Responderemos em ate 24 horas.
          </p>
        </div>

        <a
          href="/"
          className="inline-block mt-6 font-body text-sage hover:text-olive underline text-sm transition-colors"
        >
          Voltar para a pagina inicial
        </a>
      </div>
    </div>
  );
}
