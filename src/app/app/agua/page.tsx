"use client";
import { useEffect, useState, useCallback } from "react";
import { AppNav } from "@/components/app/app-nav";
import { CelebrationOverlay } from "@/components/app/celebration-overlay";

function WaterBottle({ cups, goal }: { cups: number; goal: number }) {
  const fillPercent = Math.min((cups / goal) * 100, 100);
  const fillHeight = 140 * (fillPercent / 100);
  const fillY = 180 - fillHeight;
  const reached = cups >= goal;

  return (
    <svg width="120" height="220" viewBox="0 0 120 220">
      {/* Bottle outline */}
      <defs>
        <clipPath id="bottleClip">
          <path d="M40 10 L40 40 L25 70 L25 195 Q25 210 40 210 L80 210 Q95 210 95 195 L95 70 L80 40 L80 10 Z" />
        </clipPath>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={reached ? "#2B9DF0" : "#378ADD"} />
          <stop offset="100%" stopColor={reached ? "#1A6BB5" : "#2670B5"} />
        </linearGradient>
      </defs>

      {/* Fill water */}
      <rect
        x="20"
        y={fillY}
        width="80"
        height={fillHeight + 30}
        fill="url(#waterGrad)"
        clipPath="url(#bottleClip)"
        className="transition-all duration-700 ease-out"
      />

      {/* Water wave effect */}
      {cups > 0 && (
        <path
          d={`M25 ${fillY} Q40 ${fillY - 5} 60 ${fillY} Q80 ${fillY + 5} 95 ${fillY}`}
          fill="url(#waterGrad)"
          clipPath="url(#bottleClip)"
          opacity="0.6"
          className="transition-all duration-700 ease-out"
        />
      )}

      {/* Bottle stroke */}
      <path
        d="M40 10 L40 40 L25 70 L25 195 Q25 210 40 210 L80 210 Q95 210 95 195 L95 70 L80 40 L80 10 Z"
        fill="none"
        stroke="#378ADD"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Cap */}
      <rect x="36" y="4" width="48" height="10" rx="3" fill="#378ADD" />

      {/* Level marks */}
      {Array.from({ length: 4 }).map((_, i) => {
        const markY = 185 - (i + 1) * 30;
        return (
          <line key={i} x1="28" y1={markY} x2="38" y2={markY} stroke="#378ADD" strokeWidth="1" opacity="0.3" />
        );
      })}

      {/* Percentage text */}
      <text x="60" y="130" textAnchor="middle" fill="white" fontWeight="800" fontSize="18" opacity={cups > 0 ? 1 : 0}>
        {Math.round(fillPercent)}%
      </text>
    </svg>
  );
}

