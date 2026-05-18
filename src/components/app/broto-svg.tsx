// Broto SVG inline — Fase 0 (premium minimal).
// Vetorial puro, sem outline preto. Gradient corporal + olhos expressivos
// + folhas estilo "modern wellness" (Finch/Headspace/Calm).
//
// 4 stages oficiais (alinhado com user brief 2026-05-18):
//   1. Semente (pequeno, 1 folhinha)
//   2. Brotinho (medio, 2 folhas)
//   3. Plantinha (grande, 3 folhas + caule)
//   4. Florescendo (cheio, folhas + flor)
//
// Moods aplicados via CSS filter no container pai (BrotoAvatar):
//   - feliz/tranquilo: filter default
//   - animado: glow dourado
//   - sonolento: grayscale + opacity reduzida
//   - saudoso: dessaturado + olhos fechados (TODO: variantes especiais)
//
// Resolution-independent — escala perfeito de 32px (header) a 320px (banners).

import React from "react";

export type BrotoSvgStage = 1 | 2 | 3 | 4;

// ─── Paleta oficial Broto ──────────────────────────────────
const COLORS = {
  bodyLight: "#C8E08C",
  bodyMid: "#7BA84A",
  bodyDark: "#5D8A30",
  leafLight: "#92C854",
  leafDark: "#4A7028",
  leafShadow: "#3D5C22",
  eyes: "#1A2E1B",
  eyeHighlight: "#FFFFFF",
  blush: "#F4A8A0",
  blushSoft: "rgba(244, 168, 160, 0.45)",
  mouth: "#1A2E1B",
  flowerPetal: "#F9B5C0",
  flowerCenter: "#F4E04D",
};

type Props = {
  stage: BrotoSvgStage;
  // size em px (o SVG escala perfeitamente)
  size?: number;
  // Pra estados especiais — sleeping fecha os olhos
  sleeping?: boolean;
};

export function BrotoSvg({ stage, size = 200, sleeping = false }: Props) {
  const id = `broto-${stage}`;
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Broto estagio ${stage}`}
    >
      <defs>
        {/* Gradiente corporal — luz vinda de cima-esquerda */}
        <radialGradient id={`${id}-body`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={COLORS.bodyLight} />
          <stop offset="60%" stopColor={COLORS.bodyMid} />
          <stop offset="100%" stopColor={COLORS.bodyDark} />
        </radialGradient>
        {/* Gradiente folha */}
        <linearGradient id={`${id}-leaf`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.leafLight} />
          <stop offset="100%" stopColor={COLORS.leafDark} />
        </linearGradient>
        {/* Sombra ambiente sob o broto */}
        <radialGradient id={`${id}-shadow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* Sombra ambiente sob o broto */}
      <ellipse cx="100" cy="180" rx={stageProps(stage).shadowRx} ry="6" fill={`url(#${id}-shadow)`} />

      {renderStage(stage, id, sleeping)}
    </svg>
  );
}

// ─── Render por stage ──────────────────────────────────────

function stageProps(stage: BrotoSvgStage) {
  // Tamanho do "corpo" varia por stage
  return {
    1: { shadowRx: 32, bodyRy: 35, bodyRx: 38 },
    2: { shadowRx: 42, bodyRy: 48, bodyRx: 50 },
    3: { shadowRx: 52, bodyRy: 60, bodyRx: 60 },
    4: { shadowRx: 55, bodyRy: 65, bodyRx: 65 },
  }[stage];
}

function renderStage(stage: BrotoSvgStage, id: string, sleeping: boolean) {
  const { bodyRx, bodyRy } = stageProps(stage);

  // Posição do corpo (centro) — sempre 100,130 (mais pra baixo pra deixar espaço pras folhas)
  const cx = 100;
  const cy = 140;

  return (
    <g>
      {/* Folhas/flor no topo (variável por stage, renderizadas atrás do corpo) */}
      {renderTopFoliage(stage, id, cx, cy - bodyRy + 5)}

      {/* Corpo (gota arredondada) */}
      <ellipse cx={cx} cy={cy} rx={bodyRx} ry={bodyRy} fill={`url(#${id}-body)`} />

      {/* Highlight do corpo (brilho de cima-esquerda) */}
      <ellipse
        cx={cx - bodyRx * 0.35}
        cy={cy - bodyRy * 0.4}
        rx={bodyRx * 0.35}
        ry={bodyRy * 0.25}
        fill="rgba(255,255,255,0.35)"
      />

      {/* Blush (bochechas) — cresce com o stage */}
      {stage >= 2 && (
        <>
          <ellipse cx={cx - bodyRx * 0.55} cy={cy + bodyRy * 0.15} rx={bodyRx * 0.18} ry={bodyRx * 0.13} fill={COLORS.blushSoft} />
          <ellipse cx={cx + bodyRx * 0.55} cy={cy + bodyRy * 0.15} rx={bodyRx * 0.18} ry={bodyRx * 0.13} fill={COLORS.blushSoft} />
        </>
      )}

      {/* Olhos */}
      {renderEyes(stage, cx, cy, bodyRx, bodyRy, sleeping)}

      {/* Boca */}
      {renderMouth(stage, cx, cy, bodyRx, bodyRy, sleeping)}
    </g>
  );
}

