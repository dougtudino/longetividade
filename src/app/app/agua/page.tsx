"use client";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/app/app-nav";

export default function AguaPage() {
  const [cups, setCups] = useState(0);
  const [weekData, setWeekData] = useState<number[]>([]);
  const goal = 8;

  useEffect(() => {
    // Buscar checkin de hoje
    fetch("/api/app/checkin")
      .then((r) => r.json())
      .then((d) => setCups(d.checkin?.waterCount ?? 0));

    // Buscar historico semanal
    const days: Promise<number>[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push(
        fetch(`/api/app/checkin?date=${dateStr}`)
          .then((r) => r.json())
          .then((data) => data.checkin?.waterCount ?? 0)
      );
    }
    Promise.all(days).then(setWeekData);
  }, []);

  async function addCups(n: number) {
    setCups((prev) => prev + n);
    await fetch("/api/app/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cups: n }),
    });
  }

  const maxWeek = Math.max(...weekData, goal);

  return (
    <div className="px-5 pb-24 pt-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Agua</h1>

      {/* Gotas */}
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        {Array.from({ length: goal }).map((_, i) => (
          <div
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-all"
            style={{
              backgroundColor: i < cups ? "#378ADD" : "#f0f4f8",
            }}
          >
            💧
          </div>
        ))}
      </div>

      {/* Contador */}
      <div className="mb-6 text-center">
        <p className="text-5xl font-black" style={{ color: "#378ADD" }}>
          {cups}
        </p>
        <p className="text-sm text-gray-500">de {goal} copos</p>
        {cups >= goal && (
          <p className="mt-2 text-sm font-bold" style={{ color: "#639922" }}>
            Meta atingida! Parabens!
          </p>
        )}
      </div>

      {/* Botoes */}
      <div className="mb-8 flex justify-center gap-4">
        <button
          onClick={() => addCups(1)}
          className="rounded-2xl px-8 py-4 text-lg font-bold text-white"
          style={{ backgroundColor: "#378ADD" }}
        >
          + 1 copo
        </button>
        <button
          onClick={() => addCups(2)}
          className="rounded-2xl border-2 px-6 py-4 text-lg font-bold"
          style={{ borderColor: "#378ADD", color: "#378ADD" }}
        >
          + 2 copos
        </button>
      </div>

      {/* Grafico semanal */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-4 text-sm font-bold text-gray-700">Ultimos 7 dias</h3>
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {weekData.map((count, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
            const height = maxWeek > 0 ? (count / maxWeek) * 100 : 0;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium" style={{ color: "#378ADD" }}>
                  {count > 0 ? count : ""}
                </span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor: count >= goal ? "#378ADD" : "#bfdbfe",
                    minHeight: count > 0 ? 4 : 0,
                  }}
                />
                <span className="text-[10px] text-gray-400">{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      <AppNav />
    </div>
  );
}
