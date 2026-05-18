"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/app/app-nav";
import { BrotoSvg } from "@/components/app/broto-svg";

// /app/descobrir — Conteúdo passivo (catálogos, exploração, conteúdo livre).
// Hub visual com 3 destinos principais:
//   - Receitas (catálogo completo, 39 itens)
//   - Sobre o método (educacional)
//   - 21 missões livres (navegação fora do ciclo)
//
// Sem urgência, sem progresso visível. É o "lazer" do app — diferente
// do /Hoje (cobra ação) e da /Jornada (mostra evolução).

type Card = {
  href: string;
  emoji: string;
  title: string;
  description: string;
  cta: string;
  bg: string;
  fg: string;
};

const CARDS: Card[] = [
  {
    href: "/app/receitas",
    emoji: "🍳",
    title: "Receitas",
    description: "39 receitas leves, saudáveis, com base no método S.E.M.",
    cta: "Ver catálogo →",
    bg: "#FFF6E7",
    fg: "#8B5A0F",
  },
  {
    href: "/app/desafio",
    emoji: "🌿",
    title: "Os 21 dias do método",
    description: "Veja as 21 missões da jornada. Pode navegar mesmo fora do ciclo.",
    cta: "Explorar →",
    bg: "#EAF3DE",
    fg: "#3B6D11",
  },
  {
    href: "/app/como-usar",
    emoji: "📖",
    title: "Sobre o método",
    description: "S.E.M, ciclos, níveis, ciência por trás. Tudo num lugar só.",
    cta: "Ler →",
    bg: "#F0F7FF",
    fg: "#1e3a5f",
  },
];

export default function DescobrirPage() {
  // Mostra Broto pequeno só pra reforçar identidade — não compete pelo foco.
  // Aqui o foco eh nos cards de exploração.
  const [hasBroto, setHasBroto] = useState(false);
  useEffect(() => {
    fetch("/api/app/broto")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setHasBroto(!!d))
      .catch(() => {});
  }, []);

  return (
    <div className="px-5 pb-24 pt-6" style={{ background: "#FAF8F5", minHeight: "100vh" }}>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Descobrir</h1>
        {hasBroto && (
          <div style={{ opacity: 0.65 }}>
            <BrotoSvg stage={3} size={32} />
          </div>
        )}
      </div>
      <p className="mb-6 text-sm text-gray-500">
        Conteúdo e exploração. Sem pressão, sem cobrança — só pra você curtir.
      </p>

      <div className="flex flex-col gap-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="block rounded-2xl p-5 transition-transform active:scale-[0.98]"
            style={{ backgroundColor: c.bg }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-2xl"
                style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}
              >
                {c.emoji}
              </div>
              <div className="flex-1">
                <p className="text-base font-bold" style={{ color: c.fg }}>
                  {c.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: c.fg, opacity: 0.75 }}>
                  {c.description}
                </p>
                <p
                  className="mt-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: c.fg }}
                >
                  {c.cta}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Espacinho de respiro no fim — wellness premium */}
      <p
        className="mt-8 text-center text-[10px] uppercase tracking-wider text-gray-400"
      >
        Mais conteúdos chegando · respeitando seu tempo
      </p>

      <AppNav />
    </div>
  );
}
