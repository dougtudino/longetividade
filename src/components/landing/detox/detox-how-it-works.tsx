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
      className="py-20 md:py-28"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-14 md:mb-20 max-w-3xl mx-auto">
          <span
            className="inline-block font-body text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: "var(--accent)" }}
          >
            Como funciona
          </span>
          <h2
            className="font-heading font-extrabold text-3xl md:text-[2.5rem] lg:text-5xl leading-[1.1] mb-5"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Nao e dieta. E um calendario simples.
          </h2>
          <p
            className="font-body text-base md:text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            21 dias. Habitos pequenos. Voce so segue — a gente ja organizou tudo.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 max-w-5xl mx-auto">
          {/* Linha conectora sutil entre cards no desktop */}
          <div
            aria-hidden
            className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px -translate-y-1/2 z-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--border-default), transparent)",
            }}
          />
          {DAYS.map((d) => (
            <div key={d.n} className="relative z-10">
              <MockupDayCard dayNumber={d.n} title={d.title} tasks={d.tasks} />
            </div>
          ))}
        </div>

        <p
          className="mt-14 text-center font-body text-sm md:text-base italic max-w-2xl mx-auto"
          style={{ color: "var(--text-muted)" }}
        >
          Nos dias 4 a 21, voce ja tem ritmo. O calendario continua marcando
          pequenas vitorias ate o dia 21.
        </p>
      </div>
    </section>
  );
}
