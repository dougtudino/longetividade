"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/app/app-nav";

type Tab = "peso" | "medidas" | "habitos" | "humor" | "calendario" | "ciclos";

type WeightLog = { weight: number; loggedAt: string };
type MeasurementLog = {
  waist: number | null;
  hip: number | null;
  loggedAt: string;
  note?: string | null;
};
type MoodLog = { mood: string; loggedAt: string };
type CheckinSummary = {
  date: string;
  habitsDone: number;
  habitsTotal: number;
  habitsPercent: number;
  waterCount: number;
  exerciseDone: boolean;
};
type CycleSummary = {
  id: string;
  cycleNumber: number;
  status: "active" | "paused" | "completed";
  daysCompleted: number;
  percent: number;
  startDate: string;
  completedAt: string | null;
};

type ProgressResponse = {
  days: number;
  weights: WeightLog[];
  measurements: MeasurementLog[];
  moods: MoodLog[];
  moodCounts: Record<string, number>;
  checkins: CheckinSummary[];
  cycles: CycleSummary[];
  cycleStats: {
    totalCycles: number;
    completedCycles: number;
    activeCycles: number;
    pausedCycles: number;
    totalDaysCompleted: number;
    highestCycleNumber: number;
  };
  summary: {
    startWeight: number | null;
    currentWeight: number | null;
    goalWeight: number | null;
    weightLost: number;
    weightLeft: number | null;
    avgHabitsPercent7d: number;
    avgHabitsPercent30d: number;
    checkinDays: number;
    topMood: string | null;
  };
};

const MOOD_META: Record<string, { emoji: string; label: string; color: string }> = {
  otima: { emoji: "😊", label: "Otima", color: "#639922" },
  bem: { emoji: "🙂", label: "Bem", color: "#8BC34A" },
  maisOuMenos: { emoji: "😐", label: "Mais ou menos", color: "#FFC107" },
  cansada: { emoji: "😔", label: "Cansada", color: "#FF9800" },
  dificil: { emoji: "😢", label: "Dificil", color: "#F44336" },
};

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "peso", label: "Peso", icon: "⚖️" },
  { id: "medidas", label: "Medidas", icon: "📏" },
  { id: "habitos", label: "Habitos", icon: "✅" },
  { id: "humor", label: "Humor", icon: "💚" },
  { id: "calendario", label: "Calendario", icon: "📅" },
  { id: "ciclos", label: "Ciclos", icon: "🔁" },
];

export default function ProgressoPage() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [tab, setTab] = useState<Tab>("peso");
  const [weightInput, setWeightInput] = useState("");
  const [weightNote, setWeightNote] = useState("");
  const [weightSaving, setWeightSaving] = useState(false);
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [measureSaving, setMeasureSaving] = useState(false);
  const [measureSaved, setMeasureSaved] = useState(false);

  const fetchProgress = useCallback(async () => {
    const r = await fetch("/api/app/progress?days=30");
    if (r.status === 401) {
      window.location.href = "/app/login";
      return;
    }
    if (r.ok) {
      const d = (await r.json()) as ProgressResponse;
      setData(d);
      // Pre-preenche medidas com a ultima
      const last = d.measurements[d.measurements.length - 1];
      if (last) {
        setWaist(last.waist != null ? String(last.waist) : "");
        setHip(last.hip != null ? String(last.hip) : "");
      }
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  async function saveWeight() {
    if (!weightInput) return;
    setWeightSaving(true);
    await fetch("/api/app/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: Number(weightInput), note: weightNote || null }),
    });
    setWeightInput("");
    setWeightNote("");
    setWeightSaving(false);
    fetchProgress();
  }

  async function saveMeasurements() {
    setMeasureSaving(true);
    const payload: { waist?: number; hip?: number } = {};
    const w = parseFloat(waist);
    const h = parseFloat(hip);
    if (!isNaN(w)) payload.waist = w;
    if (!isNaN(h)) payload.hip = h;
    if (Object.keys(payload).length === 0) {
      setMeasureSaving(false);
      return;
    }
    await fetch("/api/app/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMeasureSaving(false);
    setMeasureSaved(true);
    setTimeout(() => setMeasureSaved(false), 2000);
    fetchProgress();
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: "#639922" }} />
        <AppNav />
      </div>
    );
  }

  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Evolucao</h1>
      <p className="mb-4 text-sm text-gray-400">Ultimos {data.days} dias</p>

      {/* Tabs */}
      <div className="mb-5 -mx-1 flex overflow-x-auto gap-2 pb-2">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition-all"
              style={{
                backgroundColor: active ? "#639922" : "white",
                color: active ? "white" : "#6b7280",
                border: active ? "none" : "1px solid #e5e7eb",
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "peso" && <TabPeso data={data} weightInput={weightInput} weightNote={weightNote} setWeightInput={setWeightInput} setWeightNote={setWeightNote} saveWeight={saveWeight} weightSaving={weightSaving} />}
      {tab === "medidas" && <TabMedidas data={data} waist={waist} hip={hip} setWaist={setWaist} setHip={setHip} saveMeasurements={saveMeasurements} measureSaving={measureSaving} measureSaved={measureSaved} />}
      {tab === "habitos" && <TabHabitos data={data} />}
      {tab === "humor" && <TabHumor data={data} />}
      {tab === "calendario" && <TabCalendario data={data} />}
      {tab === "ciclos" && <TabCiclos data={data} />}

      <AppNav />
    </div>
  );
}

