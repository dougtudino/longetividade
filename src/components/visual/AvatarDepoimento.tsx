'use client';

interface AvatarDepoimentoProps {
  name: 'fernanda' | 'camila' | 'patricia' | string;
  size?: number;
}

function FernandaAvatar() {
  // Morena, 34 anos, cabelo castanho ondulado, pele #C4956A, top verde
  const skin = '#C4956A';
  const skinShadow = '#A67B52';
  const skinHighlight = '#D4A87E';
  const hair = '#3B2314';
  const hairHighlight = '#5C3A22';
  const hairLight = '#7A5234';
  const top = '#7A9E7E';
  const topShadow = '#5E8262';
  const lips = '#B85A5A';
  const irisColor = '#5C3A1E';

  return (
    <g>
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="#E8F0E4" />
      <clipPath id="clip-fernanda">
        <circle cx="50" cy="50" r="50" />
      </clipPath>
      <g clipPath="url(#clip-fernanda)">
        {/* Top / Blouse */}
        <path d="M15 78 Q20 70, 35 67 Q42 65, 50 65 Q58 65, 65 67 Q80 70, 85 78 L85 105 L15 105 Z" fill={top} />
        <path d="M15 78 Q20 70, 35 67 Q42 65, 50 65 Q58 65, 65 67 Q80 70, 85 78 L85 82 Q70 74, 50 72 Q30 74, 15 82 Z" fill={topShadow} opacity="0.4" />
        {/* V-neck */}
        <path d="M42 67 L50 76 L58 67" fill="none" stroke={topShadow} strokeWidth="1" />
        <path d="M42 67 L50 76 L58 67" fill={skin} opacity="0.8" />

        {/* Neck */}
        <rect x="42" y="58" width="16" height="12" rx="3" fill={skin} />
        <path d="M44 60 Q50 62, 56 60" fill="none" stroke={skinShadow} strokeWidth="0.6" opacity="0.3" />
        {/* Neck shadow */}
        <ellipse cx="50" cy="68" rx="10" ry="3" fill={skinShadow} opacity="0.2" />

        {/* Hair behind — wavy, volume */}
        <path d="M18 30 C18 12, 30 2, 50 2 C70 2, 82 12, 82 30 L84 55 Q82 60, 78 62 L78 48 Q76 30, 70 22 C62 16, 38 16, 30 22 Q24 30, 22 48 L22 62 Q18 60, 16 55 Z" fill={hair} />
        {/* Hair behind ears — flowing */}
        <path d="M22 48 Q20 55, 18 62 Q16 68, 19 72 Q22 68, 23 60 L22 48 Z" fill={hair} />
        <path d="M78 48 Q80 55, 82 62 Q84 68, 81 72 Q78 68, 77 60 L78 48 Z" fill={hair} />

        {/* Face */}
        <ellipse cx="50" cy="38" rx="22" ry="26" fill={skin} />
        {/* Face shadow — jawline */}
        <path d="M28 38 Q30 56, 40 62 Q50 66, 60 62 Q70 56, 72 38" fill={skinShadow} opacity="0.12" />
        {/* Cheek blush */}
        <ellipse cx="35" cy="44" rx="5" ry="3.5" fill="#D4897A" opacity="0.25" />
        <ellipse cx="65" cy="44" rx="5" ry="3.5" fill="#D4897A" opacity="0.25" />
        {/* Forehead highlight */}
        <ellipse cx="50" cy="24" rx="10" ry="5" fill={skinHighlight} opacity="0.2" />
        {/* Nose bridge highlight */}
        <path d="M49 32 L49 42" stroke={skinHighlight} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

        {/* Nose */}
        <path d="M50 34 Q49 38, 48 42 Q46 44, 47 45 Q49 46, 50 46 Q51 46, 53 45 Q54 44, 52 42 Q51 38, 50 34" fill="none" stroke={skinShadow} strokeWidth="0.7" opacity="0.5" />
        {/* Nose tip shadow */}
        <ellipse cx="50" cy="45" rx="3" ry="1.5" fill={skinShadow} opacity="0.1" />

        {/* Eyes — left */}
        <ellipse cx="40" cy="36" rx="5" ry="3.5" fill="white" />
        <ellipse cx="40.5" cy="36.2" rx="3" ry="3" fill={irisColor} />
        <circle cx="40.5" cy="36.2" r="1.8" fill="#1A1008" />
        <circle cx="41.5" cy="35.2" r="0.8" fill="white" opacity="0.85" />
        <circle cx="39.5" cy="37" r="0.4" fill="white" opacity="0.5" />
        {/* Upper eyelid line */}
        <path d="M35 35 Q37 33, 40 33 Q43 33, 45 35" fill="none" stroke="#2D1A0E" strokeWidth="0.9" strokeLinecap="round" />
        {/* Lower lash line */}
        <path d="M36 37.5 Q40 39, 44 37.5" fill="none" stroke={skinShadow} strokeWidth="0.4" opacity="0.4" />
        {/* Eyelashes */}
        <path d="M35 35 L33.5 33.5" stroke="#2D1A0E" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M36.5 34 L35.5 32.5" stroke="#2D1A0E" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M44 35 L45.5 33.5" stroke="#2D1A0E" strokeWidth="0.5" strokeLinecap="round" />

        {/* Eyes — right */}
        <ellipse cx="60" cy="36" rx="5" ry="3.5" fill="white" />
        <ellipse cx="59.5" cy="36.2" rx="3" ry="3" fill={irisColor} />
        <circle cx="59.5" cy="36.2" r="1.8" fill="#1A1008" />
        <circle cx="60.5" cy="35.2" r="0.8" fill="white" opacity="0.85" />
        <circle cx="58.5" cy="37" r="0.4" fill="white" opacity="0.5" />
        <path d="M55 35 Q57 33, 60 33 Q63 33, 65 35" fill="none" stroke="#2D1A0E" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M56 37.5 Q60 39, 64 37.5" fill="none" stroke={skinShadow} strokeWidth="0.4" opacity="0.4" />
        <path d="M55 35 L53.5 33.5" stroke="#2D1A0E" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M65 35 L66.5 33.5" stroke="#2D1A0E" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M63.5 34 L64.5 32.5" stroke="#2D1A0E" strokeWidth="0.5" strokeLinecap="round" />

        {/* Eyebrows */}
        <path d="M33 30 Q36 27.5, 40 28 Q43 28.5, 45 30" fill="none" stroke={hair} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M55 30 Q57 28.5, 60 28 Q64 27.5, 67 30" fill="none" stroke={hair} strokeWidth="1.4" strokeLinecap="round" />

        {/* Mouth */}
        <path d="M42 50 Q44 49, 46 49.5 Q48 50, 50 50 Q52 50, 54 49.5 Q56 49, 58 50" fill={lips} />
        <path d="M42 50 Q44 51.5, 47 52 Q50 52.5, 53 52 Q56 51.5, 58 50" fill="#A34848" />
        {/* Upper lip contour */}
        <path d="M42 50 Q46 48.5, 50 49.5 Q54 48.5, 58 50" fill="none" stroke={lips} strokeWidth="0.5" />
        {/* Lip shine */}
        <ellipse cx="50" cy="50.5" rx="3" ry="0.8" fill="white" opacity="0.15" />
        {/* Smile crease */}
        <path d="M40 49 Q39 51, 40 52" fill="none" stroke={skinShadow} strokeWidth="0.4" opacity="0.3" />
        <path d="M60 49 Q61 51, 60 52" fill="none" stroke={skinShadow} strokeWidth="0.4" opacity="0.3" />

        {/* Hair front — wavy bangs */}
        <path d="M26 28 C26 16, 34 8, 50 8 C66 8, 74 16, 74 28 Q72 22, 66 18 Q58 14, 50 15 Q42 14, 34 18 Q28 22, 26 28 Z" fill={hair} />
        {/* Hair wave texture */}
        <path d="M30 22 Q35 17, 42 16 Q48 15.5, 50 16" fill="none" stroke={hairHighlight} strokeWidth="1" opacity="0.5" />
        <path d="M70 22 Q65 17, 58 16 Q52 15.5, 50 16" fill="none" stroke={hairHighlight} strokeWidth="0.8" opacity="0.4" />
        {/* Side part highlight */}
        <path d="M34 14 Q38 11, 45 10 Q50 9.5, 55 10" fill="none" stroke={hairLight} strokeWidth="1.2" opacity="0.35" />
        {/* Wavy side strands */}
        <path d="M26 28 Q24 35, 25 42 Q24 38, 22 44 Q23 48, 24 52" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M74 28 Q76 35, 75 42 Q76 38, 78 44 Q77 48, 76 52" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round" />

        {/* Earrings — small gold hoops */}
        <circle cx="28" cy="42" r="2.5" fill="none" stroke="#D4A94B" strokeWidth="1" />
        <circle cx="72" cy="42" r="2.5" fill="none" stroke="#D4A94B" strokeWidth="1" />
      </g>
    </g>
  );
}

