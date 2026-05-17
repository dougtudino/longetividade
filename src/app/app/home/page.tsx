"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/app/app-nav";
import { CelebrationOverlay } from "@/components/app/celebration-overlay";
import { AvatarFantasy, tierLabel } from "@/components/app/avatar-fantasy";
import { InstallPwaButton } from "@/components/app/install-pwa-button";
import { ActivitiesSection } from "@/components/app/activities-section";

// ─── Tipos ─────────────────────────────────────────────────
type Profile = { name: string; createdAt: string };
type Checkin = {
  habits: Record<string, boolean>;
  waterCount: number;
  exerciseDone: boolean;
};
type LevelInfo = { level: number; levelName: string; xp: number; nextLevelXp: number };
type RecentBadge = { id: string; name: string; icon: string; earnedAt: string };
type CycleInfo = {
  cycleNumber: number;
  status: "active" | "paused" | "completed";
  difficulty: "easy" | "normal" | "hard";
  daysCompleted: number;
};
type Recipe = {
  id: string;
  name: string;
  prepTime: number;
  pillar: "S" | "E" | "M";
};
type Wellbeing = {
  currentWeight: number | null;
  weightDelta: number | null;
  daysSinceLastWeight: number | null;
  needsWeighIn: boolean;
  totalWeightLogs: number;
  avgHabitsPercent: number;
  exerciseDays: number;
  checkinDays: number;
};
type Yesterday = {
  habitsPercent: number;
  waterCount: number;
  exerciseDone: boolean;
  mood: string | null;
};

// ─── Constantes UI ─────────────────────────────────────────
const MOOD_OPTIONS: Array<{ key: string; emoji: string; label: string }> = [
  { key: "otima", emoji: "😊", label: "Ótima" },
  { key: "bem", emoji: "🙂", label: "Bem" },
  { key: "maisOuMenos", emoji: "😐", label: "Mais ou menos" },
  { key: "cansada", emoji: "😔", label: "Cansada" },
  { key: "dificil", emoji: "😢", label: "Difícil" },
];

const HABITS_OF_DAY: Array<{ key: string; label: string }> = [
  { key: "agua", label: "Beber 8 copos de água" },
  { key: "refeicoes", label: "3 refeições equilibradas" },
  { key: "fruta", label: "1 fruta no dia" },
  { key: "movimento", label: "Movimento (10+ min)" },
  { key: "sono", label: "Dormir 7-8h" },
];

const PILLAR_LABEL: Record<string, string> = {
  S: "Simplicidade",
  E: "Equilíbrio",
  M: "Movimento",
};

const QUOTES = [
  "Você apareceu por você hoje 💚",
  "Pequenos passos viram caminhos.",
  "A rotina te lembra quem você é.",
  "Constância vale mais que perfeição.",
  "Hoje você cuidou. Isso já é vitória.",
];

