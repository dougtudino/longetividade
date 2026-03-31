'use client';

interface BadgeResultadoProps {
  resultado: string;
}

export default function BadgeResultado({ resultado }: BadgeResultadoProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold text-white shadow-md"
      style={{ backgroundColor: '#7A9E7E' }}
    >
      {/* Down arrow icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M7 2 L7 11 M3 8 L7 12 L11 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {resultado}
    </span>
  );
}
