"use client";
import { useEffect, useState } from "react";
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

const PILLAR_COLORS: Record<string, string> = {
  S: "#639922",
  E: "#FFC107",
  M: "#378ADD",
};

const WEEKS = [
  { label: "Semana 1: Simplicidade", pillar: "S", color: "#639922", days: [1, 2, 3, 4, 5, 6, 7] },
  { label: "Semana 2: Equilibrio", pillar: "E", color: "#FFC107", days: [8, 9, 10, 11, 12, 13, 14] },
  { label: "Semana 3: Movimento", pillar: "M", color: "#378ADD", days: [15, 16, 17, 18, 19, 20, 21] },
];

const MILESTONE_MESSAGES: Record<number, string> = {
  7: "Primeira semana completa! Voce esta construindo habitos de verdade.",
  14: "Duas semanas! Metade do desafio. Voce e incrivel!",
  21: "PARABENS! Voce completou o Desafio 21 Dias S.E.M! Voce provou que nao precisa de dieta. Precisa de um caminho que respeite quem voce e.",
};

export default function DesafioPage() {
  const router = useRouter();
  const [days, setDays] = useState<ChallengeDay[]>([]);
  const [progress, setProgress] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);

  const fetchChallenge = async () => {
    const res = await fetch("/api/app/challenge");
    if (!res.ok) return;
    const data = await res.json();
    setDays(data.days ?? []);
    setProgress(data.progress ?? []);
    setCurrentDay(data.currentDay ?? 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const completeDay = async (day: number) => {
    if (completing) return;
    setCompleting(true);

    const res = await fetch("/api/app/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day }),
    });

    if (res.ok) {
      const newProgress = [...progress, day];
      setProgress(newProgress);
      setCurrentDay(day < 21 ? day + 1 : 22);

      // Check for milestone
      if (MILESTONE_MESSAGES[day]) {
        setCelebration(MILESTONE_MESSAGES[day]);
      }
    }

    setCompleting(false);
  };

  const completedSet = new Set(progress);
  const completedCount = progress.length;
  const progressPercent = Math.round((completedCount / 21) * 100);

  const getDayForNumber = (dayNum: number): ChallengeDay | undefined =>
    days.find((d) => d.day === dayNum);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: "#639922" }} />
        <AppNav />
      </div>
    );
  }

  return (
    <div className="px-5 pb-24 pt-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Desafio 21 Dias S.E.M</h1>
        <p className="text-sm text-gray-400">{completedCount}/21 dias completados</p>
      </div>

      {/* Progress bar */}
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
      </div>

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
      {WEEKS.map((week) => (
        <div key={week.label} className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: week.color }}
            />
            <h2 className="text-sm font-bold" style={{ color: week.color }}>
              {week.label}
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            {week.days.map((dayNum) => {
              const dayData = getDayForNumber(dayNum);
              const isCompleted = completedSet.has(dayNum);
              const isCurrent = dayNum === currentDay;
              const isLocked = dayNum > currentDay;

              return (
                <div key={dayNum}>
                  {/* Day row */}
                  <div className="flex items-center gap-3">
                    {/* Day circle */}
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all"
                      style={{
                        backgroundColor: isCompleted
                          ? "#639922"
                          : isCurrent
                          ? "white"
                          : "#e5e7eb",
                        color: isCompleted
                          ? "white"
                          : isCurrent
                          ? week.color
                          : "#9ca3af",
                        border: isCurrent ? `2px solid ${week.color}` : "none",
                        boxShadow: isCompleted ? "0 2px 8px rgba(99,153,34,0.3)" : "none",
                      }}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
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

                    {/* Day title */}
                    <p
                      className="flex-1 text-sm"
                      style={{
                        color: isLocked ? "#9ca3af" : "#374151",
                        fontWeight: isCurrent ? 700 : 400,
                      }}
                    >
                      {dayData?.title ?? `Dia ${dayNum}`}
                    </p>

                    {/* Status label */}
                    {isCompleted && (
                      <span className="text-[10px] font-bold" style={{ color: "#639922" }}>
                        Feito
                      </span>
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

                  {/* Expanded card for current day */}
                  {isCurrent && dayData && (
                    <div
                      className="ml-10 mt-2 rounded-2xl p-4"
                      style={{
                        backgroundColor: "white",
                        boxShadow: `0 2px 12px ${week.color}20`,
                        border: `1px solid ${week.color}30`,
                      }}
                    >
                      {/* Mission */}
                      <div className="mb-3">
                        <p className="text-xs font-bold text-gray-700 mb-1">Missao do dia</p>
                        <p className="text-xs text-gray-600">{dayData.mission}</p>
                      </div>

                      {/* Tip */}
                      <div className="mb-3 rounded-xl p-2.5" style={{ backgroundColor: "#EAF3DE" }}>
                        <p className="text-xs" style={{ color: "#3B6D11" }}>
                          <span className="font-bold">Dica: </span>
                          {dayData.tip}
                        </p>
                      </div>

                      {/* Quote */}
                      <p className="mb-4 text-xs italic text-gray-500">
                        &ldquo;{dayData.quote}&rdquo;
                      </p>

                      {/* CTA buttons */}
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

      {/* All done message */}
      {currentDay > 21 && (
        <div className="mt-4 rounded-2xl p-6 text-center" style={{ backgroundColor: "#EAF3DE" }}>
          <p className="text-3xl mb-2">🏆</p>
          <h3 className="text-lg font-bold" style={{ color: "#3B6D11" }}>
            Desafio Completo!
          </h3>
          <p className="mt-1 text-sm" style={{ color: "#3B6D11" }}>
            Voce completou os 21 dias. O Metodo S.E.M agora faz parte da sua vida.
          </p>
        </div>
      )}

      <AppNav />
    </div>
  );
}
