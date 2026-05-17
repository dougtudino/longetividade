"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/app/app-nav";

type ChallengeDay = {
  day: number;
  pillar: "S" | "E" | "M";
  title: string;
  mission: string;
  tip: string;
  quote: string;
  ctaPath: string;
};

type CycleDifficulty = "easy" | "normal" | "hard";

type CycleSummary = {
  id: string;
  cycleNumber: number;
  difficulty: CycleDifficulty;
  status: "active" | "paused" | "completed";
  startDate: string;
  endDate: string | null;
  daysCompleted: number;
  daysRemaining: number;
  percent: number;
  pausedAt: string | null;
  resumedAt: string | null;
  completedAt: string | null;
};

type CyclesResponse = {
  cycles: CycleSummary[];
  current: CycleSummary | null;
  suggestedDifficulty: CycleDifficulty;
  stats: {
    totalCycles: number;
    completedCycles: number;
    activeCycles: number;
    pausedCycles: number;
    totalDaysCompleted: number;
    highestCycleNumber: number;
  };
};

const DIFFICULTY_META: Record<CycleDifficulty, { label: string; subtitle: string; color: string; icon: string }> = {
  easy: {
    label: "Suave",
    subtitle: "Entrada gentil. Pequenos passos diarios.",
    color: "#8BC34A",
    icon: "🌱",
  },
  normal: {
    label: "Constante",
    subtitle: "Ritmo equilibrado. Habitos firmando.",
    color: "#639922",
    icon: "🌿",
  },
  hard: {
    label: "Intenso",
    subtitle: "Pra quem ja consolidou e quer subir.",
    color: "#BA7517",
    icon: "🌳",
  },
};

type ChallengeResponse = {
  days: ChallengeDay[];
  progress: number[];
  currentDay: number;
  daysElapsed: number;
  failedDays: number[];
  cycle: {
    id: string;
    cycleNumber: number;
    difficulty?: CycleDifficulty;
    status: string;
    daysCompleted: number;
    startDate: string;
    completedAt: string | null;
  } | null;
  needsNewCycle: boolean;
};

const WEEKS = [
  { label: "Semana 1: Simplicidade", pillar: "S", color: "#639922", days: [1, 2, 3, 4, 5, 6, 7] },
  { label: "Semana 2: Equilibrio", pillar: "E", color: "#FFC107", days: [8, 9, 10, 11, 12, 13, 14] },
  { label: "Semana 3: Movimento", pillar: "M", color: "#378ADD", days: [15, 16, 17, 18, 19, 20, 21] },
];

const MILESTONE_MESSAGES: Record<number, string> = {
  7: "Primeira semana completa! Voce esta construindo habitos de verdade.",
  14: "Duas semanas! Metade do desafio. Voce e incrivel!",
  21: "PARABENS! Voce fechou mais um ciclo do Desafio 21 Dias S.E.M! Cada ciclo solidifica o caminho que respeita quem voce e.",
};