export default function AguaPage() {
  const [cups, setCups] = useState(0);
  const [weekData, setWeekData] = useState<number[]>([]);
  const [goal, setGoal] = useState(8);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("8");
  const [showCelebration, setShowCelebration] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    // Fetch goal from profile, fallback to localStorage, fallback to 8
    fetch("/api/app/profile")
      .then((r) => r.json())
      .then((d) => {
        const profileGoal = d.profile?.waterGoal;
        if (profileGoal && profileGoal > 0) {
          setGoal(profileGoal);
          setGoalInput(String(profileGoal));
        } else {
          // Fallback to localStorage
          const savedGoal = localStorage.getItem("water_goal");
          if (savedGoal) {
            setGoal(parseInt(savedGoal));
            setGoalInput(savedGoal);
          }
        }
      })
      .catch(() => {
        const savedGoal = localStorage.getItem("water_goal");
        if (savedGoal) {
          setGoal(parseInt(savedGoal));
          setGoalInput(savedGoal);
        }
      });

    // Fetch today's checkin
    fetch("/api/app/checkin")
      .then((r) => r.json())
      .then((d) => setCups(d.checkin?.waterCount ?? 0));

    // Fetch weekly history
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

  const closeCelebration = useCallback(() => {
    setShowCelebration(false);
  }, []);

  const addCups = useCallback(async (n: number) => {
    const newCups = cups + n;
    setCups(newCups);
    await fetch("/api/app/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cups: n }),
    });
    // Check if goal reached
    if (newCups >= goal && cups < goal) {
      setShowCelebration(true);
    }
  }, [cups, goal]);

  async function saveGoal() {
    const newGoal = Math.max(1, Math.min(20, parseInt(goalInput) || 8));
    setGoal(newGoal);
    setGoalInput(String(newGoal));

    // Save to profile API
    setSavingGoal(true);
    try {
      await fetch("/api/app/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waterGoal: newGoal }),
      });
    } catch {
      // Fallback to localStorage
      localStorage.setItem("water_goal", String(newGoal));
    } finally {
      setSavingGoal(false);
    }

    // Also save to localStorage as backup
    localStorage.setItem("water_goal", String(newGoal));
    setEditingGoal(false);
  }

  const maxWeek = Math.max(...weekData, goal);

  return (
    <div className="px-5 pb-24 pt-6">
      {/* Celebration overlay */}
      <CelebrationOverlay
        show={showCelebration}
        title="Meta atingida!"
        subtitle="Seu corpo agradece cada gota"
        emoji="💧"
        onClose={closeCelebration}
      />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Agua</h1>
        <button
          onClick={() => setEditingGoal(!editingGoal)}
          className="text-xs font-medium px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#EBF5FF", color: "#378ADD" }}
        >
          Meta: {goal} copos
        </button>
      </div>

      {/* Editable goal */}
      {editingGoal && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-gray-100 p-4">
          <span className="text-sm text-gray-600">Meta diaria:</span>
          <input
            type="number"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            min={1}
            max={20}
            className="w-16 rounded-xl border border-gray-200 px-3 py-1.5 text-center text-sm outline-none focus:border-[#378ADD]"
          />
          <span className="text-sm text-gray-400">copos</span>
          <button
            onClick={saveGoal}
            disabled={savingGoal}
            className="ml-auto rounded-xl px-4 py-1.5 text-sm font-bold text-white"
            style={{ backgroundColor: "#378ADD", opacity: savingGoal ? 0.6 : 1 }}
          >
            {savingGoal ? "..." : "OK"}
          </button>
        </div>
      )}

      {/* Water bottle visual */}
      <div className="mb-4 flex flex-col items-center">
        <WaterBottle cups={cups} goal={goal} />
        <p className="mt-2 text-4xl font-black" style={{ color: "#378ADD" }}>
          {cups}
        </p>
        <p className="text-sm text-gray-500">de {goal} copos</p>
      </div>

      {/* Celebration badge (persistent when goal reached) */}
      {cups >= goal && (
        <div
          className="mb-4 rounded-2xl p-4 text-center"
          style={{ backgroundColor: "#EAF3DE" }}
        >
          <p className="text-3xl mb-1">🎉💧🎊</p>
          <p className="text-base font-bold" style={{ color: "#3B6D11" }}>
            Meta atingida! Parabens!
          </p>
          <p className="text-xs mt-1 text-gray-600">
            Seu corpo agradece cada gota
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => addCups(1)}
          className="rounded-2xl px-8 py-4 text-lg font-bold text-white transition-transform active:scale-95"
          style={{ backgroundColor: "#378ADD" }}
        >
          + 1 copo
        </button>
        <button
          onClick={() => addCups(2)}
          className="rounded-2xl border-2 px-6 py-4 text-lg font-bold transition-transform active:scale-95"
          style={{ borderColor: "#378ADD", color: "#378ADD" }}
        >
          + 2 copos
        </button>
      </div>

      {/* Weekly chart */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-4 text-sm font-bold text-gray-700">Ultimos 7 dias</h3>
        <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
          {weekData.map((count, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
            const isToday = i === 6;
            const height = maxWeek > 0 ? (count / maxWeek) * 100 : 0;
            const reachedGoal = count >= goal;

            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className="text-[10px] font-bold"
                  style={{ color: reachedGoal ? "#378ADD" : "#9ca3af" }}
                >
                  {count > 0 ? count : ""}
                </span>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    backgroundColor: reachedGoal ? "#378ADD" : "#bfdbfe",
                    minHeight: count > 0 ? 4 : 0,
                    border: isToday ? "2px solid #378ADD" : "none",
                    borderBottom: "none",
                  }}
                />
                <span
                  className="text-[10px]"
                  style={{
                    color: isToday ? "#378ADD" : "#9ca3af",
                    fontWeight: isToday ? "700" : "400",
                  }}
                >
                  {dayName}
                </span>
              </div>
            );
          })}
        </div>
        {/* Goal line label */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-0.5 flex-1" style={{ backgroundColor: "#378ADD", opacity: 0.3 }} />
          <span className="text-[10px]" style={{ color: "#378ADD" }}>meta: {goal}</span>
          <div className="h-0.5 flex-1" style={{ backgroundColor: "#378ADD", opacity: 0.3 }} />
        </div>
      </div>

      <AppNav />
    </div>
  );
}
