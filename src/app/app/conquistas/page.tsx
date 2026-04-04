"use client";
import { useEffect, useState, useCallback } from "react";
import { AppNav } from "@/components/app/app-nav";
import type { AchievementDef } from "@/data/achievements";

type EarnedBadge = {
  id: string;
  name: string;
  icon: string;
  category: string;
  earnedAt: string;
};

type LevelInfo = {
  xp: number;
  level: number;
  levelName: string;
  nextLevelXp: number;
};

const LEVEL_COLORS: Record<number, string> = {
  1: "#9EBF9E",
  2: "#9EBF9E",
  3: "#7A9E7E",
  4: "#7A9E7E",
  5: "#639922",
  6: "#639922",
  7: "#3D5A3E",
  8: "#3D5A3E",
  9: "#1A3A1C",
  10: "#1A3A1C",
};

const CATEGORY_TABS = [
  { key: "todas", label: "Todas" },
  { key: "agua", label: "Agua" },
  { key: "habitos", label: "Habitos" },
  { key: "movimento", label: "Movimento" },
  { key: "peso", label: "Peso" },
  { key: "streak", label: "Streak" },
  { key: "especial", label: "Especial" },
] as const;

export default function ConquistasPage() {
  const [achievements, setAchievements] = useState<AchievementDef[]>([]);
  const [earned, setEarned] = useState<EarnedBadge[]>([]);
  const [level, setLevel] = useState<LevelInfo | null>(null);
  const [activeTab, setActiveTab] = useState("todas");
  const [selectedBadge, setSelectedBadge] = useState<AchievementDef | null>(null);

  useEffect(() => {
    fetch("/api/app/achievements")
      .then((r) => r.json())
      .then((d) => {
        setAchievements(d.achievements ?? []);
        setEarned(d.earned ?? []);
        setLevel(d.level ?? null);
      });
  }, []);

  const earnedIds = new Set(earned.map((e) => e.id));

  const filtered =
    activeTab === "todas"
      ? achievements
      : achievements.filter((a) => a.category === activeTab);

  const earnedCount = earned.length;
  const totalCount = achievements.length;

  const levelColor = LEVEL_COLORS[level?.level ?? 1] ?? "#639922";
  const xpPercent =
    level && level.nextLevelXp > 0
      ? Math.min(Math.round((level.xp / level.nextLevelXp) * 100), 100)
      : 0;
  const xpRemaining = level ? Math.max(0, level.nextLevelXp - level.xp) : 0;

  const getEarnedDate = useCallback(
    (id: string) => {
      const e = earned.find((x) => x.id === id);
      if (!e) return null;
      return new Date(e.earnedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      });
    },
    [earned]
  );

  return (
    <div className="px-5 pb-24 pt-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Suas Conquistas</h1>

      {/* Level card */}
      {level && (
        <div
          className="mb-5 rounded-2xl p-5"
          style={{ backgroundColor: levelColor + "15", border: `1px solid ${levelColor}30` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white"
              style={{ backgroundColor: levelColor }}
            >
              {level.level}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                Nivel {level.level} — {level.levelName}
              </p>
              <p className="text-xs text-gray-500">{level.xp} XP total</p>
            </div>
          </div>
          <div className="h-3 w-full rounded-full bg-white/60">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${xpPercent}%`, backgroundColor: levelColor }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {level.level < 10
              ? `${xpRemaining} XP para o proximo nivel`
              : "Nivel maximo alcancado!"}
          </p>
        </div>
      )}

      {/* Category tabs */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-colors"
            style={{
              backgroundColor: activeTab === tab.key ? "#639922" : "#f3f4f6",
              color: activeTab === tab.key ? "white" : "#6b7280",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {filtered.map((ach) => {
          const isEarned = earnedIds.has(ach.id);
          const dateStr = getEarnedDate(ach.id);

          return (
            <button
              key={ach.id}
              onClick={() => setSelectedBadge(ach)}
              className="flex flex-col items-center gap-1.5 rounded-2xl p-4 text-center transition-transform active:scale-95"
              style={{
                backgroundColor: isEarned ? "#fff" : "#fafafa",
                border: isEarned ? "1px solid #e5e7eb" : "1px solid #f3f4f6",
                boxShadow: isEarned
                  ? "0 2px 12px rgba(99,153,34,0.15)"
                  : "none",
                opacity: isEarned ? 1 : 0.4,
                filter: isEarned ? "none" : "grayscale(100%)",
              }}
            >
              <span className="text-3xl">{ach.icon}</span>
              <span
                className="text-[10px] font-bold leading-tight"
                style={{ color: isEarned ? "#374151" : "#9ca3af" }}
              >
                {ach.name}
              </span>
              {isEarned && dateStr && (
                <span className="text-[9px] text-gray-400">{dateStr}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats summary */}
      <div className="rounded-2xl border border-gray-100 p-4 text-center">
        <p className="text-sm text-gray-500">
          <span className="font-bold" style={{ color: "#639922" }}>
            {earnedCount}
          </span>{" "}
          de{" "}
          <span className="font-bold text-gray-700">{totalCount}</span>{" "}
          conquistas desbloqueadas
        </p>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: totalCount > 0 ? `${(earnedCount / totalCount) * 100}%` : "0%",
              backgroundColor: "#639922",
            }}
          />
        </div>
      </div>

      {/* Badge detail modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="mx-8 rounded-3xl bg-white p-6 text-center shadow-2xl"
            style={{ maxWidth: 320, animation: "scaleIn 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="text-5xl block mb-3"
              style={{
                filter: earnedIds.has(selectedBadge.id)
                  ? "none"
                  : "grayscale(100%)",
                opacity: earnedIds.has(selectedBadge.id) ? 1 : 0.4,
              }}
            >
              {selectedBadge.icon}
            </span>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {selectedBadge.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {selectedBadge.description}
            </p>
            <p className="text-xs font-medium" style={{ color: "#639922" }}>
              +{selectedBadge.xp} XP
            </p>
            {earnedIds.has(selectedBadge.id) ? (
              <p className="mt-2 text-xs text-gray-400">
                Conquistada em {getEarnedDate(selectedBadge.id)}
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-400">
                Ainda nao desbloqueada
              </p>
            )}
            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-4 rounded-xl px-6 py-2 text-sm font-bold text-white"
              style={{ backgroundColor: "#639922" }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <AppNav />
    </div>
  );
}