export default function DesafioPage() {
  const router = useRouter();
  const [data, setData] = useState<ChallengeResponse | null>(null);
  const [cyclesData, setCyclesData] = useState<CyclesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<CycleDifficulty | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [chRes, cyRes] = await Promise.all([
        fetch("/api/app/challenge"),
        fetch("/api/app/cycles"),
      ]);
      if (chRes.ok) setData(await chRes.json());
      if (cyRes.ok) setCyclesData(await cyRes.json());
    } catch {
      // silencioso — UI mostra fallback
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const completeDay = async (day: number) => {
    if (completing) return;
    setCompleting(true);
    const res = await fetch("/api/app/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day }),
    });
    if (res.ok) {
      const payload = await res.json();
      if (MILESTONE_MESSAGES[day]) setCelebration(MILESTONE_MESSAGES[day]);
      if (payload.justCompleted) setCelebration(MILESTONE_MESSAGES[21]);
      await fetchAll();
    }
    setCompleting(false);
  };

  const callCycleAction = async (path: string, body?: Record<string, unknown>) => {
    if (actioning) return;
    setActioning(true);
    const res = await fetch(`/api/app/cycles/${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) await fetchAll();
    setActioning(false);
  };

  const handleReset = async () => {
    if (!confirm("Reiniciar o ciclo? O atual sera arquivado e voce comeca um novo do zero. Seu historico fica salvo.")) return;
    await callCycleAction("reset", {});
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: "#639922" }} />
        <AppNav />
      </div>
    );
  }

  const cycle = data?.cycle;
  const days = data?.days ?? [];
  const progress = data?.progress ?? [];
  const currentDay = data?.currentDay ?? 1;
  const needsNewCycle = data?.needsNewCycle ?? false;

  const completedSet = new Set(progress);
  const completedCount = progress.length;
  const progressPercent = Math.round((completedCount / 21) * 100);

  const getDayForNumber = (dayNum: number): ChallengeDay | undefined =>
    days.find((d) => d.day === dayNum);

  const isPaused = cycle?.status === "paused";
  const stats = cyclesData?.stats;

  return (
    <div className="px-5 pb-24 pt-6">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Desafio 21 Dias S.E.M</h1>
          {cycle ? (
            <p className="text-sm text-gray-500">
              Ciclo {cycle.cycleNumber} · {completedCount}/21 dias
            </p>
          ) : (
            <p className="text-sm text-gray-500">Nenhum ciclo ativo</p>
          )}
        </div>
        {stats && stats.completedCycles > 0 && (
          <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right">
            <p className="text-lg font-black" style={{ color: "#BA7517" }}>
              🏆 {stats.completedCycles}
            </p>
            <p className="text-[10px] text-gray-500">ciclos completos</p>
          </div>
        )}
      </div>

      {/* Banner: pausado (botoes de controle ficam logo abaixo na progress bar) */}
      {isPaused && (
        <div className="mb-4 rounded-2xl p-3 text-sm" style={{ backgroundColor: "#FFF6E7", border: "1px solid #f5e6cc" }}>
          <p className="text-amber-800">
            Ciclo {cycle?.cycleNumber} <strong>pausado</strong>. Use os botoes abaixo pra continuar ou reiniciar.
          </p>
        </div>
      )}

      {/* Banner: precisa comecar novo ciclo OU nao tem nenhum ciclo */}
      {(needsNewCycle || !cycle) && (
        <div className="mb-4 rounded-2xl p-4" style={{ backgroundColor: "#EAF3DE", border: "1px solid #d4e8c4" }}>
          <div className="text-center mb-3">
            <p className="text-2xl">{cycle ? "🏆" : "✨"}</p>
            <p className="text-sm font-bold" style={{ color: "#3B6D11" }}>
              {cycle ? `Ciclo ${cycle.cycleNumber} concluido!` : "Pronta pra sua primeira jornada?"}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {cycle
                ? `Voce ja completou ${stats?.totalDaysCompleted ?? 0} dias no total.`
                : "Escolha sua intensidade. Voce pode subir entre ciclos."}
            </p>
          </div>

          {/* Seletor de dificuldade */}
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Escolha a intensidade
          </p>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {(["easy", "normal", "hard"] as CycleDifficulty[]).map((d) => {
              const meta = DIFFICULTY_META[d];
              const isSuggested = cyclesData?.suggestedDifficulty === d;
              const isSelected = selectedDifficulty === d || (selectedDifficulty === null && isSuggested);
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className="rounded-xl p-2 text-center transition-all"
                  style={{
                    backgroundColor: isSelected ? meta.color : "white",
                    color: isSelected ? "white" : meta.color,
                    border: `2px solid ${meta.color}`,
                  }}
                >
                  <div className="text-xl">{meta.icon}</div>
                  <div className="text-[11px] font-bold mt-0.5">{meta.label}</div>
                  {isSuggested && !selectedDifficulty && (
                    <div className="text-[8px] mt-0.5 uppercase tracking-wider opacity-90">sugerida</div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mb-3 text-[11px] italic text-gray-600 text-center">
            {DIFFICULTY_META[selectedDifficulty ?? cyclesData?.suggestedDifficulty ?? "normal"].subtitle}
          </p>

          <button
            onClick={() =>
              callCycleAction("start", {
                difficulty: selectedDifficulty ?? cyclesData?.suggestedDifficulty ?? "normal",
              })
            }
            disabled={actioning}
            className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: "#639922" }}
          >
            {actioning ? "..." : cycle ? `Comecar Ciclo ${(cycle.cycleNumber ?? 0) + 1}` : "Comecar primeira jornada"}
          </button>
        </div>
      )}

      {/* Tarja info: como avancar */}
      {cycle && cycle.status === "active" && !needsNewCycle && (
        <div
          className="mb-4 rounded-xl p-3 text-xs"
          style={{ backgroundColor: "#F0F7FF", border: "1px dashed #d4e8fc", color: "#1e3a5f" }}
        >
          <strong>Dica:</strong> marque 5+ habitos no checkin de hoje e o dia do desafio avanca automatico.
          {cycle.difficulty && DIFFICULTY_META[cycle.difficulty] && (
            <span className="ml-1">
              Dificuldade atual:{" "}
              <span style={{ color: DIFFICULTY_META[cycle.difficulty].color, fontWeight: 700 }}>
                {DIFFICULTY_META[cycle.difficulty].icon} {DIFFICULTY_META[cycle.difficulty].label}
              </span>
            </span>
          )}
        </div>
      )}

      {/* Progress bar + botoes de controle */}
      {cycle && cycle.status !== "completed" && !needsNewCycle && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{ color: "#639922" }}>{progressPercent}%</span>
            <span className="text-xs text-gray-400">{completedCount}/21</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #639922, #FFC107, #378ADD)",
              }}
            />
          </div>

          {/* Tres botoes de controle: Pausar / Continuar / Reiniciar */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {cycle.status === "active" && (
              <button
                onClick={() => callCycleAction("pause")}
                disabled={actioning}
                className="rounded-xl py-2 text-xs font-bold transition-colors disabled:opacity-60"
                style={{ backgroundColor: "#FFF6E7", color: "#BA7517", border: "1px solid #f5e6cc" }}
              >
                ⏸ Pausar
              </button>
            )}
            {cycle.status === "paused" && (
              <button
                onClick={() => callCycleAction("resume")}
                disabled={actioning}
                className="rounded-xl py-2 text-xs font-bold text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: "#639922" }}
              >
                ▶ Continuar
              </button>
            )}
            <button
              onClick={handleReset}
              disabled={actioning}
              className="rounded-xl py-2 text-xs font-bold transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#FFF0F0", color: "#C4787A", border: "1px solid #fcd4d4" }}
            >
              ↻ Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* Celebration modal */}
      {celebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center">
            <div className="mb-3 text-5xl">
              {completedCount >= 21 ? "🏆🎉" : "🎉"}
            </div>
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              {completedCount >= 21 ? "VOCE CONSEGUIU!" : "Parabens!"}
            </h2>
            <p className="mb-4 text-sm text-gray-600">{celebration}</p>
            <button
              onClick={() => setCelebration(null)}
              className="w-full rounded-xl py-3 text-sm font-bold text-white"
              style={{ backgroundColor: "#639922" }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Week sections */}
      {cycle && WEEKS.map((week) => (
        <div key={week.label} className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: week.color }} />
            <h2 className="text-sm font-bold" style={{ color: week.color }}>
              {week.label}
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {week.days.map((dayNum) => {
              const dayData = getDayForNumber(dayNum);
              const isCompleted = completedSet.has(dayNum);
              const failedDays = data?.failedDays ?? [];
              const isFailed = failedDays.includes(dayNum);
              const isCurrent = dayNum === currentDay && !isPaused && !needsNewCycle;
              const isLocked = dayNum > currentDay || isPaused || needsNewCycle;

              return (
                <div key={dayNum}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all"
                      style={{
                        backgroundColor: isCompleted
                          ? "#639922"
                          : isFailed
                            ? "#FBEDED"
                            : isCurrent
                              ? "white"
                              : "#e5e7eb",
                        color: isCompleted
                          ? "white"
                          : isFailed
                            ? "#C4787A"
                            : isCurrent
                              ? week.color
                              : "#9ca3af",
                        border: isCurrent ? `2px solid ${week.color}` : isFailed ? "1px solid #fcd4d4" : "none",
                        boxShadow: isCompleted ? "0 2px 8px rgba(99,153,34,0.3)" : "none",
                      }}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : isFailed ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4787A" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="5" y1="5" x2="19" y2="19" />
                          <line x1="19" y1="5" x2="5" y2="19" />
                        </svg>
                      ) : isLocked ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      ) : (
                        dayNum
                      )}
                    </div>

                    <p
                      className="flex-1 text-sm"
                      style={{
                        color: isLocked ? "#9ca3af" : "#374151",
                        fontWeight: isCurrent ? 700 : 400,
                      }}
                    >
                      {dayData?.title ?? `Dia ${dayNum}`}
                    </p>

                    {isCompleted && (
                      <span className="text-[10px] font-bold" style={{ color: "#639922" }}>Feito ✓</span>
                    )}
                    {isFailed && (
                      <span className="text-[10px] font-bold" style={{ color: "#C4787A" }}>Falhou</span>
                    )}
                    {isCurrent && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: week.color }}
                      >
                        Hoje
                      </span>
                    )}
                  </div>

                  {isCurrent && dayData && (
                    <div
                      className="ml-10 mt-2 rounded-2xl p-4"
                      style={{
                        backgroundColor: "white",
                        boxShadow: `0 2px 12px ${week.color}20`,
                        border: `1px solid ${week.color}30`,
                      }}
                    >
                      <div className="mb-3">
                        <p className="text-xs font-bold text-gray-700 mb-1">Missao do dia</p>
                        <p className="text-xs text-gray-600">{dayData.mission}</p>
                      </div>
                      <div className="mb-3 rounded-xl p-2.5" style={{ backgroundColor: "#EAF3DE" }}>
                        <p className="text-xs" style={{ color: "#3B6D11" }}>
                          <span className="font-bold">Dica: </span>{dayData.tip}
                        </p>
                      </div>
                      <p className="mb-4 text-xs italic text-gray-500">&ldquo;{dayData.quote}&rdquo;</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(dayData.ctaPath)}
                          className="flex-1 rounded-xl py-2.5 text-xs font-bold transition-transform active:scale-95"
                          style={{
                            backgroundColor: `${week.color}15`,
                            color: week.color,
                            border: `1px solid ${week.color}40`,
                          }}
                        >
                          Abrir no app
                        </button>
                        <button
                          onClick={() => completeDay(dayNum)}
                          disabled={completing}
                          className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-50"
                          style={{ backgroundColor: "#639922" }}
                        >
                          {completing ? "..." : "Completar dia"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Historico de ciclos passados */}
      {cyclesData && cyclesData.cycles.length > 1 && (
        <div className="mt-6 rounded-2xl border border-gray-100 p-4">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-bold text-gray-700"
          >
            <span>Historico de ciclos ({cyclesData.cycles.length})</span>
            <span className="text-xs text-gray-400">{showHistory ? "−" : "+"}</span>
          </button>
          {showHistory && (
            <div className="mt-3 flex flex-col gap-2">
              {cyclesData.cycles.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl p-3 text-xs"
                  style={{
                    backgroundColor:
                      c.status === "completed" ? "#EAF3DE" : c.status === "paused" ? "#FFF6E7" : "#F0F7FF",
                  }}
                >
                  <div>
                    <p className="font-bold text-gray-800">Ciclo {c.cycleNumber}</p>
                    <p className="text-gray-500">
                      {c.status === "completed" ? "Completo" : c.status === "paused" ? "Pausado" : "Em andamento"} ·{" "}
                      {c.daysCompleted}/21 dias
                    </p>
                  </div>
                  <div className="text-right text-gray-400">
                    {c.completedAt
                      ? new Date(c.completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                      : new Date(c.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AppNav />
    </div>
  );
}
