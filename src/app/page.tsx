// src/app/page.tsx — Homepage Master Longetividade
import type { Metadata } from "next";
import Link from "next/link";
import LeadCapture from "@/components/LeadCapture";
import ThemeToggle from "@/components/ThemeToggle";
import { AvatarDepoimento, BadgeResultado } from "@/components/visual";

export const metadata: Metadata = {
  title: "Longetividade — Viva Mais, Viva Melhor",
  description:
    "Programas de saude e longevidade baseados em ciencia. Metodos e protocolos para transformar seu peso, sono e energia.",
};

interface Produto {
  id: string;
  titulo: string;
  subtitulo: string;
  badge: string;
  badgeEmoji: string;
  preco: string;
  precoOriginal?: string;
  descricao: string;
  beneficios: string[];
  cta: string;
  href: string;
  disponivel: boolean;
  destaque?: boolean;
  gradientDark: string;
  gradientLight: string;
  accentColor: string;
}

/* ---------- SVG Art per product ---------- */
function ProductArt({ id }: { id: string }) {
  switch (id) {
    case "emagreca-sem-dieta":
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Plate */}
          <circle cx="60" cy="62" r="38" stroke="#E5E5E5" strokeWidth="2.5" fill="none" />
          <ellipse cx="60" cy="62" rx="32" ry="30" fill="#F5F5F0" fillOpacity="0.15" />
          {/* Lettuce leaves */}
          <path d="M42 55c4-8 12-10 18-7s8 10 4 16c-6-2-14-1-18-2s-6-3-4-7z" fill="#7A9E7E" fillOpacity="0.85" />
          <path d="M50 50c5-6 14-6 18-2s4 12-1 16c-4-4-11-6-15-8s-4-3-2-6z" fill="#7A9E7E" fillOpacity="0.65" />
          <path d="M58 48c3-4 10-5 14-1s3 10 0 13c-4-3-9-5-12-7s-4-2-2-5z" fill="#93B396" fillOpacity="0.7" />
          {/* Tomato */}
          <circle cx="68" cy="68" r="7" fill="#C4787A" />
          <circle cx="68" cy="68" r="7" fill="#C4787A" fillOpacity="0.8" />
          <path d="M66 62c1-1 3-1 4 0" stroke="#3D5A3E" strokeWidth="1" strokeLinecap="round" />
          {/* Cucumber slices */}
          <circle cx="50" cy="72" r="5" fill="#93B396" fillOpacity="0.6" stroke="#7A9E7E" strokeWidth="0.8" />
          <circle cx="50" cy="72" r="2.5" fill="#B8D4BA" fillOpacity="0.4" />
          <circle cx="56" cy="78" r="4" fill="#93B396" fillOpacity="0.5" stroke="#7A9E7E" strokeWidth="0.8" />
          {/* Fork */}
          <line x1="92" y1="40" x2="92" y2="85" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
          <line x1="88" y1="40" x2="88" y2="55" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="92" y1="40" x2="92" y2="55" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="96" y1="40" x2="96" y2="55" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M88 55q4 4 8 0" stroke="#2D2D2D" strokeWidth="1.5" fill="none" />
          {/* Laurel leaf */}
          <path d="M28 48c2-6 8-8 12-5s4 8 1 12c-4-1-8-2-11-3s-3-2-2-4z" fill="#3D5A3E" fillOpacity="0.8" />
          <line x1="30" y1="50" x2="38" y2="52" stroke="#2D5A2E" strokeWidth="0.6" />
        </svg>
      );

    case "sono-profundo":
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Pillow */}
          <path d="M20 82c0-4 8-12 40-12s40 8 40 12-8 10-40 10-40-6-40-10z" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
          <path d="M25 80c0-3 7-8 35-8s35 5 35 8" stroke="#9CA3AF" strokeWidth="1" fill="none" strokeOpacity="0.5" />
          {/* Moon */}
          <circle cx="55" cy="42" r="20" fill="#D4A94B" />
          <circle cx="65" cy="36" r="16" fill="#3B4A6B" />
          {/* Stars */}
          <polygon points="90,25 91.5,29 96,29.5 92.5,32 93.5,36 90,33.5 86.5,36 87.5,32 84,29.5 88.5,29" fill="#D4A94B" fillOpacity="1" />
          <polygon points="100,45 101,47.5 104,48 102,50 102.5,53 100,51 97.5,53 98,50 96,48 99,47.5" fill="#D4A94B" fillOpacity="0.8" />
          <polygon points="30,30 31,32 33.5,32.5 31.5,34 32,36.5 30,35 28,36.5 28.5,34 26.5,32.5 29,32" fill="#D4A94B" fillOpacity="0.6" />
          <polygon points="82,55 83,57 85,57 83.5,58.5 84,60.5 82,59.5 80,60.5 80.5,58.5 79,57 81,57" fill="#D4A94B" fillOpacity="0.5" />
          <polygon points="22,50 23,52 25,52 23.5,53.5 24,55.5 22,54.5 20,55.5 20.5,53.5 19,52 21,52" fill="#D4A94B" fillOpacity="0.4" />
          {/* ZZZ */}
          <text x="72" y="22" fill="#3B4A6B" fontSize="10" fontWeight="bold" fontFamily="sans-serif" opacity="0.9">Z</text>
          <text x="80" y="16" fill="#3B4A6B" fontSize="8" fontWeight="bold" fontFamily="sans-serif" opacity="0.7">Z</text>
          <text x="86" y="11" fill="#3B4A6B" fontSize="6" fontWeight="bold" fontFamily="sans-serif" opacity="0.5">Z</text>
        </svg>
      );

    case "detox-mental":
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Female head profile */}
          <path d="M65 95c0 0-5-2-8-8s-4-12-3-18c1-8 4-14 10-18s14-6 18-4 6 6 5 12c-1 4-3 8-6 11s-6 5-8 7-4 6-4 10" stroke="#2D2D2D" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Neck */}
          <path d="M65 95l-2 15" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
          <path d="M57 87l-3 23" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" />
          {/* Nose/chin detail */}
          <path d="M54 69c-3 1-5 3-6 6s0 6 1 8" stroke="#2D2D2D" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Leaves growing from head */}
          <path d="M72 47c-2-8 2-14 8-16s10 2 8 10c-4-1-10 1-14 4z" fill="#7A9E7E" fillOpacity="0.8" />
          <path d="M80 42c0-7 4-12 10-12s8 5 5 11c-4-2-10-1-13 2z" fill="#7A9E7E" fillOpacity="0.6" />
          <path d="M66 50c-4-6-2-14 3-17s10 0 10 6c-4 0-8 4-11 8z" fill="#93B396" fillOpacity="0.7" />
          {/* Small flowers */}
          <circle cx="75" cy="35" r="3" fill="#C4787A" fillOpacity="0.7" />
          <circle cx="75" cy="35" r="1.2" fill="#D4A94B" fillOpacity="0.8" />
          <circle cx="88" cy="38" r="2.5" fill="#C4787A" fillOpacity="0.6" />
          <circle cx="88" cy="38" r="1" fill="#D4A94B" fillOpacity="0.7" />
          <circle cx="68" cy="42" r="2" fill="#C4787A" fillOpacity="0.5" />
          {/* Meditation arc waves */}
          <path d="M38 75c-8-10-8-24 0-34" stroke="#C4787A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M32 78c-10-12-10-30 0-40" stroke="#C4787A" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M26 81c-12-14-12-36 0-46" stroke="#C4787A" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.3" />
        </svg>
      );

    case "longevidade-60":
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Heart */}
          <path d="M60 90s-28-16-28-38c0-12 8-20 18-20 6 0 10 4 10 4s4-4 10-4c10 0 18 8 18 20 0 22-28 38-28 38z" fill="#C4787A" fillOpacity="0.75" />
          {/* ECG line inside heart */}
          <polyline points="38,58 46,58 50,58 53,48 56,68 59,44 62,72 65,50 68,58 72,58 76,58 82,58" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Leaf curling around heart */}
          <path d="M82 42c6-10 16-12 20-6s0 14-8 18c-2-6-6-10-10-12z" fill="#7A9E7E" fillOpacity="0.8" />
          <path d="M84 44c4-2 10-2 14 2" stroke="#3D5A3E" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M88 82c8 4 14 2 16-4s-2-12-8-14c0 6-4 12-8 16z" fill="#7A9E7E" fillOpacity="0.6" />
          <path d="M90 80c4 0 8-2 10-6" stroke="#3D5A3E" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          {/* Small sun in corner */}
          <circle cx="22" cy="22" r="6" fill="#D4A94B" fillOpacity="0.8" />
          <line x1="22" y1="12" x2="22" y2="8" stroke="#D4A94B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="32" x2="22" y2="36" stroke="#D4A94B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="22" x2="8" y2="22" stroke="#D4A94B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="32" y1="22" x2="36" y2="22" stroke="#D4A94B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="15" x2="12" y2="12" stroke="#D4A94B" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="29" y1="15" x2="32" y2="12" stroke="#D4A94B" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="15" y1="29" x2="12" y2="32" stroke="#D4A94B" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="29" y1="29" x2="32" y2="32" stroke="#D4A94B" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case "energia-metabolismo":
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Organic gear/cog */}
          <path d="M60 30c3 0 5 2 6 4l2-1c2-2 5-2 7 0s2 5 0 7l-1 2c2 1 4 3 4 6s-2 5-4 6l1 2c2 2 2 5 0 7s-5 2-7 0l-2-1c-1 2-3 4-6 4s-5-2-6-4l-2 1c-2 2-5 2-7 0s-2-5 0-7l1-2c-2-1-4-3-4-6s2-5 4-6l-1-2c-2-2-2-5 0-7s5-2 7 0l2 1c1-2 3-4 6-4z" fill="#7A9E7E" fillOpacity="0.3" stroke="#7A9E7E" strokeWidth="1.5" />
          <circle cx="60" cy="48" r="8" fill="none" stroke="#7A9E7E" strokeWidth="1" />
          {/* Leaf on gear */}
          <path d="M68 34c2-6 8-8 12-5s3 8 0 12c-4-1-8-2-10-4s-3-2-2-3z" fill="#7A9E7E" fillOpacity="0.8" />
          <line x1="70" y1="36" x2="77" y2="38" stroke="#3D5A3E" strokeWidth="0.6" />
          {/* Lightning bolt */}
          <polygon points="62,18 52,52 60,52 56,78 74,42 64,42 70,18" fill="#D4A94B" fillOpacity="0.9" />
          <polygon points="62,18 52,52 60,52 56,78 74,42 64,42 70,18" fill="none" stroke="#B8860B" strokeWidth="0.8" />
          {/* Apple */}
          <path d="M30 65c0-10 6-18 14-18s14 8 14 18-6 20-14 20-14-10-14-20z" fill="#C4787A" fillOpacity="0.7" />
          <path d="M44 47c-2-4 0-8 4-8" stroke="#3D5A3E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M44 50c2-2 5-2 7 0" fill="#7A9E7E" fillOpacity="0.6" />
          <ellipse cx="38" cy="62" rx="3" ry="5" fill="#FFFFFF" fillOpacity="0.15" />
          {/* Apple leaf */}
          <path d="M46 50c2-4 6-5 8-2s0 6-3 8c-2-1-4-3-5-4z" fill="#7A9E7E" fillOpacity="0.7" />
        </svg>
      );

    default:
      return null;
  }
}

