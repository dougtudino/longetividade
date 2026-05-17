"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/app/app-nav";
import { BrotoAvatar, useBrotoState } from "@/components/app/broto-avatar";

// /app/evolucao — view consolidada de histórico (progresso + conquistas + ciclos).
// Substitui /app/progresso e /app/conquistas como destino primário.
// Por enquanto eh uma página simples que mostra resumo + links pras telas
// detalhadas existentes. Pode ser expandida com gráficos inline depois.

type Summary = {
  totalWeightLogs: number;
  currentWeight: number | null;
  weightDelta: number | null;
  avgHabitsPercent: number;
  checkinDays: number;
  exerciseDays: number;
};
type Cycle = {
  cycleNumber: number;
  status: string;
  difficulty: string;
  daysCompleted: number;
  percent: number;
};
type Stats = {
  totalCycles: number;
  completedCycles: number;
  totalDaysCompleted: number;
  highestCycleNumber: number;
};
type LevelInfo = { level: number; levelName: string; xp: number; nextLevelXp: number };
type Achievement = { id: string; name: string; icon: string; earnedAt: string };
type WeightLog = { weight: number; loggedAt: string; note?: string | null };

export default function EvolucaoPage() {
  const [wellbeing, setWellbeing] = useState<Summary | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleStats, setCycleStats] = useState<Stats | null>(null);
  const [level, setLevel] = useState<LevelInfo | null>(null);
  const [earned, setEarned] = useState<Achievement[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [weightNote, setWeightNote] = useState("");
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightSaved, setWeightSaved] = useState(false);
  const brotoState = useBrotoState(cycleStats?.totalDaysCompleted);

  const fetchAll = useCallback(() => {
    fetch("/api/app/wellbeing-week").then((r) => r.json()).then(setWellbeing);
    fetch("/api/app/cycles").then((r) => r.json()).then((d) => {
      setCycles(d.cycles ?? []);
      setCycleStats(d.stats ?? null);
    });
    fetch("/api/app/achievements").then((r) => r.json()).then((d) => {
      setLevel(d.level ?? null);
      setEarned(d.earned ?? []);
    });
    fetch("/api/app/weight").then((r) => r.json()).then((d) => {
      // GET sem ?date retorna histórico completo ordenado ASC
      const logs = (d.logs ?? []).slice().reverse(); // mais recente primeiro
      setWeightLogs(logs.slice(0, 10)); // ultimas 10
    });
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function saveWeight() {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    setWeightSaving(true);
    try {
      const r = await fetch("/api/app/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: w, note: weightNote || null }),
      });
      if (r.ok) {
        setWeightInput("");
        setWeightNote("");
        setWeightSaved(true);
        setTimeout(() => setWeightSaved(false), 2000);
        fetchAll();
      }
    } finally {
      setWeightSaving(false);
    }
  }

  // Empty state: nunca teve ciclo, nenhuma conquista, nenhum peso registrado
  const isEmpty =
    (!cycleStats || cycleStats.totalCycles === 0) &&
    earned.length === 0 &&
    weightLogs.length === 0;

  return (
    <div className="px-5 pb-24 pt-6" style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Sua evolução</h1>
      <p className="mb-5 text-sm text-gray-500">Onde você chegou, ciclo por ciclo, semana por semana.</p>

      {/* ─── Empty state com Broto ─── */}
      {isEmpty && (
        <div
          className="mb-5 rounded-2xl p-6 text-center flex flex-col items-center"
          style={{ background: "white", border: "1px solid #f3f4f6" }}
        >
          <BrotoAvatar state={brotoState} size={140} />
          <p className="mt-3 text-base font-bold" style={{ color: "#3B6D11" }}>
            Sua jornada está começando.
          </p>
          <p className="mt-1 text-xs text-gray-500 max-w-xs">
            Cada cuidado seu vai aparecer aqui. Seu Broto vai crescer junto.
          </p>
          <Link
            href="/app/desafio"
            className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ backgroundColor: "#639922" }}
          >
            Começar primeira jornada →
          </Link>
        </div>
      )}

      {/* ─── Nível atual ─── */}
      {level && (
        <div
          className="mb-5 rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, #1A2E1B 0%, #2D4A2E 50%, #3D5A3E 100%)", color: "white" }}
        >
          <p className="text-[10px] uppercase tracking-wider opacity-70 font-bold">Nível atual</p>
          <p className="text-2xl font-black mt-1">Nv {level.level} · {level.levelName}</p>
          <p className="text-xs mt-1 opacity-80">{level.xp} XP totais</p>
          {level.nextLevelXp > level.xp && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((level.xp / level.nextLevelXp) * 100)}%`,
                    background: "linear-gradient(90deg, #FDE047, #FACC15)",
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] opacity-70">Faltam {level.nextLevelXp - level.xp} XP pro próximo nível</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Peso (input + ultimas pesagens) ─── */}
      <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Peso</p>
          {wellbeing?.currentWeight != null && (
            <p className="text-xs text-gray-500">
              atual: <strong style={{ color: "#1f2937" }}>{wellbeing.currentWeight}kg</strong>
              {wellbeing.weightDelta != null && wellbeing.weightDelta !== 0 && (
                <span style={{ color: wellbeing.weightDelta < 0 ? "#639922" : "#C4787A", marginLeft: 6 }}>
                  ({wellbeing.weightDelta < 0 ? "−" : "+"}{Math.abs(wellbeing.weightDelta).toFixed(1)}kg / 7d)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Input registrar */}
        <div className="mb-3 flex gap-2">
          <input
            type="number"
            step="0.1"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="Ex: 72.5"
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922]"
          />
          <button
            onClick={saveWeight}
            disabled={!weightInput || weightSaving}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: "#639922" }}
          >
            {weightSaved ? "Salvo ✓" : weightSaving ? "..." : "Registrar"}
          </button>
        </div>
        <input
          type="text"
          value={weightNote}
          onChange={(e) => setWeightNote(e.target.value)}
          placeholder="Nota (opcional, ex: jejum / após treino)"
          className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#639922]"
        />

        {/* Ultimas pesagens */}
        {weightLogs.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-400">
              Últimas pesagens
            </p>
            <div className="flex flex-col gap-1">
              {weightLogs.slice(0, 5).map((w, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <span className="font-bold text-gray-800">{w.weight} kg</span>
                  <span className="text-gray-400">
                    {new Date(w.loggedAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/app/progresso"
              className="mt-2 block text-center text-xs font-bold"
              style={{ color: "#639922" }}
            >
              Ver gráfico completo →
            </Link>
          </div>
        )}
      </div>

      {/* ─── Esta semana ─── */}
      {wellbeing && (
        <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Esta semana</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold" style={{ color: wellbeing.weightDelta && wellbeing.weightDelta < 0 ? "#639922" : "#374151" }}>
                {wellbeing.weightDelta != null
                  ? `${wellbeing.weightDelta < 0 ? "−" : "+"}${Math.abs(wellbeing.weightDelta).toFixed(1)}kg`
                  : wellbeing.currentWeight
                    ? `${wellbeing.currentWeight}`
                    : "—"}
              </p>
              <p className="text-[10px] text-gray-500">peso</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: "#639922" }}>{wellbeing.avgHabitsPercent}%</p>
              <p className="text-[10px] text-gray-500">hábitos</p>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: "#378ADD" }}>{wellbeing.checkinDays}d</p>
              <p className="text-[10px] text-gray-500">check-ins</p>
            </div>
          </div>
          <Link href="/app/progresso" className="mt-3 block text-center text-xs font-bold" style={{ color: "#639922" }}>
            Ver gráficos detalhados →
          </Link>
        </div>
      )}

      {/* ─── Ciclos ─── */}
      {cycleStats && cycleStats.totalCycles > 0 && (
        <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Ciclos · {cycleStats.completedCycles} completos
            </p>
            <Link href="/app/desafio" className="text-xs font-bold" style={{ color: "#639922" }}>
              Ver ciclo atual →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {cycles.slice(0, 5).map((c) => {
              const color =
                c.status === "completed" ? "#639922"
                : c.status === "paused" ? "#BA7517"
                : c.status === "abandoned" ? "#9ca3af"
                : "#378ADD";
              return (
                <div key={c.cycleNumber}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-gray-700">
                      Ciclo {c.cycleNumber} · {c.difficulty === "easy" ? "Suave" : c.difficulty === "hard" ? "Intenso" : "Constante"}
                    </span>
                    <span className="text-gray-400">{c.daysCompleted}/21 · {c.status}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full transition-all" style={{ width: `${c.percent}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Conquistas ─── */}
      {earned.length > 0 && (
        <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Conquistas · {earned.length}
            </p>
            <Link href="/app/conquistas" className="text-xs font-bold" style={{ color: "#639922" }}>
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {earned.slice(0, 10).map((a) => (
              <div key={a.id} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[8px] font-bold text-center leading-tight text-gray-700">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AppNav />
    </div>
  );
}
