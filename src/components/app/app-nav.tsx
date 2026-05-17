"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function IconHome({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconHabits({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconDesafio({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconReceitas({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function IconEmocional({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : "none"} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/app/habitos", label: "Hábitos", Icon: IconHabits, isHero: false },
  { href: "/app/desafio", label: "Desafio", Icon: IconDesafio, isHero: false },
  { href: "/app/home", label: "Jogo", Icon: IconHome, isHero: true },
  { href: "/app/receitas", label: "Receitas", Icon: IconReceitas, isHero: false },
  { href: "/app/emocional", label: "Emocional", Icon: IconEmocional, isHero: false },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 border-t border-gray-100 bg-white/95 backdrop-blur-sm"
      style={{ maxWidth: 430 }}
    >
      <style>{`
        @keyframes pulseHero {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,153,34,0.45); }
          50% { box-shadow: 0 0 0 8px rgba(99,153,34,0); }
        }
      `}</style>
      <div className="flex items-end justify-around pb-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          // O botao Jogo (centro) eh destacado como hero: maior, elevado,
          // gradiente e pulse pra puxar o olho — onde a usuaria registra.
          if (item.isHero) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center"
                style={{ WebkitTapHighlightColor: "transparent", marginTop: -18 }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 56,
                    height: 56,
                    background: "linear-gradient(135deg, #7BC34A 0%, #639922 50%, #3D5A3E 100%)",
                    boxShadow: "0 6px 16px rgba(99,153,34,0.4)",
                    animation: !active ? "pulseHero 2.4s ease-in-out infinite" : "none",
                    border: "3px solid white",
                  }}
                >
                  {/* Icone fica branco em hero */}
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <span
                  className="mt-1 text-[10px] font-black uppercase tracking-wider"
                  style={{ color: active ? "#3D5A3E" : "#639922" }}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-2 py-2"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {active && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full"
                  style={{ width: 24, backgroundColor: "#639922" }}
                />
              )}
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