/* ---------- Gradient backgrounds per product ---------- */
const gradientMap: Record<string, string> = {
  "emagreca-sem-dieta": "linear-gradient(135deg, #7A9E7E, #3D5A3E)",
  "sono-profundo": "linear-gradient(135deg, #3B4A6B, #1a2040)",
  "detox-mental": "linear-gradient(135deg, #C4787A, #8B3A3C)",
  "longevidade-60": "linear-gradient(135deg, #D4A94B, #B8860B)",
  "energia-metabolismo": "linear-gradient(135deg, #6B9E6B, #2D6B2D)",
};

const produtos: Produto[] = [
  {
    id: "emagreca-sem-dieta",
    titulo: "Emagreca Sem Dieta",
    subtitulo: "Metodo S.E.M",
    badge: "Mais Vendido",
    badgeEmoji: "🔥",
    preco: "R$ 37",
    precoOriginal: "R$ 97",
    descricao:
      "Perca peso de forma permanente sem passar fome, sem contar calorias e sem radicalismos. Um metodo que funciona na sua vida real.",
    beneficios: [
      "Sem dietas restritivas ou alimentos proibidos",
      "Metodo validado — resultados em 21 dias",
      "Plano de 7 dias + cardapio completo incluso",
      "Garantia incondicional de 7 dias",
    ],
    cta: "Quero Emagrecer Agora",
    href: "/emagreca-sem-dieta",
    disponivel: true,
    destaque: true,
    gradientDark: "from-emerald-950 to-teal-900",
    gradientLight: "from-emerald-50 to-teal-50",
    accentColor: "emerald",
  },
  {
    id: "sono-profundo",
    titulo: "Sono Profundo",
    subtitulo: "Cronobiologia Aplicada",
    badge: "Em Breve",
    badgeEmoji: "🌙",
    preco: "R$ 37",
    descricao:
      "Protocolo de 30 dias para restaurar seus ciclos de sono naturalmente. Sem remedios, sem hacks — so ciencia aplicada.",
    beneficios: [
      "Cronobiologia e ritmo circadiano",
      "Tecnicas neurocientificas comprovadas",
      "Protocolo step-by-step de 30 dias",
    ],
    cta: "Entrar na Lista VIP",
    href: "/sono-profundo",
    disponivel: false,
    gradientDark: "from-violet-950 to-indigo-900",
    gradientLight: "from-violet-50 to-indigo-50",
    accentColor: "violet",
  },
  {
    id: "detox-mental",
    titulo: "Detox Mental",
    subtitulo: "Clareza e Foco",
    badge: "Em Breve",
    badgeEmoji: "🧠",
    preco: "R$ 47",
    descricao:
      "Limpe o ruido mental e desenvolva foco sustentavel em 14 dias. Menos cortisol, mais clareza, mais resultado.",
    beneficios: [
      "Reducao de cortisol e ansiedade",
      "Mindfulness pratico para rotinas ocupadas",
      "Diario estruturado de transformacao",
    ],
    cta: "Entrar na Lista VIP",
    href: "/detox-mental",
    disponivel: false,
    gradientDark: "from-amber-950 to-orange-900",
    gradientLight: "from-amber-50 to-orange-50",
    accentColor: "amber",
  },
  {
    id: "longevidade-60",
    titulo: "Longevidade 60+",
    subtitulo: "Saude e Vitalidade",
    badge: "Em Breve",
    badgeEmoji: "💛",
    preco: "R$ 47",
    descricao:
      "Protocolo de saude cardiovascular e vitalidade para quem quer viver mais e melhor apos os 60.",
    beneficios: [
      "Saude cardiovascular baseada em ciencia",
      "Exercicios adaptados para 60+",
      "Nutricao para longevidade ativa",
    ],
    cta: "Entrar na Lista VIP",
    href: "/longevidade-60",
    disponivel: false,
    gradientDark: "from-amber-950 to-yellow-900",
    gradientLight: "from-amber-50 to-yellow-50",
    accentColor: "amber",
  },
  {
    id: "energia-metabolismo",
    titulo: "Energia & Metabolismo",
    subtitulo: "Ativacao Metabolica",
    badge: "Em Breve",
    badgeEmoji: "⚡",
    preco: "R$ 57",
    descricao:
      "Ative seu metabolismo com habitos simples e cientificos. Mais energia, menos fadiga, resultados visiveis.",
    beneficios: [
      "Ativacao metabolica natural",
      "Protocolo de energia diaria",
      "Nutricao funcional pratica",
    ],
    cta: "Entrar na Lista VIP",
    href: "/energia-metabolismo",
    disponivel: false,
    gradientDark: "from-green-950 to-emerald-900",
    gradientLight: "from-green-50 to-emerald-50",
    accentColor: "green",
  },
];

