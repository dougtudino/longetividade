"use client";

import { useEffect, useState } from "react";

export function NavBar() {
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowCta(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="mx-auto max-w-7xl px-4 md:px-10 flex items-center justify-between h-14 md:h-16">
        <span className="font-heading text-olive font-bold text-lg md:text-xl">
          Emagreca sem Dieta
        </span>
        <a
          href="#pricing"
          className={`hidden md:inline-flex items-center px-5 py-2 bg-sage text-white font-body font-bold text-sm rounded-lg transition-all duration-300 hover:bg-olive ${
            showCta
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          QUERO O METODO S.E.M
        </a>
      </div>
    </nav>
  );
}
