"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppNav } from "@/components/app/app-nav";
import { BrotoAvatar, useBrotoState } from "@/components/app/broto-avatar";

// /app/jornada — Timeline emocional unificada.
// Substitui /evolucao + /progresso + /conquistas. Scroll vertical sem
// tabs internas (apps wellness premium NAO usam tabs). Tudo numa pagina,
// com pesos visuais corretos:
//   1. Broto big (centro emocional)
//   2. Marcos do Broto (timeline com bolinhas)
//   3. Esta semana (4 KPIs compactos)
//   4. Peso (linha + ultimas pesagens)
//   5. Habitos (grafico simples 30d)
//   6. Conquistas (grid scroll horizontal)
//   7. Ciclos (lista expandivel)

type WellbeingSummary = {
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

type CycleStats = {
  totalCycles: number;
  completedCycles: number;
  totalDaysCompleted: number;
  highestCycleNumber: number;
};

type Achievement = { id: string; name: string; icon: string; earnedAt: string };
type WeightLog = { weight: number; loggedAt: string };

type Milestone = {
  id: string;
  kind: "stage_up" | "cycle_complete" | "first_checkin" | "streak_milestone";
  stage: number | null;
  message: string;
  achievedAt: string;
};

const STATUS_COLOR: Record<string, string> = {
  active: "#378ADD",
  paused: "#BA7517",
  completed: "#639922",
  abandoned: "#9ca3af",
};

const DIFF_LABEL: Record<string, string> = {
  easy: "Suave",
  normal: "Constante",
  hard: "Intenso",
};

export default function JornadaPage() {
  const [wellbeing, setWellbeing] = useState<WellbeingSummary | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleStats, setCycleStats] = useState<CycleStats | null>(null);
  const [earned, setEarned] = useState<Achievement[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const brotoState = useBrotoState(cycleStats?.totalDaysCompleted);

  const fetchAll = useCallback(() => {
    fetch("/api/app/wellbeing-week").then((r) => r.json()).then(setWellbeing);
    fetch("/api/app/cycles").then((r) => r.json()).then((d) => {
      setCycles(d.cycles ?? []);
      setCycleStats(d.stats ?? null);
    });
    fetch("/api/app/achievements").then((r) => r.json()).then((d) => {
      setEarned(d.earned ?? []);
    });
    fetch("/api/app/weight").then((r) => r.json()).then((d) => {
      // GET sem ?date retorna histórico completo ordenado ASC
      const logs = (d.logs ?? []).slice().reverse(); // mais recente primeiro
      setWeightLogs(logs.slice(0, 30)); // últimas 30 pra grafico
    });
    fetch("/api/app/broto/milestones")
      .then((r) => (r.ok ? r.json() : { milestones: [] }))
      .then((d) => setMilestones(d.milestones ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Gráfico do peso (sparkline simples SVG inline) ─────
  const weightChart = useMemo(() => {
    if (weightLogs.length < 2) return null;
    // Inverte pra ordem cronológica (asc) pra desenhar da esquerda pra direita
    const series = weightLogs.slice().reverse();
    const ws = series.map((w) => w.weight);
    const min = Math.min(...ws);
    const max = Math.max(...ws);
    const range = max - min || 1;
    const w = 280;
    const h = 60;
    const pad = 4;
    const xs = ws.map((_, i) => pad + (i * (w - pad * 2)) / (ws.length - 1));
    const ys = ws.map((v) => h - pad - ((v - min) / range) * (h - pad * 2));
    const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
    const first = ws[0];
    const last = ws[ws.length - 1];
    const delta = last - first;
    return { w, h, pathD, xs, ys, first, last, delta };
  }, [weightLogs]);

  const brotoName = brotoState?.brotoName ?? "Broto";

  return (
    <div className="px-5 pb-24 pt-6" style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Sua jornada</h1>
      <p className="mb-5 text-sm text-gray-500">
        Onde você chegou. Continuamente.
      </p>

      {/* ─── 1. Broto big + tagline emocional ─── */}
      <div
        className="mb-5 rounded-2xl p-5 flex flex-col items-center text-center"
        style={{ background: "white", border: "1px solid #f3f4f6" }}
      >
        <BrotoAvatar state={brotoState} size={160} />
        {brotoState && (
          <>
            <p className="mt-3 text-base font-bold" style={{ color: "#3B6D11" }}>
              {brotoName} · {brotoState.stageName}
            </p>
            <p className="mt-1 text-xs text-gray-500 max-w-xs">
              {milestonesNarrative(milestones, brotoName)}
            </p>
          </>
        )}
      </div>

      {/* ─── 2. Marcos (timeline com bolinhas) ─── */}
      {milestones.length > 0 && (
        <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Marcos do {brotoName} 🌱
          </p>
          <div className="relative flex flex-col gap-3">
            <div
              className="absolute left-2.5 top-1 bottom-1 w-0.5"
              style={{ backgroundColor: "#EAF3DE" }}
              aria-hidden="true"
            />
            {milestones.slice(0, 8).map((m) => {
              const date = new Date(m.achievedAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "2-digit",
              });
              return (
                <div key={m.id} className="relative flex items-start gap-3 pl-1">
                  <div
                    className="z-10 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#639922" }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-snug" style={{ color: "#3B6D11" }}>
                      {m.message}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{date}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {milestones.length > 8 && (
            <p className="mt-3 text-center text-[10px] text-gray-400">
              + {milestones.length - 8} marcos mais antigos
            </p>
          )}
        </div>
      )}

      {/* ─── 3. Esta semana (4 KPIs) ─── */}
      {wellbeing && (
        <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Esta semana
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Kpi
              value={
                wellbeing.weightDelta != null && wellbeing.weightDelta !== 0
                  ? `${wellbeing.weightDelta < 0 ? "−" : "+"}${Math.abs(wellbeing.weightDelta).toFixed(1)}kg`
                  : wellbeing.currentWeight != null
                    ? `${wellbeing.currentWeight}kg`
                    : "—"
              }
              label="peso"
              color={wellbeing.weightDelta != null && wellbeing.weightDelta < 0 ? "#639922" : "#374151"}
            />
            <Kpi value={`${wellbeing.avgHabitsPercent}%`} label="hábitos" color="#639922" />
            <Kpi value={`${wellbeing.checkinDays}d`} label="check-ins" color="#378ADD" />
            <Kpi value={`${wellbeing.exerciseDays}d`} label="movimento" color="#BA7517" />
          </div>
        </div>
      )}

      {/* ─── 4. Peso (sparkline + últimas pesagens) ─── */}
      {weightLogs.length > 0 && (
        <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Peso</p>
            {weightChart && (
              <p className="text-xs text-gray-500">
                {weightChart.first}kg → <strong style={{ color: weightChart.delta < 0 ? "#639922" : "#374151" }}>{weightChart.last}kg</strong>
                {weightChart.delta !== 0 && (
                  <span style={{ color: weightChart.delta < 0 ? "#639922" : "#C4787A", marginLeft: 4 }}>
                    ({weightChart.delta < 0 ? "−" : "+"}{Math.abs(weightChart.delta).toFixed(1)})
                  </span>
                )}
              </p>
            )}
          </div>
          {weightChart && (
            <svg
              viewBox={`0 0 ${weightChart.w} ${weightChart.h}`}
              width="100%"
              height={weightChart.h}
              className="mb-3"
            >
              <path d={weightChart.pathD} fill="none" stroke="#639922" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {weightChart.xs.map((x, i) => (
                <circle key={i} cx={x} cy={weightChart.ys[i]} r="2" fill="#639922" />
              ))}
            </svg>
          )}
          <div className="flex flex-col gap-1">
            {weightLogs.slice(0, 4).map((w, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                <span className="font-bold text-gray-800">{w.weight} kg</span>
                <span className="text-gray-400">
                  {new Date(w.loggedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 5. Ciclos (lista de cards) ─── */}
      {cycleStats && cycleStats.totalCycles > 0 && (
        <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Ciclos · {cycleStats.completedCycles}/{cycleStats.totalCycles} completos
            </p>
            <Link href="/app/desafio" className="text-xs font-bold" style={{ color: "#639922" }}>
              Atual →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {cycles.slice(0, 5).map((c) => {
              const color = STATUS_COLOR[c.status] ?? "#9ca3af";
              return (
                <div key={c.cycleNumber}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">
                      Ciclo {c.cycleNumber} · {DIFF_LABEL[c.difficulty] ?? "Constante"}
                    </span>
                    <span className="text-gray-400">
                      {c.daysCompleted}/21 · {c.status}
                    </span>
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

      {/* ─── 6. Conquistas (grid horizontal scrollable) ─── */}
      {earned.length > 0 && (
        <div className="mb-5 rounded-2xl bg-white p-4 border border-gray-100">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
            Conquistas · {earned.length}
          </p>
          <div className="flex overflow-x-auto gap-3 pb-1 -mx-1 px-1 scrollbar-hide">
            {earned.slice(0, 20).map((a) => (
              <div
                key={a.id}
                className="flex-shrink-0 flex flex-col items-center justify-start gap-1"
                style={{ width: 70 }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#EAF3DE" }}
                >
                  <span className="text-2xl">{a.icon}</span>
                </div>
                <p
                  className="text-[9px] font-bold text-center leading-tight"
                  style={{ color: "#374151" }}
                >
                  {a.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <AppNav />
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────

function Kpi({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <p className="text-base font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

// Narrativa emocional sutil baseada nos marcos (em vez de mensagem
// estatica). Usa nome customizado do Broto.
function milestonesNarrative(milestones: Milestone[], brotoName: string): string {
  if (milestones.length === 0) {
    return "Sua jornada está começando. Continue cuidando de você.";
  }
  const cycleCompleted = milestones.filter((m) => m.kind === "cycle_complete").length;
  const stageUps = milestones.filter((m) => m.kind === "stage_up").length;
  if (cycleCompleted > 0) {
    return `${brotoName} floresceu ${cycleCompleted}x · ${stageUps} crescimentos`;
  }
  if (stageUps >= 3) {
    return `${brotoName} cresceu ${stageUps} folhas com você 🌿`;
  }
  if (stageUps > 0) {
    return `${brotoName} já cresceu ${stageUps} folha${stageUps > 1 ? "s" : ""} 🌱`;
  }
  return "Cada cuidado seu vai aparecer aqui.";
}
