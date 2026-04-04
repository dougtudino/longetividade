"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Profile = {
  name: string;
};

export function AppHeader() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState(0);

  const hiddenRoutes = ["/app/login", "/app/onboarding"];
  const isHidden = hiddenRoutes.some((r) => pathname?.startsWith(r));

  useEffect(() => {
    if (isHidden) return;

    fetch("/api/app/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile));

    // Calculate streak: consecutive days with at least 1 checkin
    async function calcStreak() {
      let count = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        try {
          const res = await fetch(`/api/app/checkin?date=${dateStr}`);
          const data = await res.json();
          if (data.checkin) {
            count++;
          } else {
            break;
          }
        } catch {
          break;
        }
      }
      setStreak(count);
    }
    calcStreak();
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
      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <span className="text-lg">🔥</span>
        <span className="text-sm font-bold" style={{ color: "#BA7517" }}>
          {streak}
        </span>
      </div>

      {/* Logo */}
      <span className="text-sm font-bold" style={{ color: "#639922" }}>
        Longetividade
      </span>

      {/* Profile avatar + notification */}
      <div className="flex items-center gap-3">
        {/* Notification bell (placeholder) */}
        <button className="relative" aria-label="Notificacoes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* Avatar initial */}
        <Link
          href="/app/home"
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: "#639922" }}
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