function renderEyes(stage: BrotoSvgStage, cx: number, cy: number, bodyRx: number, bodyRy: number, sleeping: boolean) {
  const eyeY = cy - bodyRy * 0.15;
  const eyeSpacing = bodyRx * 0.4;
  const eyeSize = bodyRx * 0.12;

  if (sleeping) {
    // Olhos fechados (curvinha pra baixo)
    return (
      <g stroke={COLORS.eyes} strokeWidth={eyeSize * 0.5} fill="none" strokeLinecap="round">
        <path d={`M ${cx - eyeSpacing - eyeSize} ${eyeY} q ${eyeSize} ${eyeSize * 0.8} ${eyeSize * 2} 0`} />
        <path d={`M ${cx + eyeSpacing - eyeSize} ${eyeY} q ${eyeSize} ${eyeSize * 0.8} ${eyeSize * 2} 0`} />
      </g>
    );
  }

  // Stage 4 = olhos fechados em sorriso (felicidade pura)
  if (stage === 4) {
    return (
      <g stroke={COLORS.eyes} strokeWidth={eyeSize * 0.5} fill="none" strokeLinecap="round">
        <path d={`M ${cx - eyeSpacing - eyeSize} ${eyeY + eyeSize * 0.3} q ${eyeSize} -${eyeSize * 0.8} ${eyeSize * 2} 0`} />
        <path d={`M ${cx + eyeSpacing - eyeSize} ${eyeY + eyeSize * 0.3} q ${eyeSize} -${eyeSize * 0.8} ${eyeSize * 2} 0`} />
      </g>
    );
  }

  // Olhos abertos com highlight
  return (
    <g>
      <ellipse cx={cx - eyeSpacing} cy={eyeY} rx={eyeSize} ry={eyeSize * 1.2} fill={COLORS.eyes} />
      <ellipse cx={cx + eyeSpacing} cy={eyeY} rx={eyeSize} ry={eyeSize * 1.2} fill={COLORS.eyes} />
      {/* Highlights brancos */}
      <circle cx={cx - eyeSpacing + eyeSize * 0.3} cy={eyeY - eyeSize * 0.4} r={eyeSize * 0.35} fill={COLORS.eyeHighlight} />
      <circle cx={cx + eyeSpacing + eyeSize * 0.3} cy={eyeY - eyeSize * 0.4} r={eyeSize * 0.35} fill={COLORS.eyeHighlight} />
    </g>
  );
}

