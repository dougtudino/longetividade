"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/app/app-nav";
import { APP_BRAND } from "@/config/app-brand";

const ITEMS: Array<{ icon: string; label: string; desc: string; path: string }> = [
  { icon: "👤", label: "Meu perfil", desc: "Nome, meta, dados", path: "/app/perfil" },
  { icon: "🔔", label: "Notificações", desc: "Lembretes e horário silencioso", path: "/app/notificacoes" },
  { icon: "🍳", label: "Catálogo de receitas", desc: "Todas as 39 receitas", path: "/app/receitas" },
  { icon: "💝", label: "Conquistas completas", desc: "Galeria de badges + nível", path: "/app/conquistas" },
  { icon: "🎯", label: "Ver os 21 dias do desafio", desc: "Pausar, reiniciar, histórico", path: "/app/desafio" },
  { icon: "💚", label: "Respiração guiada", desc: "Triggers e nota de humor", path: "/app/emocional" },
  { icon: "📖", label: "Como usar o app", desc: "Sistema de pontos, níveis, benefícios", path: "/app/como-usar" },
];

export default function MaisPage() {
  const router = useRouter();
  const [showReset, setShowReset] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

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
      // Redireciona pro index do app — o /app/page.tsx vai detectar que
      // não existe AppProfile e mandar pra /app/onboarding.
      window.location.href = "/app";
    } catch (e) {
      setResetError((e as Error).message);
      setResetting(false);
    }
  }

  return (
    <div className="px-5 pb-24 pt-6" style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Mais</h1>
      <p className="mb-5 text-sm text-gray-500">Configurações, catálogos completos e ajuda.</p>

      <div className="flex flex-col gap-2">
        {ITEMS.map((it) => (
          <Link
            key={it.path}
            href={it.path}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 transition-transform active:scale-[0.98]"
            style={{ border: "1px solid #f3f4f6" }}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl" style={{ backgroundColor: "#EAF3DE" }}>
              {it.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{it.label}</p>
              <p className="text-[11px] text-gray-500">{it.desc}</p>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 w-full rounded-2xl border border-gray-200 p-4 text-sm font-bold text-gray-500"
      >
        Sair da conta
      </button>

      {/* ─── Zona perigosa ─── */}
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-red-700">Zona perigosa</p>
        <p className="mt-1 text-[11px] text-red-700/80">
          Resetar apaga todo seu progresso (ciclos, hábitos, peso, conquistas) e te devolve ao onboarding.
          Sua conta e acesso VIP continuam.
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
              Vai apagar <strong>tudo</strong>: ciclos, dias marcados, hábitos, peso, humor, conquistas, XP.
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
            {resetError && (
              <p className="mb-2 text-xs text-red-600">{resetError}</p>
            )}
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
