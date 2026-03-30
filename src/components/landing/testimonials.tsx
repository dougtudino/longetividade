const TESTIMONIALS = [
  {
    quote:
      "Achei que o problema era eu. Descobri que era o metodo. Pela primeira vez nao senti que estava fazendo dieta -- e mesmo assim comecei a ver resultado.",
    name: "Fernanda",
    detail: "34 anos, mae de 2, de Belo Horizonte",
    stars: 5,
  },
  {
    quote:
      "Eu chorei lendo o capitulo sobre alimentacao emocional. Finalmente alguem explicou por que eu comia por ansiedade a noite. Mudou tudo pra mim.",
    name: "Camila",
    detail: "29 anos, professora, de Sao Paulo",
    stars: 5,
  },
  {
    quote:
      "Em 3 semanas perdi 2,5kg sem cortar nada. Estou comendo arroz, feijao, e ate chocolate. Meu marido perguntou o que mudou.",
    name: "Patricia",
    detail: "41 anos, enfermeira, de Curitiba",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="font-heading font-bold text-charcoal text-2xl md:text-4xl text-center mb-10 md:mb-14">
          Mulheres reais, resultados reais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-cream-white rounded-2xl p-6 md:p-8 relative"
            >
              <span className="font-heading text-sage-light text-6xl absolute top-4 left-6 select-none leading-none">
                &ldquo;
              </span>
              <p className="font-body text-charcoal text-sm md:text-base italic leading-relaxed mt-8 mb-4">
                {t.quote}
              </p>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-gold"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="font-body font-bold text-charcoal text-sm">
                {t.name}
              </p>
              <p className="font-body text-medium-gray text-xs">
                {t.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
