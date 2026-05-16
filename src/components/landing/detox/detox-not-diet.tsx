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
      className="py-16 md:py-24"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center mb-12">
          <span
            className="font-body text-xs md:text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            A diferenca que muda tudo
          </span>
          <h2
            className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mt-2"
            style={{ color: "var(--text-primary)" }}
          >
            Isso nao e mais uma dieta. E continuidade.
          </h2>
        </div>

        {/* Headers desktop */}
        <div className="hidden md:grid grid-cols-2 gap-6 mb-4">
          <div
            className="rounded-xl p-4 text-center font-body font-bold uppercase tracking-wider text-sm"
            style={{
              backgroundColor: "rgba(220, 80, 80, 0.08)",
              color: "#B23B3B",
            }}
          >
            ❌ Dieta radical
          </div>
          <div
            className="rounded-xl p-4 text-center font-body font-bold uppercase tracking-wider text-sm"
            style={{
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent)",
            }}
          >
            ✅ Calendario Detox 21 dias
          </div>
        </div>

        <div className="space-y-3">
          {ROWS.map((row, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className="rounded-xl p-4 md:p-5 font-body text-sm md:text-base flex items-start gap-3"
                style={{
                  backgroundColor: "rgba(220, 80, 80, 0.06)",
                  color: "var(--text-secondary)",
                }}
              >
                <span
                  className="text-lg flex-shrink-0 mt-0.5"
                  style={{ color: "#B23B3B" }}
                >
                  ✕
                </span>
                <span>
                  <span
                    className="md:hidden font-bold text-xs uppercase tracking-wider block mb-1"
                    style={{ color: "#B23B3B" }}
                  >
                    Dieta radical
                  </span>
                  {row.bad}
                </span>
              </div>
              <div
                className="rounded-xl p-4 md:p-5 font-body text-sm md:text-base flex items-start gap-3 font-medium"
                style={{
                  backgroundColor: "var(--accent-soft)",
                  color: "var(--text-primary)",
                }}
              >
                <span
                  className="text-lg flex-shrink-0 mt-0.5"
                  style={{ color: "var(--accent)" }}
                >
                  ✓
                </span>
                <span>
                  <span
                    className="md:hidden font-bold text-xs uppercase tracking-wider block mb-1"
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
