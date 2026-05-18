"use client";

// CycleTrail — visualização emocional do ciclo de 21 dias em 3 linhas
// (Simplicidade · Equilíbrio · Movimento). Cada linha tem 7 dots (1 semana).
//
// Filosofia: quase decorativo. Não é dashboard. Cérebro precisa SENTIR
// continuidade visual, não analisar números. Sem heatmap, sem percent,
// sem cor chamativa. Tom wellness premium (Calm/Headspace/Finch).
//
// Variantes:
//   - Completo (default): 3 linhas, ~150px altura, vai na /app/jornada
//   - Compact: 1 linha (semana atual), <50px altura, vai na /app/home

export type CycleTrailProps = {
  // Dias completados (subset de 1..21). Ex: [1, 2, 3, 5, 8]
  progress: number[];
  // Dia atual do calendário (1..21+). Se > 21, ciclo terminou.
  currentDay: number | null;
  // Dias que passaram do calendário mas NÃO foram marcados
  failedDays?: number[];
  // Se true, mostra só a semana atual (uma linha). Pra Home.
  compact?: boolean;
};

// Paleta por pilar (alinhada com /data/challenge-days.ts).
const PILLAR_COLORS = {
  S: { fill: "#7BA84A", soft: "rgba(123, 168, 74, 0.18)" }, // Simplicidade · verde
  E: { fill: "#E8B83C", soft: "rgba(232, 184, 60, 0.18)" }, // Equilíbrio · amarelo
  M: { fill: "#5A9FCC", soft: "rgba(90, 159, 204, 0.18)" }, // Movimento · azul
} as const;

const PILLAR_LABEL = {
  S: "Simplicidade",
  E: "Equilíbrio",
  M: "Movimento",
} as const;

type Pillar = keyof typeof PILLAR_COLORS;

// Semana 1 = dias 1-7 (S), semana 2 = 8-14 (E), semana 3 = 15-21 (M)
const WEEKS: Array<{ pillar: Pillar; days: number[] }> = [
  { pillar: "S", days: [1, 2, 3, 4, 5, 6, 7] },
  { pillar: "E", days: [8, 9, 10, 11, 12, 13, 14] },
  { pillar: "M", days: [15, 16, 17, 18, 19, 20, 21] },
];

// ─── Helpers ─────────────────────────────────────────────

type DayState = "done" | "today" | "failed" | "future";

function dayState(
  day: number,
  progressSet: Set<number>,
  failedSet: Set<number>,
  currentDay: number | null,
): DayState {
  if (progressSet.has(day)) return "done";
  if (currentDay != null && day === currentDay) return "today";
  if (failedSet.has(day)) return "failed";
  return "future";
}

// ─── Componente principal ────────────────────────────────

export function CycleTrail({
  progress,
  currentDay,
  failedDays = [],
  compact = false,
}: CycleTrailProps) {
  const progressSet = new Set(progress);
  const failedSet = new Set(failedDays);
  const totalDone = progress.length;
  const totalDays = 21;

  // No modo compact, mostra APENAS a semana atual (ou semana 1 se não tem currentDay)
  const weeksToShow = compact
    ? [WEEKS[Math.min(2, Math.floor(((currentDay ?? 1) - 1) / 7))]]
    : WEEKS;

  return (
    <div
      className={compact ? "cycle-trail-compact" : "cycle-trail-full"}
      style={{ width: "100%" }}
    >
      {!compact && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Sua trilha · 21 dias
          </p>
          <p className="text-xs text-gray-400">
            {totalDone} de {totalDays}
          </p>
        </div>
      )}

      <div className={compact ? "flex items-center gap-2" : "flex flex-col gap-3"}>
        {weeksToShow.map((week) => (
          <CycleWeek
            key={week.pillar}
            week={week}
            progressSet={progressSet}
            failedSet={failedSet}
            currentDay={currentDay}
            compact={compact}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes trailPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.85;
          }
        }
        @keyframes trailRing {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes trailDotIn {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Linha de uma semana ─────────────────────────────────

function CycleWeek({
  week,
  progressSet,
  failedSet,
  currentDay,
  compact,
}: {
  week: { pillar: Pillar; days: number[] };
  progressSet: Set<number>;
  failedSet: Set<number>;
  currentDay: number | null;
  compact: boolean;
}) {
  const color = PILLAR_COLORS[week.pillar];
  const doneInWeek = week.days.filter((d) => progressSet.has(d)).length;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label semana + pilar (oculto no compact) */}
      {!compact && (
        <div className="flex items-baseline justify-between px-1">
          <p
            className="text-[11px] font-bold"
            style={{ color: color.fill, letterSpacing: "0.02em" }}
          >
            Semana {WEEKS.findIndex((w) => w.pillar === week.pillar) + 1} ·{" "}
            <span style={{ fontWeight: 500, opacity: 0.85 }}>{PILLAR_LABEL[week.pillar]}</span>
          </p>
          <p className="text-[10px] text-gray-400">{doneInWeek}/7</p>
        </div>
      )}

      {/* Linha de dots */}
      <div className="flex items-center gap-1">
        {week.days.map((d, i) => {
          const state = dayState(d, progressSet, failedSet, currentDay);
          return (
            <div key={d} className="flex items-center" style={{ flex: 1 }}>
              <Dot state={state} color={color} compact={compact} />
              {/* Conector entre dots (exceto após o último) */}
              {i < week.days.length - 1 && (
                <div
                  className="h-[2px] flex-1"
                  style={{
                    backgroundColor:
                      state === "done" && progressSet.has(week.days[i + 1])
                        ? color.fill
                        : "#E5E7EB",
                    opacity: state === "done" && progressSet.has(week.days[i + 1]) ? 0.55 : 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dot individual ──────────────────────────────────────

function Dot({
  state,
  color,
  compact,
}: {
  state: DayState;
  color: { fill: string; soft: string };
  compact: boolean;
}) {
  // Tamanhos compactos diferentes pro mini preview
  const baseSize = compact ? 10 : 12;
  const todaySize = compact ? 12 : 14;

  if (state === "done") {
    return (
      <div
        style={{
          width: baseSize,
          height: baseSize,
          borderRadius: "50%",
          backgroundColor: color.fill,
          animation: "trailDotIn 280ms ease-out",
          flexShrink: 0,
        }}
        aria-label="dia completo"
      />
    );
  }

  if (state === "today") {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: todaySize + 4, height: todaySize + 4, flexShrink: 0 }}
      >
        {/* Ring pulsante */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: color.soft,
            animation: "trailRing 1.8s ease-out infinite",
          }}
          aria-hidden="true"
        />
        {/* Dot interno */}
        <div
          className="relative rounded-full"
          style={{
            width: todaySize,
            height: todaySize,
            backgroundColor: color.fill,
            border: "2px solid white",
            boxShadow: `0 0 0 1.5px ${color.fill}`,
            animation: "trailPulse 2.2s ease-in-out infinite",
          }}
          aria-label="dia atual"
        />
      </div>
    );
  }

  if (state === "failed") {
    // Tom sutil rosado, sem agressividade. Visualmente "deixou passar".
    return (
      <div
        style={{
          width: baseSize,
          height: baseSize,
          borderRadius: "50%",
          backgroundColor: "transparent",
          border: "1.5px solid #D4B5B5",
          flexShrink: 0,
        }}
        aria-label="dia perdido"
      />
    );
  }

  // future
  return (
    <div
      style={{
        width: baseSize - 2,
        height: baseSize - 2,
        borderRadius: "50%",
        backgroundColor: "#E5E7EB",
        flexShrink: 0,
      }}
      aria-label="dia futuro"
    />
  );
}
