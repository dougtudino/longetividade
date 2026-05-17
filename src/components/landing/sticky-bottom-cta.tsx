"use client";

import { useEffect, useState } from "react";

export function StickyBottomCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const pricingSection = document.getElementById("pricing");

      if (pricingSection) {
        const rect = pricingSection.getBoundingClientRect();
        const isInPricing = rect.top < window.innerHeight && rect.bottom > 0;

        setVisible(scrollY > 800 && !isInPricing);
      } else {
        setVisible(scrollY > 800);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 px-3 pb-3 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a
        href="#pricing"
        className="group flex items-center justify-between gap-3 h-14 px-5 rounded-2xl text-white font-body font-bold text-sm"
        style={{
          background:
            "linear-gradient(145deg, var(--accent), var(--accent-hover))",
          boxShadow:
            "0 18px 36px -10px rgba(0,0,0,0.35), 0 8px 16px -6px rgba(0,0,0,0.18)",
        }}
      >
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-[0.15em] opacity-85 font-bold">
            Calendário Detox
          </span>
          <span className="text-[15px]">Quero meu calendário · R$67</span>
        </span>
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-transform group-active:translate-x-0.5"
          style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
        >
          →
        </span>
      </a>
    </div>
  );
}