const depoimentos = [
  {
    nome: "Ana Paula M.",
    local: "Sao Paulo, SP",
    texto:
      "Perdi 8kg em 6 semanas sem passar fome. O metodo e completamente diferente de tudo que tentei antes. Pela primeira vez nao me sinto culpada por comer.",
    resultado: "-8kg",
  },
  {
    nome: "Fernanda R.",
    local: "Curitiba, PR",
    texto:
      "Eu achava que o problema era eu. Falta de disciplina. O S.E.M me mostrou que era a estrategia. Em 3 semanas ja sentia diferenca na roupa.",
    resultado: "-6kg",
  },
  {
    nome: "Carla S.",
    local: "Rio de Janeiro, RJ",
    texto:
      "Finalmente um metodo que faz sentido. Aprendi a me relacionar com a comida de forma diferente. Nao sinto mais aquela compulsao noturna.",
    resultado: "-11kg",
  },
  {
    nome: "Patricia L.",
    local: "Belo Horizonte, MG",
    texto:
      "3 tentativas anteriores fracassaram. Essa foi diferente porque ataca a causa raiz, nao so o cardapio. Em 2 meses transformei minha relacao com a comida.",
    resultado: "-9kg",
  },
  {
    nome: "Juliana K.",
    local: "Porto Alegre, RS",
    texto:
      "Comprei sem expectativa e fiquei surpresa. Conteudo denso, pratico e que funciona. O plano de 7 dias ja vale cada centavo.",
    resultado: "-7kg",
  },
  {
    nome: "Marina T.",
    local: "Florianopolis, SC",
    texto:
      "Melhor investimento que fiz na saude. R$ 37 que mudaram minha relacao com o corpo. Minha autoestima voltou.",
    resultado: "-5kg",
  },
];

