"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/app/app-nav";

type ProfileData = {
  name: string;
  brotoName?: string;
  objective: string;
  currentWeight: number | null;
  goalWeight: number | null;
  createdAt: string;
};

type StatsData = {
  totalCheckins: number;
  longestStreak: number;
  totalWaterCups: number;
  totalExerciseMinutes: number;
  achievementsEarned: number;
  level: number;
  levelName: string;
  xp: number;
  daysInMethod: number;
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

const OBJECTIVES = [
  { value: "emagrecer", label: "Emagrecer" },
  { value: "habitos", label: "Criar habitos saudaveis" },
  { value: "ambos", label: "Ambos" },
];

export default function PerfilPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [email, setEmail] = useState("");

  // Editable fields
  const [editName, setEditName] = useState("");
  const [editBrotoName, setEditBrotoName] = useState("");
  const [editObjective, setEditObjective] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editGoalWeight, setEditGoalWeight] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/app/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          setEditName(d.profile.name ?? "");
          setEditBrotoName(d.profile.brotoName ?? "Broto");
          setEditObjective(d.profile.objective ?? "");
          setEditWeight(d.profile.currentWeight ? String(d.profile.currentWeight) : "");
          setEditGoalWeight(d.profile.goalWeight ? String(d.profile.goalWeight) : "");
        }
      });

    fetch("/api/app/stats")
      .then((r) => r.json())
      .then((d) => setStats(d));

    // Get email from cookie or user info
    fetch("/api/app/me")
      .then((r) => r.json())
      .then((d) => setEmail(d.email ?? ""))
      .catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (editName) body.name = editName;
      // Sempre envia brotoName (mesmo vazio) — backend trata default "Broto"
      body.brotoName = editBrotoName;
      if (editObjective) body.objective = editObjective;
      if (editWeight) body.currentWeight = parseFloat(editWeight);
      if (editGoalWeight) body.goalWeight = parseFloat(editGoalWeight);

      await fetch("/api/app/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    document.cookie = "app-session=; path=/; max-age=0";
    window.location.href = "/app/login";
  }

  const levelColor = LEVEL_COLORS[stats?.level ?? 1] ?? "#639922";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "...";

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="px-5 pb-24 pt-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">Meu Perfil</h1>

      {/* Profile card */}
      <div className="mb-5 rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: levelColor }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 truncate">
              {profile?.name ?? "..."}
            </p>
            <p className="text-xs text-gray-400 truncate">{email || "..."}</p>
            {stats && (
              <p
                className="text-xs font-medium mt-0.5"
                style={{ color: levelColor }}
              >
                Nivel {stats.level} — {stats.levelName}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4 text-center">
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900">
              {stats?.daysInMethod ?? 0}
            </p>
            <p className="text-[10px] text-gray-400">Dias no metodo</p>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900">
              {stats?.totalCheckins ?? 0}
            </p>
            <p className="text-[10px] text-gray-400">Check-ins</p>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-gray-900">
              {stats?.achievementsEarned ?? 0}
            </p>
            <p className="text-[10px] text-gray-400">Conquistas</p>
          </div>
        </div>

        <p className="mt-3 text-[10px] text-gray-400 text-center">
          Membro desde {memberSince}
        </p>
      </div>

      {/* Editable fields */}
      <div className="mb-5 rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700">Dados pessoais</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#EAF3DE", color: "#639922" }}
            >
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                style={{ backgroundColor: "#639922", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          )}
        </div>

        {saved && (
          <div className="mb-3 rounded-xl p-2 text-center text-xs font-medium" style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}>
            Perfil atualizado com sucesso!
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nome</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={!editing}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922] disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">
              Nome do seu Broto 🌱
            </label>
            <input
              type="text"
              maxLength={24}
              value={editBrotoName}
              onChange={(e) => setEditBrotoName(e.target.value)}
              disabled={!editing}
              placeholder="Broto"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922] disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Objetivo</label>
            <select
              value={editObjective}
              onChange={(e) => setEditObjective(e.target.value)}
              disabled={!editing}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922] disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Selecione...</option>
              {OBJECTIVES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Peso atual (kg)
              </label>
              <input
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                disabled={!editing}
                step="0.1"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922] disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Peso meta (kg)
              </label>
              <input
                type="number"
                value={editGoalWeight}
                onChange={(e) => setEditGoalWeight(e.target.value)}
                disabled={!editing}
                step="0.1"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#639922] disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-5 rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Estatisticas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold" style={{ color: "#639922" }}>
              {stats?.totalCheckins ?? 0}
            </p>
            <p className="text-[10px] text-gray-400">Check-ins</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold" style={{ color: "#BA7517" }}>
              {stats?.longestStreak ?? 0}
            </p>
            <p className="text-[10px] text-gray-400">Maior streak</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold" style={{ color: "#378ADD" }}>
              {stats?.totalWaterCups ?? 0}
            </p>
            <p className="text-[10px] text-gray-400">Copos de agua</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold" style={{ color: "#E53935" }}>
              {stats?.totalExerciseMinutes ?? 0}
            </p>
            <p className="text-[10px] text-gray-400">Min exercicio</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-5 rounded-2xl border border-gray-100 p-5 space-y-2">
        <button
          onClick={() => router.push("/app/conquistas")}
          className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-medium text-gray-700">
              Minhas conquistas
            </span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          onClick={() => router.push("/app/onboarding")}
          className="flex w-full items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">✏️</span>
            <span className="text-sm font-medium text-gray-700">
              Editar desafios
            </span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Subscription badge */}
      <div className="mb-5 rounded-2xl p-4 text-center" style={{ backgroundColor: "#EAF3DE" }}>
        <span className="text-sm font-bold" style={{ color: "#3B6D11" }}>
          ✨ Plano VIP — Acesso Vitalicio
        </span>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full rounded-2xl border border-red-200 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
      >
        Sair da conta
      </button>

      <AppNav />
    </div>
  );
}
