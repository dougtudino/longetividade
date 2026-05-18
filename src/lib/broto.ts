// Broto — motor emocional do app. Calcula o estado da plantinha DERIVADO
// dos sinais existentes (checkin, streak, ciclo, hábitos, água, ausência).
// NADA é persistido — toda computação é em tempo real a partir do banco.
// Reseta automaticamente quando user usa /api/app/reset.
//
// Princípio: sobe fácil, desce devagar, Stage 5 é eterno (medalha).
// O Broto NUNCA culpa, pune ou pressiona — só acolhe, acompanha, comemora.

import { prisma } from "./prisma";
import { getStreak } from "./streaks";
import { brasilToday, brasilStartOfDay } from "./tz";

// ─── Tipos ────────────────────────────────────────

export type BrotoStage = 1 | 2 | 3 | 4 | 5;
export type BrotoMood = "animado" | "feliz" | "tranquilo" | "sonolento" | "saudoso";

export type BrotoState = {
  stage: BrotoStage;
  stageName: string;
  mood: BrotoMood;
  imageKey: string; // path relativo pra <img src>
  message: string; // microcopy contextual pro card
  brotoName: string; // nome do Broto (personalizado pela usuária, default "Broto")
  daysSinceLastCheckin: number;
  // Sinais brutos usados pra calcular (úteis pro UI mostrar contexto)
  signals: {
    streak: number;
    cyclesCompleted: number;
    currentCycleDay: number | null;
    habitsCheckedToday: number;
    waterCount: number;
    waterGoal: number;
    hasCheckinToday: boolean;
    cycleCompletedToday: boolean;
  };
};

// ─── Stage mapping (slot da sprite → arquivo final) ─────────
// Pra trocar imagem por stage, basta substituir o arquivo em /public/broto/

const STAGE_IMAGES: Record<BrotoStage, string> = {
  1: "/broto/stage-1-semente.png",
  2: "/broto/stage-2-brotinho.png",
  3: "/broto/stage-3-folhinhas.png",
  4: "/broto/stage-4-plantinha.png",
  5: "/broto/stage-5-florido.png",
};

const STAGE_NAMES: Record<BrotoStage, string> = {
  1: "Semente",
  2: "Brotinho",
  3: "Folhinhas",
  4: "Plantinha Forte",
  5: "Florido",
};

// ─── Regras de evolução ────────────────────────────────────
// Sobe fácil, desce devagar. Stage 5 nunca regride.

type StageRule = {
  stage: BrotoStage;
  // Condição pra estar PELO MENOS nesse stage. Usa OR (streak OU ciclo).
  minStreak?: number;
  minCycleDay?: number; // dia do ciclo 1+
  minCyclesCompleted?: number;
  // Quantos dias de ausência derrubam DESSE stage de volta pro anterior.
  // null = não regride (stage 5 é eterno).
  // 0 = só vai pra esse stage se as condições estiverem satisfeitas (Stage 1).
  regressAfterDays: number | null;
};

const STAGE_RULES: StageRule[] = [
  { stage: 1, regressAfterDays: 0 },
  { stage: 2, minStreak: 3, minCycleDay: 4, regressAfterDays: 21 },
  { stage: 3, minStreak: 7, minCycleDay: 11, regressAfterDays: 14 },
  { stage: 4, minStreak: 14, minCycleDay: 18, regressAfterDays: 10 },
  { stage: 5, minCyclesCompleted: 1, minStreak: 21, regressAfterDays: null },
];

// ─── Microcopy por estado ──────────────────────────────────
// Mensagens curtas. Tom acolhedor, nunca de cobrança.
// O conjunto certo depende de (mood, stage, momento especial).

const MESSAGES_BY_MOOD: Record<BrotoMood, string[]> = {
  animado: [
    "{name} está radiante 🌸",
    "Você cuidou de você hoje. Olha o brilho.",
    "Dia completo. {name} agradece.",
  ],
  feliz: [
    "{name} ficou feliz hoje 💚",
    "Você apareceu por você. Isso já é vitória.",
    "{name} sente cada cuidadinho.",
  ],
  tranquilo: [
    "{name} agradece a visita.",
    "Pequenos passos também contam.",
    "Você está aqui. Já está cuidando.",
  ],
  sonolento: [
    "{name} cochilou. Que tal um copo de água?",
    "Hoje é um bom dia pra começar de novo.",
    "{name} está te esperando 💚",
  ],
  saudoso: [
    "{name} sentiu sua falta. Que bom te ver.",
    "Que bom você voltou. Sem pressão.",
    "{name} guardou o lugar pra você.",
  ],
};

