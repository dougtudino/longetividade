"use client";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/app/app-nav";

const HABITS = [
  { id: "agua", label: "Bebi pelo menos 6 copos de agua" },
  { id: "refeicoes", label: "Fiz 3 refeicoes (nao pulei nenhuma)" },
  { id: "fruta", label: "Comi pelo menos 1 fruta" },
  { id: "salada", label: "Comi salada ou legume no almoco" },
  { id: "movimento", label: "Me movimentei por pelo menos 15 min" },
  { id: "mastigar", label: "Mastiguei devagar em pelo menos 1 refeicao" },
  { id: "fome_real", label: "Identifiquei se minha fome era real ou emocional" },
  { id: "troca", label: "Troquei 1 alimento por uma opcao melhor" },
  { id: "sono", label: "Dormi pelo menos 7 horas" },
  { id: "vitoria", label: "Celebrei pelo menos 1 vitoria do dia" },
];

export default function HabitosPage() {
  const [habits, setHabits] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetch("/api/app/checkin")
      .then((r) => r.json())
      .then((d) => {
        if (d.checkin?.habits && typeof d.checkin.habits === "object") {
          setHabits(d.checkin.habits as Record<string, boolean>);
        }
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

    // Verificar se completou todos
    const done = HABITS.every((h) => updated[h.id]);
    if (done) setShowCelebration(true);
  }

  const completed = HABITS.filter((h) => habits[h.id]).length;

  return (
    <div className="px-5 pb-24 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Habitos do dia</h1>
        <span className="text-sm font-bold" style={{ color: "#639922" }}>
          {completed}/{HABITS.length}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="mb-6 h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${(completed / HABITS.length) * 100}%`,
            backgroundColor: "#639922",
          }}
        />
      </div>

      {/* Celebracao */}
      {showCelebration && (
        <div className="mb-6 rounded-2xl p-5 text-center" style={{ backgroundColor: "#EAF3DE" }}>
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-base font-bold" style={{ color: "#3B6D11" }}>
            Parabens! Todos os habitos completos!
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Voce esta construindo algo incrivel.
          </p>
        </div>
      )}

      {/* Lista de habitos */}
      <div className="space-y-2">
        {HABITS.map((habit) => (
          <button
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            className="flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors"
            style={{
              borderColor: habits[habit.id] ? "#639922" : "#e5e7eb",
              backgroundColor: habits[habit.id] ? "#f7faf2" : "white",
            }}
          >
            <div
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-xs text-white transition-colors"
              style={{ backgroundColor: habits[habit.id] ? "#639922" : "#d1d5db" }}
            >
              {habits[habit.id] ? "✓" : ""}
            </div>
            <span
              className="text-sm font-medium"
              style={{
                color: habits[habit.id] ? "#3B6D11" : "#374151",
                textDecoration: habits[habit.id] ? "line-through" : "none",
              }}
            >
              {habit.label}
            </span>
          </button>
        ))}
      </div>

      {saving && (
        <p className="mt-4 text-center text-xs text-gray-400">Salvando...</p>
      )}

      <AppNav />
    </div>
  );
}
