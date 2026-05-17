"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/app/app-nav";
import { CelebrationOverlay } from "@/components/app/celebration-overlay";
import { DateScrubber } from "@/components/app/date-scrubber";
import { AvatarFantasy, tierLabel } from "@/components/app/avatar-fantasy";

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

type Profile = { name: string; createdAt: string };
type Checkin = { waterCount: number; habits: Record<string, boolean>; exerciseDone: boolean };
type TodayMood = { mood: string; loggedAt: string } | null;
type LevelInfo = { level: number; levelName: string; xp: number; nextLevelXp: number };
type RecentBadge = { id: string; name: string; icon: string; earnedAt: string };
type Quest = {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  done: boolean;
  progress?: { current: number; target: number };
  ctaPath: string;
};
type QuestsResponse = {
  date: string;
  quests: Quest[];
  summary: { totalQuests: number; totalDone: number; allDone: boolean };
  yesterday: {
    date: string;
    habitsPercent: number;
    waterCount: number;
    exerciseDone: boolean;
    mood: string | null;
  } | null;
  recentAchievements: Array<{ name: string; icon: string; xp: number; earnedAt: string }>;
  challengeDayToday: number | null;
};
type ChallengeProgress = {
  completedCount: number;
  currentDay: number;
  cycleNumber: number | null;
  cycleStatus: "active" | "paused" | "completed" | null;
  needsNewCycle: boolean;
};

type Wellbeing = {
  currentWeight: number | null;
  weightDelta: number | null;
  daysSinceLastWeight: number | null;
  needsWeighIn: boolean;
  totalWeightLogs: number;
  dominantMood: string | null;
  moodLogsCount: number;
  avgHabitsPercent: number;
  exerciseDays: number;
  checkinDays: number;
};

const MOOD_MAP: Record<string, { emoji: string; label: string; color: string }> = {
  otima: { emoji: "😊", label: "Otima", color: "#639922" },
  bem: { emoji: "🙂", label: "Bem", color: "#8BC34A" },
  maisOuMenos: { emoji: "😐", label: "Mais ou menos", color: "#FFC107" },
  cansada: { emoji: "😔", label: "Cansada", color: "#FF9800" },
  dificil: { emoji: "😢", label: "Dificil", color: "#F44336" },
};

