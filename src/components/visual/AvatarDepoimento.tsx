'use client';

interface AvatarDepoimentoProps {
  name: 'fernanda' | 'camila' | 'patricia' | string;
  size?: number;
}

interface AvatarTraits {
  skinColor: string;
  hairColor: string;
  hairStyle: 'wavy' | 'straight' | 'curly';
}

function getTraits(name: string): AvatarTraits {
  const lower = name.toLowerCase();

  if (lower === 'fernanda') {
    return { skinColor: '#C4956A', hairColor: '#3B2314', hairStyle: 'wavy' };
  }
  if (lower === 'camila') {
    return { skinColor: '#F0D5B8', hairColor: '#1A1A1A', hairStyle: 'straight' };
  }
  if (lower === 'patricia') {
    return { skinColor: '#8B6F4E', hairColor: '#2A1810', hairStyle: 'curly' };
  }

  // Hash from first letter for unknown names
  const code = lower.charCodeAt(0) || 65;
  const skins = ['#C4956A', '#F0D5B8', '#8B6F4E', '#D4A574', '#E8C49A'];
  const hairs = ['#1A1A1A', '#3B2314', '#5C3A1E', '#2A1810', '#4A3728'];
  const styles: AvatarTraits['hairStyle'][] = ['wavy', 'straight', 'curly'];

  return {
    skinColor: skins[code % skins.length],
    hairColor: hairs[code % hairs.length],
    hairStyle: styles[code % styles.length],
  };
}

function renderHair(style: AvatarTraits['hairStyle'], hairColor: string) {
  switch (style) {
    case 'wavy':
      return (
        <path
          d="M20 28 C20 16, 28 10, 50 10 C72 10, 80 16, 80 28 C82 22, 84 30, 82 38 C84 32, 86 24, 82 16 C78 6, 66 2, 50 2 C34 2, 22 6, 18 16 C14 24, 16 32, 18 38 C16 30, 18 22, 20 28Z"
          fill={hairColor}
        />
      );
    case 'straight':
      return (
        <path
          d="M22 30 C22 14, 32 6, 50 6 C68 6, 78 14, 78 30 L78 46 C80 42, 82 36, 82 28 C82 12, 68 2, 50 2 C32 2, 18 12, 18 28 C18 36, 20 42, 22 46Z"
          fill={hairColor}
        />
      );
    case 'curly':
      return (
        <>
          <path
            d="M22 30 C22 14, 32 6, 50 6 C68 6, 78 14, 78 30 C80 24, 84 18, 80 12 C74 2, 62 -2, 50 -2 C38 -2, 26 2, 20 12 C16 18, 20 24, 22 30Z"
            fill={hairColor}
          />
          {/* Curly volume */}
          <circle cx="20" cy="26" r="6" fill={hairColor} />
          <circle cx="16" cy="34" r="5" fill={hairColor} />
          <circle cx="80" cy="26" r="6" fill={hairColor} />
          <circle cx="84" cy="34" r="5" fill={hairColor} />
          <circle cx="18" cy="42" r="4" fill={hairColor} />
          <circle cx="82" cy="42" r="4" fill={hairColor} />
        </>
      );
  }
}

export default function AvatarDepoimento({ name, size = 64 }: AvatarDepoimentoProps) {
  const { skinColor, hairColor, hairStyle } = getTraits(name);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Avatar de ${name}`}
    >
      {/* Circular frame with sage border */}
      <circle cx="50" cy="50" r="48" fill="#FAF8F5" stroke="#7A9E7E" strokeWidth="3" />
      <clipPath id={`clip-${name}`}>
        <circle cx="50" cy="50" r="46" />
      </clipPath>

      <g clipPath={`url(#clip-${name})`}>
        {/* Neck */}
        <rect x="40" y="62" width="20" height="16" rx="4" fill={skinColor} />

        {/* Shoulders */}
        <ellipse cx="50" cy="88" rx="32" ry="16" fill="#7A9E7E" />

        {/* Hair behind head */}
        {renderHair(hairStyle, hairColor)}

        {/* Face */}
        <ellipse cx="50" cy="40" rx="24" ry="28" fill={skinColor} />

        {/* Hair on top (front layer) */}
        <path
          d="M26 32 C26 18, 36 10, 50 10 C64 10, 74 18, 74 32 C74 26, 70 18, 50 16 C30 18, 26 26, 26 32Z"
          fill={hairColor}
          opacity="0.9"
        />

        {/* Eyes */}
        <ellipse cx="40" cy="38" rx="2.5" ry="3" fill="#2D2D2D" />
        <ellipse cx="60" cy="38" rx="2.5" ry="3" fill="#2D2D2D" />

        {/* Eye highlights */}
        <circle cx="41" cy="37" r="0.8" fill="white" opacity="0.7" />
        <circle cx="61" cy="37" r="0.8" fill="white" opacity="0.7" />

        {/* Eyebrows */}
        <path d="M35 33 Q40 30, 44 32" stroke="#2D2D2D" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M56 32 Q60 30, 65 33" stroke="#2D2D2D" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Nose */}
        <path d="M50 42 Q48 46, 50 47 Q52 46, 50 42" stroke={skinColor} strokeWidth="0.8" fill="none"
          style={{ filter: 'brightness(0.85)' }} />

        {/* Smile */}
        <path d="M42 50 Q50 56, 58 50" stroke="#C4787A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
