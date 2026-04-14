// Agenda semanal multi-slot da Luna.
// Cada dia da semana pode ter ate 3 slots independentes: FEED_AM, REEL, STORY.
// Total: ~13 posts/semana (6 feed + 3 reels + 4 stories).
//
// Usado por generate-now e cron/social-generate.

export type Slot = "FEED_AM" | "REEL" | "STORY";
export type Pillar = "s" | "e" | "m" | "promo";

export type WeeklySlotEntry = {
  dayOffset: number; // 1=seg, 2=ter, ..., 6=sab (relativo ao dia atual +N)
  slot: Slot;
  pillar: Pillar;
  format: "carrossel" | "imagem" | "reels" | "stories";
  hour: number;
  minute: number;
  preferTrend: boolean; // se true, generate-now tenta usar trend primeiro
};

// Matriz canonica: Seg-Sab x (FEED_AM | REEL | STORY)
// Domingo e OFF.
export const WEEKLY_SCHEDULE: WeeklySlotEntry[] = [
  // SEG — abre semana com valor (carrossel S) + story engaja
  { dayOffset: 1, slot: "FEED_AM", pillar: "s", format: "carrossel", hour: 9, minute: 0, preferTrend: false },
  { dayOffset: 1, slot: "STORY",   pillar: "s", format: "stories",   hour: 11, minute: 0, preferTrend: false },

  // TER — reel M trend + story dica
  { dayOffset: 2, slot: "REEL",    pillar: "m", format: "reels",     hour: 13, minute: 0, preferTrend: true },
  { dayOffset: 2, slot: "STORY",   pillar: "m", format: "stories",   hour: 19, minute: 0, preferTrend: false },

  // QUA — carrossel E emocional + story sequencia
  { dayOffset: 3, slot: "FEED_AM", pillar: "e", format: "carrossel", hour: 9, minute: 0, preferTrend: false },
  { dayOffset: 3, slot: "STORY",   pillar: "e", format: "stories",   hour: 20, minute: 0, preferTrend: false },

  // QUI — carrossel S + reel S trend + story bastidor
  { dayOffset: 4, slot: "FEED_AM", pillar: "s", format: "carrossel", hour: 9, minute: 0, preferTrend: true },
  { dayOffset: 4, slot: "REEL",    pillar: "s", format: "reels",     hour: 19, minute: 0, preferTrend: true },

  // SEX — reel E conexao
  { dayOffset: 5, slot: "REEL",    pillar: "e", format: "reels",     hour: 13, minute: 0, preferTrend: false },
  { dayOffset: 5, slot: "STORY",   pillar: "e", format: "stories",   hour: 20, minute: 0, preferTrend: false },

  // SAB — promo feed + story inspiracao
  { dayOffset: 6, slot: "FEED_AM", pillar: "promo", format: "imagem",  hour: 10, minute: 0, preferTrend: false },
  { dayOffset: 6, slot: "STORY",   pillar: "promo", format: "stories", hour: 15, minute: 0, preferTrend: false },
];

export function computeSlotDate(baseNow: Date, entry: WeeklySlotEntry): Date {
  const d = new Date(baseNow.getTime() + entry.dayOffset * 24 * 60 * 60 * 1000);
  d.setHours(entry.hour, entry.minute, 0, 0);
  return d;
}

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
