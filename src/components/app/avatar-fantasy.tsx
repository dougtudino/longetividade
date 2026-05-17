"use client";
import { useMemo } from "react";

// Avatar fantasy/RPG evolutivo. 10 estagios baseados em level.
// SVG nativo, sem dependencias. Cada estagio adiciona detalhe visual:
//
//   Lvl 1-2: aventureira basica (capa cinza, vestes simples)
//   Lvl 3-4: capa marrom + cinto + faca
//   Lvl 5-6: armadura prata, capa azul, espada curta
//   Lvl 7-8: armadura ouro, capa purpura, espada longa
//   Lvl 9:   armadura ouro brilhante, gemas
//   Lvl 10:  aura dourada pulsando + coroa
//
// Visual aproximadamente isometrico/chibi pra caber em card.
// Cores baseadas em level usando funcoes helper.

type Tier = "basic" | "leather" | "silver" | "gold" | "shining" | "legendary";

function tierFromLevel(level: number): Tier {
  if (level >= 10) return "legendary";
  if (level >= 9) return "shining";
  if (level >= 7) return "gold";
  if (level >= 5) return "silver";
  if (level >= 3) return "leather";
  return "basic";
}

const TIER_COLORS: Record<Tier, {
  armor: string;
  armorShade: string;
  cape: string;
  capeShade: string;
  weapon: string;
  accent: string;
}> = {
  basic:     { armor: "#9CA3AF", armorShade: "#6B7280", cape: "#94A3B8", capeShade: "#64748B", weapon: "#475569", accent: "#A8A29E" },
  leather:   { armor: "#A16207", armorShade: "#713F12", cape: "#92400E", capeShade: "#78350F", weapon: "#57534E", accent: "#D97706" },
  silver:    { armor: "#CBD5E1", armorShade: "#94A3B8", cape: "#3B82F6", capeShade: "#1D4ED8", weapon: "#94A3B8", accent: "#60A5FA" },
  gold:      { armor: "#FACC15", armorShade: "#CA8A04", cape: "#7C3AED", capeShade: "#5B21B6", weapon: "#EAB308", accent: "#FBBF24" },
  shining:   { armor: "#FDE047", armorShade: "#EAB308", cape: "#9333EA", capeShade: "#7E22CE", weapon: "#FACC15", accent: "#FEF08A" },
  legendary: { armor: "#FEF3C7", armorShade: "#FBBF24", cape: "#A855F7", capeShade: "#7C3AED", weapon: "#FDE047", accent: "#FFFFFF" },
};

export type AvatarFantasyProps = {
  level: number; // 1..10
  size?: number; // px (default 120)
  showAura?: boolean; // forca aura visivel mesmo em lvl < 10 (pra animacao de level up)
};

