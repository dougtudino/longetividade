"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/app/app-nav";
import { BrotoAvatar, useBrotoState } from "@/components/app/broto-avatar";
import { APP_BRAND } from "@/config/app-brand";

// /app/eu — Identidade + configuracao consolidados.
// Substitui /perfil + /notificacoes + /como-usar + /mais.
// Estrutura: card de identidade no topo (foto/avatar + nome + Broto +
// stats minimos) seguido de lista de settings estilo iOS.

type Profile = { name: string; brotoName?: string; createdAt?: string };
type Stats = {
  level: number;
  levelName: string;
  totalCheckins: number;
  daysInMethod: number;
  achievementsEarned: number;
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

type LinkItem = {
  icon: string;
  label: string;
  description: string;
  href: string;
  danger?: boolean;
};

const LINKS: LinkItem[] = [
  {
    icon: "👤",
    label: "Meus dados",
    description: "Nome, peso, objetivo, nome do Broto",
    href: "/app/perfil",
  },
  {
    icon: "🔔",
    label: "Notificações",
    description: "Lembretes do Broto e horário silencioso",
    href: "/app/notificacoes",
  },
  {
    icon: "📖",
    label: "Como funciona",
    description: "Sobre o método 21 Dias, XP, ciclos e ciência",
    href: "/app/como-usar",
  },
  {
    icon: "💝",
    label: "Conquistas",
    description: "Galeria de todas as conquistas",
    href: "/app/conquistas",
  },
];

export default function EuPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [email, setEmail] = useState("");

  const [showReset, setShowReset] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const brotoState = useBrotoState(stats?.totalCheckins);

  useEffect(() => {
    fetch("/api/app/profile").then((r) => r.json()).then((d) => {
      if (d.profile) setProfile(d.profile);
    });
    fetch("/api/app/stats").then((r) => r.json()).then((d) => {
      setStats(d ?? null);
    });
    fetch("/api/app/me").then((r) => r.json()).then((d) => {
      if (d.email) setEmail(d.email);
    });
  }, []);

  async function handleLogout() {
    if (!confirm("Sair da conta neste dispositivo?")) return;
    await fetch("/api/app/logout", { method: "POST" });
    router.push("/app/login");
  }

  async function handleReset() {
    if (resetInput.trim().toUpperCase() !== "RESETAR") {
      setResetError("Digite RESETAR pra confirmar");
      return;
    }
    setResetting(true);
    setResetError(null);
    try {
      const r = await fetch("/api/app/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "RESETAR" }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setResetError(d.error ?? "Falha ao resetar");
        setResetting(false);
        return;
      }
      window.location.href = "/app";
    } catch (e) {
      setResetError((e as Error).message);
      setResetting(false);
    }
  }

  const levelColor = LEVEL_COLORS[stats?.level ?? 1] ?? "#639922";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="px-5 pb-24 pt-6" style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Eu</h1>
      <p className="mb-5 text-sm text-gray-500">Sua identidade e seus ajustes.</p>

      {/* ─── Card identidade ─── */}
      <div className="mb-5 rounded-2xl bg-white p-5 border border-gray-100">
        <div className="flex items-center gap-4">
          <div style={{ flexShrink: 0 }}>
            <BrotoAvatar state={brotoState} size={64} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 truncate">{profile?.name ?? "..."}</p>
            <p className="text-xs text-gray-400 truncate">{email || "..."}</p>
            {stats && (
              <p className="mt-0.5 text-xs font-medium" style={{ color: levelColor }}>
                Nível {stats.level} · {stats.levelName}
              </p>
            )}
          </div>
        </div>

        {stats && (
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.daysInMethod}</p>
              <p className="text-[10px] text-gray-500">dias no método</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.totalCheckins}</p>
              <p className="text-[10px] text-gray-500">check-ins</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.achievementsEarned}</p>
              <p className="text-[10px] text-gray-500">conquistas</p>
            </div>
          </div>
        )}

        {memberSince && (
          <p className="mt-3 text-center text-[10px] text-gray-400">
            Com {APP_BRAND.name} desde {memberSince}
          </p>
        )}
      </div>

      {/* ─── Lista de settings ─── */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-white border border-gray-100">
        {LINKS.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-4 transition-colors active:bg-gray-50"
            style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: "#EAF3DE" }}
            >
              {item.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{item.label}</p>
              <p className="text-[11px] text-gray-500">{item.description}</p>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        ))}
      </div>

      {/* ─── Logout ─── */}
      <button
        onClick={handleLogout}
        className="mb-5 w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm font-bold text-gray-500"
      >
        Sair da conta
      </button>

      {/* ─── Zona perigosa ─── */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-red-700">Zona perigosa</p>
        <p className="mt-1 text-[11px] text-red-700/80">
          Resetar apaga todo seu progresso (ciclos, hábitos, peso, conquistas, Broto). Sua conta e acesso VIP continuam.
        </p>
        <button
          onClick={() => {
            setShowReset(true);
            setResetInput("");
            setResetError(null);
          }}
          className="mt-3 w-full rounded-xl border border-red-300 bg-white p-3 text-sm font-bold text-red-700"
        >
          🔄 Resetar e começar do zero
        </button>
      </div>

      <p className="mt-6 text-center text-[10px] text-gray-400">
        {APP_BRAND.name} · {APP_BRAND.by} · {new Date().getFullYear()}
      </p>

      {/* Modal de confirmação do reset */}
      {showReset && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60"
          onClick={() => !resetting && setShowReset(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-red-700">⚠️ Resetar tudo?</h3>
              {!resetting && (
                <button
                  onClick={() => setShowReset(false)}
                  aria-label="Fechar"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-gray-400"
                >
                  ×
                </button>
              )}
            </div>
            <p className="mb-3 text-sm text-gray-700 leading-relaxed">
              Vai apagar <strong>tudo</strong>: ciclos, dias marcados, hábitos, peso, humor, conquistas, XP, marcos do {profile?.brotoName ?? "Broto"}.
              <br />
              <span className="text-gray-500">Sua conta e acesso ao app continuam normais.</span>
            </p>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
              Pra confirmar, digite RESETAR
            </p>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => {
                setResetInput(e.target.value);
                setResetError(null);
              }}
              placeholder="RESETAR"
              autoCapitalize="characters"
              className="mb-2 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm font-bold outline-none focus:border-red-500"
              disabled={resetting}
            />
            {resetError && <p className="mb-2 text-xs text-red-600">{resetError}</p>}
            <button
              onClick={handleReset}
              disabled={resetting || resetInput.trim().toUpperCase() !== "RESETAR"}
              className="mt-2 w-full rounded-xl bg-red-600 p-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {resetting ? "Resetando..." : "Sim, apagar tudo e recomeçar"}
            </button>
            <button
              onClick={() => setShowReset(false)}
              disabled={resetting}
              className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-sm font-bold text-gray-600 disabled:opacity-40"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <AppNav />
    </div>
  );
}
