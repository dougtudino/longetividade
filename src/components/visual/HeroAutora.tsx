'use client';

interface HeroAutoraProps {
  className?: string;
}

export default function HeroAutora({ className }: HeroAutoraProps) {
  return (
    <svg
      viewBox="0 0 300 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ilustracao da autora"
      style={{ width: '100%', maxWidth: 300, height: 'auto' }}
    >
      {/* Flowing hair — back layer */}
      <path
        d="M108 80 C100 50, 120 20, 150 18 C180 16, 210 40, 206 75
           C210 90, 216 110, 220 140 C226 160, 230 180, 224 200
           Q218 215, 210 220 L210 160 C210 130, 200 100, 190 80
           C180 65, 160 55, 150 55 C140 55, 120 65, 112 80
           L108 80Z"
        fill="#3D5A3E"
        opacity="0.6"
      />

      {/* Hair right side flowing */}
      <path
        d="M192 80 C200 95, 210 120, 214 150 C218 180, 222 200, 218 230
           C216 240, 210 248, 204 252 C208 230, 206 200, 200 170
           C196 145, 192 120, 192 100Z"
        fill="#3D5A3E"
        opacity="0.5"
      />

      {/* Hair left side flowing */}
      <path
        d="M108 80 C102 95, 94 120, 90 150 C86 180, 82 200, 86 230
           C88 240, 92 248, 98 252 C94 230, 96 200, 100 170
           C104 145, 108 120, 108 100Z"
        fill="#3D5A3E"
        opacity="0.5"
      />

      {/* Body / Torso silhouette */}
      <path
        d="M112 190 C108 210, 100 240, 92 280 C88 300, 84 330, 82 360
           L218 360 C216 330, 212 300, 208 280 C200 240, 192 210, 188 190
           Q170 178, 150 178 Q130 178, 112 190Z"
        fill="#7A9E7E"
      />

      {/* Neckline detail */}
      <path
        d="M128 190 Q150 205, 172 190"
        stroke="#3D5A3E"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />

      {/* Neck */}
      <rect x="138" y="160" width="24" height="28" rx="8" fill="#E8D5C0" />

      {/* Head */}
      <ellipse cx="150" cy="110" rx="40" ry="55" fill="#E8D5C0" />

      {/* Hair — front layer */}
      <path
        d="M110 100 C110 55, 125 25, 150 22 C175 25, 190 55, 190 100
           C190 85, 182 60, 150 55 C118 60, 110 85, 110 100Z"
        fill="#3D5A3E"
      />

      {/* Side hair strands */}
      <path
        d="M110 100 C108 115, 106 130, 104 145 C103 155, 104 150, 108 140
           C110 130, 112 118, 112 108Z"
        fill="#3D5A3E"
        opacity="0.7"
      />
      <path
        d="M190 100 C192 115, 194 130, 196 145 C197 155, 196 150, 192 140
           C190 130, 188 118, 188 108Z"
        fill="#3D5A3E"
        opacity="0.7"
      />

      {/* Face features — minimal/silhouette style */}
      {/* Eyes */}
      <ellipse cx="138" cy="108" rx="3" ry="3.5" fill="#2D2D2D" />
      <ellipse cx="162" cy="108" rx="3" ry="3.5" fill="#2D2D2D" />

      {/* Subtle smile */}
      <path
        d="M140 126 Q150 134, 160 126"
        stroke="#C4787A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Right arm presenting ebook */}
      <path
        d="M188 200 C200 210, 216 218, 228 215 C234 213, 238 208, 238 202
           L238 200"
        stroke="#7A9E7E"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />

      {/* Hand */}
      <ellipse cx="236" cy="198" rx="8" ry="6" fill="#E8D5C0" />

      {/* Ebook rectangle */}
      <g transform="translate(220, 162) rotate(5)">
        <rect
          x="0"
          y="0"
          width="42"
          height="56"
          rx="3"
          fill="#FAF8F5"
          stroke="#D4A94B"
          strokeWidth="2"
        />
        {/* Ebook cover lines */}
        <rect x="8" y="10" width="26" height="3" rx="1" fill="#7A9E7E" opacity="0.5" />
        <rect x="8" y="18" width="20" height="2" rx="1" fill="#7A9E7E" opacity="0.3" />
        <rect x="8" y="24" width="22" height="2" rx="1" fill="#7A9E7E" opacity="0.3" />
        {/* Small leaf icon on cover */}
        <path
          d="M22 36 Q26 30, 30 36 Q26 34, 22 36Z"
          fill="#7A9E7E"
          opacity="0.6"
        />
        {/* Spine shadow */}
        <rect x="0" y="0" width="4" height="56" rx="1" fill="#D4A94B" opacity="0.2" />
      </g>

      {/* Left arm resting */}
      <path
        d="M112 200 C100 215, 90 240, 88 260"
        stroke="#7A9E7E"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />

      {/* Decorative sparkle near ebook */}
      <g opacity="0.6">
        <path d="M270 155 L272 148 L274 155 L281 157 L274 159 L272 166 L270 159 L263 157Z" fill="#D4A94B" />
        <path d="M248 140 L249 136 L250 140 L254 141 L250 142 L249 146 L248 142 L244 141Z" fill="#D4A94B" opacity="0.5" />
      </g>
    </svg>
  );
}
