"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Tipos mínimos pro client — espelham os do lib/broto.ts.
// Deliberadamente NAO importamos do server pra evitar bundle bloat com prisma.
type BrotoStage = 1 | 2 | 3 | 4 | 5;
type BrotoMood = "animado" | "feliz" | "tranquilo" | "sonolento" | "saudoso";

export type BrotoState = {
  stage: BrotoStage;
  stageName: string;
  mood: BrotoMood;
  imageKey: string;
  message: string;
  daysSinceLastCheckin: number;
  signals: {
    streak: number;
    cyclesCompleted: number;
    currentCycleDay: number | null;
    habitsCheckedToday: number;
    waterCount: number;
    waterGoal: number;
    hasCheckinToday: boolean;
    cycleCompletedToday: boolean;
  };
};

// Hook reutilizavel — busca o estado do Broto e revalida quando refreshKey muda.
// refreshKey: passa um valor que muda toda vez que uma acao relevante acontece
// (toggleHabit, addWater, mood) pra Broto reagir em tempo real.
export function useBrotoState(refreshKey?: unknown): BrotoState | null {
  const [state, setState] = useState<BrotoState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/app/broto")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setState(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return state;
}

// Componente visual. Renderiza a imagem do stage atual com leve "breathing"
// animation (scale 1.0 -> 1.04 -> 1.0). Sem JS — só CSS.
//
// Pra moods especiais (saudoso, animado) aplica leve tint/glow via filter.
//
// Prop `celebrating` (default false): quando true, aplica "puff" animation
// (scale + glow forte + 8 sparkles ao redor) por 2s. Usado pra celebrar
// stage-up sem precisar de overlay modal.
export function BrotoAvatar({
  state,
  size = 200,
  priority = false,
  celebrating = false,
}: {
  state: BrotoState | null;
  size?: number;
  priority?: boolean;
  celebrating?: boolean;
}) {
  if (!state) {
    // Placeholder shimmer enquanto carrega
    return (
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #EAF3DE 0%, #D4E5BF 100%)",
          opacity: 0.5,
        }}
      />
    );
  }

  const filterByMood: Record<BrotoMood, string | undefined> = {
    animado: "drop-shadow(0 0 16px rgba(250, 204, 21, 0.35))",
    feliz: "drop-shadow(0 4px 12px rgba(99, 153, 34, 0.20))",
    tranquilo: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08))",
    sonolento: "grayscale(0.15) opacity(0.85)",
    saudoso: "grayscale(0.25) opacity(0.80)",
  };

  // Quando celebrating, glow dourado forte SOBRESCREVE o filter de mood
  // (o momento de stage-up eh sempre festivo, independente do humor anterior).
  const activeFilter = celebrating
    ? "drop-shadow(0 0 24px rgba(250, 204, 21, 0.7)) drop-shadow(0 0 12px rgba(99, 153, 34, 0.5))"
    : filterByMood[state.mood];

  return (
    <div
      className={celebrating ? "broto-celebrating relative" : "broto-breathing relative"}
      style={{
        width: size,
        height: size,
        filter: activeFilter,
      }}
      aria-label={`Broto ${state.stageName}, ${state.mood}`}
    >
      <Image
        src={state.imageKey}
        alt={`Seu Broto: ${state.stageName}`}
        width={size}
        height={size}
        priority={priority}
        unoptimized // PNG com transparencia, sem ganho real em otimizar
        style={{ objectFit: "contain", width: "100%", height: "100%" }}
      />

      {/* Sparkles ao redor — só renderizam durante celebracao.
          8 pontos posicionados em circulo via CSS transform. */}
      {celebrating && (
        <div className="broto-sparkles" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="broto-sparkle"
              style={{
                left: "50%",
                top: "50%",
                transform: `rotate(${i * 45}deg) translateY(-${size * 0.55}px)`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              ✨
            </span>
          ))}
        </div>
      )}

      <style jsx>{`
        .broto-breathing {
          animation: brotoBreath 4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .broto-celebrating {
          animation: brotoPuff 1.6s ease-out;
          transform-origin: center center;
        }
        .broto-sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .broto-sparkle {
          position: absolute;
          font-size: ${Math.max(14, size * 0.13)}px;
          opacity: 0;
          transform-origin: center center;
          animation: sparklePop 1.5s ease-out forwards;
        }
        @keyframes brotoBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }
        @keyframes brotoPuff {
          0% { transform: scale(1); }
          25% { transform: scale(1.25); }
          50% { transform: scale(0.95); }
          75% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        @keyframes sparklePop {
          0% { opacity: 0; transform: rotate(var(--rot, 0deg)) translateY(0px) scale(0.3); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: rotate(var(--rot, 0deg)) translateY(-${size * 0.7}px) scale(1.2); }
        }
      `}</style>
    </div>
  );
}

// Versão compacta com avatar + microcopy embaixo, pra usar em cards.
export function BrotoCard({
  state,
  size = 180,
  priority = false,
  celebrating = false,
}: {
  state: BrotoState | null;
  size?: number;
  priority?: boolean;
  celebrating?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <BrotoAvatar state={state} size={size} priority={priority} celebrating={celebrating} />
      {state && (
        <p
          className="mt-3 text-sm font-medium leading-snug"
          style={{ color: "#3B6D11", maxWidth: 280 }}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