export function AvatarFantasy({ level, size = 120, showAura }: AvatarFantasyProps) {
  const tier = tierFromLevel(level);
  const c = TIER_COLORS[tier];
  const auraOn = showAura ?? level >= 9;
  const hasGems = level >= 7;
  const hasCrown = level >= 10;

  // Items que aparecem por tier
  const hasFaca = level >= 3 && level < 5;
  const hasEspadaCurta = level >= 5 && level < 7;
  const hasEspadaLonga = level >= 7;
  const hasShield = level >= 5;

  const auraId = useMemo(() => `aura-${level}-${Math.random().toString(36).slice(2, 8)}`, [level]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id={auraId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.accent} stopOpacity={0.9} />
          <stop offset="60%" stopColor={c.accent} stopOpacity={0.3} />
          <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`armor-grad-${level}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.armor} />
          <stop offset="100%" stopColor={c.armorShade} />
        </linearGradient>
        <linearGradient id={`cape-grad-${level}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.cape} />
          <stop offset="100%" stopColor={c.capeShade} />
        </linearGradient>
      </defs>

      {/* Aura (lvl 9+) */}
      {auraOn && (
        <circle cx="60" cy="62" r="55" fill={`url(#${auraId})`}>
          <animate attributeName="r" values="50;58;50" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Capa traseira */}
      <path
        d="M 35 50 Q 30 95 40 105 L 80 105 Q 90 95 85 50 Z"
        fill={`url(#cape-grad-${level})`}
      />
      <path
        d="M 35 50 Q 30 95 40 105 L 80 105 Q 90 95 85 50 Z"
        fill="black"
        opacity="0.08"
      />

      {/* Corpo / vestes (armadura ou tunica) */}
      <rect x="45" y="55" width="30" height="38" rx="3" fill={`url(#armor-grad-${level})`} />
      <rect x="44" y="55" width="32" height="6" rx="2" fill={c.armorShade} />

      {/* Cinto */}
      <rect x="44" y="78" width="32" height="4" fill="#3F2F1B" />
      <rect x="58" y="78" width="4" height="4" fill={c.accent} />

      {/* Gemas no peito (lvl 7+) */}
      {hasGems && (
        <>
          <circle cx="60" cy="65" r="2.5" fill={c.accent}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="54" cy="68" r="1.5" fill={c.accent} opacity="0.7" />
          <circle cx="66" cy="68" r="1.5" fill={c.accent} opacity="0.7" />
        </>
      )}

      {/* Bracos */}
      <rect x="38" y="58" width="7" height="22" rx="3" fill={c.armorShade} />
      <rect x="75" y="58" width="7" height="22" rx="3" fill={c.armorShade} />

      {/* Pernas */}
      <rect x="48" y="92" width="8" height="18" rx="2" fill="#3F2F1B" />
      <rect x="64" y="92" width="8" height="18" rx="2" fill="#3F2F1B" />
      <rect x="46" y="108" width="12" height="5" rx="1" fill="#1F1611" />
      <rect x="62" y="108" width="12" height="5" rx="1" fill="#1F1611" />

      {/* Cabeca */}
      <circle cx="60" cy="38" r="14" fill="#F4D5B8" />
      {/* Cabelo */}
      <path
        d="M 46 38 Q 46 22 60 22 Q 74 22 74 38 L 72 30 Q 68 26 60 26 Q 52 26 48 30 Z"
        fill="#3F2F1B"
      />
      {/* Olhos */}
      <circle cx="55" cy="38" r="1.5" fill="#1F1611" />
      <circle cx="65" cy="38" r="1.5" fill="#1F1611" />
      {/* Boca discreta */}
      <path d="M 56 44 Q 60 46 64 44" stroke="#9C5710" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* Coroa (lvl 10) */}
      {hasCrown && (
        <g>
          <path
            d="M 48 22 L 51 14 L 55 19 L 60 12 L 65 19 L 69 14 L 72 22 Z"
            fill="#FDE047"
            stroke="#CA8A04"
            strokeWidth="0.8"
          />
          <circle cx="60" cy="16" r="1.5" fill="#A855F7" />
          <circle cx="52" cy="19" r="1" fill="#3B82F6" />
          <circle cx="68" cy="19" r="1" fill="#EF4444" />
        </g>
      )}

      {/* Armas */}
      {hasFaca && (
        <g>
          <rect x="80" y="70" width="2" height="10" fill={c.weapon} />
          <rect x="79" y="78" width="4" height="3" fill="#3F2F1B" />
        </g>
      )}
      {hasEspadaCurta && (
        <g>
          <rect x="80" y="60" width="2.5" height="22" fill={c.weapon} />
          <rect x="78" y="80" width="6.5" height="3" fill="#3F2F1B" />
          <circle cx="81.25" cy="58" r="1.5" fill={c.accent} />
        </g>
      )}
      {hasEspadaLonga && (
        <g>
          <rect x="80" y="50" width="3" height="32" fill={c.weapon} />
          <rect x="76" y="80" width="11" height="3" fill="#3F2F1B" />
          <circle cx="81.5" cy="48" r="2" fill={c.accent}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Escudo (lvl 5+) */}
      {hasShield && (
        <g>
          <path
            d="M 30 65 Q 26 65 26 70 L 26 82 Q 26 88 32 90 Q 38 88 38 82 L 38 70 Q 38 65 34 65 Z"
            fill={c.armor}
            stroke={c.armorShade}
            strokeWidth="1"
          />
          <path
            d="M 32 72 L 32 84 M 28 76 L 36 76"
            stroke={c.accent}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}

// Helper: nome do tier pra UI ("Aventureira Basica", "Cavaleira de Prata", etc)
export function tierLabel(level: number): string {
  const tier = tierFromLevel(level);
  switch (tier) {
    case "basic": return "Aventureira";
    case "leather": return "Batedora";
    case "silver": return "Cavaleira de Prata";
    case "gold": return "Cavaleira de Ouro";
    case "shining": return "Campea Brilhante";
    case "legendary": return "Lendaria Fenix";
  }
}
