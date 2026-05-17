"use client";
import { useMemo } from "react";

// Avatar fantasy/RPG feminino evolutivo. 10 estagios baseados em level.
// SVG nativo. Cabelo longo ondulado descendo pelas costas.
// Paleta feminina: pessego/lilas (basics) -> rosa/lavanda (medio)
// -> rose gold (avancado) -> dourado luminoso com aura (lendario).
//
//   Lvl 1-2: Aprendiz — vestido lilas claro, cabelo solto
//   Lvl 3-4: Druida — vestes rosa-lavanda + cinto + adaga
//   Lvl 5-6: Sacerdotisa — vestido azul-rosado + ciajo + medalhao
//   Lvl 7-8: Cavaleira Rosa — armadura rose-gold + capa magenta + espada
//   Lvl 9:   Campea Brilhante — armadura brilhante + aura rosa-dourada
//   Lvl 10:  Lendaria Fenix — coroa floral + aura dourada pulsando

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
  hair: string;
  hairShade: string;
}> = {
  basic:     { armor: "#E0BBE4", armorShade: "#9C8BAE", cape: "#D8BFD8", capeShade: "#A084A8", weapon: "#8B7AAE", accent: "#F5C9D9", hair: "#6B4226", hairShade: "#3D2614" },
  leather:   { armor: "#F4B7C8", armorShade: "#C97B91", cape: "#E07A9B", capeShade: "#B85A78", weapon: "#7B4B5A", accent: "#FFC9DB", hair: "#7A4830", hairShade: "#4A2A1B" },
  silver:    { armor: "#F0C4D6", armorShade: "#C994AC", cape: "#A7B8E8", capeShade: "#6D86C9", weapon: "#D1B5C5", accent: "#FFD6E8", hair: "#5A3A2A", hairShade: "#3B2418" },
  gold:      { armor: "#F5C9A8", armorShade: "#D49467", cape: "#E91E63", capeShade: "#AD1457", weapon: "#E0A07A", accent: "#FFB89C", hair: "#4A2C1B", hairShade: "#2E1A0E" },
  shining:   { armor: "#FFD7B5", armorShade: "#E6A87A", cape: "#FF4081", capeShade: "#C2185B", weapon: "#FFB088", accent: "#FFD9C2", hair: "#3D241A", hairShade: "#21120B" },
  legendary: { armor: "#FFF0DC", armorShade: "#FFC78E", cape: "#FF1493", capeShade: "#C71585", weapon: "#FFD180", accent: "#FFFFFF", hair: "#2E170D", hairShade: "#180A05" },
};

export type AvatarFantasyProps = {
  level: number; // 1..10
  size?: number; // px (default 120)
  showAura?: boolean;
};