export default function AppHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [todayMood, setTodayMood] = useState<TodayMood>(null);
  const [moodChecked, setMoodChecked] = useState(false);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [recentBadges, setRecentBadges] = useState<RecentBadge[]>([]);
  const [questsData, setQuestsData] = useState<QuestsResponse | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgress | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [wellbeing, setWellbeing] = useState<Wellbeing | null>(null);
  const [celebration, setCelebration] = useState<{ show: boolean; title: string; subtitle: string; emoji: string }>({
    show: false,
    title: "",
    subtitle: "",
    emoji: "",
  });

  const closeCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, show: false }));
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayIso());
  const isToday = selectedDate === todayIso();

  // Refetch dados do "dia" quando muda selectedDate
  useEffect(() => {
    const dateQuery = isToday ? "" : `?date=${selectedDate}`;
    fetch(`/api/app/checkin${dateQuery}`)
      .then((r) => r.json())
      .then((d) => setCheckin(d.checkin));
    const moodUrl = isToday ? "/api/app/mood?days=1" : `/api/app/mood?date=${selectedDate}`;
    fetch(moodUrl)
      .then((r) => r.json())
      .then((d) => {
        const dayLog = isToday ? d.todayLog : d.logs?.[0] ?? null;
        setTodayMood(dayLog);
        setMoodChecked(true);
      });

    // Quests + recap so faz sentido pra hoje
    if (isToday) {
      fetch("/api/app/daily-quests")
        .then((r) => r.json())
        .then(setQuestsData)
        .catch(() => {});
    }
  }, [selectedDate, isToday]);

  // Dados "globais" + auth
  useEffect(() => {
    fetch("/api/app/profile").then((r) => {
      if (r.status === 401) { window.location.href = "/app/login"; return null; }
      return r.json();
    }).then((d) => { if (d) setProfile(d.profile); });

    fetch("/api/app/achievements")
      .then((r) => r.json())
      .then((d) => {
        if (d.level) {
          setLevelInfo({
            level: d.level.level,
            levelName: d.level.levelName,
            xp: d.level.xp,
            nextLevelXp: d.level.nextLevelXp,
          });
        }
        if (d.earned && d.earned.length > 0) {
          setRecentBadges(
            d.earned.slice(0, 3).map((e: RecentBadge) => ({
              id: e.id,
              name: e.name,
              icon: e.icon,
              earnedAt: e.earnedAt,
            }))
          );
        }
      })
      .catch(() => {});

    fetch("/api/app/challenge")
      .then((r) => r.json())
      .then((d) => {
        if (d.progress) {
          setChallengeProgress({
            completedCount: d.progress.length,
            currentDay: d.currentDay ?? 1,
            cycleNumber: d.cycle?.cycleNumber ?? null,
            cycleStatus: d.cycle?.status ?? null,
            needsNewCycle: !!d.needsNewCycle,
          });
        }
      })
      .catch(() => {});

    // Wellbeing da semana (peso delta, humor dominante, habitos% media)
    fetch("/api/app/wellbeing-week")
      .then((r) => r.json())
      .then(setWellbeing)
      .catch(() => {});

    // Streak: contar dias consecutivos com checkin (max 30d lookback) feito client-side
    const days: Promise<boolean>[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push(
        fetch(`/api/app/checkin?date=${dateStr}`).then((r) => r.json()).then((data) => !!data.checkin)
      );
    }
    Promise.all(days).then((results) => {
      let count = 0;
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i]) count++;
        else break;
      }
      setStreakCount(count);
    });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = profile?.name ? profile.name.split(" ")[0] : "";
  const daysInMethod = profile?.createdAt
    ? Math.max(1, Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const level = levelInfo?.level ?? 1;
  const xp = levelInfo?.xp ?? 0;
  const nextLevelXp = levelInfo?.nextLevelXp ?? 100;
  const currentLevelXp = (level - 1) * (level - 1) * 100;
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpPercent = xpNeeded > 0 ? Math.round((xpInLevel / xpNeeded) * 100) : 100;

  const habitsTotal = 10;
  const habitsCount = checkin?.habits ? Object.values(checkin.habits).filter(Boolean).length : 0;
  const waterCount = checkin?.waterCount ?? 0;

  return (
    <div className="px-5 pb-24 pt-5">
      <CelebrationOverlay
        show={celebration.show}
        title={celebration.title}
        subtitle={celebration.subtitle}
        emoji={celebration.emoji}
        onClose={closeCelebration}
      />

      {/* Greeting compacto */}
      <div className="mb-3">
        <h1 className="text-xl font-bold text-gray-900">
          {greeting()}, {firstName} 👋
        </h1>
        {daysInMethod > 0 && (
          <p className="text-xs" style={{ color: "#639922" }}>
            Dia {daysInMethod} da sua rotina
          </p>
        )}
      </div>

      {/* ─── HERO: Avatar + Level + XP bar ─── */}
      <div
        className="mb-5 rounded-3xl p-5"
        style={{
          background: "linear-gradient(135deg, #1A2E1B 0%, #2D4A2E 50%, #3D5A3E 100%)",
          color: "white",
          boxShadow: "0 8px 24px rgba(99, 153, 34, 0.25)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <AvatarFantasy level={level} size={100} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider opacity-70 font-bold">Nível {level}</p>
            <p className="text-lg font-black truncate">{tierLabel(level)}</p>
            <p className="text-[11px] opacity-80">{levelInfo?.levelName ?? "..."}</p>
            {/* XP bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] mb-1 opacity-90">
                <span>{xpInLevel} XP</span>
                <span>{xpNeeded} para o Nv. {level + 1}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${xpPercent}%`,
                    background: "linear-gradient(90deg, #FDE047, #FACC15)",
                    boxShadow: "0 0 8px rgba(250, 204, 21, 0.5)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Streak no canto */}
        {streakCount > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="text-sm font-bold">{streakCount} dias seguidos</span>
            </div>
            {challengeProgress?.cycleNumber && (
              <Link href="/app/desafio" className="text-[11px] underline opacity-90">
                Ciclo {challengeProgress.cycleNumber} → {challengeProgress.completedCount}/21
              </Link>
            )}
          </div>
        )}
      </div>

      <DateScrubber selectedDate={selectedDate} onSelect={setSelectedDate} />

      {/* ─── OBJETIVOS DO DIA (Daily Quests) ─── */}
      {isToday && questsData && (
        <div className="mb-5 rounded-2xl border border-gray-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">Objetivos de hoje</h2>
            <span className="text-xs font-bold" style={{ color: questsData.summary.allDone ? "#639922" : "#9ca3af" }}>
              {questsData.summary.totalDone}/{questsData.summary.totalQuests} ✓
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {questsData.quests.map((q) => (
              <button
                key={q.id}
                onClick={() => router.push(q.ctaPath)}
                className="flex items-center gap-3 rounded-xl p-3 text-left transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: q.done ? "#EAF3DE" : "#FAFAF7",
                  border: `1px solid ${q.done ? "#9EBF9E" : "#e5e7eb"}`,
                  opacity: q.done ? 0.85 : 1,
                }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg"
                  style={{
                    backgroundColor: q.done ? "#639922" : "white",
                    border: q.done ? "none" : "1px solid #e5e7eb",
                  }}
                >
                  {q.done ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    q.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: q.done ? "#3B6D11" : "#1f2937",
                      textDecoration: q.done ? "line-through" : "none",
                    }}
                  >
                    {q.title}
                  </p>
                  {q.progress && !q.done && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (q.progress.current / q.progress.target) * 100)}%`,
                            backgroundColor: "#639922",
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {q.progress.current}/{q.progress.target}
                      </span>
                    </div>
                  )}
                  {!q.progress && (
                    <p className="text-[11px] text-gray-500">{q.description}</p>
                  )}
                </div>
                <span className="text-[10px] font-bold text-gray-400">+{q.xp} XP</span>
              </button>
            ))}
          </div>
          {questsData.summary.allDone && (
            <div className="mt-3 rounded-xl bg-gradient-to-r from-yellow-100 to-amber-100 p-3 text-center">
              <p className="text-sm font-bold" style={{ color: "#7A5712" }}>
                🏆 Você completou tudo hoje! Heroína do dia!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── PESAGEM SEMANAL (so se passaram 7+ dias ou nunca pesou) ─── */}
      {isToday && wellbeing?.needsWeighIn && (
        <button
          onClick={() => router.push("/app/progresso")}
          className="mb-5 w-full rounded-2xl p-4 text-left transition-transform active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #FFF8EE 0%, #FFE8C6 100%)",
            border: "1px solid #f5e6cc",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: "white" }}
            >
              ⚖️
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "#8B5A0F" }}>
                {wellbeing.totalWeightLogs === 0
                  ? "Registre seu peso inicial"
                  : `Pesagem da semana (${wellbeing.daysSinceLastWeight}d sem pesar)`}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "#8B5A0F", opacity: 0.85 }}>
                Toque pra registrar →
              </p>
            </div>
          </div>
        </button>
      )}

      {/* ─── SUA SEMANA (widget bem-estar) ─── */}
      {isToday && wellbeing && (wellbeing.checkinDays > 0 || wellbeing.totalWeightLogs > 0) && (
        <div className="mb-5 rounded-2xl border border-gray-100 p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Sua semana
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {/* Peso */}
            <div className="text-center">
              <p className="text-xs text-gray-400">Peso</p>
              {wellbeing.currentWeight != null ? (
                <>
                  <p className="text-lg font-bold text-gray-800">{wellbeing.currentWeight}</p>
                  {wellbeing.weightDelta != null && wellbeing.weightDelta !== 0 ? (
                    <p
                      className="text-[10px] font-bold"
                      style={{ color: wellbeing.weightDelta < 0 ? "#639922" : "#C4787A" }}
                    >
                      {wellbeing.weightDelta < 0 ? "↓" : "↑"} {Math.abs(wellbeing.weightDelta).toFixed(1)}kg
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400">7d estavel</p>
                  )}
                </>
              ) : (
                <p className="text-base text-gray-400">—</p>
              )}
            </div>
            {/* Humor */}
            <div className="text-center">
              <p className="text-xs text-gray-400">Humor</p>
              {wellbeing.dominantMood ? (
                <>
                  <p className="text-2xl">{MOOD_MAP[wellbeing.dominantMood]?.emoji ?? "💚"}</p>
                  <p className="text-[10px] text-gray-500">
                    {MOOD_MAP[wellbeing.dominantMood]?.label ?? wellbeing.dominantMood} predominante
                  </p>
                </>
              ) : (
                <p className="text-base text-gray-400">—</p>
              )}
            </div>
            {/* Habitos */}
            <div className="text-center">
              <p className="text-xs text-gray-400">Habitos</p>
              <p className="text-lg font-bold" style={{ color: "#639922" }}>
                {wellbeing.avgHabitsPercent}%
              </p>
              <p className="text-[10px] text-gray-500">{wellbeing.checkinDays}d checkin</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── RECAP DE ONTEM ─── */}
      {isToday && questsData?.yesterday && (
        <div className="mb-5 rounded-2xl p-4" style={{ backgroundColor: "#F0F7FF", border: "1px solid #d4e8fc" }}>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#1e3a5f" }}>
            Ontem
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-xl" style={{ backgroundColor: "white" }}>
              {questsData.yesterday.mood ? MOOD_MAP[questsData.yesterday.mood]?.emoji ?? "💚" : "📊"}
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-base font-bold" style={{ color: "#378ADD" }}>{questsData.yesterday.habitsPercent}%</p>
                <p className="text-[10px] text-gray-500">habitos</p>
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: "#378ADD" }}>{questsData.yesterday.waterCount}</p>
                <p className="text-[10px] text-gray-500">copos</p>
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: questsData.yesterday.exerciseDone ? "#639922" : "#9ca3af" }}>
                  {questsData.yesterday.exerciseDone ? "✓" : "—"}
                </p>
                <p className="text-[10px] text-gray-500">movimento</p>
              </div>
            </div>
          </div>
          {questsData.recentAchievements.length > 0 && (
            <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-600">
              <span>Ganhou:</span>
              {questsData.recentAchievements.slice(0, 3).map((a, i) => (
                <span key={i} className="rounded-full bg-white px-2 py-0.5">
                  {a.icon} {a.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conquistas recentes (cards horizontais — pra incentivar) */}
      {recentBadges.length > 0 && (
        <div className="mb-5 rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">Conquistas recentes</h3>
            <Link href="/app/conquistas" className="text-xs font-medium" style={{ color: "#639922" }}>
              Ver todas →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {recentBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1 rounded-xl p-2"
                style={{
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(99,153,34,0.12)",
                  minWidth: 80,
                }}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood quick action (so em hoje, ou read-only em passado) */}
      {moodChecked && (
        <button
          onClick={() => isToday && router.push("/app/emocional")}
          disabled={!isToday && !todayMood}
          className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-gray-100 p-4 text-left transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: todayMood
                ? (MOOD_MAP[todayMood.mood]?.color ?? "#639922") + "20"
                : "#f3f4f6",
            }}
          >
            <span className="text-xl">
              {todayMood ? (MOOD_MAP[todayMood.mood]?.emoji ?? "💚") : "💚"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-700">
              {isToday ? "Como esta se sentindo?" : "Humor desse dia"}
            </p>
            <p className="text-xs text-gray-400">
              {todayMood
                ? `${isToday ? "Hoje" : "Registrado"}: ${MOOD_MAP[todayMood.mood]?.label ?? todayMood.mood}`
                : isToday
                  ? "Registre seu humor do dia"
                  : "Sem registro"}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Atalhos rapidos — so em hoje */}
      {isToday && (
        <div className="mb-5 grid grid-cols-4 gap-2">
          {[
            { label: "Agua", color: "#378ADD", bg: "#EBF5FF", path: "/app/agua", icon: "💧" },
            { label: "Habitos", color: "#639922", bg: "#EAF3DE", path: "/app/habitos", icon: "✓" },
            { label: "Progresso", color: "#BA7517", bg: "#FFF8EE", path: "/app/progresso", icon: "📊" },
            { label: "Emocional", color: "#E53935", bg: "#FFF0F0", path: "/app/emocional", icon: "💚" },
          ].map((b) => (
            <button
              key={b.label}
              onClick={() => router.push(b.path)}
              className="flex flex-col items-center gap-1 rounded-2xl p-3 transition-transform active:scale-95"
              style={{ backgroundColor: b.bg, border: `1px solid ${b.color}30` }}
            >
              <span className="text-lg">{b.icon}</span>
              <span className="text-[10px] font-bold" style={{ color: b.color }}>{b.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Stats compactos do dia */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-xl font-bold" style={{ color: "#378ADD" }}>{waterCount}</p>
          <p className="text-[10px] text-gray-500">/ 8 copos</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-xl font-bold" style={{ color: "#639922" }}>{habitsCount}</p>
          <p className="text-[10px] text-gray-500">/ {habitsTotal} habitos</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-3 text-center">
          <p className="text-xl font-bold" style={{ color: checkin?.exerciseDone ? "#639922" : "#d1d5db" }}>
            {checkin?.exerciseDone ? "✓" : "—"}
          </p>
          <p className="text-[10px] text-gray-500">movimento</p>
        </div>
      </div>

      {/* Help/Tutorial CTA */}
      <Link
        href="/app/como-usar"
        className="mb-5 flex items-center justify-between rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-600 transition-colors hover:bg-gray-50"
      >
        <span className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span>Como usar o app</span>
        </span>
        <span className="text-gray-400">→</span>
      </Link>

      {/* Botão flutuante de água — quick action global, persistente */}
      {isToday && (
        <button
          onClick={async () => {
            // Optimistic update
            setCheckin((prev) => prev ? { ...prev, waterCount: prev.waterCount + 1 } : prev);
            try {
              await fetch("/api/app/water", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cups: 1 }),
              });
            } catch {
              // rollback em caso de erro
              setCheckin((prev) => prev ? { ...prev, waterCount: Math.max(0, prev.waterCount - 1) } : prev);
            }
          }}
          className="fixed z-40 flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-95"
          style={{
            bottom: 90,
            right: 16,
            width: 56,
            height: 56,
            background: "linear-gradient(135deg, #5BB0FF 0%, #378ADD 100%)",
            boxShadow: "0 6px 16px rgba(55, 138, 221, 0.4)",
          }}
          title="Adicionar 1 copo de água"
        >
          <span className="text-2xl">💧</span>
          <span
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
            style={{ backgroundColor: "#1565C0", border: "2px solid white" }}
          >
            +1
          </span>
        </button>
      )}

      <AppNav />
    </div>
  );
}
