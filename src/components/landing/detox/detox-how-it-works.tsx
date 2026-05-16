import { MockupDayCard } from "@/components/mockups/mockup-day-card";

const DAYS = [
  {
    n: 1,
    title: "Comecar leve",
    tasks: ["Beber 2L de agua", "Cafe com proteina", "Caminhada 10 min"],
  },
  {
    n: 2,
    title: "Criar ritmo",
    tasks: [
      "Repetir habitos do dia 1",
      "Substituir 1 refeicao",
      "Marcar progresso no app",
    ],
  },
  {
    n: 3,
    title: "Sentir diferenca",
    tasks: ["3 dias seguidos", "Streak ativo", "Roupa vestindo diferente"],
  },
];

export function DetoxHowItWorks() {
  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-body text-xs md:text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            Como funciona
          </span>
          <h2
            className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mt-2 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Nao e dieta. E um calendario simples.
          </h2>
          <p
            className="font-body text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            21 dias. Habitos pequenos. Voce so segue — a gente ja organizou
            tudo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {DAYS.map((d) => (
            <MockupDayCard
              key={d.n}
              dayNumber={d.n}
              title={d.title}
              tasks={d.tasks}
            />
          ))}
        </div>

        <p
          className="mt-12 text-center font-body text-sm md:text-base italic max-w-2xl mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          Nos dias 4 a 21, voce ja tem ritmo. O calendario continua marcando
          pequenas vitorias ate o dia 21.
        </p>
      </div>
    </section>
  );
}
