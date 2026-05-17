"use client";

import { PLAN_BASICO } from "@/config/plans";
import ThemeToggle from "@/components/ThemeToggle";

interface DetoxNavProps {
  onCtaClick: () => void;
}

export function DetoxNav({ onCtaClick }: DetoxNavProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: "rgba(250, 247, 240, 0.92)",
        borderColor: "var(--border-default)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <a
          href="#"
          className="font-heading font-bold text-base md:text-lg flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <span className="text-xl">📅</span>
          <span className="hidden sm:inline">Calendário Detox</span>
        </a>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href={PLAN_BASICO.checkoutUrl}
            onClick={onCtaClick}
            data-cta="nav-detox"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl py-2.5 px-4 md:px-5 text-sm md:text-base font-bold text-white transition-all hover:scale-[1.02]"
            style={{ backgroundColor: "var(--accent)" }}
          >
            <span className="hidden md:inline">Quero meu kit</span>
            <span className="md:hidden">R$67</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
