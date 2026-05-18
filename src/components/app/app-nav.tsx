"use client";
import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_SIZE = 22;

// ─── Icons ────────────────────────────────────────────────
// SVGs inline, 22px, single color via stroke prop.
// Estilo: outlined, sem fill (estilo Finch/Fabulous). Active = verde
// principal, inactive = cinza neutro.

function IconHoje({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  // Casinha simples
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" />
    </svg>
  );
}

function IconJornada({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  // Trajeto crescente com ponto no topo
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18 L8 13 L13 16 L20 7" />
      <circle cx="20" cy="7" r="1.5" fill={color} />
    </svg>
  );
}

function IconDescobrir({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  // Compass / bússola simples
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="15.5 8.5 11 11 8.5 15.5 13 13" fill={color} stroke="none" />
    </svg>
  );
}

function IconEu({ active }: { active: boolean }) {
  const color = active ? "#639922" : "#9ca3af";
  // Person
  return (
    <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7" />
    </svg>
  );
}

// ─── Nav 4 abas ────────────────────────────────────────────
// Decisão de produto (2026-05-18): demolir nav fragmentada (3 abas com
// /mais drawer + páginas paralelas) e consolidar em 4 destinos claros:
//   HOJE      — ritual diário (Broto + missão + cuidados)
//   JORNADA   — timeline emocional (era /evolucao + /progresso + /conquistas)
//   DESCOBRIR — conteúdo passivo (receitas + sobre método + missões)
//   EU        — identidade + config (era /perfil + /notificacoes + /mais + /como-usar)
//
// Sem hero center destacada (estilo "Jogo" antigo) — todas equivalentes,
// estilo Apple / Material / Finch. Active marker = pill verde no ícone.

type Tab = {
  href: string;
  label: string;
  Icon: (p: { active: boolean }) => ReactElement;
  match: (path: string) => boolean;
};

const TABS: Tab[] = [
  {
    href: "/app/home",
    label: "Hoje",
    Icon: IconHoje,
    match: (p) => p === "/app/home" || p === "/app" || p.startsWith("/app/desafio"),
  },
  {
    href: "/app/jornada",
    label: "Jornada",
    Icon: IconJornada,
    match: (p) =>
      p.startsWith("/app/jornada") ||
      p.startsWith("/app/evolucao") ||
      p.startsWith("/app/progresso") ||
      p.startsWith("/app/conquistas"),
  },
  {
    href: "/app/descobrir",
    label: "Descobrir",
    Icon: IconDescobrir,
    match: (p) =>
      p.startsWith("/app/descobrir") ||
      p.startsWith("/app/receitas"),
  },
  {
    href: "/app/eu",
    label: "Eu",
    Icon: IconEu,
    match: (p) =>
      p.startsWith("/app/eu") ||
      p.startsWith("/app/perfil") ||
      p.startsWith("/app/notificacoes") ||
      p.startsWith("/app/como-usar") ||
      p.startsWith("/app/emocional") ||
      p.startsWith("/app/mais"),
  },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 border-t border-gray-100 bg-white/95 backdrop-blur-sm"
      style={{ maxWidth: 430 }}
    >
      <div className="flex items-end justify-around pb-1 pt-1">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 px-2 py-2"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-current={active ? "page" : undefined}
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
                <tab.Icon active={active} />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? "#639922" : "#9ca3af" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
