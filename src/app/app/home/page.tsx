"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/app/app-nav";
import { CelebrationOverlay } from "@/components/app/celebration-overlay";
import { BrotoCard, useBrotoState } from "@/components/app/broto-avatar";
import { CycleTrail } from "@/components/app/cycle-trail";

// /app/home — Ritual diário (radical redesign 2026-05-18).
// Antes: 8 cards competindo (Hero verde XP, Mood inline, Atividades extras,
// Receita do dia, Daily quote, Wellbeing card, Install PWA, etc).
// Agora: 1 foco emocional (Broto) + 1 missão do dia + 5 mini-cuidados.
//
// Removido: HERO verde Avatar/Level/XP (move pra /app/eu), receita inline
// (move pra /app/descobrir), daily quote (Broto fala), ActivitiesSection
// (movido pra modal opcional futura), Wellbeing card (já em /app/jornada).

// ─── Tipos ─────────────────────────────────────────────────
type Profile = { name: string; createdAt: string; waterGoal?: number; brotoName?: string };
type Checkin = {
  habits: Record<string, boolean>;
  waterCount: number;
  exerciseDone: boolean;
};
type CycleInfo = {
  cycleNumber: number;
  status: "active" | "paused" | "completed";
  difficulty: "easy" | "normal" | "hard";
  daysCompleted: number;
};
type ChallengeDay = {
  day: number;
  pillar: "S" | "E" | "M";
  title: string;
  mission: string;
  tip: string;
  quote: string;
  ctaPath: string;
};
type ChallengeResponse = {
  days: ChallengeDay[];
  progress: number[];
  currentDay: number;
  failedDays: number[];
  cycle: {
    id: string;
    cycleNumber: number;
    daysCompleted: number;
    status: string;
  } | null;
  needsNewCycle: boolean;
};

const MOOD_OPTIONS: Array<{ key: string; emoji: string; label: string }> = [
  { key: "otima", emoji: "😊", label: "Ótima" },
  { key: "bem", emoji: "🙂", label: "Bem" },
  { key: "maisOuMenos", emoji: "😐", label: "Mais ou menos" },
  { key: "cansada", emoji: "😔", label: "Cansada" },
  { key: "dificil", emoji: "😢", label: "Difícil" },
];

const HABITS_OF_DAY: Array<{ key: string; label: string }> = [
  { key: "agua", label: "Beber água" },
  { key: "refeicoes", label: "3 refeições equilibradas" },
  { key: "fruta", label: "1 fruta no dia" },
  { key: "movimento", label: "Movimentar 10+ min" },
  { key: "sono", label: "Dormir bem" },
];

const HABIT_SPEECHES: Record<string, string[]> = {
  agua: ["Obrigada pela água 💧", "Hidratada e feliz ✨"],
  refeicoes: ["Que cuidado 💚", "Comer com calma faz bem."],
  fruta: ["Doce ideia 🍎", "Cor no prato, vida no corpo."],
  movimento: ["Senti seu movimento!", "Corpo solto, mente leve."],
  sono: ["Bom descanso 😴", "Cuidar do sono é cuidar de mim."],
};

const PILLAR_COLOR: Record<string, string> = {
  S: "#639922",
  E: "#FFC107",
  M: "#378ADD",
};

const PILLAR_LABEL: Record<string, string> = {
  S: "Simplicidade",
  E: "Equilíbrio",
  M: "Movimento",
};

