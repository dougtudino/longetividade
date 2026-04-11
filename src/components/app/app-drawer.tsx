"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
};

type ProfileData = {
  name: string;
};

type LevelData = {
  level: number;
  levelName: string;
  xp: number;
  nextLevelXp: number;
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

const MENU_ITEMS = [
  { href: "/app/agua", icon: "💧", label: "Agua" },
  { href: "/app/movimento", icon: "🏃‍♀️", label: "Movimento" },
  { href: "/app/progresso", icon: "📊", label: "Progresso" },
  { href: "/app/conquistas", icon: "🏆", label: "Conquistas" },
  { href: "/app/perfil", icon: "👤", label: "Meu Perfil" },
  { href: "/app/desafio", icon: "🎯", label: "Desafio 21 Dias" },
];

export function AppDrawer({ open, onClose }: DrawerProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [level, setLevel] = useState<LevelData | null>(null);

  useEffect(() => {
    if (open) {
      fetch("/api/app/profile")
        .then((r) => r.json())
        .then((d) => setProfile(d.profile));
      fetch("/api/app/stats")
        .then((r) => r.json())
        .then((d) =>
          setLevel({
            level: d.level,
            levelName: d.levelName,
            xp: d.xp,
            nextLevelXp: d.nextLevelXp,
          })
        );
    }
  }, [open]);

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const levelColor = LEVEL_COLORS[level?.level ?? 1] ?? "#639922";
  const xpPercent =
    level && level.nextLevelXp > 0
      ? Math.min(Math.round((level.xp / level.nextLevelXp) * 100), 100)
      : 0;
  const xpRemaining = level ? Math.max(0, level.nextLevelXp - level.xp) : 0;

  async function handleLogout() {
    try {
      await fetch("/api/app/logout", { method: "POST" });
    } catch {
      /* mesmo se falhar, segue pro login */
    }
    window.location.href = "/app/login";
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        className="fixed top-0 left-0 z-50 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out"
        style={{
          width: 280,
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
          aria-label="Fechar menu"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* User profile section */}
        <div className="px-5 pt-12 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: levelColor }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {profile?.name ?? "..."}
              </p>
              {level && (
                <p
                  className="text-xs font-medium"
                  style={{ color: levelColor }}
                >
                  Nivel {level.level} — {level.levelName}
                </p>
              )}
            </div>
          </div>

          {/* XP progress bar */}
          {level && (
            <div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${xpPercent}%`,
                    backgroundColor: levelColor,
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-gray-400">
                {level.xp} XP — {xpRemaining} XP para o proximo nivel
              </p>
            </div>
          )}
        </div>

        {/* Menu items */}
        <nav className="px-3 py-4">
          {MENU_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors"
                style={{
                  backgroundColor: active ? "#EAF3DE" : "transparent",
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span
                  className="text-sm font-medium"
                  style={{ color: active ? "#639922" : "#374151" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 h-px bg-gray-100" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-red-50"
          >
            <span className="text-lg">🚪</span>
            <span className="text-sm font-medium text-red-500">Sair</span>
          </button>
        </nav>
      </div>
    </>
  );
}