// Mensagem especial sobreposta quando o user acabou de subir de stage.
// Renderizado como toast/banner separado pelo UI.
const GROWTH_HINT_BY_STAGE: Record<BrotoStage, string> = {
  1: "",
  2: "🌿 {name} cresceu uma folha nova.",
  3: "🪴 {name} está mais firme. Vocês estão crescendo juntas.",
  4: "🌳 {name} está forte. Olha o quanto você fez.",
  5: "🌸 {name} floresceu. Esse momento é seu.",
};

// ─── Calculador principal ───────────────────────────────────

export async function getBrotoState(userId: string): Promise<BrotoState> {
  const today = brasilToday();
  const todayStart = brasilStartOfDay();

  // Sinais em paralelo
  const [
    streak,
    checkinToday,
    cycles,
    profile,
  ] = await Promise.all([
    getStreak(userId),
    prisma.appCheckin.findUnique({
      where: { userId_date: { userId, date: todayStart } },
    }),
    prisma.appCycle.findMany({
      where: { userId },
      orderBy: { cycleNumber: "desc" },
    }),
    prisma.appProfile.findUnique({
      where: { userId },
      select: { waterGoal: true, brotoName: true },
    }),
  ]);

  // brotoName eh capitalizado pelo input do user. Default "Broto" se nao
  // setado ou se a coluna ainda nao existir (DB pre-migration).
  const brotoName =
    (profile as { brotoName?: string } | null)?.brotoName?.trim() || "Broto";

  const cyclesCompleted = cycles.filter((c) => c.status === "completed").length;
  const currentCycle = cycles.find((c) => c.status === "active" || c.status === "paused");
  const currentCycleDay = currentCycle
    ? computeCycleDay(currentCycle.startDate)
    : null;
  const cycleCompletedToday =
    currentCycle?.completedAt != null &&
    dateToBrString(currentCycle.completedAt) === today;

  const habits = (checkinToday?.habits as Record<string, boolean> | null) ?? {};
  const habitsCheckedToday = Object.values(habits).filter(Boolean).length;
  const waterCount = checkinToday?.waterCount ?? 0;
  const waterGoal = profile?.waterGoal ?? 8;
  const hasCheckinToday = checkinToday != null;

  // Última atividade: maior data entre checkin/water/mood/weight
  const lastActivityDays = await computeDaysSinceLastActivity(userId);

  // Resolve stage aplicando rules em ordem decrescente
  const stage = resolveStage({
    streak,
    cyclesCompleted,
    currentCycleDay,
    daysSinceLastActivity: lastActivityDays,
  });

  // Resolve mood baseado no dia atual + ausência
  const mood = resolveMood({
    hasCheckinToday,
    habitsCheckedToday,
    daysSinceLastActivity: lastActivityDays,
    cycleCompletedToday,
  });

  const message = pickMessage(mood, userId).replace(/\{name\}/g, brotoName);

  return {
    stage,
    stageName: STAGE_NAMES[stage],
    mood,
    imageKey: STAGE_IMAGES[stage],
    message,
    brotoName,
    daysSinceLastCheckin: lastActivityDays,
    signals: {
      streak,
      cyclesCompleted,
      currentCycleDay,
      habitsCheckedToday,
      waterCount,
      waterGoal,
      hasCheckinToday,
      cycleCompletedToday,
    },
  };
}

// Pega só o crescimento (pra mostrar toast quando subir de stage).
// Comparação simples — não persistimos histórico, então o UI tem que
// guardar localStorage["lastBrotoStage"] e comparar no client.
export function getGrowthHint(stage: BrotoStage, brotoName = "Broto"): string {
  return (GROWTH_HINT_BY_STAGE[stage] ?? "").replace(/\{name\}/g, brotoName);
}

// ─── Helpers internos ──────────────────────────────────────