function renderMouth(stage: BrotoSvgStage, cx: number, cy: number, bodyRx: number, bodyRy: number, sleeping: boolean) {
  const mouthY = cy + bodyRy * 0.12;
  const mouthWidth = bodyRx * 0.22;

  if (sleeping) {
    // Boca pequena fechada
    return (
      <line
        x1={cx - mouthWidth * 0.4}
        y1={mouthY}
        x2={cx + mouthWidth * 0.4}
        y2={mouthY}
        stroke={COLORS.mouth}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  }

  // Stage 1: sorriso pequeno e fechado
  if (stage === 1) {
    return (
      <path
        d={`M ${cx - mouthWidth} ${mouthY} q ${mouthWidth} ${mouthWidth * 0.5} ${mouthWidth * 2} 0`}
        stroke={COLORS.mouth}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  // Stage 2-4: sorriso aberto com lingua pequena
  return (
    <g>
      <path
        d={`M ${cx - mouthWidth} ${mouthY}
            q ${mouthWidth} ${mouthWidth * 0.85} ${mouthWidth * 2} 0
            z`}
        fill={COLORS.mouth}
      />
      {/* Lingua interna */}
      <path
        d={`M ${cx - mouthWidth * 0.4} ${mouthY + mouthWidth * 0.25}
            q ${mouthWidth * 0.4} ${mouthWidth * 0.3} ${mouthWidth * 0.8} 0`}
        fill={COLORS.blush}
      />
    </g>
  );
}

function renderTopFoliage(stage: BrotoSvgStage, id: string, cx: number, topY: number) {
  // Folhas estilizadas saindo do topo do corpo
  const leafFill = `url(#${id}-leaf)`;

  switch (stage) {
    case 1: {
      // 1 folhinha tímida central
      return (
        <g>
          <path
            d={`M ${cx} ${topY}
                C ${cx - 8} ${topY - 14}, ${cx - 14} ${topY - 22}, ${cx - 4} ${topY - 30}
                C ${cx + 6} ${topY - 22}, ${cx + 4} ${topY - 14}, ${cx} ${topY} Z`}
            fill={leafFill}
          />
          {/* Caule */}
          <line x1={cx} y1={topY} x2={cx - 1} y2={topY - 8} stroke={COLORS.leafDark} strokeWidth={1.5} strokeLinecap="round" />
        </g>
      );
    }
    case 2: {
      // 2 folhas balanceadas
      return (
        <g>
          {/* Folha esquerda */}
          <path
            d={`M ${cx} ${topY}
                C ${cx - 12} ${topY - 8}, ${cx - 24} ${topY - 22}, ${cx - 18} ${topY - 32}
                C ${cx - 6} ${topY - 28}, ${cx - 2} ${topY - 14}, ${cx} ${topY} Z`}
            fill={leafFill}
          />
          {/* Folha direita */}
          <path
            d={`M ${cx} ${topY}
                C ${cx + 12} ${topY - 8}, ${cx + 24} ${topY - 22}, ${cx + 18} ${topY - 32}
                C ${cx + 6} ${topY - 28}, ${cx + 2} ${topY - 14}, ${cx} ${topY} Z`}
            fill={leafFill}
          />
        </g>
      );
    }
    case 3: {
      // 3 folhas + caule central
      return (
        <g>
          {/* Folha esquerda */}
          <path
            d={`M ${cx - 4} ${topY}
                C ${cx - 16} ${topY - 4}, ${cx - 30} ${topY - 18}, ${cx - 24} ${topY - 30}
                C ${cx - 12} ${topY - 26}, ${cx - 6} ${topY - 14}, ${cx - 4} ${topY} Z`}
            fill={leafFill}
          />
          {/* Folha direita */}
          <path
            d={`M ${cx + 4} ${topY}
                C ${cx + 16} ${topY - 4}, ${cx + 30} ${topY - 18}, ${cx + 24} ${topY - 30}
                C ${cx + 12} ${topY - 26}, ${cx + 6} ${topY - 14}, ${cx + 4} ${topY} Z`}
            fill={leafFill}
          />
          {/* Folha central (atras) */}
          <path
            d={`M ${cx} ${topY}
                C ${cx - 8} ${topY - 16}, ${cx - 10} ${topY - 36}, ${cx} ${topY - 42}
                C ${cx + 10} ${topY - 36}, ${cx + 8} ${topY - 16}, ${cx} ${topY} Z`}
            fill={leafFill}
            opacity="0.95"
          />
        </g>
      );
    }
    case 4: {
      // Folhas + flor na cabeca (florescendo)
      return (
        <g>
          {/* Folhas laterais */}
          <path
            d={`M ${cx - 6} ${topY}
                C ${cx - 18} ${topY - 4}, ${cx - 32} ${topY - 16}, ${cx - 26} ${topY - 28}
                C ${cx - 14} ${topY - 24}, ${cx - 8} ${topY - 14}, ${cx - 6} ${topY} Z`}
            fill={leafFill}
          />
          <path
            d={`M ${cx + 6} ${topY}
                C ${cx + 18} ${topY - 4}, ${cx + 32} ${topY - 16}, ${cx + 26} ${topY - 28}
                C ${cx + 14} ${topY - 24}, ${cx + 8} ${topY - 14}, ${cx + 6} ${topY} Z`}
            fill={leafFill}
          />
          {/* Caule */}
          <line x1={cx} y1={topY} x2={cx} y2={topY - 30} stroke={COLORS.leafDark} strokeWidth={2.5} strokeLinecap="round" />
          {/* Flor: 5 petalas + centro */}
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const px = cx + Math.cos(rad) * 9;
            const py = topY - 38 + Math.sin(rad) * 9;
            return <circle key={angle} cx={px} cy={py} r={6} fill={COLORS.flowerPetal} />;
          })}
          <circle cx={cx} cy={topY - 38} r={5} fill={COLORS.flowerCenter} />
        </g>
      );
    }
  }
}