function CamilaAvatar() {
  // 29 anos, cabelo preto liso com franja, pele clara #F5DEB3, blusa azul
  const skin = '#F5DEB3';
  const skinShadow = '#DBBF8E';
  const skinHighlight = '#FFF0D6';
  const hair = '#1A1A1A';
  const hairHighlight = '#333333';
  const hairShine = '#4A4A4A';
  const top = '#4A6FA5';
  const topShadow = '#385880';
  const lips = '#C76B6B';
  const irisColor = '#2D1A0E';

  return (
    <g>
      <circle cx="50" cy="50" r="50" fill="#E4ECF4" />
      <clipPath id="clip-camila">
        <circle cx="50" cy="50" r="50" />
      </clipPath>
      <g clipPath="url(#clip-camila)">
        {/* Blouse — blue round neck */}
        <path d="M15 80 Q22 72, 36 68 Q43 66, 50 66 Q57 66, 64 68 Q78 72, 85 80 L85 105 L15 105 Z" fill={top} />
        <path d="M36 68 Q43 66, 50 66 Q57 66, 64 68 Q58 70, 50 70 Q42 70, 36 68 Z" fill={topShadow} opacity="0.3" />
        {/* Round neckline */}
        <path d="M38 68 Q44 72, 50 73 Q56 72, 62 68" fill={skin} />

        {/* Neck */}
        <rect x="43" y="58" width="14" height="12" rx="3" fill={skin} />
        <ellipse cx="50" cy="68" rx="9" ry="2.5" fill={skinShadow} opacity="0.15" />

        {/* Hair behind — long straight */}
        <path d="M20 26 C20 10, 32 0, 50 0 C68 0, 80 10, 80 26 L82 65 Q80 70, 76 72 L76 40 Q74 26, 68 18 C60 10, 40 10, 32 18 Q26 26, 24 40 L24 72 Q20 70, 18 65 Z" fill={hair} />
        {/* Hair flowing behind shoulders */}
        <path d="M24 55 Q22 62, 20 70 Q18 76, 20 80 Q22 76, 24 68 Z" fill={hair} />
        <path d="M76 55 Q78 62, 80 70 Q82 76, 80 80 Q78 76, 76 68 Z" fill={hair} />

        {/* Face */}
        <ellipse cx="50" cy="38" rx="21" ry="25" fill={skin} />
        {/* Face shadow — jawline */}
        <path d="M29 38 Q32 55, 41 61 Q50 65, 59 61 Q68 55, 71 38" fill={skinShadow} opacity="0.1" />
        {/* Cheek blush */}
        <ellipse cx="36" cy="44" rx="4.5" ry="3" fill="#E8A0A0" opacity="0.2" />
        <ellipse cx="64" cy="44" rx="4.5" ry="3" fill="#E8A0A0" opacity="0.2" />
        {/* Forehead highlight */}
        <ellipse cx="50" cy="22" rx="9" ry="4" fill={skinHighlight} opacity="0.25" />
        {/* Nose highlight */}
        <path d="M49.5 32 L49.5 41" stroke={skinHighlight} strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />

        {/* Nose */}
        <path d="M50 33 Q48.5 38, 47 42 Q46 43.5, 47 44.5 Q49 45.5, 50 45.5 Q51 45.5, 53 44.5 Q54 43.5, 53 42 Q51.5 38, 50 33" fill="none" stroke={skinShadow} strokeWidth="0.6" opacity="0.45" />
        <ellipse cx="50" cy="44.5" rx="2.5" ry="1.2" fill={skinShadow} opacity="0.08" />

        {/* Eyes — left */}
        <ellipse cx="40" cy="36" rx="5.5" ry="3.8" fill="white" />
        <ellipse cx="40.5" cy="36.3" rx="3.2" ry="3.2" fill={irisColor} />
        <circle cx="40.5" cy="36.3" r="2" fill="#0D0805" />
        <circle cx="41.8" cy="35" r="0.9" fill="white" opacity="0.9" />
        <circle cx="39.5" cy="37.2" r="0.4" fill="white" opacity="0.5" />
        <path d="M34.5 35 Q37 32.5, 40 32.5 Q43 32.5, 45.5 35" fill="none" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
        <path d="M35.5 37.8 Q40 39.5, 44.5 37.8" fill="none" stroke={skinShadow} strokeWidth="0.35" opacity="0.35" />
        {/* Lashes */}
        <path d="M34.5 35 L33 33" stroke="#1A1A1A" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M36 33.5 L35 32" stroke="#1A1A1A" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M37.5 33 L37 31.5" stroke="#1A1A1A" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M44.5 34.5 L46 33" stroke="#1A1A1A" strokeWidth="0.5" strokeLinecap="round" />

        {/* Eyes — right */}
        <ellipse cx="60" cy="36" rx="5.5" ry="3.8" fill="white" />
        <ellipse cx="59.5" cy="36.3" rx="3.2" ry="3.2" fill={irisColor} />
        <circle cx="59.5" cy="36.3" r="2" fill="#0D0805" />
        <circle cx="60.8" cy="35" r="0.9" fill="white" opacity="0.9" />
        <circle cx="58.5" cy="37.2" r="0.4" fill="white" opacity="0.5" />
        <path d="M54.5 35 Q57 32.5, 60 32.5 Q63 32.5, 65.5 35" fill="none" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
        <path d="M55.5 37.8 Q60 39.5, 64.5 37.8" fill="none" stroke={skinShadow} strokeWidth="0.35" opacity="0.35" />
        <path d="M54.5 34.5 L53 33" stroke="#1A1A1A" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M65.5 35 L67 33" stroke="#1A1A1A" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M64 33.5 L65 32" stroke="#1A1A1A" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M62.5 33 L63 31.5" stroke="#1A1A1A" strokeWidth="0.5" strokeLinecap="round" />

        {/* Eyebrows — thinner, arched */}
        <path d="M34 29.5 Q37 27, 41 27.5 Q44 28, 46 29.5" fill="none" stroke={hair} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M54 29.5 Q56 28, 59 27.5 Q63 27, 66 29.5" fill="none" stroke={hair} strokeWidth="1.2" strokeLinecap="round" />

        {/* Mouth */}
        <path d="M43 50.5 Q45 49.5, 47 50 Q49 50.5, 50 50.5 Q51 50.5, 53 50 Q55 49.5, 57 50.5" fill={lips} />
        <path d="M43 50.5 Q45 52, 47 52.5 Q50 53, 53 52.5 Q55 52, 57 50.5" fill="#A85555" />
        <path d="M43 50.5 Q47 49, 50 49.8 Q53 49, 57 50.5" fill="none" stroke={lips} strokeWidth="0.4" />
        <ellipse cx="50" cy="51" rx="2.5" ry="0.6" fill="white" opacity="0.12" />
        <path d="M41.5 49.5 Q41 51, 41.5 52" fill="none" stroke={skinShadow} strokeWidth="0.35" opacity="0.25" />
        <path d="M58.5 49.5 Q59 51, 58.5 52" fill="none" stroke={skinShadow} strokeWidth="0.35" opacity="0.25" />

        {/* Hair front — straight with fringe/bangs */}
        <path d="M26 26 C26 14, 35 6, 50 6 C65 6, 74 14, 74 26 Q72 20, 66 16 Q58 12, 50 12 Q42 12, 34 16 Q28 20, 26 26 Z" fill={hair} />
        {/* Fringe / bangs — covering forehead */}
        <path d="M30 26 Q32 18, 38 14 Q44 11, 50 11 L50 28 Q44 27, 38 26 Q34 25, 30 26 Z" fill={hair} />
        <path d="M50 11 Q56 11, 62 14 Q66 16, 68 20 L66 26 Q60 24, 54 26 L50 28 Z" fill={hair} />
        {/* Fringe edge — slightly uneven */}
        <path d="M30 26 Q34 28, 38 27 Q42 26, 46 28 Q48 28.5, 50 28 Q52 27, 56 26 Q60 25, 66 26" fill={hair} />
        {/* Hair shine streaks */}
        <path d="M36 14 Q42 10, 50 10" fill="none" stroke={hairShine} strokeWidth="1.5" opacity="0.3" />
        <path d="M40 18 Q46 16, 52 16" fill="none" stroke={hairHighlight} strokeWidth="0.8" opacity="0.25" />
        {/* Side hair strands */}
        <path d="M26 26 Q24 34, 24 42 Q23 50, 24 56" fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round" />
        <path d="M74 26 Q76 34, 76 42 Q77 50, 76 56" fill="none" stroke={hair} strokeWidth="3" strokeLinecap="round" />

        {/* Small stud earrings — pearl */}
        <circle cx="28" cy="42" r="1.8" fill="#F0E6D0" />
        <circle cx="28.5" cy="41.5" r="0.6" fill="white" opacity="0.6" />
        <circle cx="72" cy="42" r="1.8" fill="#F0E6D0" />
        <circle cx="72.5" cy="41.5" r="0.6" fill="white" opacity="0.6" />
      </g>
    </g>
  );
}

