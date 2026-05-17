"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { APP_BRAND } from "@/config/app-brand";

type Profile = {
  name: string;
};

// AppHeader simplificado em 2026-05-17 (Onda 2 do diagnóstico):
// - Hamburger + Drawer removidos (eram caminho paralelo a AppNav.Mais —
//   2 entradas pro mesmo destino confundia)
// - Streak agora vem de /api/app/stats (era loop N+1 de 30 fetchs)
// - Sino agora navega pra /app/notificacoes
// - Logo agora reflete brand "21 Dias"
export function AppHeader() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState(0);

  const hiddenRoutes = ["/app/login", "/app/onboarding", "/app/cadastro"];
  const isHidden = hiddenRoutes.some((r) => pathname?.startsWith(r));

  useEffect(() => {
    if (isHidden) return;

    fetch("/api/app/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile))
      .catch(() => {});

    // Streak via endpoint agregado (server calcula com lib/streaks que
    // ja respeita TZ BR). Antes era loop de 30 fetchs sequenciais.
    fetch("/api/app/stats")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.streak === "number") setStreak(d.streak);
      })
      .catch(() => {});
  }, [isHidden]);

  if (isHidden) return null;

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
      {/* Left: Streak */}
      <div className="flex items-center gap-1.5">
        <span className="text-lg">🔥</span>
        <span className="text-sm font-bold" style={{ color: "#BA7517" }}>
          {streak}
        </span>
      </div>

      {/* Logo: 21 Dias + tagline empilhado (responde "21 dias de quê?") */}
      <Link href="/app/home" className="flex flex-col items-center leading-none">
        <span className="text-sm font-black" style={{ color: "#639922" }}>
          {APP_BRAND.name}
        </span>
        <span
          className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider"
          style={{ color: "#9ca3af", letterSpacing: "0.08em" }}
        >
          {APP_BRAND.tagline}
        </span>
      </Link>

      {/* Right: Notif + Avatar */}
      <div className="flex items-center gap-2">
        <Link
          href="/app/notificacoes"
          className="flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Notificações"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </Link>

        <Link
          href="/app/perfil"
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: "#639922" }}
          aria-label="Meu perfil"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
