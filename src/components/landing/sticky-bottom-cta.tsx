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
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a
        href="#pricing"
        className="flex items-center justify-center h-16 text-white font-body font-bold text-sm shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
        style={{backgroundColor: 'var(--accent)'}}
      >
        QUERO O METODO S.E.M -- R$ 67
      </a>
    </div>
  );
}
