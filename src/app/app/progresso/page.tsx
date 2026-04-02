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

export default function ProgressoPage() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/app/weight").then((r) => r.json()).then((d) => setLogs(d.logs ?? []));
    fetch("/api/app/profile").then((r) => r.json()).then((d) => setProfile(d.profile));
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

  const startWeight = profile?.currentWeight ?? (logs.length > 0 ? logs[0].weight : null);
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : startWeight;
  const diff = startWeight && currentWeight ? startWeight - currentWeight : 0;
  const goalWeight = profile?.goalWeight;

  // Marcos
  const milestones = [
    { kg: 1, label: "Primeiro quilo", icon: "🏅" },
    { kg: 5, label: "5 kg perdidos", icon: "🥈" },
    { kg: 10, label: "10 kg perdidos", icon: "🥇" },
  ];

  // Grafico simples
  const maxWeight = logs.length > 0 ? Math.max(...logs.map((l) => l.weight)) : 100;
  const minWeight = logs.length > 0 ? Math.min(...logs.map((l) => l.weight)) : 50;
  const range = maxWeight - minWeight || 1;

  return (
    <div className="px-5 pb-24 pt-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Progresso</h1>

      {/* Resumo */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-400">Inicial</p>
          <p className="text-lg font-bold text-gray-900">{startWeight ?? "—"}</p>
          <p className="text-[10px] text-gray-400">kg</p>
        </div>
        <div className="rounded-2xl border p-4 text-center" style={{ borderColor: "#639922" }}>
          <p className="text-xs text-gray-400">Atual</p>
          <p className="text-lg font-bold" style={{ color: "#639922" }}>
            {currentWeight ?? "—"}
          </p>
          <p className="text-[10px] text-gray-400">kg</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-400">{diff >= 0 ? "Perdido" : "Ganho"}</p>
          <p className="text-lg font-bold" style={{ color: diff > 0 ? "#639922" : "#ef4444" }}>
            {diff > 0 ? `-${diff.toFixed(1)}` : diff === 0 ? "—" : `+${Math.abs(diff).toFixed(1)}`}
          </p>
          <p className="text-[10px] text-gray-400">kg</p>
        </div>
      </div>

      {/* Grafico de linha */}
      {logs.length > 1 && (
        <div className="mb-6 rounded-2xl border border-gray-100 p-5">
          <h3 className="mb-4 text-sm font-bold text-gray-700">Evolucao do peso</h3>
          <div className="relative" style={{ height: 160 }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${logs.length * 50} 160`} preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#639922"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={logs
                  .map((l, i) => {
                    const x = i * (logs.length > 1 ? (logs.length * 50 - 20) / (logs.length - 1) : 0) + 10;
                    const y = 150 - ((l.weight - minWeight) / range) * 130 + 10;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
              {logs.map((l, i) => {
                const x = i * (logs.length > 1 ? (logs.length * 50 - 20) / (logs.length - 1) : 0) + 10;
                const y = 150 - ((l.weight - minWeight) / range) * 130 + 10;
                return <circle key={i} cx={x} cy={y} r="4" fill="#639922" />;
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Marcos */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-bold text-gray-700">Marcos de conquista</h3>
        {milestones.map((m) => {
          const achieved = diff >= m.kg;
          return (
            <div
              key={m.kg}
              className="mb-2 flex items-center gap-3 rounded-xl border px-4 py-3"
              style={{
                borderColor: achieved ? "#639922" : "#e5e7eb",
                backgroundColor: achieved ? "#f7faf2" : "white",
              }}
            >
              <span className="text-2xl">{achieved ? m.icon : "🔒"}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: achieved ? "#3B6D11" : "#9ca3af" }}>
                  {m.label}
                </p>
                {achieved && startWeight && (
                  <p className="text-xs" style={{ color: "#639922" }}>
                    Conquistado! {(startWeight - m.kg).toFixed(1)} kg
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registrar peso */}
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
