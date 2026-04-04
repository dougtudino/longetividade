"use client";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/app/app-nav";

type WeightLog = {
  weight: number;
  loggedAt: string;
  note: string | null;
};

type Profile = {
  currentWeight: number | null;
  goalWeight: number | null;
};

type Measurements = {
  waist: string;
  hip: string;
};

export default function ProgressoPage() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [measurements, setMeasurements] = useState<Measurements>({ waist: "", hip: "" });
  const [savingMeasures, setSavingMeasures] = useState(false);
  const [measureSaved, setMeasureSaved] = useState(false);

  useEffect(() => {
    fetch("/api/app/weight").then((r) => r.json()).then((d) => setLogs(d.logs ?? []));
    fetch("/api/app/profile").then((r) => r.json()).then((d) => setProfile(d.profile));

    // Load measurements from localStorage
    const saved = localStorage.getItem("body_measurements");
    if (saved) {
      try {
        setMeasurements(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  async function saveWeight() {
    if (!weight) return;
    setSaving(true);
    const res = await fetch("/api/app/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: Number(weight), note: note || null }),
    });
    const data = await res.json();
    setLogs((prev) => [...prev, data.log]);
    setWeight("");
    setNote("");
    setSaving(false);
  }

  function saveMeasurements() {
    setSavingMeasures(true);
    localStorage.setItem("body_measurements", JSON.stringify(measurements));
    setSavingMeasures(false);
    setMeasureSaved(true);
    setTimeout(() => setMeasureSaved(false), 2000);
  }

  const startWeight = profile?.currentWeight ?? (logs.length > 0 ? logs[0].weight : null);
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : startWeight;
  const diff = startWeight && currentWeight ? startWeight - currentWeight : 0;
  const goalWeight = profile?.goalWeight;

  // Trend: compare last 2 logs
  const trend =
    logs.length >= 2
      ? logs[logs.length - 1].weight - logs[logs.length - 2].weight
      : 0;

  // Milestones
  const milestones = [
    { kg: 1, label: "Primeiro quilo", icon: "🏅" },
    { kg: 3, label: "3 kg perdidos", icon: "💪" },
    { kg: 5, label: "5 kg perdidos", icon: "🥈" },
    { kg: 10, label: "10 kg perdidos", icon: "🥇" },
  ];

  // Chart dimensions
  const chartW = 350;
  const chartH = 160;
  const padding = 20;

  const maxWeight = logs.length > 0 ? Math.max(...logs.map((l) => l.weight)) : 100;
  const minWeight = logs.length > 0 ? Math.min(...logs.map((l) => l.weight)) : 50;
  const range = maxWeight - minWeight || 1;

  function getPoint(i: number) {
    const x = logs.length > 1
      ? padding + (i / (logs.length - 1)) * (chartW - padding * 2)
      : chartW / 2;
    const y = padding + (1 - (logs[i].weight - minWeight) / range) * (chartH - padding * 2);
    return { x, y };
  }

  // Generate smooth curve path using cardinal spline
  function getSmoothPath() {
    if (logs.length < 2) return "";
    const points = logs.map((_, i) => getPoint(i));
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }

  // Area fill path
  function getAreaPath() {
    const linePath = getSmoothPath();
    if (!linePath) return "";
    const lastPt = getPoint(logs.length - 1);
    const firstPt = getPoint(0);
    return `${linePath} L ${lastPt.x} ${chartH - padding} L ${firstPt.x} ${chartH - padding} Z`;
  }

  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Progresso</h1>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-400">Inicial</p>
          <p className="text-lg font-bold text-gray-900">{startWeight ?? "—"}</p>
          <p className="text-[10px] text-gray-400">kg</p>
        </div>
        <div className="rounded-2xl border p-4 text-center" style={{ borderColor: "#639922" }}>
          <p className="text-xs text-gray-400">Atual</p>
          <div className="flex items-center justify-center gap-1">
            <p className="text-lg font-bold" style={{ color: "#639922" }}>
              {currentWeight ?? "—"}
            </p>
            {/* Trend arrow */}
            {trend !== 0 && (
              <span
                className="text-sm"
                style={{ color: trend < 0 ? "#639922" : "#ef4444" }}
              >
                {trend < 0 ? "↓" : "↑"}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400">kg</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-400">{diff >= 0 ? "Perdido" : "Ganho"}</p>
          <p className="text-lg font-bold" style={{ color: diff > 0 ? "#639922" : diff < 0 ? "#ef4444" : "#9ca3af" }}>
            {diff > 0 ? `-${diff.toFixed(1)}` : diff === 0 ? "—" : `+${Math.abs(diff).toFixed(1)}`}
          </p>
          <p className="text-[10px] text-gray-400">kg</p>
        </div>
      </div>

      {/* Trend indicator */}
      {trend !== 0 && (
        <div
          className="mb-5 rounded-xl px-4 py-2.5 flex items-center gap-2"
          style={{
            backgroundColor: trend < 0 ? "#EAF3DE" : "#FEF2F2",
          }}
        >
          <span className="text-lg">{trend < 0 ? "📉" : "📈"}</span>
          <p className="text-sm" style={{ color: trend < 0 ? "#3B6D11" : "#991B1B" }}>
            {trend < 0
              ? `Voce perdeu ${Math.abs(trend).toFixed(1)} kg desde o ultimo registro`
              : `Voce ganhou ${Math.abs(trend).toFixed(1)} kg desde o ultimo registro`}
          </p>
        </div>
      )}

      {/* Smooth weight chart */}
      {logs.length > 1 && (
        <div className="mb-5 rounded-2xl border border-gray-100 p-5">
          <h3 className="mb-4 text-sm font-bold text-gray-700">Evolucao do peso</h3>
          <div className="relative overflow-x-auto">
            <svg
              width="100%"
              height={chartH}
              viewBox={`0 0 ${chartW} ${chartH}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((frac) => {
                const y = padding + frac * (chartH - padding * 2);
                return (
                  <line key={frac} x1={padding} y1={y} x2={chartW - padding} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                );
              })}

              {/* Area fill */}
              <path d={getAreaPath()} fill="#639922" opacity="0.1" />

              {/* Smooth line */}
              <path d={getSmoothPath()} fill="none" stroke="#639922" strokeWidth="2.5" strokeLinecap="round" />

              {/* Dots */}
              {logs.map((l, i) => {
                const { x, y } = getPoint(i);
                const isLast = i === logs.length - 1;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={isLast ? 5 : 3.5} fill="#639922" />
                    {isLast && (
                      <circle cx={x} cy={y} r="8" fill="#639922" opacity="0.2" />
                    )}
                    {/* Weight label on hover points */}
                    {(isLast || i === 0 || i % Math.max(1, Math.floor(logs.length / 5)) === 0) && (
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#639922"
                        fontSize="10"
                        fontWeight="600"
                      >
                        {l.weight}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Goal line */}
              {goalWeight && goalWeight >= minWeight && goalWeight <= maxWeight && (
                <>
                  <line
                    x1={padding}
                    y1={padding + (1 - (goalWeight - minWeight) / range) * (chartH - padding * 2)}
                    x2={chartW - padding}
                    y2={padding + (1 - (goalWeight - minWeight) / range) * (chartH - padding * 2)}
                    stroke="#BA7517"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={chartW - padding}
                    y={padding + (1 - (goalWeight - minWeight) / range) * (chartH - padding * 2) - 5}
                    textAnchor="end"
                    fill="#BA7517"
                    fontSize="9"
                  >
                    Meta: {goalWeight}
                  </text>
                </>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="mb-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Marcos de conquista</h3>
        {milestones.map((m) => {
          const achieved = diff >= m.kg;
          return (
            <div
              key={m.kg}
              className="mb-2 flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500"
              style={{
                borderColor: achieved ? "#639922" : "#e5e7eb",
                backgroundColor: achieved ? "#f7faf2" : "white",
                transform: achieved ? "scale(1)" : "scale(0.98)",
              }}
            >
              <span
                className="text-2xl transition-all duration-500"
                style={{
                  transform: achieved ? "scale(1.1)" : "scale(1)",
                }}
              >
                {achieved ? m.icon : "🔒"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: achieved ? "#3B6D11" : "#9ca3af" }}>
                  {m.label}
                </p>
                {achieved && startWeight && (
                  <p className="text-xs" style={{ color: "#639922" }}>
                    Conquistado! Chegou em {(startWeight - m.kg).toFixed(1)} kg
                  </p>
                )}
              </div>
              {achieved && (
                <span className="text-xs font-bold" style={{ color: "#639922" }}>✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Body measurements */}
      <div className="mb-5 rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Medidas corporais (opcional)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Cintura (cm)</label>
            <input
              type="number"
              value={measurements.waist}
              onChange={(e) => setMeasurements((prev) => ({ ...prev, waist: e.target.value }))}
              placeholder="Ex: 80"
              step="0.5"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Quadril (cm)</label>
            <input
              type="number"
              value={measurements.hip}
              onChange={(e) => setMeasurements((prev) => ({ ...prev, hip: e.target.value }))}
              placeholder="Ex: 95"
              step="0.5"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922]"
            />
          </div>
        </div>
        <button
          onClick={saveMeasurements}
          disabled={savingMeasures}
          className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: "#639922" }}
        >
          {measureSaved ? "Salvo!" : savingMeasures ? "..." : "Salvar medidas"}
        </button>
      </div>

      {/* Register weight */}
      <div className="rounded-2xl border border-gray-100 p-5">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Registrar peso</h3>
        <div className="flex gap-3">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 71.5"
            step="0.1"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#639922]"
          />
          <button
            onClick={saveWeight}
            disabled={!weight || saving}
            className="rounded-xl px-6 py-3 font-bold text-white disabled:opacity-40"
            style={{ backgroundColor: "#639922" }}
          >
            {saving ? "..." : "Salvar"}
          </button>
        </div>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional)"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#639922]"
        />
      </div>

      <AppNav />
    </div>
  );
}
