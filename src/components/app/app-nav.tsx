"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/app/home", label: "Inicio", icon: "🏠" },
  { href: "/app/agua", label: "Agua", icon: "💧" },
  { href: "/app/habitos", label: "Habitos", icon: "✅" },
  { href: "/app/movimento", label: "Movimento", icon: "🏃" },
  { href: "/app/progresso", label: "Progresso", icon: "📊" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 border-t border-gray-100 bg-white/95 backdrop-blur-sm" style={{ maxWidth: 430 }}>
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <span className="text-xl">{item.icon}</span>
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
