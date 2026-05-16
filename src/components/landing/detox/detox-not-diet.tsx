const ROWS = [
  {
    bad: "Cortar carboidrato, acucar, gluten",
    good: "Comer do jeito que voce gosta, com inteligencia",
  },
  {
    bad: "Contar caloria de cada refeicao",
    good: "Marcar um checklist simples no fim do dia",
  },
  {
    bad: "Passar fome pra perder peso",
    good: "Comer mais, mas certo",
  },
  {
    bad: "Sentir culpa todo fim de semana",
    good: "Um dia de cada vez, sem julgamento",
  },
  {
    bad: "Tudo ou nada",
    good: "Pequenos passos que se acumulam",
  },
  {
    bad: "Recomecar toda segunda-feira",
    good: "Continuar de onde parou — o calendario lembra",
  },
  {
    bad: "Resultado em 3 dias (e perde tudo em 3 semanas)",
    good: "Resultado em 21 dias (e fica pra sempre)",
  },
];

export function DetoxNotDiet() {
  return (
    <section
      className="py-20 md:py-28"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <span
            className="inline-block font-body text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: "var(--accent)" }}
          >
            A diferenca que muda tudo
          </span>
          <h2
            className="font-heading font-extrabold text-3xl md:text-[2.5rem] lg:text-5xl leading-[1.1]"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Isso nao e mais uma dieta. E continuidade.
          </h2>
        </div>

        {/* Headers desktop */}
        <div className="hidden md:grid grid-cols-2 gap-5 mb-3">
          <div
            className="rounded-2xl p-4 text-center font-body font-bold uppercase tracking-[0.12em] text-[13px] flex items-center justify-center gap-2"
            style={{
              backgroundColor: "rgba(178, 59, 59, 0.08)",
              color: "#B23B3B",
              border: "1px solid rgba(178, 59, 59, 0.15)",
            }}
          >
            <span className="text-base">✕</span> Dieta radical
          </div>
          <div
            className="rounded-2xl p-4 text-center font-body font-bold uppercase tracking-[0.12em] text-[13px] flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
            }}
          >
            <span className="text-base">✓</span> Calendario Detox 21 dias
          </div>
        </div>

        <div className="space-y-3">
          {ROWS.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className="rounded-2xl p-5 md:p-6 font-body text-sm md:text-base flex items-start gap-3.5"
                style={{
                  backgroundColor: "rgba(178, 59, 59, 0.05)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(178, 59, 59, 0.10)",
                }}
              >
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold mt-px"
                  style={{
                    backgroundColor: "rgba(178, 59, 59, 0.15)",
                    color: "#B23B3B",
                  }}
                >
                  ✕
                </span>
                <span className="leading-relaxed">
                  <span
                    className="md:hidden font-bold text-[10px] uppercase tracking-[0.12em] block mb-1"
                    style={{ color: "#B23B3B" }}
                  >
                    Dieta radical
                  </span>
                  {row.bad}
                </span>
              </div>
              <div
                className="rounded-2xl p-5 md:p-6 font-body text-sm md:text-base flex items-start gap-3.5 font-medium"
                style={{
                  backgroundColor: "var(--accent-soft)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--accent)",
                }}
              >
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold mt-px"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "white",
                  }}
                >
                  ✓
                </span>
                <span className="leading-relaxed">
                  <span
                    className="md:hidden font-bold text-[10px] uppercase tracking-[0.12em] block mb-1"
                    style={{ color: "var(--accent)" }}
                  >
                    Calendario Detox
                  </span>
                  {row.good}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
