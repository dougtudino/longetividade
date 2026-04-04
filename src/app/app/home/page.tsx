"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

function ProgressRing({ percent, size = 80, strokeWidth = 7, color = "#639922" }: {
  percent: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export default function AppHome() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quote, setQuote] = useState("");
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [streak7, setStreak7] = useState<boolean[]>([]);
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    fetch("/api/app/profile").then((r) => r.json()).then((d) => setProfile(d.profile));
    fetch("/api/app/quote").then((r) => r.json()).then((d) => setQuote(d.quote));
    fetch("/api/app/checkin").then((r) => r.json()).then((d) => setCheckin(d.checkin));

    // Fetch last 7 days streak + calculate consecutive streak
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
    Promise.all(days).then((results) => {
      setStreak7(results);
      // Count consecutive days from today backwards
      let count = 0;
      for (let i = results.length - 1; i >= 0; i--) {
        if (results[i]) count++;
        else break;
      }
      setStreakCount(count);
    });
  }, []);

  const habitsTotal = 10;
  const habitsCount = checkin?.habits ? Object.values(checkin.habits).filter(Boolean).length : 0;
  const waterCount = checkin?.waterCount ?? 0;
  const habitsPercent = Math.round((habitsCount / habitsTotal) * 100);

  // Days in the method
  const daysInMethod = profile?.createdAt
    ? Math.max(1, Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const firstName = profile?.name ? profile.name.split(" ")[0] : "";

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="px-5 pb-24 pt-6">
      {/* Header greeting */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-400 capitalize">{today}</p>
        {daysInMethod > 0 && (
          <p className="text-xs mt-1" style={{ color: "#639922" }}>
            Dia {daysInMethod} no Metodo S.E.M
          </p>
        )}
      </div>

      {/* Streak badge + Progress ring */}
      <div className="mb-5 flex items-center gap-5">
        {/* Streak count */}
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 border border-gray-100">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-xl font-black" style={{ color: "#BA7517" }}>{streakCount}</p>
            <p className="text-[10px] text-gray-400">dias seguidos</p>
          </div>
        </div>

        {/* Progress ring - today's habits */}
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="relative">
            <ProgressRing percent={habitsPercent} size={72} strokeWidth={6} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold" style={{ color: "#639922" }}>{habitsPercent}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Hoje</p>
            <p className="text-xs text-gray-400">{habitsCount}/{habitsTotal} habitos</p>
          </div>
        </div>
      </div>

      {/* Quote */}
      {quote && (
        <div className="mb-5 rounded-2xl p-4" style={{ backgroundColor: "#EAF3DE" }}>
          <p className="text-sm font-medium italic" style={{ color: "#3B6D11" }}>
            &ldquo;{quote}&rdquo;
          </p>
        </div>
      )}

      {/* Quick action buttons */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <button
          onClick={() => router.push("/app/agua")}
          className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-transform active:scale-95"
          style={{ backgroundColor: "#EBF5FF", border: "1px solid #d4e8fc" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span className="text-xs font-bold" style={{ color: "#378ADD" }}>+ Agua</span>
        </button>

        <button
          onClick={() => router.push("/app/habitos")}
          className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-transform active:scale-95"
          style={{ backgroundColor: "#EAF3DE", border: "1px solid #d4e8c4" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span className="text-xs font-bold" style={{ color: "#639922" }}>Habitos</span>
        </button>

        <button
          onClick={() => router.push("/app/progresso")}
          className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-transform active:scale-95"
          style={{ backgroundColor: "#FFF8EE", border: "1px solid #f5e6cc" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span className="text-xs font-bold" style={{ color: "#BA7517" }}>Peso</span>
        </button>
      </div>

      {/* Progress cards */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold" style={{ color: "#378ADD" }}>
            {waterCount}
          </p>
          <p className="text-xs text-gray-500">/ 8 copos</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-500"
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
              className="h-full rounded-full transition-all duration-500"
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
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: checkin?.exerciseDone ? "100%" : "0%",
                backgroundColor: "#639922",
              }}
            />
          </div>
        </div>
      </div>

      {/* 7-day streak visual */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Ultimos 7 dias</h3>
        <div className="flex justify-between">
          {streak7.map((done, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    backgroundColor: done ? "#639922" : "#f3f4f6",
                    color: done ? "white" : "#9ca3af",
                    boxShadow: done ? "0 2px 8px rgba(99,153,34,0.3)" : "none",
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
