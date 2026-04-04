"use client";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/app/app-nav";

// Habits grouped by S.E.M pillars
const PILLARS = [
  {
    name: "S — Saude Nutricional",
    color: "#639922",
    bgColor: "#EAF3DE",
    habits: [
      { id: "agua", label: "Bebi pelo menos 6 copos de agua" },
      { id: "refeicoes", label: "Fiz 3 refeicoes (nao pulei nenhuma)" },
      { id: "fruta", label: "Comi pelo menos 1 fruta" },
      { id: "salada", label: "Comi salada ou legume no almoco" },
      { id: "mastigar", label: "Mastiguei devagar em pelo menos 1 refeicao" },
    ],
  },
  {
    name: "E — Equilibrio Emocional",
    color: "#BA7517",
    bgColor: "#FFF8EE",
    habits: [
      { id: "fome_real", label: "Identifiquei se minha fome era real ou emocional" },
      { id: "troca", label: "Troquei 1 alimento por uma opcao melhor" },
      { id: "vitoria", label: "Celebrei pelo menos 1 vitoria do dia" },
    ],
  },
  {
    name: "M — Movimento & Descanso",
    color: "#378ADD",
    bgColor: "#EBF5FF",
    habits: [
      { id: "movimento", label: "Me movimentei por pelo menos 15 min" },
      { id: "sono", label: "Dormi pelo menos 7 horas" },
    ],
  },
];

const ALL_HABITS = PILLARS.flatMap((p) => p.habits);

export default function HabitosPage() {
  const [habits, setHabits] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [weekHeatmap, setWeekHeatmap] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    fetch("/api/app/checkin")
      .then((r) => r.json())
      .then((d) => {
        if (d.checkin?.habits && typeof d.checkin.habits === "object") {
          setHabits(d.checkin.habits as Record<string, boolean>);
        }
      });

    // Fetch week heatmap and streak
    const days: Promise<number>[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push(
        fetch(`/api/app/checkin?date=${dateStr}`)
          .then((r) => r.json())
          .then((data) => {
            if (!data.checkin?.habits) return 0;
            const h = data.checkin.habits as Record<string, boolean>;
            return Object.values(h).filter(Boolean).length;
          })
      );
    }
    Promise.all(days).then((results) => {
      setWeekHeatmap(results);
      // Calculate streak: consecutive days with all habits done
      let count = 0;
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i] >= ALL_HABITS.length) count++;
        else break;
      }
      setStreakCount(count);
    });
  }, []);

  async function toggleHabit(id: string) {
    const updated = { ...habits, [id]: !habits[id] };
    setHabits(updated);
    setSaving(true);

    await fetch("/api/app/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habits: updated }),
    });
    setSaving(false);

    // Check if all completed
    const done = ALL_HABITS.every((h) => updated[h.id]);
    if (done) setShowCelebration(true);
  }

  const completed = ALL_HABITS.filter((h) => habits[h.id]).length;
  const totalHabits = ALL_HABITS.length;

  return (
    <div className="px-5 pb-24 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Habitos do dia</h1>
        <span className="text-sm font-bold" style={{ color: "#639922" }}>
          {completed}/{totalHabits}
        </span>
      </div>

      {/* Streak + progress bar */}
      <div className="mb-4 flex items-center gap-3">
        {streakCount > 0 && (
          <div className="flex items-center gap-1 rounded-full px-3 py-1" style={{ backgroundColor: "#FFF8EE" }}>
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold" style={{ color: "#BA7517" }}>{streakCount} dias</span>
          </div>
        )}
        <div className="flex-1 h-2.5 rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(completed / totalHabits) * 100}%`,
              backgroundColor: completed === totalHabits ? "#BA7517" : "#639922",
            }}
          />
        </div>
      </div>

      {/* Weekly mini-heatmap */}
      <div className="mb-5 flex justify-between items-center px-2">
        {weekHeatmap.map((count, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 1).toUpperCase();
          const isToday = i === 6;
          const intensity = count / totalHabits;
          let bgColor = "#f3f4f6";
          if (intensity > 0 && intensity < 0.5) bgColor = "#d4e8c4";
          if (intensity >= 0.5 && intensity < 1) bgColor = "#a3c77a";
          if (intensity >= 1) bgColor = "#639922";

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all"
                style={{
                  backgroundColor: bgColor,
                  color: intensity >= 0.5 ? "white" : "#9ca3af",
                  border: isToday ? "2px solid #3B6D11" : "none",
                }}
              >
                {count > 0 ? count : ""}
              </div>
              <span className="text-[9px] text-gray-400">{dayName}</span>
            </div>
          );
        })}
      </div>

      {/* Celebration */}
      {showCelebration && (
        <div
          className="mb-5 rounded-2xl p-5 text-center"
          style={{
            backgroundColor: "#EAF3DE",
            animation: "celebrateIn 0.6s ease-out",
          }}
        >
          <div className="text-4xl mb-2" style={{ animation: "bounce 0.5s ease-in-out 3" }}>
            🎉🌟🎊
          </div>
          <p className="text-lg font-bold" style={{ color: "#3B6D11" }}>
            Parabens! Todos os habitos completos!
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Voce esta construindo algo incrivel. Dia perfeito!
          </p>
          {streakCount > 0 && (
            <p className="text-xs mt-2 font-bold" style={{ color: "#BA7517" }}>
              🔥 {streakCount + 1} dias seguidos com tudo completo!
            </p>
          )}
        </div>
      )}

      {/* Habits grouped by S.E.M pillar */}
      {PILLARS.map((pillar) => {
        const pillarCompleted = pillar.habits.filter((h) => habits[h.id]).length;
        const allDone = pillarCompleted === pillar.habits.length;

        return (
          <div key={pillar.name} className="mb-4">
            <div
              className="flex items-center justify-between rounded-t-xl px-4 py-2"
              style={{ backgroundColor: pillar.bgColor }}
            >
              <span className="text-xs font-bold" style={{ color: pillar.color }}>
                {pillar.name}
              </span>
              <span className="text-xs" style={{ color: pillar.color }}>
                {allDone ? "✓ Completo" : `${pillarCompleted}/${pillar.habits.length}`}
              </span>
            </div>
            <div className="space-y-1.5 pt-1.5">
              {pillar.habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all active:scale-[0.98]"
                  style={{
                    borderColor: habits[habit.id] ? pillar.color : "#e5e7eb",
                    backgroundColor: habits[habit.id] ? `${pillar.bgColor}` : "white",
                  }}
                >
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-xs text-white transition-all"
                    style={{
                      backgroundColor: habits[habit.id] ? pillar.color : "#d1d5db",
                      transform: habits[habit.id] ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {habits[habit.id] ? "✓" : ""}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: habits[habit.id] ? pillar.color : "#374151",
                      textDecoration: habits[habit.id] ? "line-through" : "none",
                    }}
                  >
                    {habit.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {saving && (
        <p className="mt-2 text-center text-xs text-gray-400">Salvando...</p>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes celebrateIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <AppNav />
    </div>
  );
}