// ─── Tab: Peso ─────────────────────────────────────────────

function TabPeso(props: {
  data: ProgressResponse;
  weightInput: string;
  weightNote: string;
  setWeightInput: (v: string) => void;
  setWeightNote: (v: string) => void;
  saveWeight: () => void;
  weightSaving: boolean;
}) {
  const { data, weightInput, weightNote, setWeightInput, setWeightNote, saveWeight, weightSaving } = props;
  const { weights, summary } = data;
  const startWeight = summary.startWeight;
  const currentWeight = summary.currentWeight;
  const goalWeight = summary.goalWeight;
  const lost = summary.weightLost;

  return (
    <>
      <SummaryCards
        items={[
          { label: "Inicial", value: startWeight != null ? `${startWeight}` : "—", unit: "kg" },
          { label: "Atual", value: currentWeight != null ? `${currentWeight}` : "—", unit: "kg", highlight: true },
          { label: lost > 0 ? "Perdido" : "Diff", value: lost !== 0 ? `${lost > 0 ? "-" : "+"}${Math.abs(lost).toFixed(1)}` : "—", unit: "kg", positive: lost > 0 },
        ]}
      />

      {weights.length > 1 ? (
        <LineChart
          title="Evolucao do peso"
          points={weights.map((w) => ({ x: new Date(w.loggedAt).getTime(), y: w.weight }))}
          color="#639922"
          unit="kg"
          goal={goalWeight}
        />
      ) : (
        <div className="mb-5 rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-400">Registre mais pesagens pra ver o grafico de evolucao</p>
        </div>
      )}

      {/* Registrar peso */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Registrar peso</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="Ex: 71.5"
            step="0.1"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#639922]"
          />
          <button
            onClick={saveWeight}
            disabled={!weightInput || weightSaving}
            className="rounded-xl px-6 py-3 font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: "#639922" }}
          >
            {weightSaving ? "..." : "Salvar"}
          </button>
        </div>
        <input
          type="text"
          value={weightNote}
          onChange={(e) => setWeightNote(e.target.value)}
          placeholder="Nota (opcional)"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#639922]"
        />
      </div>
    </>
  );
}

// ─── Tab: Medidas ──────────────────────────────────────────

function TabMedidas(props: {
  data: ProgressResponse;
  waist: string;
  hip: string;
  setWaist: (v: string) => void;
  setHip: (v: string) => void;
  saveMeasurements: () => void;
  measureSaving: boolean;
  measureSaved: boolean;
}) {
  const { data, waist, hip, setWaist, setHip, saveMeasurements, measureSaving, measureSaved } = props;
  const { measurements } = data;

  return (
    <>
      {measurements.length > 1 && (
        <LineChart
          title="Cintura"
          points={measurements
            .filter((m) => m.waist != null)
            .map((m) => ({ x: new Date(m.loggedAt).getTime(), y: m.waist as number }))}
          color="#7A4A11"
          unit="cm"
        />
      )}
      {measurements.length > 1 && (
        <LineChart
          title="Quadril"
          points={measurements
            .filter((m) => m.hip != null)
            .map((m) => ({ x: new Date(m.loggedAt).getTime(), y: m.hip as number }))}
          color="#9C5710"
          unit="cm"
        />
      )}
      <div className="mb-5 rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Registrar medidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Cintura (cm)</label>
            <input
              type="number"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="Ex: 80"
              step="0.5"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Quadril (cm)</label>
            <input
              type="number"
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              placeholder="Ex: 95"
              step="0.5"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922]"
            />
          </div>
        </div>
        <button
          onClick={saveMeasurements}
          disabled={measureSaving}
          className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: "#639922" }}
        >
          {measureSaved ? "Salvo!" : measureSaving ? "..." : "Salvar medidas"}
        </button>
      </div>
    </>
  );
}

// ─── Tab: Hábitos ──────────────────────────────────────────

