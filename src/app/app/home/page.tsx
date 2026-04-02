"use client";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/app/app-nav";

type Profile = {
  name: string;
  createdAt: string;
};

type Checkin = {
  waterCount: number;
  habits: Record<string, boolean>;
  exerciseDone: boolean;
};

export default function AppHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quote, setQuote] = useState("");
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [streak, setStreak] = useState<boolean[]>([]);

  useEffect(() => {
    fetch("/api/app/profile").then((r) => r.json()).then((d) => setProfile(d.profile));
    fetch("/api/app/quote").then((r) => r.json()).then((d) => setQuote(d.quote));
    fetch("/api/app/checkin").then((r) => r.json()).then((d) => setCheckin(d.checkin));

    // Buscar streak dos ultimos 7 dias
    const days: Promise<boolean>[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      days.push(
        fetch(`/api/app/checkin?date=${dateStr}`)
          .then((r) => r.json())
          .then((data) => !!data.checkin)
      );
    }
    Promise.all(days).then(setStreak);
  }, []);

  const habitsCount = checkin?.habits ? Object.values(checkin.habits).filter(Boolean).length : 0;
  const waterCount = checkin?.waterCount ?? 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="px-5 pb-24 pt-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {profile?.name ?? ""}
        </h1>
        <p className="text-sm text-gray-400 capitalize">{today}</p>
      </div>

      {/* Frase do dia */}
      {quote && (
        <div className="mb-6 rounded-2xl p-5" style={{ backgroundColor: "#EAF3DE" }}>
          <p className="text-sm font-medium italic" style={{ color: "#3B6D11" }}>
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      )}

      {/* Cards de progresso */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: "#378ADD" }}>
            {waterCount}
          </p>
          <p className="text-xs text-gray-500">/ 8 copos</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((waterCount / 8) * 100, 100)}%`,
                backgroundColor: "#378ADD",
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: "#639922" }}>
            {habitsCount}
          </p>
          <p className="text-xs text-gray-500">/ 10 habitos</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(habitsCount / 10) * 100}%`,
                backgroundColor: "#639922",
              }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: checkin?.exerciseDone ? "#639922" : "#d1d5db" }}>
            {checkin?.exerciseDone ? "Sim" : "Nao"}
          </p>
          <p className="text-xs text-gray-500">Movimento</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: checkin?.exerciseDone ? "100%" : "0%",
                backgroundColor: "#639922",
              }}
            />
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Ultimos 7 dias</h3>
        <div className="flex justify-between">
          {streak.map((done, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: done ? "#639922" : "#f3f4f6",
                    color: done ? "white" : "#9ca3af",
                  }}
                >
                  {done ? "✓" : "·"}
                </div>
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
