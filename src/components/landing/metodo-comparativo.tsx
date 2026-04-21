// Seção comparativa — Dieta tradicional vs Método S.E.M.
// Reforço lógico pré-pricing: usuário vê a diferença e entende a transformação do método.

type ComparisonRow = {
  tradicional: string;
  sem: string;
};

const ROWS: ComparisonRow[] = [
  { tradicional: "Contar caloria de cada refeição", sem: "Montar o prato sem pesar nada" },
  { tradicional: "Cortar carboidrato, glúten, açúcar", sem: "Comer do jeito que você gosta" },
  { tradicional: "Acordar 5h pra academia", sem: "15 minutos de movimento em casa" },
  { tradicional: "Depender de força de vontade", sem: "Hábitos automáticos que se sustentam" },
  { tradicional: "Dieta restritiva que sabota à noite", sem: "Plano prático de 7 dias pronto" },
  { tradicional: "Culpa toda vez que 'saiu da linha'", sem: "Flexibilidade sem autossabotagem" },
  { tradicional: "Cozinhar comida separada pra você", sem: "Uma refeição pra família inteira" },
];

export function MetodoComparativo() {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <p
            className="mb-2 text-xs uppercase tracking-wider font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Por que esse método é diferente
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            A vida real × o método que respeita você
          </h2>
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
        >
          {/* Headers */}
          <div
            className="grid grid-cols-2 divide-x text-xs md:text-sm font-bold uppercase tracking-wider"
            style={{ borderColor: "var(--border-default)" }}
          >
            <div
              className="px-4 md:px-6 py-3 text-center"
              style={{ color: "#f87171", backgroundColor: "rgba(239,68,68,0.05)" }}
            >
              Dieta tradicional
            </div>
            <div
              className="px-4 md:px-6 py-3 text-center"
              style={{ color: "var(--accent)", backgroundColor: "var(--accent-soft)" }}
            >
              Método S.E.M
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-2 divide-x border-t text-sm md:text-base"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div
                className="px-4 md:px-6 py-3 md:py-4 flex items-start gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <span style={{ color: "#f87171", fontWeight: 700, flexShrink: 0 }}>✕</span>
                <span>{row.tradicional}</span>
              </div>
              <div
                className="px-4 md:px-6 py-3 md:py-4 flex items-start gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <span style={{ color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span>{row.sem}</span>
              </div>
            </div>
          ))}
        </div>

        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Não é sobre força de vontade. É sobre ter o método certo.
        </p>
      </div>
    </section>
  );
}
