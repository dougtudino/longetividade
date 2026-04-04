"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconHome({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconWater({ active }: { active: boolean }) {
  const color = active ? "#378ADD" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function IconHabits({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconMove({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <path d="M6.5 8h11" />
      <path d="M12 8v5" />
      <path d="M7 21l3-8" />
      <path d="M17 21l-3-8" />
    </svg>
  );
}

function IconEmocional({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/app/home", label: "Inicio", Icon: IconHome },
  { href: "/app/agua", label: "Agua", Icon: IconWater },
  { href: "/app/habitos", label: "Habitos", Icon: IconHabits },
  { href: "/app/movimento", label: "Movimento", Icon: IconMove },
  { href: "/app/emocional", label: "Emocional", Icon: IconEmocional },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 border-t border-gray-100 bg-white/95 backdrop-blur-sm"
      style={{ maxWidth: 430 }}
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-2 py-2"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Active top bar indicator */}
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full"
                  style={{ width: 24, backgroundColor: "#639922" }}
                />
              )}

              {/* Tap feedback circle */}
              <div
                className="flex items-center justify-center rounded-full transition-colors"
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: active ? "#EAF3DE" : "transparent",
                }}
              >
                <item.Icon active={active} />
              </div>

              <span
                className="text-[10px] font-medium"
                style={{ color: active ? "#639922" : "#9ca3af" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
