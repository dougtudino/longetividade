"use client";
import { useCallback, useEffect, useState } from "react";

type TimeOption = { minutes: number; xp: number };

type Activity = {
  id: string;
  name: string;
  icon: string;
  category: "movimento" | "mental" | "social" | "criativo";
  description: string;
  scienceTip?: string;
  timeOptions: TimeOption[];
  requiredLevel: number;
  locked: boolean;
  todayMinutes: number;
  todayXp: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  movimento: "#378ADD",
  mental: "#639922",
  social: "#FF9800",
  criativo: "#E91E63",
};

// Componente da secao "Atividades extras" pra usar na home.
// Modelo hibrido: cada atividade tem requiredLevel (desbloqueia por XP)
// e a usuaria escolhe o tempo entre opcoes pre-definidas (10, 20, 30 min...).
//
// Default: secao colapsada. Toca pra expandir e ver lista.
export function ActivitiesSection({ onRegistered }: { onRegistered?: () => void }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const fetchActivities = useCallback(async () => {
    try {
      const r = await fetch("/api/app/activities");
      if (r.ok) {
        const d = await r.json();
        setActivities(d.activities ?? []);
        setUserLevel(d.userLevel ?? 1);
      }
    } catch {
      /* silent */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  async function registerActivity(activityId: string, minutes: number) {
    if (registering) return;
    setRegistering(true);
    try {
      const r = await fetch("/api/app/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId, minutes }),
      });
      if (r.ok) {
        await fetchActivities();
        if (onRegistered) onRegistered();
      }
    } finally {
      setRegistering(false);
      setSelectedActivity(null);
    }
  }

  if (loading) return null;

  const unlockedCount = activities.filter((a) => !a.locked).length;
  const doneTodayCount = activities.filter((a) => a.todayMinutes > 0).length;

  return (
    <>
      <div
        className="mb-4 rounded-2xl bg-white"
        style={{ border: "1px solid #f3f4f6", overflow: "hidden" }}
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div>
            <p className="text-sm font-bold text-gray-800">Atividades extras 💪</p>
            <p className="text-[11px] text-gray-500">
              {unlockedCount} desbloqueadas · {doneTodayCount} feita{doneTodayCount === 1 ? "" : "s"} hoje
            </p>
          </div>
          <span className="text-gray-400 text-xl">{expanded ? "−" : "+"}</span>
        </button>

        {expanded && (
          <div className="border-t border-gray-100 p-2">
            {activities.map((a) => {
              const categoryColor = CATEGORY_COLORS[a.category];
              const done = a.todayMinutes > 0;
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl p-2.5 mb-1"
                  style={{
                    backgroundColor: done ? "#EAF3DE" : "transparent",
                    opacity: a.locked ? 0.55 : 1,
                  }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: `${categoryColor}15` }}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold"
                      style={{ color: done ? "#3B6D11" : "#1f2937" }}
                    >
                      {a.name}
                      {done && (
                        <span className="ml-2 text-[10px] font-bold" style={{ color: "#639922" }}>
                          ✓ {a.todayMinutes}min hoje
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {a.locked ? `🔒 Desbloqueia no Nv ${a.requiredLevel}` : a.description}
                    </p>
                  </div>
                  {!a.locked && (
                    <button
                      onClick={() => setSelectedActivity(a)}
                      className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white"
                      style={{ backgroundColor: categoryColor }}
                    >
                      + Registrar
                    </button>
                  )}
                </div>
              );
            })}
            <p className="mt-2 text-center text-[10px] text-gray-400">
              Mais atividades desbloqueiam quando você sobe de nível
            </p>
          </div>
        )}
      </div>

      {/* Modal seletor de tempo */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60"
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedActivity.icon}</span>
                <h3 className="text-lg font-bold text-gray-900">{selectedActivity.name}</h3>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-xl text-gray-400"
              >
                ×
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600 leading-relaxed">
              {selectedActivity.description}
            </p>
            {selectedActivity.scienceTip && (
              <div className="mb-4 rounded-xl p-3" style={{ backgroundColor: "#F0F7FF" }}>
                <p className="text-[11px] leading-relaxed" style={{ color: "#1e3a5f" }}>
                  💡 <strong>Base científica:</strong> {selectedActivity.scienceTip}
                </p>
              </div>
            )}
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              Quanto tempo você fez?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {selectedActivity.timeOptions.map((opt) => (
                <button
                  key={opt.minutes}
                  onClick={() => registerActivity(selectedActivity.id, opt.minutes)}
                  disabled={registering}
                  className="rounded-xl p-3 text-center transition-transform active:scale-95 disabled:opacity-60"
                  style={{
                    backgroundColor: CATEGORY_COLORS[selectedActivity.category],
                    color: "white",
                  }}
                >
                  <p className="text-base font-bold">{opt.minutes} min</p>
                  <p className="text-[10px] opacity-90">+{opt.xp} XP</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedActivity(null)}
              className="mt-4 w-full rounded-xl py-3 text-sm font-bold text-gray-500"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <p className="sr-only">user level: {userLevel}</p>
    </>
  );
}