function resolveStage(opts: {
  streak: number;
  cyclesCompleted: number;
  currentCycleDay: number | null;
  daysSinceLastActivity: number;
}): BrotoStage {
  const { streak, cyclesCompleted, currentCycleDay, daysSinceLastActivity } = opts;

  // Tenta do maior stage pro menor: primeiro match ganha.
  // Stage 5 sempre considera cyclesCompleted (medalha eterna).
  for (let i = STAGE_RULES.length - 1; i >= 0; i--) {
    const rule = STAGE_RULES[i];
    if (rule.stage === 1) continue; // Stage 1 é fallback final

    const meetsStreak = rule.minStreak != null && streak >= rule.minStreak;
    const meetsCycle =
      rule.minCycleDay != null &&
      currentCycleDay != null &&
      currentCycleDay >= rule.minCycleDay;
    const meetsCompletedCycles =
      rule.minCyclesCompleted != null &&
      cyclesCompleted >= rule.minCyclesCompleted;

    const reached = meetsStreak || meetsCycle || meetsCompletedCycles;

    if (reached) {
      // Stage 5 é eterno — não regride
      if (rule.regressAfterDays == null) return rule.stage;

      // Senão, checa se ausência derruba do stage atual
      if (daysSinceLastActivity >= rule.regressAfterDays) {
        // Regride 1 stage e tenta o anterior
        const prevStage = (rule.stage - 1) as BrotoStage;
        return prevStage >= 1 ? prevStage : 1;
      }

      return rule.stage;
    }
  }
  return 1;
}

function resolveMood(opts: {
  hasCheckinToday: boolean;
  habitsCheckedToday: number;
  daysSinceLastActivity: number;
  cycleCompletedToday: boolean;
}): BrotoMood {
  const { hasCheckinToday, habitsCheckedToday, daysSinceLastActivity, cycleCompletedToday } = opts;

  // Saudoso domina: 3+ dias de ausência > qualquer outro mood
  if (daysSinceLastActivity >= 3) return "saudoso";

  // Hoje sem nada (sem ser saudoso ainda) → sonolento
  if (!hasCheckinToday) return "sonolento";

  // Ciclo concluído hoje OU todos os 5 hábitos → animado
  if (cycleCompletedToday || habitsCheckedToday >= 5) return "animado";

  // 2+ hábitos → feliz
  if (habitsCheckedToday >= 2) return "feliz";

  return "tranquilo";
}

// Deterministico-pseudo: mesma userId no mesmo dia retorna a mesma mensagem,
// mas troca a cada dia. Evita ficar repetitivo.
function pickMessage(mood: BrotoMood, userId: string): string {
  const opts = MESSAGES_BY_MOOD[mood];
  // Hash bobo do userId + dia atual
  const today = brasilToday();
  const seed = (userId + today)
    .split("")
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 7);
  return opts[seed % opts.length];
}

function computeCycleDay(startDate: Date): number {
  const start = new Date(startDate);
  // Compara em dias BR (ignorando hora)
  const startBr = dateToBrString(start);
  const todayBr = brasilToday();
  const startTs = brasilStartOfDay(startBr).getTime();
  const todayTs = brasilStartOfDay(todayBr).getTime();
  const diff = Math.floor((todayTs - startTs) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(21, diff + 1));
}

function dateToBrString(d: Date): string {
  const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return br.toISOString().split("T")[0];
}

// Última "atividade significativa" do user. Considera os 4 sinais principais:
// checkin, water, mood, weight. Retorna diferença em dias entre hoje e o mais recente.
async function computeDaysSinceLastActivity(userId: string): Promise<number> {
  const [lastCheckin, lastWater, lastMood, lastWeight] = await Promise.all([
    prisma.appCheckin.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { date: true },
    }),
    prisma.appWaterLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      select: { loggedAt: true },
    }),
    prisma.appMoodLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      select: { loggedAt: true },
    }),
    prisma.appWeightLog.findFirst({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      select: { loggedAt: true },
    }),
  ]);

  const dates = [
    lastCheckin?.date,
    lastWater?.loggedAt,
    lastMood?.loggedAt,
    lastWeight?.loggedAt,
  ].filter(Boolean) as Date[];

  if (dates.length === 0) return 999; // nunca usou — saudoso bem profundo

  const maxTs = Math.max(...dates.map((d) => d.getTime()));
  const todayTs = brasilStartOfDay(brasilToday()).getTime();
  const lastDayTs = brasilStartOfDay(
    new Date(maxTs - 3 * 60 * 60 * 1000).toISOString().split("T")[0],
  ).getTime();

  const diff = Math.floor((todayTs - lastDayTs) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
