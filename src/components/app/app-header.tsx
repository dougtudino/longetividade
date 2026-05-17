"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { APP_BRAND } from "@/config/app-brand";
import { useBrotoState } from "@/components/app/broto-avatar";

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
  // Mini Broto no header — presença continua em todas as telas.
  // refreshKey baseado no pathname pra revalidar quando a usuaria navega
  // entre telas (acabou de marcar habito numa, volta pra home, Broto reage).
  const brotoState = useBrotoState(pathname);

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

      {/* Logo: mini-Broto + 21 Dias + tagline empilhado.
          O Broto aqui usa o mesmo estado emocional do app — presenca
          continua. Tap no header inteiro leva pra home. */}
      <Link href="/app/home" className="flex items-center gap-1.5 leading-none">
        {brotoState && (
          <div
            style={{
              width: 32,
              height: 32,
              filter:
                brotoState.mood === "animado"
                  ? "drop-shadow(0 0 6px rgba(250, 204, 21, 0.45))"
                  : brotoState.mood === "saudoso" || brotoState.mood === "sonolento"
                    ? "grayscale(0.2) opacity(0.85)"
                    : undefined,
              flexShrink: 0,
              animation: "headerBrotoBreath 4s ease-in-out infinite",
              transformOrigin: "center bottom",
            }}
            aria-hidden="true"
          >
            <Image
              src={brotoState.imageKey}
              alt=""
              width={32}
              height={32}
              unoptimized
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </div>
        )}
        <div className="flex flex-col items-start leading-none">
          <span className="text-sm font-black" style={{ color: "#639922" }}>
            {APP_BRAND.name}
          </span>
          <span
            className="mt-0.5 text-[9px] font-semibold uppercase"
            style={{ color: "#9ca3af", letterSpacing: "0.08em" }}
          >
            {APP_BRAND.tagline}
          </span>
        </div>
        <style jsx>{`
          @keyframes headerBrotoBreath {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}</style>
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
