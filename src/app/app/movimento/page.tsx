"use client";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/app/app-nav";

const EXERCISE_TYPES = [
  { value: "caminhada", label: "Caminhada", icon: "🚶" },
  { value: "alongamento", label: "Alongamento", icon: "🧘" },
  { value: "danca", label: "Danca", icon: "💃" },
  { value: "escada", label: "Subir escada", icon: "🪜" },
  { value: "outro", label: "Outro", icon: "🏃" },
];

export default function MovimentoPage() {
  const [exerciseType, setExerciseType] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [done, setDone] = useState(false);
  const [todayMin, setTodayMin] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/app/checkin")
      .then((r) => r.json())
      .then((d) => {
        if (d.checkin) {
          setDone(d.checkin.exerciseDone);
          setTodayMin(d.checkin.exerciseMin ?? 0);
        }
      });
  }, []);

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
    setSaving(false);
  }

  return (
    <div className="px-5 pb-24 pt-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Movimento</h1>

      {/* Status do dia */}
      <div
        className="mb-6 rounded-2xl p-5 text-center"
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

      {/* Tipo de exercicio */}
      <h3 className="mb-3 text-sm font-bold text-gray-700">Tipo de movimento</h3>
      <div className="mb-6 flex flex-wrap gap-2">
        {EXERCISE_TYPES.map((ex) => (
          <button
            key={ex.value}
            onClick={() => setExerciseType(ex.value)}
            className="flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              borderColor: exerciseType === ex.value ? "#639922" : "#e5e7eb",
              backgroundColor: exerciseType === ex.value ? "#EAF3DE" : "white",
              color: exerciseType === ex.value ? "#3B6D11" : "#6b7280",
            }}
          >
            <span>{ex.icon}</span>
            {ex.label}
          </button>
        ))}
      </div>

      {/* Minutos */}
      <h3 className="mb-3 text-sm font-bold text-gray-700">Quantos minutos?</h3>
      <div className="mb-6 flex items-center justify-center gap-6">
        <button
          onClick={() => setMinutes(Math.max(5, minutes - 5))}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 text-xl font-bold text-gray-500"
        >
          -
        </button>
        <span className="text-4xl font-black text-gray-900">{minutes}</span>
        <button
          onClick={() => setMinutes(minutes + 5)}
          className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: "#639922" }}
        >
          +
        </button>
      </div>
      <p className="mb-6 text-center text-xs text-gray-400">minutos</p>

      {/* Salvar */}
      <button
        onClick={saveExercise}
        disabled={!exerciseType || saving}
        className="w-full rounded-2xl py-4 text-base font-bold text-white transition-colors disabled:opacity-40"
        style={{ backgroundColor: "#639922" }}
      >
        {saving ? "Salvando..." : "Registrar movimento"}
      </button>

      <AppNav />
    </div>
  );
}
