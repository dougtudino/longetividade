// Atividades extras desbloqueaveis por nível.
// Modelo híbrido: app sugere atividade (gamificação), pessoa escolhe
// o tempo entre opções pré-definidas. XP proporcional ao tempo.
//
// Filosofia: atividades crescem em complexidade conforme a usuária
// consolida hábitos. Nv 1 começa com caminhada (todo mundo consegue).
// Nv 7+ envolve outras pessoas (família, voluntariado). Nv 10 é
// expressão criativa.

export type ActivityCategory = "movimento" | "mental" | "social" | "criativo";

export type TimeOption = {
  minutes: number;
  xp: number;
};

export type Activity = {
  id: string;
  name: string;
  icon: string;
  category: ActivityCategory;
  description: string;
  scienceTip?: string; // base científica curta
  timeOptions: TimeOption[];
  requiredLevel: number; // 1..10
};

export const ACTIVITIES: Activity[] = [
  // ─── Nv 1: desbloqueada desde o início ────────────────────
  {
    id: "caminhada",
    name: "Caminhada",
    icon: "🚶",
    category: "movimento",
    description: "Andar em ritmo confortável, ao ar livre ou na esteira.",
    scienceTip: "150 min/sem de caminhada reduz risco cardiovascular em ~30% (OMS).",
    timeOptions: [
      { minutes: 10, xp: 10 },
      { minutes: 20, xp: 18 },
      { minutes: 30, xp: 25 },
      { minutes: 45, xp: 35 },
      { minutes: 60, xp: 45 },
    ],
    requiredLevel: 1,
  },

  // ─── Nv 2 ─────────────────────────────────────────────────
  {
    id: "alongamento",
    name: "Alongamento",
    icon: "🧘",
    category: "mental",
    description: "Estica e relaxa o corpo, principalmente pescoço, ombros, lombar.",
    scienceTip: "Alongamento reduz tensão muscular acumulada e melhora qualidade do sono.",
    timeOptions: [
      { minutes: 5, xp: 6 },
      { minutes: 10, xp: 10 },
      { minutes: 15, xp: 14 },
      { minutes: 20, xp: 18 },
    ],
    requiredLevel: 2,
  },

  // ─── Nv 3 ─────────────────────────────────────────────────
  {
    id: "ioga",
    name: "Yoga",
    icon: "🧘‍♀️",
    category: "mental",
    description: "Aula de yoga em casa, vídeo no YouTube, ou estúdio.",
    scienceTip: "8 semanas de yoga reduzem cortisol e sintomas de ansiedade (meta-análise 2020).",
    timeOptions: [
      { minutes: 15, xp: 16 },
      { minutes: 30, xp: 28 },
      { minutes: 45, xp: 38 },
      { minutes: 60, xp: 50 },
    ],
    requiredLevel: 3,
  },

  // ─── Nv 4 ─────────────────────────────────────────────────
  {
    id: "bicicleta",
    name: "Bicicleta",
    icon: "🚴",
    category: "movimento",
    description: "Pedalar ao ar livre ou ergométrica em casa/academia.",
    scienceTip: "Ciclismo regular eleva VO2max e protege articulações vs. corrida.",
    timeOptions: [
      { minutes: 20, xp: 22 },
      { minutes: 30, xp: 32 },
      { minutes: 45, xp: 45 },
      { minutes: 60, xp: 58 },
      { minutes: 90, xp: 80 },
    ],
    requiredLevel: 4,
  },

  // ─── Nv 5 ─────────────────────────────────────────────────
  {
    id: "danca",
    name: "Dança",
    icon: "💃",
    category: "movimento",
    description: "Solta o corpo na música que você ama. Sozinha ou em grupo.",
    scienceTip: "Dança combina exercício aeróbico + cognição + humor — único nesse trio.",
    timeOptions: [
      { minutes: 15, xp: 16 },
      { minutes: 30, xp: 28 },
      { minutes: 45, xp: 40 },
      { minutes: 60, xp: 52 },
    ],
    requiredLevel: 5,
  },

  // ─── Nv 6 ─────────────────────────────────────────────────
  {
    id: "natacao",
    name: "Natação",
    icon: "🏊‍♀️",
    category: "movimento",
    description: "Piscina, mar, lagoa. Qualquer estilo conta.",
    scienceTip: "Natação trabalha praticamente todos os músculos sem impacto articular.",
    timeOptions: [
      { minutes: 20, xp: 22 },
      { minutes: 40, xp: 42 },
      { minutes: 60, xp: 60 },
    ],
    requiredLevel: 6,
  },

  // ─── Nv 7 ─────────────────────────────────────────────────
  {
    id: "familia",
    name: "Tempo em família",
    icon: "👨‍👩‍👧",
    category: "social",
    description: "Atividade presente sem celular com quem você ama (filho, mãe, parceiro, amiga).",
    scienceTip: "Conexões sociais são o preditor #1 de longevidade no Harvard Study (85 anos, n=730+).",
    timeOptions: [
      { minutes: 30, xp: 22 },
      { minutes: 60, xp: 40 },
      { minutes: 120, xp: 70 },
    ],
    requiredLevel: 7,
  },

  // ─── Nv 8 ─────────────────────────────────────────────────
  {
    id: "leitura",
    name: "Leitura",
    icon: "📖",
    category: "criativo",
    description: "Livro, revista, conteúdo profundo. Sem ser scroll de redes sociais.",
    scienceTip: "30 min/dia de leitura associados a -23% de mortalidade ao longo de 12 anos.",
    timeOptions: [
      { minutes: 15, xp: 14 },
      { minutes: 30, xp: 26 },
      { minutes: 60, xp: 48 },
    ],
    requiredLevel: 8,
  },

  // ─── Nv 9 ─────────────────────────────────────────────────
  {
    id: "voluntariado",
    name: "Voluntariado",
    icon: "🤝",
    category: "social",
    description: "Ajudar alguém ou uma causa. Online ou presencial.",
    scienceTip: "Ajudar outros ativa circuitos de recompensa e reduz inflamação (estudos em altruísmo).",
    timeOptions: [
      { minutes: 60, xp: 45 },
      { minutes: 120, xp: 80 },
    ],
    requiredLevel: 9,
  },

  // ─── Nv 10 ────────────────────────────────────────────────
  {
    id: "criativo",
    name: "Projeto criativo",
    icon: "🎨",
    category: "criativo",
    description: "Artesanato, escrita, música, pintura, jardinagem — qualquer expressão.",
    scienceTip: "Atividade criativa ativa flow e reduz ruminação mental (Csikszentmihalyi).",
    timeOptions: [
      { minutes: 30, xp: 28 },
      { minutes: 60, xp: 50 },
      { minutes: 120, xp: 85 },
    ],
    requiredLevel: 10,
  },
];

export const CATEGORY_META: Record<ActivityCategory, { label: string; color: string }> = {
  movimento: { label: "Movimento", color: "#378ADD" },
  mental: { label: "Mental", color: "#639922" },
  social: { label: "Social", color: "#FF9800" },
  criativo: { label: "Criativo", color: "#E91E63" },
};
