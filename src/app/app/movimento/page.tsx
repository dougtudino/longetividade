"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { AppNav } from "@/components/app/app-nav";

const EXERCISE_CATEGORIES = [
  {
    category: "Cardio",
    color: "#ef4444",
    exercises: [
      { value: "caminhada", label: "Caminhada" },
      { value: "corrida", label: "Corrida leve" },
      { value: "danca", label: "Danca" },
      { value: "bicicleta", label: "Bicicleta" },
    ],
  },
  {
    category: "Flexibilidade",
    color: "#378ADD",
    exercises: [
      { value: "alongamento", label: "Alongamento" },
      { value: "yoga", label: "Yoga" },
      { value: "pilates", label: "Pilates" },
    ],
  },
  {
    category: "Forca",
    color: "#BA7517",
    exercises: [
      { value: "escada", label: "Subir escada" },
      { value: "musculacao", label: "Musculacao" },
      { value: "funcional", label: "Funcional" },
    ],
  },
  {
    category: "Outros",
    color: "#639922",
    exercises: [
      { value: "faxina", label: "Faxina ativa" },
      { value: "outro", label: "Outro" },
    ],
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Cardio: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Flexibilidade: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  Forca: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  ),
  Outros: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MovimentoPage() {
  const [exerciseType, setExerciseType] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [done, setDone] = useState(false);
  const [todayMin, setTodayMin] = useState(0);
  const [saving, setSaving] = useState(false);
  const [weeklyMin, setWeeklyMin] = useState<number[]>([]);

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/app/checkin")
      .then((r) => r.json())
      .then((d) => {
        if (d.checkin) {
          setDone(d.checkin.exerciseDone);
          setTodayMin(d.checkin.exerciseMin ?? 0);
        }
      });

    // Weekly movement summary
    const days: Promise<number>[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push(
        fetch(`/api/app/checkin?date=${dateStr}`)
          .then((r) => r.json())
          .then((data) => data.checkin?.exerciseMin ?? 0)
      );
    }
    Promise.all(days).then(setWeeklyMin);
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const toggleTimer = useCallback(() => {
    if (timerActive) {
      // Stop timer, set minutes from timer
      setTimerActive(false);
      const timerMin = Math.max(1, Math.round(timerSeconds / 60));
      setMinutes(timerMin);
    } else {
      setTimerSeconds(0);
      setTimerActive(true);
    }
  }, [timerActive, timerSeconds]);

  async function saveExercise() {
    setSaving(true);
    const newMin = todayMin + minutes;
    await fetch("/api/app/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseDone: true,
        exerciseMin: newMin,
      }),
    });
    setDone(true);
    setTodayMin(newMin);
    setTimerActive(false);
    setTimerSeconds(0);
    setSaving(false);
  }

  const totalWeeklyMin = weeklyMin.reduce((a, b) => a + b, 0);
  const weeklyGoalMin = 150; // WHO recommendation

  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Movimento</h1>

      {/* Today status */}
      <div
        className="mb-5 rounded-2xl p-5 text-center"
        style={{ backgroundColor: done ? "#EAF3DE" : "#f3f4f6" }}
      >
        <p className="text-4xl mb-2">{done ? "🎉" : "🏃"}</p>
        <p className="text-lg font-bold" style={{ color: done ? "#3B6D11" : "#6b7280" }}>
          {done ? `${todayMin} min hoje` : "Nenhum movimento registrado"}
        </p>
        {done && (
          <p className="text-sm mt-1" style={{ color: "#639922" }}>
            Voce ja se movimentou hoje! Pode registrar mais.
          </p>
        )}
      </div>

      {/* Weekly movement summary */}
      <div className="mb-5 rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700">Resumo semanal</h3>
          <span className="text-xs font-bold" style={{ color: totalWeeklyMin >= weeklyGoalMin ? "#639922" : "#BA7517" }}>
            {totalWeeklyMin} / {weeklyGoalMin} min
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 mb-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((totalWeeklyMin / weeklyGoalMin) * 100, 100)}%`,
              backgroundColor: totalWeeklyMin >= weeklyGoalMin ? "#639922" : "#BA7517",
            }}
          />
        </div>
        <div className="flex justify-between gap-1">
          {weeklyMin.map((min, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
            const isToday = i === 6;
            const maxMin = Math.max(...weeklyMin, 30);

            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[9px] font-medium" style={{ color: min > 0 ? "#639922" : "#d1d5db" }}>
                  {min > 0 ? `${min}m` : ""}
                </span>
                <div
                  className="w-full rounded-t transition-all duration-500"
                  style={{
                    height: Math.max(min > 0 ? 4 : 0, (min / maxMin) * 40),
                    backgroundColor: min > 0 ? "#639922" : "#f3f4f6",
                    border: isToday ? "1.5px solid #3B6D11" : "none",
                    borderBottom: "none",
                  }}
                />
                <span
                  className="text-[9px]"
                  style={{ color: isToday ? "#639922" : "#9ca3af", fontWeight: isToday ? "700" : "400" }}
                >
                  {dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exercise categories */}
      <h3 className="mb-3 text-sm font-bold text-gray-700">Tipo de movimento</h3>
      {EXERCISE_CATEGORIES.map((cat) => (
        <div key={cat.category} className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: cat.color }}>{CATEGORY_ICONS[cat.category]}</span>
            <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.category}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-1">
            {cat.exercises.map((ex) => (
              <button
                key={ex.value}
                onClick={() => setExerciseType(ex.value)}
                className="rounded-xl border-2 px-3 py-2 text-xs font-medium transition-all active:scale-95"
                style={{
                  borderColor: exerciseType === ex.value ? cat.color : "#e5e7eb",
                  backgroundColor: exerciseType === ex.value ? `${cat.color}15` : "white",
                  color: exerciseType === ex.value ? cat.color : "#6b7280",
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Timer / Manual minutes */}
      <div className="mb-5 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700">Duracao</h3>
          <button
            onClick={toggleTimer}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95"
            style={{
              backgroundColor: timerActive ? "#FEF2F2" : "#EBF5FF",
              color: timerActive ? "#ef4444" : "#378ADD",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {timerActive ? "Parar" : "Cronometro"}
          </button>
        </div>

        {timerActive ? (
          <div className="text-center py-4">
            <p className="text-5xl font-black tabular-nums" style={{ color: "#639922" }}>
              {formatTime(timerSeconds)}
            </p>
            <p className="text-xs text-gray-400 mt-2">Cronometro rodando...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setMinutes(Math.max(5, minutes - 5))}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 text-xl font-bold text-gray-500 transition-transform active:scale-90"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-4xl font-black text-gray-900">{minutes}</span>
              <p className="text-xs text-gray-400">minutos</p>
            </div>
            <button
              onClick={() => setMinutes(minutes + 5)}
              className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white transition-transform active:scale-90"
              style={{ backgroundColor: "#639922" }}
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Save */}
      <button
        onClick={saveExercise}
        disabled={!exerciseType || saving}
        className="w-full rounded-2xl py-4 text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40"
        style={{ backgroundColor: "#639922" }}
      >
        {saving ? "Salvando..." : "Registrar movimento"}
      </button>

      <AppNav />
    </div>
  );
}