export function AvatarFantasy({ level, size = 120, showAura }: AvatarFantasyProps) {
  const tier = tierFromLevel(level);
  const c = TIER_COLORS[tier];
  const auraOn = showAura ?? level >= 9;
  const hasGems = level >= 7;
  const hasFloralCrown = level >= 10;
  const hasTiara = level >= 9 && level < 10;
  const hasMedalhao = level >= 5 && level < 7;
  const hasStaff = level >= 5 && level < 7;
  const hasAdaga = level >= 3 && level < 5;
  const hasSword = level >= 7;
  const hasEarrings = level >= 5;

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
          <stop offset="60%" stopColor={c.cape} stopOpacity={0.4} />
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
        <linearGradient id={`hair-grad-${level}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.hair} />
          <stop offset="100%" stopColor={c.hairShade} />
        </linearGradient>
      </defs>

      {/* Aura (lvl 9+) */}
      {auraOn && (
        <circle cx="60" cy="62" r="55" fill={`url(#${auraId})`}>
          <animate attributeName="r" values="50;58;50" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Cabelo longo POSTERIOR (atras da capa, descendo pelas costas) */}
      <path
        d="M 38 35 Q 30 60 32 95 Q 33 105 40 110 L 80 110 Q 87 105 88 95 Q 90 60 82 35 Q 78 30 60 28 Q 42 30 38 35 Z"
        fill={`url(#hair-grad-${level})`}
      />
      {/* Mechas onduladas pra dar movimento */}
      <path
        d="M 35 50 Q 38 65 36 80 Q 35 90 38 100"
        stroke={c.hairShade}
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      <path
        d="M 85 50 Q 82 65 84 80 Q 85 90 82 100"
        stroke={c.hairShade}
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />

      {/* Capa flowy */}
      <path
        d="M 37 52 Q 28 95 38 108 L 82 108 Q 92 95 83 52 Q 75 48 60 48 Q 45 48 37 52 Z"
        fill={`url(#cape-grad-${level})`}
      />
      {/* Sombra na capa */}
      <path
        d="M 37 52 Q 28 95 38 108 L 60 108 Q 52 95 50 52 Q 43 48 37 52 Z"
        fill="black"
        opacity="0.1"
      />

      {/* Vestido / armadura — peito feminino */}
      <path
        d="M 44 58 Q 44 54 48 54 L 72 54 Q 76 54 76 58 L 78 92 L 42 92 Z"
        fill={`url(#armor-grad-${level})`}
      />
      {/* Detalhe decotado V */}
      <path
        d="M 50 54 L 60 65 L 70 54"
        stroke={c.armorShade}
        strokeWidth="1.5"
        fill="none"
      />

      {/* Cintura/cinto */}
      <rect x="44" y="78" width="32" height="3" rx="1" fill={c.capeShade} />
      <circle cx="60" cy="79.5" r="1.8" fill={c.accent} />

      {/* Gemas decorativas no peito (lvl 7+) */}
      {hasGems && (
        <>
          <circle cx="60" cy="69" r="2" fill={c.accent}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="55" cy="72" r="1.2" fill={c.accent} opacity="0.7" />
          <circle cx="65" cy="72" r="1.2" fill={c.accent} opacity="0.7" />
        </>
      )}

      {/* Medalhao (lvl 5-6) */}
      {hasMedalhao && (
        <g>
          <circle cx="60" cy="68" r="3" fill={c.accent} stroke={c.armorShade} strokeWidth="0.8" />
          <circle cx="60" cy="68" r="1.2" fill={c.capeShade} />
          <line x1="60" y1="56" x2="60" y2="65" stroke={c.armorShade} strokeWidth="0.5" />
        </g>
      )}

      {/* Bracos finos */}
      <path
        d="M 42 58 Q 38 70 39 82 L 43 82 Q 45 70 46 58 Z"
        fill={c.armorShade}
      />
      <path
        d="M 78 58 Q 82 70 81 82 L 77 82 Q 75 70 74 58 Z"
        fill={c.armorShade}
      />

      {/* Saia em A (mais feminino que pernas retas) */}
      <path
        d="M 42 88 L 38 112 L 82 112 L 78 88 Z"
        fill={c.capeShade}
        opacity="0.85"
      />
      {/* Detalhe da saia */}
      <path
        d="M 50 88 L 48 112 M 60 88 L 60 112 M 70 88 L 72 112"
        stroke={c.armor}
        strokeWidth="0.6"
        opacity="0.5"
      />

      {/* Pes/sapatilhas */}
      <ellipse cx="48" cy="113" rx="5" ry="2" fill={c.weapon} />
      <ellipse cx="72" cy="113" rx="5" ry="2" fill={c.weapon} />

      {/* Cabelo FRONTAL — franja + mechas que caem na frente */}
      <path
        d="M 46 30 Q 50 22 60 22 Q 70 22 74 30 Q 70 35 60 35 Q 50 35 46 30 Z"
        fill={`url(#hair-grad-${level})`}
      />
      {/* Mecha lateral esquerda caindo na frente */}
      <path
        d="M 46 35 Q 44 48 47 55"
        stroke={c.hairShade}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Mecha lateral direita */}
      <path
        d="M 74 35 Q 76 48 73 55"
        stroke={c.hairShade}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Rosto */}
      <circle cx="60" cy="40" r="11" fill="#F8D5BC" />
      {/* Bochecha rosa (rubor) */}
      <ellipse cx="53" cy="44" rx="2" ry="1.2" fill="#FFB3C1" opacity="0.6" />
      <ellipse cx="67" cy="44" rx="2" ry="1.2" fill="#FFB3C1" opacity="0.6" />
      {/* Olhos com cilios (femininos) */}
      <ellipse cx="55" cy="40" rx="1.5" ry="2" fill="#3D2614" />
      <ellipse cx="65" cy="40" rx="1.5" ry="2" fill="#3D2614" />
      <path d="M 53 37 Q 54 36 55 36 M 65 36 Q 66 36 67 37" stroke="#3D2614" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Sobrancelhas delicadas */}
      <path d="M 52 35 Q 55 34 57 35" stroke={c.hairShade} strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M 63 35 Q 65 34 68 35" stroke={c.hairShade} strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Boca com batom rosa */}
      <path d="M 56 46 Q 60 48 64 46 Q 60 47.5 56 46 Z" fill="#E91E63" />

      {/* Brincos (lvl 5+) */}
      {hasEarrings && (
        <>
          <circle cx="48.5" cy="42" r="1" fill={c.accent} />
          <circle cx="71.5" cy="42" r="1" fill={c.accent} />
        </>
      )}

      {/* Tiara (lvl 9) */}
      {hasTiara && (
        <g>
          <path
            d="M 47 25 Q 60 18 73 25 L 73 28 Q 60 22 47 28 Z"
            fill={c.accent}
            stroke={c.armorShade}
            strokeWidth="0.5"
          />
          <circle cx="60" cy="22" r="1.8" fill={c.cape}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {/* Coroa floral (lvl 10) */}
      {hasFloralCrown && (
        <g>
          <path
            d="M 44 26 Q 60 16 76 26"
            stroke="#9C5710"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Flores ao longo da coroa */}
          <g>
            <circle cx="48" cy="24" r="2.5" fill="#FF1493" />
            <circle cx="48" cy="24" r="1" fill="#FFD180" />
          </g>
          <g>
            <circle cx="55" cy="20" r="2" fill="#FFD180" />
            <circle cx="55" cy="20" r="0.8" fill="#FF1493" />
          </g>
          <g>
            <circle cx="60" cy="18" r="2.8" fill="#FFFFFF" />
            <circle cx="60" cy="18" r="1.2" fill="#FF69B4" />
          </g>
          <g>
            <circle cx="65" cy="20" r="2" fill="#FFD180" />
            <circle cx="65" cy="20" r="0.8" fill="#FF1493" />
          </g>
          <g>
            <circle cx="72" cy="24" r="2.5" fill="#FF1493" />
            <circle cx="72" cy="24" r="1" fill="#FFD180" />
          </g>
        </g>
      )}

      {/* Adaga (lvl 3-4) — pequena, elegante */}
      {hasAdaga && (
        <g>
          <rect x="80" y="72" width="1.5" height="9" fill={c.weapon} />
          <rect x="78" y="79" width="5" height="2" fill={c.capeShade} />
          <circle cx="80.75" cy="71" r="1" fill={c.accent} />
        </g>
      )}

      {/* Cajado/staff (lvl 5-6) */}
      {hasStaff && (
        <g>
          <rect x="80" y="45" width="2" height="40" fill={c.hairShade} />
          <circle cx="81" cy="44" r="3.5" fill={c.accent} stroke={c.cape} strokeWidth="1">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="81" cy="44" r="1.5" fill={c.cape} />
        </g>
      )}

      {/* Espada (lvl 7+) — feminina, com detalhe */}
      {hasSword && (
        <g>
          <rect x="80" y="50" width="2.5" height="30" fill={c.weapon} />
          <rect x="77" y="78" width="8" height="2.5" rx="1" fill={c.capeShade} />
          <circle cx="81.25" cy="48" r="2" fill={c.cape}>
            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Pomo decorado */}
          <circle cx="81.25" cy="82" r="1.8" fill={c.accent} />
        </g>
      )}
    </svg>
  );
}

// Helper: nome do tier pra UI
export function tierLabel(level: number): string {
  const tier = tierFromLevel(level);
  switch (tier) {
    case "basic": return "Aprendiz";
    case "leather": return "Druida";
    case "silver": return "Sacerdotisa";
    case "gold": return "Cavaleira Rosa";
    case "shining": return "Campea Brilhante";
    case "legendary": return "Lendaria Fenix";
  }
}