function TabHabitos({ data }: { data: ProgressResponse }) {
  const { checkins, summary } = data;
  const maxBar = 100;
  const barW = 8;
  const gap = 4;
  const chartW = checkins.length * (barW + gap);
  const chartH = 140;

  return (
    <>
      <SummaryCards
        items={[
          { label: "Media 7d", value: `${summary.avgHabitsPercent7d}%`, highlight: true },
          { label: "Media 30d", value: `${summary.avgHabitsPercent30d}%` },
          { label: "Check-ins", value: `${summary.checkinDays}`, unit: "dias" },
        ]}
      />

      <div className="mb-5 rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Habitos % por dia</h3>
        {checkins.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Faca check-ins pra acompanhar % de habitos
          </p>
        ) : (
          <div className="overflow-x-auto">
            <svg width={Math.max(chartW, 320)} height={chartH + 30} viewBox={`0 0 ${Math.max(chartW, 320)} ${chartH + 30}`}>
              {/* Grid 0/25/50/75/100% */}
              {[0, 25, 50, 75, 100].map((p) => {
                const y = chartH - (p / maxBar) * chartH + 5;
                return (
                  <g key={p}>
                    <line x1={0} y1={y} x2={Math.max(chartW, 320)} y2={y} stroke="#f3f4f6" />
                    <text x={2} y={y - 2} fontSize="9" fill="#9ca3af">{p}%</text>
                  </g>
                );
              })}
              {checkins.map((c, i) => {
                const h = (c.habitsPercent / maxBar) * chartH;
                const x = i * (barW + gap);
                const y = chartH - h + 5;
                const color = c.habitsPercent >= 80 ? "#639922" : c.habitsPercent >= 50 ? "#9EBF9E" : "#d4e8c4";
                return (
                  <rect key={i} x={x} y={y} width={barW} height={h} rx={2} fill={color}>
                    <title>{new Date(c.date).toLocaleDateString("pt-BR")}: {c.habitsPercent}%</title>
                  </rect>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Tab: Humor ────────────────────────────────────────────

function TabHumor({ data }: { data: ProgressResponse }) {
  const { moods, moodCounts, summary } = data;
  const total = moods.length;
  const entries = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <SummaryCards
        items={[
          { label: "Registros", value: `${total}`, unit: "" },
          {
            label: "Mais comum",
            value: summary.topMood ? MOOD_META[summary.topMood]?.emoji ?? "—" : "—",
            highlight: true,
          },
          {
            label: "Diferentes",
            value: `${entries.length}`,
            unit: "estados",
          },
        ]}
      />

      <div className="mb-5 rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Distribuicao do humor</h3>
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Registre seu humor no Emocional</p>
        ) : (
          <div className="space-y-2">
            {entries.map(([mood, count]) => {
              const meta = MOOD_META[mood];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={mood}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">{meta?.emoji ?? "❔"}</span>
                      <span className="text-gray-700 font-semibold">{meta?.label ?? mood}</span>
                    </span>
                    <span className="text-gray-400">{count} · {pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: meta?.color ?? "#9ca3af" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Tab: Calendário (heatmap) ─────────────────────────────

function TabCalendario({ data }: { data: ProgressResponse }) {
  const { checkins } = data;
  // Mapa date string -> habitsPercent
  const map = new Map<string, number>();
  for (const c of checkins) {
    const key = new Date(c.date).toISOString().slice(0, 10);
    map.set(key, c.habitsPercent);
  }
  // Gerar grid dos ultimos 30 dias (mais antigo a esquerda)
  const cells: Array<{ date: string; percent: number | null; isToday: boolean }> = [];
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, percent: map.get(key) ?? null, isToday: key === todayStr });
  }

  function colorFor(p: number | null): string {
    if (p === null) return "#f3f4f6";
    if (p >= 80) return "#639922";
    if (p >= 50) return "#9EBF9E";
    if (p >= 20) return "#d4e8c4";
    return "#EAF3DE";
  }

  return (
    <div className="mb-5 rounded-2xl border border-gray-100 p-5">
      <h3 className="mb-1 text-sm font-bold text-gray-700">Calendario (30d)</h3>
      <p className="mb-4 text-xs text-gray-400">Cor = % de habitos no dia. Mais escuro = mais consistente.</p>
      <div className="grid grid-cols-10 gap-1">
        {cells.map((c) => (
          <div
            key={c.date}
            className="aspect-square rounded-md"
            title={`${new Date(c.date).toLocaleDateString("pt-BR")}: ${c.percent === null ? "sem checkin" : c.percent + "%"}`}
            style={{
              backgroundColor: colorFor(c.percent),
              border: c.isToday ? "2px solid #BA7517" : "none",
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
        <span>30d atras</span>
        <div className="flex items-center gap-1">
          <span>Menos</span>
          {[null, 20, 50, 80].map((p) => (
            <div key={String(p)} className="h-3 w-3 rounded-sm" style={{ backgroundColor: colorFor(p) }} />
          ))}
          <span>Mais</span>
        </div>
        <span>Hoje</span>
      </div>
    </div>
  );
}

// ─── Tab: Ciclos ───────────────────────────────────────────

function TabCiclos({ data }: { data: ProgressResponse }) {
  const { cycles, cycleStats } = data;
  return (
    <>
      <SummaryCards
        items={[
          { label: "Total", value: `${cycleStats.totalCycles}` },
          { label: "Completos", value: `${cycleStats.completedCycles}`, highlight: true },
          { label: "Dias", value: `${cycleStats.totalDaysCompleted}` },
        ]}
      />
      <div className="mb-5 rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Comparacao entre ciclos</h3>
        {cycles.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">Voce ainda nao tem ciclos</p>
        ) : (
          <div className="space-y-3">
            {cycles.map((c) => {
              const color = c.status === "completed" ? "#639922" : c.status === "paused" ? "#BA7517" : "#378ADD";
              return (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-bold text-gray-700">Ciclo {c.cycleNumber}</span>
                    <span className="text-gray-400">
                      {c.daysCompleted}/21 · {c.percent}% · {c.status}
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full transition-all" style={{ width: `${c.percent}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Helpers ───────────────────────────────────────────────

function SummaryCards({
  items,
}: {
  items: Array<{ label: string; value: string; unit?: string; highlight?: boolean; positive?: boolean }>;
}) {
  return (
    <div className="mb-5 grid grid-cols-3 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl p-4 text-center"
          style={{
            border: it.highlight ? "1px solid #639922" : "1px solid #f3f4f6",
            backgroundColor: it.highlight ? "#f7faf2" : "white",
          }}
        >
          <p className="text-xs text-gray-400">{it.label}</p>
          <p className="text-lg font-bold" style={{ color: it.positive ? "#639922" : it.highlight ? "#639922" : "#1f2937" }}>
            {it.value}
          </p>
          {it.unit && <p className="text-[10px] text-gray-400">{it.unit}</p>}
        </div>
      ))}
    </div>
  );
}

function LineChart({
  title,
  points,
  color,
  unit,
  goal,
}: {
  title: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  unit?: string;
  goal?: number | null;
}) {
  const chartW = 350;
  const chartH = 160;
  const padding = 20;

  const minY = useMemo(() => {
    const ys = points.map((p) => p.y);
    if (goal != null) ys.push(goal);
    return Math.min(...ys);
  }, [points, goal]);
  const maxY = useMemo(() => {
    const ys = points.map((p) => p.y);
    if (goal != null) ys.push(goal);
    return Math.max(...ys);
  }, [points, goal]);
  const rangeY = maxY - minY || 1;

  const xMin = points[0]?.x ?? 0;
  const xMax = points[points.length - 1]?.x ?? 1;
  const rangeX = xMax - xMin || 1;

  function px(p: { x: number; y: number }) {
    const x = padding + ((p.x - xMin) / rangeX) * (chartW - padding * 2);
    const y = padding + (1 - (p.y - minY) / rangeY) * (chartH - padding * 2);
    return { x, y };
  }

  if (points.length === 0) {
    return (
      <div className="mb-5 rounded-2xl border border-gray-100 p-6 text-center">
        <p className="text-sm text-gray-400">Sem dados pra mostrar</p>
      </div>
    );
  }

  const pathStr = points.map((p, i) => {
    const { x, y } = px(p);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  const goalY = goal != null ? padding + (1 - (goal - minY) / rangeY) * (chartH - padding * 2) : null;

  return (
    <div className="mb-5 rounded-2xl border border-gray-100 p-5">
      <h3 className="mb-3 text-sm font-bold text-gray-700">{title}</h3>
      <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((f) => {
          const y = padding + f * (chartH - padding * 2);
          return <line key={f} x1={padding} y1={y} x2={chartW - padding} y2={y} stroke="#f3f4f6" />;
        })}
        {/* Goal line */}
        {goalY != null && (
          <>
            <line x1={padding} y1={goalY} x2={chartW - padding} y2={goalY} stroke="#BA7517" strokeDasharray="4 4" />
            <text x={chartW - padding} y={goalY - 4} textAnchor="end" fill="#BA7517" fontSize="10">
              Meta: {goal} {unit ?? ""}
            </text>
          </>
        )}
        {/* Line */}
        <path d={pathStr} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        {/* Dots */}
        {points.map((p, i) => {
          const { x, y } = px(p);
          const isLast = i === points.length - 1;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={isLast ? 5 : 3} fill={color} />
              {(isLast || i === 0) && (
                <text x={x} y={y - 8} textAnchor="middle" fill={color} fontSize="10" fontWeight="600">
                  {p.y}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