// ─── Helpers ───────────────────────────────────────────────
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// ─── Componente ────────────────────────────────────────────
export default function AppHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [levelInfo, setLevelInfo] = useState<LevelInfo | null>(null);
  const [recentBadges, setRecentBadges] = useState<RecentBadge[]>([]);
  const [cycle, setCycle] = useState<CycleInfo | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pillarLabel, setPillarLabel] = useState<string>("");
  const [wellbeing, setWellbeing] = useState<Wellbeing | null>(null);
  const [yesterday, setYesterday] = useState<Yesterday | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [hasPushSubscription, setHasPushSubscription] = useState<boolean | null>(null);

  // Estado local do checklist (otimista) — sincroniza com checkin real
  const [localHabits, setLocalHabits] = useState<Record<string, boolean>>({});
  const [weightInput, setWeightInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [celebration, setCelebration] = useState<{ show: boolean; title: string; subtitle: string; emoji: string }>({
    show: false, title: "", subtitle: "", emoji: "",
  });

  const closeCelebration = useCallback(() => setCelebration((p) => ({ ...p, show: false })), []);

  const fetchAll = useCallback(async () => {
    const auth = await fetch("/api/app/profile");
    if (auth.status === 401) { window.location.href = "/app/login"; return; }
    const d = await auth.json();
    setProfile(d.profile);

    // tudo em paralelo
    const [chRes, achRes, cyRes, recRes, wbRes, dqRes, pushRes] = await Promise.all([
      fetch("/api/app/checkin"),
      fetch("/api/app/achievements"),
      fetch("/api/app/cycles"),
      fetch("/api/app/recipe-of-day"),
      fetch("/api/app/wellbeing-week"),
      fetch("/api/app/daily-quests"),
      fetch("/api/app/push/prefs"),
    ]);

    if (chRes.ok) {
      const c = await chRes.json();
      setCheckin(c.checkin);
      setLocalHabits((c.checkin?.habits as Record<string, boolean>) ?? {});
    }
    if (achRes.ok) {
      const a = await achRes.json();
      if (a.level) {
        setLevelInfo({
          level: a.level.level,
          levelName: a.level.levelName,
          xp: a.level.xp,
          nextLevelXp: a.level.nextLevelXp,
        });
      }
      if (a.earned) setRecentBadges(a.earned.slice(0, 4));
    }
    if (cyRes.ok) {
      const cy = await cyRes.json();
      if (cy.current) setCycle(cy.current);
    }
    if (recRes.ok) {
      const r = await recRes.json();
      setRecipe(r.recipe);
      setPillarLabel(r.pillarLabel ?? PILLAR_LABEL[r.pillar] ?? "");
    }
    if (wbRes.ok) {
      const w = await wbRes.json();
      setWellbeing(w);
    }
    if (dqRes.ok) {
      const dq = await dqRes.json();
      setYesterday(dq.yesterday);
    }
    if (pushRes.ok) {
      const p = await pushRes.json();
      setHasPushSubscription(!!p.hasSubscriptions);
    }

    // Mood do dia
    const moodRes = await fetch("/api/app/mood?days=1");
    if (moodRes.ok) {
      const m = await moodRes.json();
      setTodayMood(m.todayLog?.mood ?? null);
    }

    // Streak (últimos 7 dias)
    const days: Promise<boolean>[] = [];
    for (let i = 6; i >= 0; i--) {
      const dt = new Date();
      dt.setDate(dt.getDate() - i);
      const dateStr = dt.toISOString().split("T")[0];
      days.push(
        fetch(`/api/app/checkin?date=${dateStr}`).then((r) => r.json()).then((data) => !!data.checkin)
      );
    }
    const streakArr = await Promise.all(days);
    let count = 0;
    for (let i = streakArr.length - 1; i >= 0; i--) {
      if (streakArr[i]) count++;
      else break;
    }
    setStreakCount(count);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Ações ──────────────────────────────────────────────
  // Toggle persiste imediatamente no backend (autosave). Sem o "Marcar
  // meu dia", a usuária poderia perder tudo trocando de aba. /api/app/checkin
  // POST eh upsert idempotente — chamar com habits parciais eh seguro.
  function toggleHabit(key: string) {
    setLocalHabits((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Fire-and-forget autosave (sem await pra UI nao travar)
      fetch("/api/app/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: next }),
      }).catch(() => {
        /* silencioso; usuaria ainda pode tocar "Marcar meu dia" depois */
      });
      return next;
    });
  }

  async function addWater() {
    // optimistic
    setCheckin((prev) => (prev ? { ...prev, waterCount: prev.waterCount + 1 } : prev));
    try {
      const r = await fetch("/api/app/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cups: 1 }),
      });
      // Rollback em qualquer status != 2xx (nao so erro de rede)
      if (!r.ok) {
        setCheckin((prev) => (prev ? { ...prev, waterCount: Math.max(0, prev.waterCount - 1) } : prev));
      }
    } catch {
      setCheckin((prev) => (prev ? { ...prev, waterCount: Math.max(0, prev.waterCount - 1) } : prev));
    }
  }

  async function selectMood(mood: string) {
    setTodayMood(mood);
    try {
      await fetch("/api/app/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, triggers: [] }),
      });
    } catch {
      /* silent */
    }
  }

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
        const d = await r.json();
        if (d.autoChallengeDay) {
          setCelebration({
            show: true,
            title: `Dia ${d.autoChallengeDay} do ciclo! 🎯`,
            subtitle: "Você marcou 5+ hábitos. O desafio avançou junto.",
            emoji: "🎯",
          });
        } else {
          setCelebration({
            show: true,
            title: "Dia marcado! 💚",
            subtitle: QUOTES[Math.floor(Math.random() * QUOTES.length)],
            emoji: "✨",
          });
        }
        setWeightInput("");
        await fetchAll();
      }
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  }

  // ─── Derivações ─────────────────────────────────────────
  const firstName = profile?.name ? profile.name.split(" ")[0] : "";
  const daysInJourney = profile?.createdAt
    ? Math.max(1, Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const level = levelInfo?.level ?? 1;
  const xp = levelInfo?.xp ?? 0;
  const nextLevelXp = levelInfo?.nextLevelXp ?? 100;
  const currentLevelXp = (level - 1) * (level - 1) * 100;
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpPercent = xpNeeded > 0 ? Math.round((xpInLevel / xpNeeded) * 100) : 100;

  const waterCount = checkin?.waterCount ?? 0;
  const habitsDoneLocal = Object.values(localHabits).filter(Boolean).length;
  const habitsDirty = JSON.stringify(localHabits) !== JSON.stringify(checkin?.habits ?? {});

  const quote = useMemo(() => QUOTES[Math.floor((daysInJourney || 0) % QUOTES.length)], [daysInJourney]);

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="px-5 pb-24 pt-5" style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      <CelebrationOverlay
        show={celebration.show}
        title={celebration.title}
        subtitle={celebration.subtitle}
        emoji={celebration.emoji}
        onClose={closeCelebration}
      />

      {/* ─── Greeting + dia da jornada ─── */}
      <div className="mb-3">
        <h1 className="text-xl font-bold text-gray-900">
          {greeting()}, {firstName} 💚
        </h1>
        {daysInJourney > 0 && (
          <p className="text-xs" style={{ color: "#639922" }}>
            Dia {daysInJourney} da sua jornada
          </p>
        )}
      </div>

      {/* ─── HERO compacto: Avatar + Level + XP + Streak ─── */}
      <div
        className="mb-4 rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, #1A2E1B 0%, #2D4A2E 50%, #3D5A3E 100%)",
          color: "white",
        }}
      >
        <div className="flex items-center gap-3">
          <AvatarFantasy level={level} size={64} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] uppercase tracking-wider opacity-70 font-bold">Nv {level} · {tierLabel(level)}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${xpPercent}%`, background: "linear-gradient(90deg, #FDE047, #FACC15)" }}
              />
            </div>
            <p className="mt-1 text-[10px] opacity-70">
              {xpInLevel} XP · {xpNeeded - xpInLevel} para Nv {level + 1}
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg">🔥</p>
            <p className="text-[10px] font-bold">{streakCount}d</p>
          </div>
        </div>
      </div>

      {/* ─── CARD PRINCIPAL: Seu próximo pequeno passo ─── */}
      <div className="mb-4 rounded-2xl bg-white p-4" style={{ border: "2px solid #639922", boxShadow: "0 6px 20px rgba(99,153,34,0.12)" }}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Seu próximo pequeno passo</h2>
          {cycle && (
            <Link
              href="/app/desafio"
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#639922" }}
            >
              Dia {Math.min(21, cycle.daysCompleted + 1)} · Ciclo {cycle.cycleNumber} →
            </Link>
          )}
        </div>

        {/* Lista de hábitos com toggle inline */}
        <div className="flex flex-col gap-1.5">
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
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors"
                  style={{
                    backgroundColor: done ? "#639922" : "white",
                    border: done ? "none" : "2px solid #d1d5db",
                  }}
                >
                  {done && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
                  {h.label}
                </span>
                {isWater && (
                  <span className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-600">{waterCount}/8</span>
                    <button
                      onClick={addWater}
                      className="flex h-7 w-7 items-center justify-center rounded-full font-bold text-white"
                      style={{ backgroundColor: "#378ADD", fontSize: 14 }}
                    >
                      +
                    </button>
                  </span>
                )}
              </div>
            );
          })}

          {/* Linha de peso (semanal) */}
          {wellbeing?.needsWeighIn && (
            <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-base" style={{ backgroundColor: "#FFF6E7" }}>
                ⚖️
              </div>
              <span className="text-sm text-gray-700">Atualizar peso (semanal)</span>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={wellbeing.currentWeight ? `${wellbeing.currentWeight}` : "kg"}
                className="ml-auto w-16 rounded-lg border border-gray-200 px-2 py-1 text-right text-sm outline-none focus:border-[#639922]"
              />
            </div>
          )}
        </div>

        {/* Botão "Marcar meu dia" */}
        <button
          onClick={markMyDay}
          disabled={saving || (!habitsDirty && !weightInput && habitsDoneLocal === 0)}
          className="mt-3 w-full rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #639922 0%, #3D5A3E 100%)",
          }}
        >
          {saving
            ? "Salvando..."
            : habitsDoneLocal >= 5
              ? `Marcar meu dia ✓ (${habitsDoneLocal}/5 hábitos)`
              : `Marcar meu dia (${habitsDoneLocal}/5 hábitos)`}
        </button>
      </div>

      {/* ─── Atividades extras (desbloqueadas por nivel) ─── */}
      <ActivitiesSection onRegistered={() => fetchAll()} />

      {/* ─── Humor inline ─── */}
      <div className="mb-4 rounded-2xl bg-white p-4 border border-gray-100">
        <p className="mb-2 text-sm font-bold text-gray-800">Como você está agora?</p>
        <div className="flex items-center justify-between">
          {MOOD_OPTIONS.map((m) => {
            const selected = todayMood === m.key;
            return (
              <button
                key={m.key}
                onClick={() => selectMood(m.key)}
                className="flex flex-col items-center gap-0.5 rounded-xl p-2 transition-transform active:scale-95"
                style={{
                  backgroundColor: selected ? "#EAF3DE" : "transparent",
                  transform: selected ? "scale(1.1)" : "scale(1)",
                }}
              >
                <span style={{ fontSize: 28, opacity: selected ? 1 : 0.4 }}>{m.emoji}</span>
                <span className="text-[10px] font-bold" style={{ color: selected ? "#3B6D11" : "#9ca3af" }}>
                  {m.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Receita do dia ─── */}
      {recipe && (
        <Link
          href={`/app/receitas`}
          className="mb-4 block rounded-2xl p-4 transition-transform active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #FFF8EE 0%, #FFE8C6 100%)", border: "1px solid #f5e6cc" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-xl">
              🍳
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#BA7517" }}>
                Receita pra hoje · {pillarLabel}
              </p>
              <p className="text-sm font-bold" style={{ color: "#7A5712" }}>{recipe.name}</p>
              <p className="text-[11px]" style={{ color: "#BA7517", opacity: 0.8 }}>
                {recipe.prepTime} min · toque pra ver
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* ─── Frase emocional ─── */}
      <div className="mb-4 rounded-2xl p-4 text-center" style={{ backgroundColor: "#EAF3DE" }}>
        <p className="text-sm italic" style={{ color: "#3B6D11" }}>"{quote}"</p>
      </div>

      {/* ─── Sua evolução: 3 mini cards ─── */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white p-3 text-center border border-gray-100">
          <p className="text-base font-bold">🔥 {streakCount}d</p>
          <p className="text-[10px] text-gray-500">cuidando</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center border border-gray-100">
          <p className="text-base font-bold" style={{ color: wellbeing?.weightDelta && wellbeing.weightDelta < 0 ? "#639922" : "#374151" }}>
            {wellbeing?.weightDelta != null
              ? `${wellbeing.weightDelta < 0 ? "−" : "+"}${Math.abs(wellbeing.weightDelta).toFixed(1)}kg`
              : wellbeing?.currentWeight
                ? `${wellbeing.currentWeight}kg`
                : "—"}
          </p>
          <p className="text-[10px] text-gray-500">peso 7d</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center border border-gray-100">
          <p className="text-base font-bold" style={{ color: "#639922" }}>
            {wellbeing?.avgHabitsPercent ?? 0}%
          </p>
          <p className="text-[10px] text-gray-500">hábitos 7d</p>
        </div>
      </div>

      {/* ─── Ribbon conquistas ─── */}
      {recentBadges.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
              Conquistas recentes
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentBadges.map((b) => (
              <div
                key={b.id}
                className="flex min-w-[70px] flex-col items-center gap-1 rounded-xl bg-white p-2"
                style={{ boxShadow: "0 2px 8px rgba(99,153,34,0.1)" }}
              >
                <span className="text-xl">{b.icon}</span>
                <span className="text-[9px] font-bold text-center leading-tight text-gray-700">
                  {b.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Recap ontem (1 linha) ─── */}
      {yesterday && (
        <p className="mb-4 text-center text-xs text-gray-500">
          Ontem você cuidou de {Math.round(yesterday.habitsPercent / 20)}/5 ✓ ·{" "}
          {yesterday.waterCount} copos
          {yesterday.exerciseDone && " · 🚶"}
        </p>
      )}

      {/* ─── Banner notificações (só se ainda não ativou) ─── */}
      {hasPushSubscription === false && (
        <Link
          href="/app/notificacoes"
          className="mb-3 flex items-center gap-3 rounded-2xl p-4"
          style={{
            background: "linear-gradient(135deg, #FFF8EE 0%, #FFE8C6 100%)",
            border: "1px solid #f5e6cc",
          }}
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-xl">
            🔔
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "#8B5A0F" }}>
              Ativar lembretes
            </p>
            <p className="text-[11px]" style={{ color: "#BA7517" }}>
              Te lembro de beber água, registrar humor, fechar o dia.
            </p>
          </div>
          <span style={{ color: "#BA7517" }}>→</span>
        </Link>
      )}

      {/* ─── Botão Instalar como app (esconde se já instalou) ─── */}
      <div className="mb-3">
        <InstallPwaButton variant="secondary" hideWhenInstalled={true} label="Instalar app no celular" />
      </div>

      {/* ─── CTA discreto: ver evolução completa ─── */}
      <button
        onClick={() => router.push("/app/evolucao")}
        className="mb-4 w-full rounded-2xl border border-dashed border-gray-200 p-3 text-center text-xs text-gray-500"
      >
        ↓ Ver minha evolução completa ↓
      </button>

      <AppNav />
    </div>
  );
}