function PatriciaAvatar() {
  // 41 anos, cabelo castanho preso (coque), pele morena #8B6F4E, jaleco branco (enfermeira)
  const skin = '#8B6F4E';
  const skinShadow = '#725A3C';
  const skinHighlight = '#A08462';
  const hair = '#2A1810';
  const hairHighlight = '#4A3020';
  const top = '#FFFFFF';
  const topShadow = '#D8D8D8';
  const lips = '#A0524E';
  const irisColor = '#3B2316';

  return (
    <g>
      <circle cx="50" cy="50" r="50" fill="#F0E8E0" />
      <clipPath id="clip-patricia">
        <circle cx="50" cy="50" r="50" />
      </clipPath>
      <g clipPath="url(#clip-patricia)">
        {/* Jaleco — white lab coat / scrubs */}
        <path d="M15 78 Q22 70, 36 67 Q43 65, 50 65 Q57 65, 64 67 Q78 70, 85 78 L85 105 L15 105 Z" fill={top} />
        <path d="M15 78 Q22 70, 36 67 L36 105 L15 105 Z" fill={topShadow} opacity="0.15" />
        <path d="M85 78 Q78 70, 64 67 L64 105 L85 105 Z" fill={topShadow} opacity="0.1" />
        {/* V-neck collar */}
        <path d="M40 67 L50 77 L60 67" fill="none" stroke={topShadow} strokeWidth="0.8" />
        <path d="M40 67 L50 77 L60 67" fill={skin} opacity="0.7" />
        {/* Collar lapels */}
        <path d="M36 67 L40 67 L44 72" fill="none" stroke={topShadow} strokeWidth="0.6" />
        <path d="M64 67 L60 67 L56 72" fill="none" stroke={topShadow} strokeWidth="0.6" />
        {/* Pocket detail */}
        <rect x="62" y="80" width="8" height="6" rx="1" fill="none" stroke={topShadow} strokeWidth="0.5" opacity="0.4" />

        {/* Neck */}
        <rect x="42" y="57" width="16" height="12" rx="3" fill={skin} />
        <ellipse cx="50" cy="67" rx="9" ry="2.5" fill={skinShadow} opacity="0.15" />

        {/* Hair behind — pulled back into bun */}
        <path d="M24 28 C24 14, 34 4, 50 4 C66 4, 76 14, 76 28 L76 38 Q74 32, 68 26 C60 18, 40 18, 32 26 Q26 32, 24 38 Z" fill={hair} />

        {/* Hair bun on top */}
        <ellipse cx="50" cy="6" rx="12" ry="9" fill={hair} />
        <ellipse cx="50" cy="5" rx="10" ry="7" fill={hairHighlight} opacity="0.2" />
        {/* Bun texture */}
        <path d="M42 4 Q46 0, 50 0 Q54 0, 58 4" fill="none" stroke={hairHighlight} strokeWidth="0.8" opacity="0.3" />
        <path d="M44 8 Q48 5, 52 5 Q56 5, 58 8" fill="none" stroke={hairHighlight} strokeWidth="0.6" opacity="0.25" />
        {/* Hair band */}
        <path d="M40 10 Q45 12, 50 12 Q55 12, 60 10" fill="none" stroke={hair} strokeWidth="1.5" />

        {/* Face */}
        <ellipse cx="50" cy="38" rx="21" ry="25" fill={skin} />
        {/* Face shadow — jawline */}
        <path d="M29 40 Q32 55, 41 61 Q50 65, 59 61 Q68 55, 71 40" fill={skinShadow} opacity="0.12" />
        {/* Cheek blush */}
        <ellipse cx="36" cy="44" rx="4" ry="3" fill="#A06858" opacity="0.2" />
        <ellipse cx="64" cy="44" rx="4" ry="3" fill="#A06858" opacity="0.2" />
        {/* Forehead highlight */}
        <ellipse cx="50" cy="22" rx="8" ry="4" fill={skinHighlight} opacity="0.2" />
        {/* Nose highlight */}
        <path d="M49.5 32 L49.5 41" stroke={skinHighlight} strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />

        {/* Nose */}
        <path d="M50 33 Q48.5 37, 47.5 41 Q46 43, 47 44 Q49 45, 50 45 Q51 45, 53 44 Q54 43, 52.5 41 Q51.5 37, 50 33" fill="none" stroke={skinShadow} strokeWidth="0.65" opacity="0.5" />
        <ellipse cx="50" cy="44" rx="2.8" ry="1.3" fill={skinShadow} opacity="0.08" />

        {/* Eyes — left */}
        <ellipse cx="40" cy="36" rx="5" ry="3.5" fill="white" />
        <ellipse cx="40.5" cy="36.2" rx="3" ry="3" fill={irisColor} />
        <circle cx="40.5" cy="36.2" r="1.8" fill="#0D0805" />
        <circle cx="41.5" cy="35.2" r="0.8" fill="white" opacity="0.85" />
        <circle cx="39.5" cy="37" r="0.4" fill="white" opacity="0.5" />
        <path d="M35 34.8 Q37.5 32.8, 40 32.8 Q42.5 32.8, 45 34.8" fill="none" stroke="#1A0E05" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M36 37.5 Q40 39, 44 37.5" fill="none" stroke={skinShadow} strokeWidth="0.35" opacity="0.35" />
        <path d="M35 34.8 L33.5 33.3" stroke="#1A0E05" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M36.5 33.5 L35.8 32" stroke="#1A0E05" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M45 34.5 L46 33.2" stroke="#1A0E05" strokeWidth="0.5" strokeLinecap="round" />

        {/* Eyes — right */}
        <ellipse cx="60" cy="36" rx="5" ry="3.5" fill="white" />
        <ellipse cx="59.5" cy="36.2" rx="3" ry="3" fill={irisColor} />
        <circle cx="59.5" cy="36.2" r="1.8" fill="#0D0805" />
        <circle cx="60.5" cy="35.2" r="0.8" fill="white" opacity="0.85" />
        <circle cx="58.5" cy="37" r="0.4" fill="white" opacity="0.5" />
        <path d="M55 34.8 Q57.5 32.8, 60 32.8 Q62.5 32.8, 65 34.8" fill="none" stroke="#1A0E05" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M56 37.5 Q60 39, 64 37.5" fill="none" stroke={skinShadow} strokeWidth="0.35" opacity="0.35" />
        <path d="M55 34.5 L54 33.2" stroke="#1A0E05" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M65 34.8 L66.5 33.3" stroke="#1A0E05" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M63.5 33.5 L64.2 32" stroke="#1A0E05" strokeWidth="0.5" strokeLinecap="round" />

        {/* Eyebrows — slightly thicker, confident */}
        <path d="M33 30 Q36.5 27, 41 27.5 Q44 28, 46 30" fill="none" stroke={hair} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M54 30 Q56 28, 59 27.5 Q63.5 27, 67 30" fill="none" stroke={hair} strokeWidth="1.5" strokeLinecap="round" />

        {/* Mouth — confident warm smile */}
        <path d="M42 50 Q44.5 49.5, 47 50 Q50 50.5, 53 50 Q55.5 49.5, 58 50" fill={lips} />
        <path d="M42 50 Q45 52.5, 48 53 Q50 53.3, 52 53 Q55 52.5, 58 50" fill="#8A3E3A" />
        {/* Teeth hint */}
        <path d="M45 50.5 L55 50.5" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <path d="M42 50 Q47 48.5, 50 49.5 Q53 48.5, 58 50" fill="none" stroke={lips} strokeWidth="0.4" />
        <ellipse cx="50" cy="50.8" rx="2.5" ry="0.6" fill="white" opacity="0.1" />

        {/* Hair front — slicked back look */}
        <path d="M28 30 C28 16, 36 8, 50 8 C64 8, 72 16, 72 30 Q70 24, 64 20 Q56 16, 50 16 Q44 16, 36 20 Q30 24, 28 30 Z" fill={hair} />
        {/* Hair texture — smooth pulled back */}
        <path d="M32 18 Q40 12, 50 11 Q60 12, 68 18" fill="none" stroke={hairHighlight} strokeWidth="1" opacity="0.3" />
        <path d="M34 22 Q42 16, 50 15 Q58 16, 66 22" fill="none" stroke={hairHighlight} strokeWidth="0.7" opacity="0.2" />
        {/* Side hair tight */}
        <path d="M28 30 Q26 36, 27 40" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />
        <path d="M72 30 Q74 36, 73 40" fill="none" stroke={hair} strokeWidth="2" strokeLinecap="round" />

        {/* Necklace — thin chain with small pendant */}
        <path d="M40 62 Q42 64, 46 65 Q48 65.5, 50 66 Q52 65.5, 54 65 Q58 64, 60 62" fill="none" stroke="#D4A94B" strokeWidth="0.5" />
        <circle cx="50" cy="66.5" r="1.5" fill="#D4A94B" />
        <circle cx="50" cy="66.5" r="0.5" fill="white" opacity="0.4" />
      </g>
    </g>
  );
}

