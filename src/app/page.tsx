// src/app/page.tsx — Homepage Master Longetividade
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import LeadCapture from "@/components/LeadCapture";
import ThemeToggle from "@/components/ThemeToggle";
import { BadgeResultado } from "@/components/visual";

const AVATAR_MAP: Record<string, string> = {
  fernanda: "/images/avatar-fernanda.png",
  camila: "/images/avatar-camila.png",
  "patrícia": "/images/avatar-patricia.jpg",
  ana: "/images/avatar-ana.jpg",
  carla: "/images/avatar-carla.jpg",
  juliana: "/images/avatar-juliana.png",
  marina: "/images/avatar-marina.jpg",
};

export const metadata: Metadata = {
  title: "Longetividade — Viva Mais, Viva Melhor",
  description:
    "Programas de saúde e longevidade baseados em ciência. Métodos e protocolos para transformar seu peso, sono e energia.",
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
    titulo: "Emagreça Sem Dieta",
    subtitulo: "Método S.E.M",
    badge: "Mais Vendido",
    badgeEmoji: "🔥",
    preco: "R$ 37",
    precoOriginal: "R$ 97",
    descricao:
      "Perca peso de forma permanente sem passar fome, sem contar calorias e sem radicalismos. Um método que funciona na sua vida real.",
    beneficios: [
      "Sem dietas restritivas ou alimentos proibidos",
      "Método validado — resultados em 21 dias",
      "Plano de 7 dias + cardápio completo incluso",
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
      "Protocolo de 30 dias para restaurar seus ciclos de sono naturalmente. Sem remédios, sem hacks — só ciência aplicada.",
    beneficios: [
      "Cronobiologia e ritmo circadiano",
      "Técnicas neurocientíficas comprovadas",
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
      "Limpe o ruído mental e desenvolva foco sustentável em 14 dias. Menos cortisol, mais clareza, mais resultado.",
    beneficios: [
      "Redução de cortisol e ansiedade",
      "Mindfulness prático para rotinas ocupadas",
      "Diário estruturado de transformação",
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
    subtitulo: "Saúde e Vitalidade",
    badge: "Em Breve",
    badgeEmoji: "💛",
    preco: "R$ 47",
    descricao:
      "Protocolo de saúde cardiovascular e vitalidade para quem quer viver mais e melhor após os 60.",
    beneficios: [
      "Saúde cardiovascular baseada em ciência",
      "Exercícios adaptados para 60+",
      "Nutrição para longevidade ativa",
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
    subtitulo: "Ativação Metabólica",
    badge: "Em Breve",
    badgeEmoji: "⚡",
    preco: "R$ 57",
    descricao:
      "Ative seu metabolismo com hábitos simples e científicos. Mais energia, menos fadiga, resultados visíveis.",
    beneficios: [
      "Ativação metabólica natural",
      "Protocolo de energia diária",
      "Nutrição funcional prática",
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
    local: "São Paulo, SP",
    texto:
      "Perdi 8kg em 6 semanas sem passar fome. O método é completamente diferente de tudo que tentei antes. Pela primeira vez não me sinto culpada por comer.",
    resultado: "-8kg",
  },
  {
    nome: "Fernanda R.",
    local: "Curitiba, PR",
    texto:
      "Eu achava que o problema era eu. Falta de disciplina. O S.E.M me mostrou que era a estratégia. Em 3 semanas já sentia diferença na roupa.",
    resultado: "-6kg",
  },
  {
    nome: "Carla S.",
    local: "Rio de Janeiro, RJ",
    texto:
      "Finalmente um método que faz sentido. Aprendi a me relacionar com a comida de forma diferente. Não sinto mais aquela compulsão noturna.",
    resultado: "-11kg",
  },
  {
    nome: "Patrícia L.",
    local: "Belo Horizonte, MG",
    texto:
      "3 tentativas anteriores fracassaram. Essa foi diferente porque ataca a causa raiz, não só o cardápio. Em 2 meses transformei minha relação com a comida.",
    resultado: "-9kg",
  },
  {
    nome: "Juliana K.",
    local: "Porto Alegre, RS",
    texto:
      "Comprei sem expectativa e fiquei surpresa. Conteúdo denso, prático e que funciona. O plano de 7 dias já vale cada centavo.",
    resultado: "-7kg",
  },
  {
    nome: "Marina T.",
    local: "Florianópolis, SC",
    texto:
      "Melhor investimento que fiz na saúde. R$ 37 que mudaram minha relação com o corpo. Minha autoestima voltou.",
    resultado: "-5kg",
  },
];

function HeroIllustration() {
  return (
    <div className="relative" style={{ maxWidth: 380 }}>
      <Image
        src="/images/hero-woman.png"
        alt="Mulher saudável e confiante segurando uma folha verde"
        width={380}
        height={507}
        className="w-full h-auto rounded-3xl"
        priority
      />
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
              Começar Agora
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
              Programas baseados em ciência para transformar sua saúde, peso e
              energia. Métodos que funcionam na vida real.
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
            { n: "4.9 ★", l: "avaliação média" },
            { n: "97%", l: "satisfação" },
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
            Nossa coleção
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
            Cada programa foi desenvolvido para uma área específica da saúde,
            com métodos práticos e resultados mensuráveis.
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
              O risco é todo nosso.
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
              Quem já transformou
            </h2>
            <p
              className="mt-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Mais de 12.400 pessoas já usaram o Método S.E.M para emagrecer sem sofrimento.
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
                  {AVATAR_MAP[d.nome.split(" ")[0].toLowerCase()] ? (
                    <Image
                      src={AVATAR_MAP[d.nome.split(" ")[0].toLowerCase()]}
                      alt={d.nome}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      style={{ width: 40, height: 40 }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-text)" }}
                    >
                      {d.nome.charAt(0)}
                    </div>
                  )}
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
            Novos lançamentos
          </p>
          <h3
            className="mb-4 text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Entre na Lista VIP
          </h3>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Seja o primeiro a saber dos novos programas com desconto exclusivo
            para quem está na lista.
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