function HeroIllustration() {
  return (
    <div className="relative" style={{ maxWidth: 380 }}>
      {/* CSS animations */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes heroFloat2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(8deg); }
        }
        @keyframes heroFloat3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(-6deg); }
        }
        @keyframes heroBadgeBounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-4px); }
          75% { transform: translateY(2px); }
        }
        @keyframes heroSparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: scale(1.3) rotate(45deg); opacity: 1; }
        }
      `}</style>

      <svg viewBox="0 0 380 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Aura circles */}
        <circle cx="190" cy="210" r="190" fill="var(--accent)" opacity="0.03" />
        <circle cx="190" cy="210" r="150" fill="var(--accent)" opacity="0.05" />
        <circle cx="190" cy="210" r="110" fill="var(--accent)" opacity="0.07" />

        {/* === WOMAN FIGURE === */}
        {/* Legs */}
        <path d="M160 340 L155 400 L148 402 L148 408 L170 408 L170 402 L163 400 L165 340" fill="#FAF8F5" />
        <path d="M210 340 L215 400 L208 402 L208 408 L230 408 L230 402 L223 400 L218 340" fill="#FAF8F5" />
        {/* Leg shadows */}
        <path d="M160 340 L155 400 L159 400 L163 340" fill="#E8E0D8" opacity="0.3" />
        <path d="M218 340 L223 400 L219 400 L215 340" fill="#E8E0D8" opacity="0.3" />
        {/* Shoes */}
        <ellipse cx="159" cy="408" rx="14" ry="4" fill="#3D5A3E" />
        <ellipse cx="219" cy="408" rx="14" ry="4" fill="#3D5A3E" />

        {/* Body — blouse sage */}
        <path d="M145 220 Q148 200, 160 195 Q175 190, 190 188 Q205 190, 220 195 Q232 200, 235 220 L238 290 Q235 340, 220 345 L160 345 Q145 340, 142 290 Z" fill="#7A9E7E" />
        {/* Blouse shadow */}
        <path d="M145 220 Q155 240, 155 280 L155 340 L160 345 Q145 340, 142 290 L145 220Z" fill="#5E8262" opacity="0.25" />
        <path d="M235 220 Q225 240, 225 280 L225 340 L220 345 Q235 340, 238 290 L235 220Z" fill="#5E8262" opacity="0.2" />
        {/* Neckline V */}
        <path d="M170 195 L190 215 L210 195" fill="#C4956A" opacity="0.6" />
        {/* Blouse fold lines */}
        <path d="M170 240 Q185 245, 200 238" fill="none" stroke="#5E8262" strokeWidth="0.6" opacity="0.3" />
        <path d="M165 270 Q180 275, 210 268" fill="none" stroke="#5E8262" strokeWidth="0.5" opacity="0.25" />

        {/* Pants — cream */}
        <path d="M155 290 L142 345 L175 345 L185 310 L190 310 L195 310 L205 345 L238 345 L225 290 Z" fill="#FAF8F5" />
        {/* Pants shadow */}
        <path d="M155 290 L142 345 L155 345 L165 300 Z" fill="#E0D5C8" opacity="0.2" />
        {/* Belt */}
        <rect x="150" y="288" width="80" height="5" rx="2" fill="#3D5A3E" opacity="0.5" />

        {/* Left arm — relaxed */}
        <path d="M148 200 Q135 210, 128 235 Q122 258, 126 280 Q128 290, 132 295" fill="#7A9E7E" />
        <path d="M128 280 Q125 288, 128 295 Q130 300, 135 298 Q138 292, 135 285 Z" fill="#C4956A" />
        {/* Arm shadow */}
        <path d="M148 200 Q138 210, 132 230 L136 230 Q142 212, 150 204Z" fill="#5E8262" opacity="0.2" />

        {/* Right arm — holding leaf */}
        <path d="M232 200 Q245 210, 252 235 Q258 260, 254 285 Q252 292, 248 296" fill="#7A9E7E" />
        <path d="M254 282 Q257 290, 255 296 Q252 302, 248 298 Q245 292, 248 285Z" fill="#C4956A" />
        {/* Right hand holding stem */}
        <path d="M250 290 Q248 296, 252 300 L255 298 Q258 294, 254 288Z" fill="#A07850" opacity="0.4" />

        {/* Big leaf in right hand */}
        <path d="M252 296 Q270 270, 285 240 Q295 220, 290 210 Q285 215, 275 235 Q265 255, 252 296Z" fill="#7A9E7E" />
        <path d="M252 296 Q265 268, 278 242 L280 244 Q267 270, 254 298Z" fill="#3D5A3E" opacity="0.25" />
        {/* Leaf vein */}
        <path d="M255 290 Q268 262, 282 232" fill="none" stroke="#3D5A3E" strokeWidth="0.8" opacity="0.3" />
        <path d="M262 276 Q268 268, 278 252" fill="none" stroke="#3D5A3E" strokeWidth="0.5" opacity="0.2" />

        {/* Neck */}
        <rect x="178" y="175" width="24" height="20" rx="5" fill="#C4956A" />
        <path d="M182 180 Q190 183, 198 180" fill="none" stroke="#A07850" strokeWidth="0.5" opacity="0.25" />

        {/* Head */}
        <ellipse cx="190" cy="148" rx="38" ry="44" fill="#C4956A" />
        {/* Face shadows */}
        <path d="M152 150 Q158 178, 172 188 Q190 195, 208 188 Q222 178, 228 150" fill="#A07850" opacity="0.1" />
        {/* Cheek blush */}
        <ellipse cx="168" cy="158" rx="8" ry="5" fill="#D4897A" opacity="0.2" />
        <ellipse cx="212" cy="158" rx="8" ry="5" fill="#D4897A" opacity="0.2" />
        {/* Forehead highlight */}
        <ellipse cx="190" cy="125" rx="14" ry="7" fill="#D4A87E" opacity="0.15" />

        {/* Eyes — closed (satisfaction) — curved lines */}
        <path d="M172 145 Q176 140, 180 145" fill="none" stroke="#2D2D2D" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M200 145 Q204 140, 208 145" fill="none" stroke="#2D2D2D" strokeWidth="1.8" strokeLinecap="round" />
        {/* Eyelashes from closed eyes */}
        <path d="M171 145 L169 142" stroke="#2D2D2D" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M174 142 L173 139" stroke="#2D2D2D" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M209 145 L211 142" stroke="#2D2D2D" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M206 142 L207 139" stroke="#2D2D2D" strokeWidth="0.7" strokeLinecap="round" />

        {/* Eyebrows */}
        <path d="M168 136 Q174 132, 182 134" fill="none" stroke="#3B2314" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M198 134 Q206 132, 212 136" fill="none" stroke="#3B2314" strokeWidth="1.5" strokeLinecap="round" />

        {/* Nose */}
        <path d="M190 142 Q188 150, 186 155 Q185 157, 187 158 Q190 159, 193 158 Q195 157, 194 155 Q192 150, 190 142" fill="none" stroke="#A07850" strokeWidth="0.7" opacity="0.45" />

        {/* Smile — warm, teeth showing */}
        <path d="M178 165 Q183 163, 186 164 Q190 165, 194 164 Q197 163, 202 165" fill="#B85A5A" />
        <path d="M178 165 Q183 170, 188 171 Q190 171.5, 192 171 Q197 170, 202 165" fill="#9A4545" />
        <path d="M182 165.5 L198 165.5" stroke="white" strokeWidth="2" opacity="0.45" />
        {/* Smile dimples */}
        <path d="M176 163 Q175 166, 176 168" fill="none" stroke="#A07850" strokeWidth="0.5" opacity="0.2" />
        <path d="M204 163 Q205 166, 204 168" fill="none" stroke="#A07850" strokeWidth="0.5" opacity="0.2" />

        {/* Hair — brown, long, wavy, flowing */}
        {/* Back hair */}
        <path d="M148 120 C148 90, 160 70, 190 68 C220 70, 232 90, 232 120 L236 180 Q238 200, 240 220 Q242 240, 238 255 Q234 248, 232 235 Q230 215, 228 195 L228 130 Q226 100, 210 88 C200 82, 180 82, 170 88 Q154 100, 152 130 L152 195 Q150 215, 148 235 Q146 248, 142 255 Q138 240, 140 220 Q142 200, 144 180 Z" fill="#3B2314" />
        {/* Front hair — bangs and framing */}
        <path d="M152 118 C152 92, 164 76, 190 74 C216 76, 228 92, 228 118 Q226 108, 218 96 Q206 86, 190 84 Q174 86, 162 96 Q154 108, 152 118Z" fill="#3B2314" />
        {/* Hair volume top */}
        <path d="M156 110 C156 88, 168 72, 190 70 C212 72, 224 88, 224 110 Q220 98, 210 88 Q200 80, 190 78 Q180 80, 170 88 Q160 98, 156 110Z" fill="#4A3020" opacity="0.5" />
        {/* Hair shine */}
        <path d="M168 82 Q178 76, 190 75 Q202 76, 210 80" fill="none" stroke="#6B4E30" strokeWidth="1.5" opacity="0.35" />
        <path d="M172 90 Q182 85, 192 84" fill="none" stroke="#6B4E30" strokeWidth="1" opacity="0.25" />
        {/* Flowing strands left */}
        <path d="M152 120 Q148 140, 145 165 Q142 185, 140 200 Q138 215, 140 225" fill="none" stroke="#3B2314" strokeWidth="5" strokeLinecap="round" />
        <path d="M154 125 Q150 145, 148 168 Q146 188, 146 205" fill="none" stroke="#4A3020" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        {/* Flowing strands right */}
        <path d="M228 120 Q232 140, 235 165 Q238 185, 240 200 Q242 215, 240 225" fill="none" stroke="#3B2314" strokeWidth="5" strokeLinecap="round" />
        <path d="M226 125 Q230 145, 232 168 Q234 188, 234 205" fill="none" stroke="#4A3020" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
        {/* Wind-blown strand */}
        <path d="M236 140 Q248 135, 256 140 Q262 146, 258 155" fill="none" stroke="#3B2314" strokeWidth="3" strokeLinecap="round" />

        {/* Floating leaves */}
        <g style={{ animation: 'heroFloat 3s ease-in-out infinite' }}>
          <path d="M60 180 Q65 170, 75 172 Q80 175, 75 182 Q70 188, 60 180Z" fill="#7A9E7E" opacity="0.6" />
          <path d="M60 180 L75 177" stroke="#3D5A3E" strokeWidth="0.4" opacity="0.4" />
        </g>
        <g style={{ animation: 'heroFloat2 3.5s ease-in-out infinite', animationDelay: '0.8s' }}>
          <path d="M320 140 Q326 130, 335 133 Q340 138, 333 144 Q326 148, 320 140Z" fill="#7A9E7E" opacity="0.5" />
          <path d="M320 140 L333 138" stroke="#3D5A3E" strokeWidth="0.4" opacity="0.3" />
        </g>
        <g style={{ animation: 'heroFloat3 4s ease-in-out infinite', animationDelay: '1.5s' }}>
          <path d="M90 300 Q95 290, 105 293 Q108 298, 102 304 Q95 308, 90 300Z" fill="#7A9E7E" opacity="0.45" />
        </g>
        <g style={{ animation: 'heroFloat 3.2s ease-in-out infinite', animationDelay: '2s' }}>
          <path d="M300 280 Q304 272, 312 275 Q315 280, 310 285 Q304 288, 300 280Z" fill="#7A9E7E" opacity="0.4" />
        </g>
        <g style={{ animation: 'heroFloat2 3.8s ease-in-out infinite', animationDelay: '0.5s' }}>
          <path d="M340 320 Q345 312, 352 316 Q354 320, 349 324 Q343 326, 340 320Z" fill="#7A9E7E" opacity="0.35" />
        </g>

        {/* Sparkles */}
        <g style={{ animation: 'heroSparkle 6s infinite' }}>
          <path d="M85 120 L87 114 L89 120 L95 122 L89 124 L87 130 L85 124 L79 122Z" fill="#D4A94B" opacity="0.7" />
        </g>
        <g style={{ animation: 'heroSparkle 6s infinite', animationDelay: '3s' }}>
          <path d="M310 90 L311.5 85 L313 90 L318 91.5 L313 93 L311.5 98 L310 93 L305 91.5Z" fill="#D4A94B" opacity="0.6" />
        </g>

        {/* Floating badge — result card */}
        <g style={{ animation: 'heroBadgeBounce 4s ease-in-out infinite' }}>
          <rect x="50" y="310" width="120" height="48" rx="12" fill="var(--bg-card)" stroke="var(--border-default)" strokeWidth="1" />
          {/* Check circle */}
          <circle cx="72" cy="328" r="8" fill="#7A9E7E" opacity="0.15" />
          <path d="M68 328 L71 331 L77 325" stroke="#7A9E7E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Text */}
          <text x="83" y="331" fontSize="9" fontWeight="700" fill="var(--text-primary)" fontFamily="sans-serif">-6kg em 3 sem.</text>
          {/* Stars */}
          <g fill="#D4A94B">
            <path d="M72 342 l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" />
            <path d="M79 342 l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" />
            <path d="M86 342 l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" />
            <path d="M93 342 l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" />
            <path d="M100 342 l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="themed min-h-screen antialiased">
      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2C5.6 2 4 4 4 6c0 3 4 8 4 8s4-5 4-8c0-2-1.6-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Longetividade
            </span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="#cursos"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              Programas
            </Link>
            <Link
              href="#depoimentos"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              Depoimentos
            </Link>
            <Link
              href="#lista-vip"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              Lista VIP
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/emagreca-sem-dieta"
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Comecar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — split 60/40 com ilustração */}
      <section className="relative overflow-hidden px-6 pt-28 pb-16 md:pt-32 md:pb-24">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--accent-soft)" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* LEFT — text 60% */}
          <div className="flex-1 text-center md:text-left">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{
                borderColor: "var(--border-default)",
                backgroundColor: "var(--accent-soft)",
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--accent)" }}
              />
              <span
                className="text-xs font-medium tracking-wide"
                style={{ color: "var(--accent-text)" }}
              >
                Mais de 12.400 mulheres transformadas
              </span>
            </div>
            <h1
              className="text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl"
              style={{ color: "var(--text-primary)" }}
            >
              Viva Mais.
              <br />
              <span style={{ color: "var(--accent)" }}>Viva Melhor.</span>
            </h1>
            <p
              className="mt-6 max-w-xl text-lg leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Programas baseados em ciencia para transformar sua saude, peso e
              energia. Metodos que funcionam na vida real.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <Link
                href="/emagreca-sem-dieta"
                className="rounded-2xl px-8 py-4 text-base font-bold text-white transition-all active:scale-95"
                style={{
                  backgroundColor: "var(--accent)",
                  boxShadow: "0 8px 32px var(--accent-soft)",
                }}
              >
                Ver Programas →
              </Link>
              <Link
                href="#depoimentos"
                className="rounded-2xl border px-8 py-4 text-base font-medium transition-all"
                style={{
                  borderColor: "var(--border-default)",
                  color: "var(--text-secondary)",
                }}
              >
                Ver Resultados
              </Link>
            </div>
          </div>

          {/* RIGHT — ilustração 40% */}
          <div className="flex-shrink-0 w-full max-w-[320px] md:max-w-[380px]">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* STATS */}
      <div
        className="border-y py-6"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--shimmer)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-around gap-8 px-6">
          {[
            { n: "12.400+", l: "alunos ativos" },
            { n: "4.9 ★", l: "avaliacao media" },
            { n: "97%", l: "satisfacao" },
            { n: "21 dias", l: "primeiros resultados" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center gap-1">
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {s.n}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {s.l}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CURSOS */}
      <section id="cursos" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Nossa colecao
          </p>
          <h2
            className="text-4xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Programas de Longevidade
          </h2>
          <p
            className="mt-3 max-w-lg mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Cada programa foi desenvolvido para uma area especifica da saude,
            com metodos praticos e resultados mensuráveis.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured card — spans 2 cols */}
          {produtos
            .filter((p) => p.destaque)
            .map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01] neon-border md:col-span-2 lg:col-span-2"
                style={{
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--border-hover), transparent)",
                  }}
                />
                <div className="absolute top-5 right-5 z-10">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold"
                    style={{
                      borderColor: "var(--border-default)",
                      backgroundColor: "var(--accent-soft)",
                      color: "var(--accent-text)",
                    }}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                    {p.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-4 p-7 flex-1 md:flex-row md:items-center md:gap-8">
                  <div className="flex flex-col gap-3 md:flex-1">
                    <p
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {p.badgeEmoji} {p.subtitulo}
                    </p>
                    <h2
                      className="text-3xl font-bold leading-tight md:text-4xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {p.titulo}
                    </h2>
                    <p
                      className="text-sm leading-relaxed max-w-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {p.descricao}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {p.beneficios.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <svg
                            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            style={{ color: "var(--accent)" }}
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {b}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-3 mt-4 md:flex-row md:items-center">
                      <div className="flex items-baseline gap-2">
                        {p.precoOriginal && (
                          <span
                            className="text-sm line-through"
                            style={{ color: "var(--text-hint)" }}
                          >
                            {p.precoOriginal}
                          </span>
                        )}
                        <span
                          className="text-4xl font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {p.preco}
                        </span>
                      </div>
                      <button
                        className="rounded-xl py-3.5 px-6 text-base font-semibold text-white transition-all duration-200 active:scale-95"
                        style={{ backgroundColor: "var(--accent)" }}
                      >
                        {p.cta} →
                      </button>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-hint)" }}
                    >
                      Pagamento seguro · Acesso imediato
                    </p>
                  </div>
                  {/* SVG Art area — right side for featured */}
                  <div
                    className="flex items-center justify-center rounded-xl p-6 md:min-w-[200px] md:w-[220px] md:h-[220px]"
                    style={{
                      background: gradientMap[p.id],
                    }}
                  >
                    <div className="w-[140px] h-[140px]">
                      <ProductArt id={p.id} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          {/* Other cards */}
          {produtos
            .filter((p) => !p.destaque)
            .map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01] neon-border"
                style={{
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card)",
                  minHeight: "300px",
                }}
              >
                {/* SVG Art area — top for regular cards */}
                <div
                  className="flex items-center justify-center rounded-t-2xl p-5"
                  style={{
                    background: gradientMap[p.id],
                    minHeight: "140px",
                  }}
                >
                  <div className="w-[100px] h-[100px]">
                    <ProductArt id={p.id} />
                  </div>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                    style={{
                      borderColor: "rgba(255,255,255,0.2)",
                      backgroundColor: "rgba(0,0,0,0.25)",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {p.badgeEmoji} {p.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-3 p-7 flex-1">
                  <p
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.subtitulo}
                  </p>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.titulo}
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.descricao}
                  </p>
                  <ul className="flex flex-col gap-1.5 mt-1">
                    {p.beneficios.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <svg
                          className="mt-0.5 h-3 w-3 flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3 mt-auto pt-4">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.preco}
                      </span>
                    </div>
                    <button
                      className="w-full rounded-xl border py-3 px-4 text-sm font-medium transition-all"
                      style={{
                        borderColor: "var(--border-default)",
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--shimmer)",
                      }}
                    >
                      {p.cta}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* GARANTIA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="rounded-2xl border p-8 md:p-12"
            style={{
              borderColor: "var(--border-default)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{
                borderColor: "var(--border-default)",
                backgroundColor: "var(--accent-soft)",
              }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: "var(--accent)" }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              className="mb-3 text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Garantia Incondicional de 7 Dias
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Devolvemos 100% do seu dinheiro. Sem burocracia, sem perguntas.
              O risco e todo nosso.
            </p>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section
        id="depoimentos"
        className="py-24"
        style={{ backgroundColor: "var(--shimmer)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Resultados reais
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Quem ja transformou
            </h2>
            <p
              className="mt-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Mais de 12.400 pessoas ja usaram o Metodo S.E.M para emagrecer sem sofrimento.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {depoimentos.map((d) => (
              <div
                key={d.nome}
                className="flex flex-col gap-4 rounded-2xl border p-6 transition-colors"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 text-amber-400"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.2L8 10.5l-3.8 2 .7-4.2-3-2.9 4.2-.6z" />
                      </svg>
                    ))}
                  </div>
                  <BadgeResultado resultado={d.resultado} />
                </div>
                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &ldquo;{d.texto}&rdquo;
                </p>
                <div
                  className="mt-auto flex items-center gap-3 pt-3 border-t"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <AvatarDepoimento name={d.nome.split(" ")[0].toLowerCase()} size={40} />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {d.nome}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {d.local}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LISTA VIP */}
      <section id="lista-vip" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent-text)" }}
          >
            Novos lancamentos
          </p>
          <h3
            className="mb-4 text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Entre na Lista VIP
          </h3>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Seja o primeiro a saber dos novos programas com desconto exclusivo
            para quem esta na lista.
          </p>
          <LeadCapture source="homepage-vip" />
          <p className="mt-3 text-xs" style={{ color: "var(--text-hint)" }}>
            Sem spam. Apenas novidades que importam.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t py-10"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 px-6 md:flex-row md:justify-between">
          <span
            className="text-sm font-bold"
            style={{ color: "var(--text-muted)" }}
          >
            Longetividade
          </span>
          <div className="flex gap-6 text-xs" style={{ color: "var(--text-hint)" }}>
            <Link
              href="/privacidade"
              className="transition-colors hover:opacity-70"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="transition-colors hover:opacity-70"
            >
              Termos
            </Link>
            <Link
              href="mailto:contato@longetividade.com.br"
              className="transition-colors hover:opacity-70"
            >
              Contato
            </Link>
          </div>
          <p className="text-xs" style={{ color: "var(--text-hint)" }}>
            © {new Date().getFullYear()} Longetividade.
          </p>
        </div>
      </footer>
    </div>
  );
}