function GenericAvatar({ name }: { name: string }) {
  const code = (name.toLowerCase().charCodeAt(0) || 65);
  const skins = ['#C4956A', '#F5DEB3', '#8B6F4E', '#D4A574', '#E8C49A'];
  const hairs = ['#1A1A1A', '#3B2314', '#5C3A1E', '#2A1810', '#4A3728'];
  const tops = ['#7A9E7E', '#4A6FA5', '#C4787A', '#D4A94B', '#6B5B8A'];
  const skin = skins[code % skins.length];
  const hair = hairs[code % hairs.length];
  const top = tops[code % tops.length];
  const skinShadow = '#00000020';

  return (
    <g>
      <circle cx="50" cy="50" r="50" fill="#EDEDED" />
      <clipPath id={`clip-gen-${name}`}>
        <circle cx="50" cy="50" r="50" />
      </clipPath>
      <g clipPath={`url(#clip-gen-${name})`}>
        <path d="M15 80 Q30 70, 50 66 Q70 70, 85 80 L85 105 L15 105 Z" fill={top} />
        <rect x="43" y="58" width="14" height="12" rx="3" fill={skin} />
        <path d="M20 28 C20 10, 32 0, 50 0 C68 0, 80 10, 80 28 L80 50 L20 50 Z" fill={hair} />
        <ellipse cx="50" cy="38" rx="21" ry="25" fill={skin} />
        <path d="M28 28 C28 16, 36 8, 50 8 C64 8, 72 16, 72 28 Q68 20, 50 18 Q32 20, 28 28 Z" fill={hair} />
        <ellipse cx="40" cy="36" rx="3.5" ry="2.5" fill="white" />
        <circle cx="40" cy="36" r="1.8" fill="#2D2D2D" />
        <circle cx="41" cy="35.3" r="0.6" fill="white" opacity="0.8" />
        <ellipse cx="60" cy="36" rx="3.5" ry="2.5" fill="white" />
        <circle cx="60" cy="36" r="1.8" fill="#2D2D2D" />
        <circle cx="61" cy="35.3" r="0.6" fill="white" opacity="0.8" />
        <path d="M34 30 Q38 28, 45 29" fill="none" stroke={hair} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M55 29 Q62 28, 66 30" fill="none" stroke={hair} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M48 42 Q50 44, 52 42" fill="none" stroke={skinShadow} strokeWidth="0.6" />
        <path d="M43 50 Q50 54, 57 50" fill="none" stroke="#B85A5A" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </g>
  );
}

export default function AvatarDepoimento({ name, size = 96 }: AvatarDepoimentoProps) {
  const lower = name.toLowerCase();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Avatar de ${name}`}
      style={{ borderRadius: '50%' }}
    >
      {lower === 'fernanda' && <FernandaAvatar />}
      {lower === 'camila' && <CamilaAvatar />}
      {lower === 'patricia' && <PatriciaAvatar />}
      {lower !== 'fernanda' && lower !== 'camila' && lower !== 'patricia' && <GenericAvatar name={lower} />}
    </svg>
  );
}
