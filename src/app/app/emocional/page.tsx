"use client";
import { useEffect, useState, useCallback } from "react";
import { AppNav } from "@/components/app/app-nav";

// ─── Types ──────────────────────────────────────
type MoodOption = {
  key: string;
  emoji: string;
  label: string;
  color: string;
};

type MoodLog = {
  id: string;
  mood: string;
  note: string | null;
  triggers: string[];
  loggedAt: string;
};

type TriggerCount = { name: string; count: number };

// ─── Constants ──────────────────────────────────
const MOODS: MoodOption[] = [
  { key: "otima", emoji: "😊", label: "Otima", color: "#639922" },
  { key: "bem", emoji: "🙂", label: "Bem", color: "#8BC34A" },
  { key: "maisOuMenos", emoji: "😐", label: "Mais ou menos", color: "#FFC107" },
  { key: "cansada", emoji: "😔", label: "Cansada", color: "#FF9800" },
  { key: "dificil", emoji: "😢", label: "Dificil", color: "#F44336" },
];

const HUNGER_OPTIONS = [
  { key: "real", label: "Real (corpo pediu)" },
  { key: "emocional", label: "Emocional (mente pediu)" },
];

const TRIGGER_TAGS = [
  "Estresse",
  "Ansiedade",
  "Tedio",
  "Tristeza",
  "TPM",
  "Cansaco",
  "Solidao",
  "Raiva",
  "Comemoracao",
];

