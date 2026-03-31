"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "neon";

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("light", "neon");
  if (theme === "light") html.classList.add("light");
  if (theme === "neon") html.classList.add("neon");
  // dark = no extra class (default CSS vars)
}

const CYCLE: Theme[] = ["light", "dark", "neon"];

const ICONS: Record<Theme, React.ReactNode> = {
  light: (
    // Sun — switch to dark
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  dark: (
    // Moon — switch to neon
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  ),
  neon: (
    // Sparkle — switch to light
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
      <path d="M19 16l.75 2.25L22 19l-2.25.75L19 22l-.75-2.25L16 19l2.25-.75L19 16z" opacity=".6"/>
      <path d="M5 16l.6 1.8L7.4 18l-1.8.6L5 20.4l-.6-1.8L2.6 18l1.8-.6L5 16z" opacity=".4"/>
    </svg>
  ),
};

const LABELS: Record<Theme, string> = {
  light: "Modo claro — clique para escuro",
  dark: "Modo escuro — clique para neon",
  neon: "Modo neon — clique para claro",
};

const BUTTON_STYLE: Record<Theme, string> = {
  light: "border-black/10 bg-black/5 text-black/50 hover:border-black/20 hover:text-black/80",
  dark: "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80",
  neon: "border-pink-500/40 bg-pink-500/10 text-pink-400 hover:border-pink-500/70 hover:text-pink-300",
};

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("theme") as Theme) ?? "light";
    const valid: Theme = CYCLE.includes(saved) ? saved : "light";
    setTheme(valid);
    applyTheme(valid);
  }, []);

  function toggle() {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
    document.documentElement.classList.add("theme-transitioning");
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 300);
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={LABELS[theme]}
      title={LABELS[theme]}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${BUTTON_STYLE[theme]} ${
        theme === "neon" ? "shadow-[0_0_8px_rgba(255,31,143,0.4)]" : ""
      } ${className}`}
    >
      {ICONS[theme]}
    </button>
  );
}