// ─── Helpers ───────────────────────────────────────────────
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function pickHabitSpeech(key: string): string {
  const pool = HABIT_SPEECHES[key] ?? ["Obrigada 💚"];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Microcopy do anchoring temporal (ontem / amanha).
// Pool curto, tom acolhedor, NUNCA mencionando "falha" ou "perdeu".
// Indice deterministico por dia (semente do calendario) — mesma mensagem
// durante o dia inteiro, troca quando muda o dia.

const YESTERDAY_DONE_COPIES = [
  "Você apareceu por você 💚",
  "Mesmo imperfeito, você continuou",
  "Ontem também contou",
];

const YESTERDAY_MISSED_COPIES = [
  "Hoje é um bom dia pra continuar",
  "Continua de onde você está",
  "Cada manhã é um novo começo 💚",
];

const PILLAR_TEASE: Record<string, string[]> = {
  S: [
    "Você vai cuidar da sua simplicidade",
    "Um pequeno gesto te espera",
    "Algo gentil pra amanhã",
  ],
  E: [
    "Você vai cuidar do seu equilíbrio",
    "Um respiro mais profundo te espera",
    "Algo pra calma de amanhã",
  ],
  M: [
    "Você vai cuidar da sua energia",
    "Movimento te espera amanhã",
    "Seu corpo vai agradecer",
  ],
};

// Hash bobo deterministico por dia BR — pra mensagem nao mudar a cada
// re-render mas trocar entre dias.
function dailySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
}

function pickByDay<T>(pool: T[]): T {
  if (pool.length === 0) throw new Error("Empty pool");
  return pool[dailySeed() % pool.length];
}

