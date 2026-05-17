"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/app/app-nav";

// ─── Tipos ────────────────────────────────────────────────
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
  status: "active" | "paused" | "completed" | "abandoned";
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

// ─── Constantes ───────────────────────────────────────────
const DIFFICULTY_META: Record<CycleDifficulty, { label: string; subtitle: string; color: string; icon: string }> = {
  easy: { label: "Suave", subtitle: "Entrada gentil. Pequenos passos.", color: "#8BC34A", icon: "🌱" },
  normal: { label: "Constante", subtitle: "Ritmo equilibrado. Hábitos firmando.", color: "#639922", icon: "🌿" },
  hard: { label: "Intenso", subtitle: "Pra quem já consolidou e quer subir.", color: "#BA7517", icon: "🌳" },
};

const PILLAR_META: Record<string, { label: string; color: string }> = {
  S: { label: "Simplicidade", color: "#639922" },
  E: { label: "Equilíbrio", color: "#FFC107" },
  M: { label: "Movimento", color: "#378ADD" },
};

// ─── Componente ───────────────────────────────────────────
export default function DesafioPage() {
  const router = useRouter();
  const [data, setData] = useState<ChallengeResponse | null>(null);
  const [cyclesData, setCyclesData] = useState<CyclesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<CycleDifficulty | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [chRes, cyRes] = await Promise.all([
        fetch("/api/app/challenge"),
        fetch("/api/app/cycles"),
      ]);
      if (chRes.ok) setData(await chRes.json());
      if (cyRes.ok) setCyclesData(await cyRes.json());
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Scrolla pro dia atual quando data carrega
  useEffect(() => {
    if (data?.currentDay && scrollerRef.current) {
      const card = scrollerRef.current.querySelector<HTMLElement>(
        `[data-day="${Math.min(21, data.currentDay)}"]`
      );
      if (card) {
        // Centraliza o card de hoje na viewport horizontal
        const containerWidth = scrollerRef.current.clientWidth;
        const cardLeft = card.offsetLeft;
        const cardWidth = card.clientWidth;
        scrollerRef.current.scrollTo({
          left: cardLeft - containerWidth / 2 + cardWidth / 2,
          behavior: "smooth",
        });
        // Expande o dia atual por default
        setExpandedDay(data.currentDay);
      }
    }
  }, [data?.currentDay]);

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
    if (!confirm("Reiniciar o ciclo? O atual será arquivado e você começa um novo do zero. Seu histórico fica salvo.")) return;
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
  const failedDays = data?.failedDays ?? [];
  const currentDay = data?.currentDay ?? 1;
  const needsNewCycle = data?.needsNewCycle ?? false;
  const completedSet = new Set(progress);
  const failedSet = new Set(failedDays);
  const completedCount = progress.length;
  const stats = cyclesData?.stats;
  const isPaused = cycle?.status === "paused";

  const getDayData = (n: number) => days.find((d) => d.day === n);

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="px-5 pb-24 pt-5" style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      {/* Header compacto */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Desafio 21 Dias</h1>
          {cycle ? (
            <p className="text-xs text-gray-500">
              Ciclo {cycle.cycleNumber}
              {cycle.difficulty && DIFFICULTY_META[cycle.difficulty] && (
                <>
                  {" · "}
                  <span style={{ color: DIFFICULTY_META[cycle.difficulty].color, fontWeight: 700 }}>
                    {DIFFICULTY_META[cycle.difficulty].icon} {DIFFICULTY_META[cycle.difficulty].label}
                  </span>
                </>
              )}
            </p>
          ) : (
            <p className="text-xs text-gray-500">Nenhum ciclo ativo</p>
          )}
        </div>
        {stats && stats.completedCycles > 0 && (
          <div className="rounded-xl bg-amber-50 px-3 py-2 text-right">
            <p className="text-base font-black" style={{ color: "#BA7517" }}>🏆 {stats.completedCycles}</p>
            <p className="text-[9px] text-gray-500">completos</p>
          </div>
        )}
      </div>

      {/* Banner pausado */}
      {isPaused && (
        <div className="mb-3 rounded-2xl p-3 text-xs" style={{ backgroundColor: "#FFF6E7", border: "1px solid #f5e6cc", color: "#8B5A0F" }}>
          Ciclo {cycle?.cycleNumber} <strong>pausado</strong>. Use os botões abaixo pra continuar ou reiniciar.
        </div>
      )}

      {/* Banner: precisa começar novo OU nenhum ciclo */}
      {(needsNewCycle || !cycle) && (
        <div className="mb-4 rounded-2xl p-4" style={{ backgroundColor: "#EAF3DE", border: "1px solid #d4e8c4" }}>
          <div className="text-center mb-3">
            <p className="text-2xl">{cycle ? "🏆" : "✨"}</p>
            <p className="text-sm font-bold" style={{ color: "#3B6D11" }}>
              {cycle ? `Ciclo ${cycle.cycleNumber} concluído!` : "Pronta pra sua primeira jornada?"}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {cycle
                ? `Você já completou ${stats?.totalDaysCompleted ?? 0} dias no total.`
                : "Escolha sua intensidade. Você pode subir entre ciclos."}
            </p>
          </div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">Escolha a intensidade</p>
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
            {actioning ? "..." : cycle ? `Começar Ciclo ${(cycle.cycleNumber ?? 0) + 1}` : "Começar primeira jornada"}
          </button>
        </div>
      )}

      {/* Stats compactos do ciclo ativo */}
      {cycle && cycle.status !== "completed" && !needsNewCycle && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white p-3 text-center border border-gray-100">
            <p className="text-lg font-bold" style={{ color: "#639922" }}>{completedCount}</p>
            <p className="text-[10px] text-gray-500">vitórias</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center border border-gray-100">
            <p className="text-lg font-bold" style={{ color: "#C4787A" }}>{failedDays.length}</p>
            <p className="text-[10px] text-gray-500">falhas</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center border border-gray-100">
            <p className="text-lg font-bold" style={{ color: "#9ca3af" }}>{Math.max(0, 21 - completedCount - failedDays.length)}</p>
            <p className="text-[10px] text-gray-500">restantes</p>
          </div>
        </div>
      )}

      {/* ─── CARROSSEL HORIZONTAL DE 21 DIAS ─── */}
      {cycle && (
        <>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Os 21 dias · arraste pra ver ←→
          </p>
          <div
            ref={scrollerRef}
            className="mb-4 flex gap-3 overflow-x-auto pb-2"
            style={{
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            {Array.from({ length: 21 }, (_, i) => i + 1).map((dayNum) => {
              const dayData = getDayData(dayNum);
              const isCompleted = completedSet.has(dayNum);
              const isFailed = failedSet.has(dayNum);
              const isCurrent = dayNum === currentDay && !isPaused && !needsNewCycle;
              const isFuture = dayNum > currentDay;
              const pillarColor = dayData ? PILLAR_META[dayData.pillar].color : "#9ca3af";
              const isExpanded = expandedDay === dayNum;

              const statusBg = isCompleted
                ? "#639922"
                : isFailed
                  ? "#FBEDED"
                  : isCurrent
                    ? "white"
                    : "#f3f4f6";
              const statusColor = isCompleted
                ? "white"
                : isFailed
                  ? "#C4787A"
                  : isCurrent
                    ? pillarColor
                    : "#9ca3af";

              return (
                <div
                  key={dayNum}
                  data-day={dayNum}
                  onClick={() => setExpandedDay(isExpanded ? null : dayNum)}
                  className="flex-shrink-0 rounded-2xl bg-white p-3 cursor-pointer transition-all"
                  style={{
                    scrollSnapAlign: "center",
                    width: isExpanded ? 280 : 140,
                    border: isCurrent
                      ? `2px solid ${pillarColor}`
                      : isCompleted
                        ? "1px solid #d4e8c4"
                        : isFailed
                          ? "1px solid #fcd4d4"
                          : "1px solid #e5e7eb",
                    boxShadow: isCurrent
                      ? `0 4px 16px ${pillarColor}30`
                      : isExpanded
                        ? "0 4px 16px rgba(30,40,30,0.1)"
                        : "none",
                  }}
                >
                  {/* Header do card: status circle + dia + pilar */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: statusBg,
                        color: statusColor,
                        border: isCurrent ? `1px solid ${pillarColor}` : "none",
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
                      ) : (
                        dayNum
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Dia {dayNum}
                      </p>
                      {dayData && (
                        <p className="text-[10px] font-bold" style={{ color: pillarColor }}>
                          {PILLAR_META[dayData.pillar].label}
                        </p>
                      )}
                    </div>
                    {isCurrent && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                        style={{ backgroundColor: pillarColor }}
                      >
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Título do dia */}
                  <p
                    className="text-xs font-bold mb-1"
                    style={{
                      color: isFailed ? "#9ca3af" : isFuture ? "#9ca3af" : "#1f2937",
                    }}
                  >
                    {dayData?.title ?? `Dia ${dayNum}`}
                  </p>

                  {/* Conteúdo expandido */}
                  {isExpanded && dayData && (
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Missão</p>
                        <p className="text-xs text-gray-700">{dayData.mission}</p>
                      </div>
                      <div className="rounded-lg p-2" style={{ backgroundColor: "#EAF3DE" }}>
                        <p className="text-[10px]" style={{ color: "#3B6D11" }}>
                          <strong>Dica: </strong>{dayData.tip}
                        </p>
                      </div>
                      <p className="text-[10px] italic text-gray-500">"{dayData.quote}"</p>
                      {isCurrent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/app/home");
                          }}
                          className="w-full rounded-xl py-2 text-[11px] font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #639922 0%, #3D5A3E 100%)" }}
                        >
                          Marcar 5+ hábitos na Home →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Status badge no rodapé */}
                  {!isExpanded && (
                    <p
                      className="text-[10px] font-bold"
                      style={{
                        color: isCompleted ? "#639922" : isFailed ? "#C4787A" : isCurrent ? pillarColor : "#9ca3af",
                      }}
                    >
                      {isCompleted ? "✓ Feito" : isFailed ? "Falhou" : isCurrent ? "Toque pra ver" : "Aguarda"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dica de fechar dia */}
          {cycle.status === "active" && !needsNewCycle && (
            <div
              className="mb-3 rounded-xl p-3 text-xs"
              style={{ backgroundColor: "#F0F7FF", border: "1px solid #d4e8fc", color: "#1e3a5f" }}
            >
              <strong>Dica:</strong> marque 5+ hábitos na <strong>Home</strong> antes da meia-noite pra fechar o dia ✓
            </div>
          )}

          {/* Controles do ciclo */}
          {cycle.status !== "completed" && !needsNewCycle && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {cycle.status === "active" && (
                <button
                  onClick={() => callCycleAction("pause")}
                  disabled={actioning}
                  className="rounded-xl py-2.5 text-xs font-bold transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#FFF6E7", color: "#BA7517", border: "1px solid #f5e6cc" }}
                >
                  ⏸ Pausar
                </button>
              )}
              {cycle.status === "paused" && (
                <button
                  onClick={() => callCycleAction("resume")}
                  disabled={actioning}
                  className="rounded-xl py-2.5 text-xs font-bold text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#639922" }}
                >
                  ▶ Continuar
                </button>
              )}
              <button
                onClick={handleReset}
                disabled={actioning}
                className="rounded-xl py-2.5 text-xs font-bold transition-colors disabled:opacity-60"
                style={{ backgroundColor: "#FFF0F0", color: "#C4787A", border: "1px solid #fcd4d4" }}
              >
                ↻ Reiniciar
              </button>
            </div>
          )}
        </>
      )}

      {/* Histórico de ciclos passados */}
      {cyclesData && cyclesData.cycles.length > 1 && (
        <div className="mt-4 rounded-2xl border border-gray-100 p-4">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-bold text-gray-700"
          >
            <span>Histórico de ciclos ({cyclesData.cycles.length})</span>
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
                      c.status === "completed" ? "#EAF3DE"
                      : c.status === "paused" ? "#FFF6E7"
                      : c.status === "abandoned" ? "#F3F4F6"
                      : "#F0F7FF",
                  }}
                >
                  <div>
                    <p className="font-bold text-gray-800">Ciclo {c.cycleNumber}</p>
                    <p className="text-gray-500">
                      {c.status === "completed" ? "Completo"
                        : c.status === "paused" ? "Pausado"
                        : c.status === "abandoned" ? "Abandonado"
                        : "Em andamento"} ·{" "}
                      {c.daysCompleted}/21 dias ·{" "}
                      {DIFFICULTY_META[c.difficulty]?.label}
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
