"use client";
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

  async function handleLogout() {
    if (!confirm("Sair da conta neste dispositivo?")) return;
    await fetch("/api/app/logout", { method: "POST" });
    router.push("/app/login");
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

      <p className="mt-6 text-center text-[10px] text-gray-400">
        {APP_BRAND.name} · {APP_BRAND.by} · {new Date().getFullYear()}
      </p>

      <AppNav />
    </div>
  );
}