// ─── Componente ────────────────────────────────────────────
export default function AppHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [cycle, setCycle] = useState<CycleInfo | null>(null);
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [streakCount, setStreakCount] = useState(0);

  // Local optimistic state pro checklist
  const [localHabits, setLocalHabits] = useState<Record<string, boolean>>({});
  const [weightInput, setWeightInput] = useState("");
  const [showMoodSheet, setShowMoodSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [markingMissionDay, setMarkingMissionDay] = useState(false);
  const [celebration, setCelebration] = useState<{ show: boolean; title: string; subtitle: string; emoji: string }>({
    show: false, title: "", subtitle: "", emoji: "",
  });

  // Anchoring temporal: qual dia esta sendo "espiado" no modal (ontem/amanha).
  // null = modal fechado.
  const [peekedDay, setPeekedDay] = useState<number | null>(null);

  // Broto state + microreacoes
  const habitsHash = useMemo(() => JSON.stringify(localHabits), [localHabits]);
  const waterCount = useMemo(() => checkin?.waterCount ?? 0, [checkin]);
  const brotoRefreshKey = `${habitsHash}-${waterCount}`;
  const brotoState = useBrotoState(brotoRefreshKey);
  const [bounceCounter, setBounceCounter] = useState(0);
  const [brotoSpeech, setBrotoSpeech] = useState<string | null>(null);
  function brotoReact(speech?: string) {
    setBounceCounter((c) => c + 1);
    if (speech) {
      setBrotoSpeech(speech);
      // 4s eh o sweet spot — tempo suficiente pra ler microcopy curta
      // sem segurar a UI travada se a usuaria for marcando habit em rajada.
      setTimeout(() => setBrotoSpeech(null), 4000);
    }
  }

  // Stage-up detection + milestone permanente
  const [growthHint, setGrowthHint] = useState<string | null>(null);
  useEffect(() => {
    if (!brotoState) return;
    try {
      const lastStageStr = localStorage.getItem("broto:lastStage");
      const lastStage = lastStageStr ? parseInt(lastStageStr, 10) : 0;
      if (brotoState.stage > lastStage) {
        const name = brotoState.brotoName;
        const hints: Record<number, string> = {
          2: `🌿 ${name} cresceu uma folha nova.`,
          3: `🪴 ${name} está mais firme. Vocês estão crescendo juntas.`,
          4: `🌳 ${name} está forte. Olha o quanto você fez.`,
          5: `🌸 ${name} floresceu. Esse momento é seu.`,
        };
        const hint = hints[brotoState.stage];
        if (hint) {
          setGrowthHint(hint);
          setTimeout(() => setGrowthHint(null), 8000);
          fetch("/api/app/broto/milestones", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kind: "stage_up",
              stage: brotoState.stage,
              message: hint,
            }),
          }).catch(() => {});
        }
      }
      localStorage.setItem("broto:lastStage", String(brotoState.stage));
    } catch {
      /* localStorage indisponivel — silencioso */
    }
  }, [brotoState]);

  const closeCelebration = useCallback(() => setCelebration((p) => ({ ...p, show: false })), []);

  // ─── Fetch tudo ──────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const auth = await fetch("/api/app/profile");
    if (auth.status === 401) {
      window.location.href = "/app/login";
      return;
    }
    const d = await auth.json();
    setProfile(d.profile);

    const [chRes, cyRes, chalRes, statsRes, moodRes] = await Promise.all([
      fetch("/api/app/checkin"),
      fetch("/api/app/cycles"),
      fetch("/api/app/challenge"),
      fetch("/api/app/stats"),
      fetch("/api/app/mood?days=1"),
    ]);

    if (chRes.ok) {
      const c = await chRes.json();
      setCheckin(c.checkin);
      const habits = (c.checkin?.habits as Record<string, boolean>) ?? {};
      const wc = c.checkin?.waterCount ?? 0;
      const goal = d.profile?.waterGoal ?? 8;
      if (wc >= goal && !habits.agua) {
        habits.agua = true;
      }
      setLocalHabits(habits);
    }
    if (cyRes.ok) {
      const cy = await cyRes.json();
      const active = cy.cycles?.find((c: CycleInfo) => c.status === "active");
      if (active) setCycle(active);
    }
    if (chalRes.ok) {
      const ch = await chalRes.json();
      setChallenge(ch);
    }
    if (statsRes.ok) {
      const s = await statsRes.json();
      if (typeof s.streak === "number") setStreakCount(s.streak);
    }
    if (moodRes.ok) {
      const m = await moodRes.json();
      setTodayMood(m.todayLog?.mood ?? null);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Ações ──────────────────────────────────────────────
  function toggleHabit(key: string) {
    setLocalHabits((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!prev[key] && next[key]) {
        brotoReact(pickHabitSpeech(key));
      }
      fetch("/api/app/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: next }),
      }).catch(() => {});
      return next;
    });
  }

  async function addWater() {
    const goal = profile?.waterGoal ?? 8;
    const newCount = (checkin?.waterCount ?? 0) + 1;
    setCheckin((prev) => (prev ? { ...prev, waterCount: prev.waterCount + 1 } : prev));
    setLocalHabits((prev) => {
      if (newCount >= goal && !prev.agua) {
        return { ...prev, agua: true };
      }
      return prev;
    });
    brotoReact(
      newCount === 1
        ? "Bom começo 💧"
        : newCount >= goal
          ? "Meta de água! 🌟"
          : pickHabitSpeech("agua"),
    );
    try {
      const r = await fetch("/api/app/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cups: 1 }),
      });
      if (!r.ok) {
        setCheckin((prev) => (prev ? { ...prev, waterCount: Math.max(0, prev.waterCount - 1) } : prev));
      }
    } catch {
      setCheckin((prev) => (prev ? { ...prev, waterCount: Math.max(0, prev.waterCount - 1) } : prev));
    }
  }

  async function selectMood(mood: string) {
    const prev = todayMood;
    setTodayMood(mood);
    setShowMoodSheet(false);
    brotoReact("Anotado 💚");
    try {
      const r = await fetch("/api/app/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, triggers: [] }),
      });
      if (!r.ok) setTodayMood(prev);
    } catch {
      setTodayMood(prev);
    }
  }

  // Marcar dia do desafio (atalho direto da missao do dia)
  async function markMissionDay() {
    if (markingMissionDay || !challenge) return;
    const dayToMark = challenge.currentDay;
    if (!dayToMark || dayToMark > 21) return;
    setMarkingMissionDay(true);
    try {
      const r = await fetch("/api/app/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: dayToMark }),
      });
      if (r.ok) {
        const d = await r.json();
        setCelebration({
          show: true,
          title: d.justCompleted ? `Você floresceu! 🌸` : `Dia ${dayToMark} marcado! 🌿`,
          subtitle: d.justCompleted ? "21 dias completos. Olha o quanto você cresceu." : "Mais um cuidado consigo. Continua bonito.",
          emoji: d.justCompleted ? "🌸" : "✓",
        });
        await fetchAll();
      }
    } finally {
      setMarkingMissionDay(false);
    }
  }

  // Marcar dia completo (com habits/mood/peso) — usado pelo CTA secundario
  async function markMyDay() {
    if (saving) return;
    setSaving(true);
    const weightNum = parseFloat(weightInput);
    const body: Record<string, unknown> = {
      habits: localHabits,
      mood: todayMood,
    };
    if (!isNaN(weightNum) && weightNum > 0) {
      body.weight = weightNum;
    }
    try {
      const r = await fetch("/api/app/mark-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setCelebration({
          show: true,
          title: "Dia marcado 💚",
          subtitle: "Você apareceu por você hoje.",
          emoji: "✨",
        });
        setWeightInput("");
        await fetchAll();
      }
    } finally {
      setSaving(false);
    }
  }

  // ─── Computed ────────────────────────────────────────────
  const firstName = profile?.name?.split(" ")[0] ?? "";
  const goal = profile?.waterGoal ?? 8;
  const currentDay = challenge?.currentDay ?? null;
  const currentMission = useMemo(() => {
    if (!challenge || !currentDay || currentDay > 21) return null;
    return challenge.days.find((d) => d.day === currentDay) ?? null;
  }, [challenge, currentDay]);
  const missionAlreadyDone = useMemo(() => {
    if (!challenge || !currentDay) return false;
    return challenge.progress.includes(currentDay);
  }, [challenge, currentDay]);

  // Anchoring: dia anterior e proximo, com status
  const yesterday = useMemo(() => {
    if (!challenge || !currentDay || currentDay <= 1) return null;
    const day = currentDay - 1;
    const dayData = challenge.days.find((d) => d.day === day);
    if (!dayData) return null;
    const done = challenge.progress.includes(day);
    return {
      day,
      title: dayData.title,
      mission: dayData.mission,
      pillar: dayData.pillar,
      done,
      copy: done ? pickByDay(YESTERDAY_DONE_COPIES) : pickByDay(YESTERDAY_MISSED_COPIES),
    };
  }, [challenge, currentDay]);

  const tomorrow = useMemo(() => {
    if (!challenge || !currentDay || currentDay >= 21) return null;
    const day = currentDay + 1;
    const dayData = challenge.days.find((d) => d.day === day);
    if (!dayData) return null;
    return {
      day,
      title: dayData.title,
      mission: dayData.mission,
      pillar: dayData.pillar,
      copy: pickByDay(PILLAR_TEASE[dayData.pillar] ?? PILLAR_TEASE.S),
    };
  }, [challenge, currentDay]);

  // Detalhe do dia espiado (renderizado no modal)
  const peekedDayData = useMemo(() => {
    if (!challenge || peekedDay == null) return null;
    const dayData = challenge.days.find((d) => d.day === peekedDay);
    if (!dayData) return null;
    const done = challenge.progress.includes(peekedDay);
    const isPast = currentDay != null && peekedDay < currentDay;
    const isFuture = currentDay != null && peekedDay > currentDay;
    return { ...dayData, done, isPast, isFuture };
  }, [challenge, peekedDay, currentDay]);
  const moodLabel = useMemo(
    () => MOOD_OPTIONS.find((m) => m.key === todayMood)?.label ?? null,
    [todayMood],
  );

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="px-5 pb-24 pt-5" style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      <CelebrationOverlay
        show={celebration.show}
        title={celebration.title}
        subtitle={celebration.subtitle}
        emoji={celebration.emoji}
        onClose={closeCelebration}
      />

      {/* ─── Greeting ─── */}
      <div className="mb-3">
        <h1 className="text-xl font-bold text-gray-900">
          {greeting()}, {firstName} 💚
        </h1>
        {cycle && currentDay && currentDay <= 21 && (
          <p className="text-xs" style={{ color: "#639922" }}>
            Dia {currentDay} · Ciclo {cycle.cycleNumber} da sua jornada
          </p>
        )}
      </div>

      {/* ─── Banner saudoso (3+ dias ausente) ─── */}
      {brotoState?.mood === "saudoso" && (
        <div
          className="mb-3 rounded-2xl p-3 text-center"
          style={{
            background: "linear-gradient(135deg, #FFF6E7 0%, #FCEFD0 100%)",
            border: "1px solid #f5e6cc",
          }}
          role="status"
        >
          <p className="text-sm font-bold" style={{ color: "#8B5A0F" }}>
            🌱 Que bom te ver de novo.
          </p>
          <p className="mt-1 text-[11px]" style={{ color: "#8B5A0F", opacity: 0.85 }}>
            Sem pressão. Hoje é um bom dia pra recomeçar — do seu jeito.
          </p>
        </div>
      )}

      {/* ─── Broto (centro emocional) ─── */}
      <div className="mb-4 flex flex-col items-center">
        <BrotoCard
          state={brotoState}
          size={180}
          priority
          celebrating={!!growthHint}
          bounceTrigger={bounceCounter}
          overrideMessage={brotoSpeech}
        />
      </div>

      {/* Growth toast (stage-up) */}
      {growthHint && (
        <div
          className="mb-3 rounded-2xl p-3 text-center"
          style={{
            background: "linear-gradient(135deg, #EAF3DE 0%, #D4E5BF 100%)",
            border: "1px solid #639922",
            color: "#3B6D11",
          }}
          role="status"
        >
          <p className="text-sm font-bold">{growthHint}</p>
        </div>
      )}

      {/* ─── Strip "Ontem" (anchoring temporal, atmosferico) ─── */}
      {yesterday && (
        <button
          onClick={() => setPeekedDay(yesterday.day)}
          className="mb-2 w-full text-left transition-opacity active:opacity-60"
          aria-label={`Ver detalhes do dia ${yesterday.day}`}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              backgroundColor: "#FAFAF7",
              border: "1px solid #F0EFE9",
            }}
          >
            <span className="text-xs" style={{ color: yesterday.done ? "#7BA84A" : "#C4B5B5" }}>
              {yesterday.done ? "✓" : "—"}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Ontem
            </span>
            <span className="flex-1 truncate text-[11px]" style={{ color: "#9b9485" }}>
              {yesterday.copy}
            </span>
          </div>
        </button>
      )}

      {/* ─── Missão de hoje (hero card do ciclo) ─── */}
      {currentMission && cycle && (
        <div
          className="mb-4 rounded-2xl p-5"
          style={{
            background: "white",
            border: `2px solid ${missionAlreadyDone ? "#EAF3DE" : PILLAR_COLOR[currentMission.pillar]}`,
            boxShadow: missionAlreadyDone ? "none" : "0 6px 20px rgba(99,153,34,0.12)",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: PILLAR_COLOR[currentMission.pillar] }}>
              {PILLAR_LABEL[currentMission.pillar]} · Dia {currentMission.day}
            </p>
            {missionAlreadyDone && (
              <span className="text-[10px] font-bold" style={{ color: "#639922" }}>
                ✓ Feito hoje
              </span>
            )}
          </div>
          <h2 className="mb-1 text-base font-bold text-gray-900">{currentMission.title}</h2>
          <p className="mb-3 text-sm leading-relaxed text-gray-700">{currentMission.mission}</p>
          {!missionAlreadyDone && (
            <button
              onClick={markMissionDay}
              disabled={markingMissionDay}
              className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60 transition-transform active:scale-[0.98]"
              style={{ backgroundColor: PILLAR_COLOR[currentMission.pillar] }}
            >
              {markingMissionDay ? "..." : "Fiz ✓"}
            </button>
          )}
        </div>
      )}

      {/* ─── Strip "Amanhã" (anchoring temporal, atmosferico) ─── */}
      {tomorrow && (
        <button
          onClick={() => setPeekedDay(tomorrow.day)}
          className="mb-4 w-full text-left transition-opacity active:opacity-60"
          aria-label={`Ver previsão do dia ${tomorrow.day}`}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              backgroundColor: "#FAFAF7",
              border: "1px solid #F0EFE9",
            }}
          >
            <span className="text-xs" style={{ color: "#C4B5B5" }}>
              🔒
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Amanhã
            </span>
            <span className="flex-1 truncate text-[11px]" style={{ color: "#9b9485" }}>
              {tomorrow.copy}
            </span>
          </div>
        </button>
      )}

      {/* ─── Empty state se sem ciclo ─── */}
      {(!cycle || !currentMission) && (
        <div
          className="mb-4 rounded-2xl p-5 text-center"
          style={{ background: "white", border: "1px solid #f3f4f6" }}
        >
          <p className="mb-1 text-sm font-bold text-gray-800">Pronta pra começar?</p>
          <p className="mb-3 text-xs text-gray-500">
            21 dias pra criar uma rotina que você consegue continuar.
          </p>
          <Link
            href="/app/desafio"
            className="inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: "#639922" }}
          >
            Começar minha jornada →
          </Link>
        </div>
      )}

      {/* ─── Mini preview da trilha (semana atual) ─── */}
      {challenge && cycle && currentDay && currentDay <= 21 && (
        <Link
          href="/app/jornada"
          className="mb-4 block rounded-2xl bg-white p-3 border border-gray-100 transition-transform active:scale-[0.98]"
        >
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Sua trilha
            </p>
            <p className="text-[10px] text-gray-400">
              {challenge.progress.length} de 21 dias · ver trilha →
            </p>
          </div>
          <CycleTrail
            progress={challenge.progress}
            currentDay={currentDay}
            failedDays={challenge.failedDays}
            compact
          />
        </Link>
      )}

      {/* ─── Hoje você cuidou de você ─── */}
      <div className="mb-4 rounded-2xl bg-white p-4 border border-gray-100">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          Hoje você cuidou de você
        </p>
        <div className="flex flex-col gap-1">
          {HABITS_OF_DAY.map((h) => {
            const done = !!localHabits[h.key];
            const isWater = h.key === "agua";
            return (
              <div
                key={h.key}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors"
                style={{ backgroundColor: done ? "#EAF3DE" : "transparent" }}
              >
                <button
                  onClick={() => toggleHabit(h.key)}
                  aria-label={done ? `Desmarcar ${h.label}` : `Marcar ${h.label}`}
                  aria-pressed={done}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md transition-colors"
                  style={{
                    backgroundColor: done ? "#639922" : "white",
                    border: done ? "none" : "2px solid #d1d5db",
                  }}
                >
                  {done && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <span
                  className="flex-1 text-sm"
                  style={{
                    color: done ? "#3B6D11" : "#374151",
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  {isWater ? `Beber ${goal} copos de água` : h.label}
                </span>
                {isWater && (
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-600">
                      {waterCount}/{goal}
                    </span>
                    <button
                      onClick={addWater}
                      aria-label="Adicionar 1 copo de água"
                      className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                      style={{ backgroundColor: "#378ADD", fontSize: 18 }}
                    >
                      +
                    </button>
                  </span>
                )}
              </div>
            );
          })}

          {/* Mood compacto (1 linha clicavel — abre bottom sheet) */}
          <button
            onClick={() => setShowMoodSheet(true)}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors"
            style={{ backgroundColor: todayMood ? "#F0F7FF" : "transparent" }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-xl"
              style={{ backgroundColor: todayMood ? "#378ADD" : "white", border: todayMood ? "none" : "2px solid #d1d5db" }}
            >
              {todayMood ? MOOD_OPTIONS.find((m) => m.key === todayMood)?.emoji : "😊"}
            </div>
            <span className="flex-1 text-left text-sm text-gray-700">
              {todayMood ? `Você está: ${moodLabel}` : "Como você está hoje?"}
            </span>
            <span className="text-xs text-gray-400">{todayMood ? "trocar" : "registrar"}</span>
          </button>

          {/* Peso (input inline compacto) */}
          <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-lg"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              ⚖️
            </div>
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Peso de hoje (opcional)"
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
            {weightInput && (
              <button
                onClick={markMyDay}
                disabled={saving}
                className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
                style={{ backgroundColor: "#639922" }}
              >
                {saving ? "..." : "Salvar"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Streak footer + link Jornada ─── */}
      <div className="text-center">
        {streakCount > 0 && (
          <p className="text-xs text-gray-500">
            🔥 <strong style={{ color: "#BA7517" }}>{streakCount} dias</strong> cuidando de você
          </p>
        )}
        <Link
          href="/app/jornada"
          className="mt-3 inline-block text-xs font-bold uppercase tracking-wider"
          style={{ color: "#639922" }}
        >
          Ver minha jornada →
        </Link>
      </div>

      {/* ─── Bottom sheet do anchoring (ontem/amanha) ─── */}
      {peekedDayData && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60"
          onClick={() => setPeekedDay(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: PILLAR_COLOR[peekedDayData.pillar] }}
                >
                  {PILLAR_LABEL[peekedDayData.pillar]} · Dia {peekedDayData.day}
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  {peekedDayData.isFuture ? "🔒 " : ""}
                  {peekedDayData.title}
                </h3>
              </div>
              <button
                onClick={() => setPeekedDay(null)}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-400"
              >
                ×
              </button>
            </div>

            {/* Status (ontem) ou teaser (amanha) */}
            {peekedDayData.isPast && (
              <div
                className="mb-3 rounded-xl px-3 py-2 text-xs"
                style={{
                  backgroundColor: peekedDayData.done ? "#EAF3DE" : "#FAFAF7",
                  color: peekedDayData.done ? "#3B6D11" : "#9b9485",
                }}
              >
                {peekedDayData.done
                  ? "✓ Você marcou esse dia. Olha o quanto você cuidou."
                  : "Esse dia não foi marcado — e tudo bem. Continua de onde você está."}
              </div>
            )}

            {peekedDayData.isFuture && (
              <div
                className="mb-3 rounded-xl px-3 py-2 text-xs"
                style={{ backgroundColor: "#FAFAF7", color: "#9b9485" }}
              >
                Volte amanhã pra marcar esse dia. Sem pressa.
              </div>
            )}

            {/* Mostra missao sempre (passado completo, futuro como spoiler leve) */}
            <p className="text-sm leading-relaxed text-gray-700">
              {peekedDayData.mission}
            </p>

            {/* Frase final */}
            {peekedDayData.tip && (
              <p className="mt-3 rounded-xl bg-gray-50 p-3 text-xs italic text-gray-600">
                💡 {peekedDayData.tip}
              </p>
            )}

            <button
              onClick={() => setPeekedDay(null)}
              className="mt-5 w-full rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ─── Bottom sheet do mood ─── */}
      {showMoodSheet && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60"
          onClick={() => setShowMoodSheet(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Como você está hoje?</h3>
              <button
                onClick={() => setShowMoodSheet(false)}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-400"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => selectMood(m.key)}
                  className="flex flex-col items-center gap-1 rounded-xl p-3 transition-transform active:scale-95"
                  style={{
                    backgroundColor: todayMood === m.key ? "#EAF3DE" : "#f9fafb",
                    border: todayMood === m.key ? "2px solid #639922" : "2px solid transparent",
                  }}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600">{m.label}</span>
                </button>
              ))}
            </div>
            <Link
              href="/app/emocional"
              className="mt-4 block w-full rounded-xl border border-gray-200 py-3 text-center text-xs font-bold text-gray-600"
              onClick={() => setShowMoodSheet(false)}
            >
              Detalhar humor · gatilhos · respiração →
            </Link>
          </div>
        </div>
      )}

      <AppNav />
    </div>
  );
}