// ─── Breathing Exercise Component ───────────────
function BreathingExercise({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"inspire" | "segure" | "expire">("inspire");
  const [cycle, setCycle] = useState(0);
  const [seconds, setSeconds] = useState(4);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Advance phase
          setPhase((currentPhase) => {
            if (currentPhase === "inspire") return "segure";
            if (currentPhase === "segure") return "expire";
            // expire -> next cycle
            setCycle((c) => {
              const next = c + 1;
              if (next >= 4) {
                setDone(true);
                return next;
              }
              return next;
            });
            return "inspire";
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [done]);

  const phaseLabel =
    phase === "inspire" ? "Inspire..." : phase === "segure" ? "Segure..." : "Expire...";

  const scale = phase === "inspire" ? 1.5 : phase === "segure" ? 1.5 : 1;
  const opacity = phase === "expire" ? 0.6 : 1;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {done ? (
        <div className="text-center px-8">
          <div className="text-5xl mb-4">🌿</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pronto!</h2>
          <p className="text-sm text-gray-500 mb-8">
            Voce completou a respiracao guiada. Como esta se sentindo agora?
          </p>
          <button
            onClick={onClose}
            className="rounded-2xl px-8 py-3 text-white font-bold"
            style={{ backgroundColor: "#639922" }}
          >
            Voltar
          </button>
        </div>
      ) : (
        <>
          <p className="mb-2 text-xs text-gray-400">
            Ciclo {cycle + 1} de 4
          </p>

          {/* Breathing circle */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 160,
              height: 160,
              backgroundColor: "#639922",
              opacity,
              transform: `scale(${scale})`,
              transition: "transform 4s ease-in-out, opacity 4s ease-in-out",
            }}
          >
            <span className="text-white text-lg font-bold">{seconds}</span>
          </div>

          <p className="mt-8 text-lg font-bold text-gray-700">{phaseLabel}</p>
        </>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────
export default function EmocionalPage() {
  // Entry state
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [hunger, setHunger] = useState<string | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // History state
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [topMood, setTopMood] = useState<string | null>(null);
  const [topTriggers, setTopTriggers] = useState<TriggerCount[]>([]);
  const [todayLogged, setTodayLogged] = useState(false);

  // Breathing
  const [showBreathing, setShowBreathing] = useState(false);

  const fetchMoodData = useCallback(() => {
    fetch("/api/app/mood?days=7")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs ?? []);
        setTopMood(data.topMood);
        setTopTriggers(data.topTriggers ?? []);
        setTodayLogged(!!data.todayLog);
      });
  }, []);

  useEffect(() => {
    fetchMoodData();
  }, [fetchMoodData]);

  const toggleTrigger = (t: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    setSaving(true);

    const triggers = [...selectedTriggers];
    if (hunger) triggers.push(hunger === "emocional" ? "Fome Emocional" : "Fome Real");

    await fetch("/api/app/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood: selectedMood,
        note: note || undefined,
        triggers,
      }),
    });

    setSaving(false);
    setShowCelebration(true);
    setTodayLogged(true);

    // Reset form after delay
    setTimeout(() => {
      setShowCelebration(false);
      setSelectedMood(null);
      setHunger(null);
      setSelectedTriggers([]);
      setNote("");
      fetchMoodData();
    }, 3000);
  };

  const getMoodOption = (key: string) => MOODS.find((m) => m.key === key);

  // Build last 7 days for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
    const log = logs.find((l) => l.loggedAt.startsWith(dateStr));
    return { dateStr, dayName, mood: log?.mood ?? null };
  });

  return (
    <div className="px-5 pb-24 pt-6">
      {/* Breathing exercise overlay */}
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center px-8">
            <div className="text-5xl mb-4">💚</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registrado!</h2>
            <p className="text-sm text-gray-500">
              Reconhecer como se sente ja e um passo enorme.
            </p>
            <p className="text-xs mt-2" style={{ color: "#639922" }}>+10 XP</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {todayLogged && !selectedMood ? "Seu diario emocional" : "Como voce esta se sentindo?"}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {todayLogged && !selectedMood
            ? "Voce ja registrou hoje. Pode registrar novamente se quiser."
            : "Sem julgamento. Apenas observe."}
        </p>
      </div>

      {/* Mood selector */}
      <div className="mb-6">
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelectedMood(m.key)}
                className="flex flex-1 flex-col items-center gap-1 rounded-2xl p-3 transition-all active:scale-95"
                style={{
                  backgroundColor: isSelected ? m.color + "20" : "#f9fafb",
                  border: isSelected ? `2px solid ${m.color}` : "2px solid transparent",
                }}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: isSelected ? m.color : "#6b7280" }}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional sections after mood selection */}
      {selectedMood && (
        <div className="space-y-5 mb-6">
          {/* Hunger type */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">
              Sua fome hoje foi mais...
            </p>
            <div className="flex gap-3">
              {HUNGER_OPTIONS.map((h) => (
                <button
                  key={h.key}
                  onClick={() => setHunger(hunger === h.key ? null : h.key)}
                  className="flex-1 rounded-2xl px-3 py-3 text-xs font-medium transition-all active:scale-95"
                  style={{
                    backgroundColor: hunger === h.key ? "#EAF3DE" : "#f9fafb",
                    border: hunger === h.key ? "1px solid #639922" : "1px solid #e5e7eb",
                    color: hunger === h.key ? "#639922" : "#6b7280",
                  }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger tags */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">
              Gatilhos emocionais (opcional)
            </p>
            <div className="flex flex-wrap gap-2">
              {TRIGGER_TAGS.map((t) => {
                const isActive = selectedTriggers.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTrigger(t)}
                    className="rounded-full px-4 py-2 text-xs font-medium transition-all active:scale-95"
                    style={{
                      backgroundColor: isActive ? "#639922" : "#f3f4f6",
                      color: isActive ? "white" : "#6b7280",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">
              Nota para voce mesma:
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escreva algo se quiser..."
              className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#639922]"
              rows={3}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-2xl py-4 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: "#639922" }}
          >
            {saving ? "Salvando..." : "Registrar como me sinto"}
          </button>
        </div>
      )}

      {/* ─── Weekly Mood Chart ──────────────────────── */}
      <div className="rounded-2xl border border-gray-100 p-5 mb-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Ultimos 7 dias</h3>
        <div className="flex justify-between">
          {last7Days.map((day, i) => {
            const moodOpt = day.mood ? getMoodOption(day.mood) : null;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all"
                  style={{
                    backgroundColor: moodOpt ? moodOpt.color : "#f3f4f6",
                  }}
                >
                  {moodOpt ? (
                    <span>{moodOpt.emoji}</span>
                  ) : (
                    <span className="text-gray-300">·</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">{day.dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Pattern & Triggers Summary ─────────────── */}
      {(topMood || topTriggers.length > 0) && (
        <div className="rounded-2xl border border-gray-100 p-5 mb-5">
          {topMood && (
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Seu padrao:</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{getMoodOption(topMood)?.emoji}</span>
                <span className="text-sm font-bold text-gray-700">
                  {getMoodOption(topMood)?.label}
                </span>
                <span className="text-xs text-gray-400">esta semana</span>
              </div>
            </div>
          )}

          {topTriggers.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Gatilhos mais frequentes:</p>
              <div className="flex flex-wrap gap-2">
                {topTriggers.map((t) => (
                  <span
                    key={t.name}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
                  >
                    {t.name} ({t.count}x)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Breathing Exercise Card ────────────────── */}
      <div className="rounded-2xl border border-gray-100 p-5 mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: "#EAF3DE" }}
          >
            <span className="text-lg">🌿</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Precisa de um momento?</p>
            <p className="text-xs text-gray-400">Respire fundo e acalme a mente</p>
          </div>
        </div>
        <button
          onClick={() => setShowBreathing(true)}
          className="w-full rounded-2xl py-3 text-sm font-bold text-white transition-all active:scale-[0.98]"
          style={{ backgroundColor: "#639922" }}
        >
          Respiracao guiada (1 min)
        </button>
      </div>

      <AppNav />
    </div>
  );
}
