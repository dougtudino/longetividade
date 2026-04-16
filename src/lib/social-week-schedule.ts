// Agenda semanal multi-slot da Luna.
// Cada dia da semana pode ter ate 3 slots independentes: FEED_AM, REEL, STORY.
// Total: 12 posts/semana (2 por dia util Seg-Sab), Domingo OFF.
//
// Usado por generate-now, cron/social-generate e fill-gaps.

export type Slot = "FEED_AM" | "REEL" | "STORY";
export type Pillar = "s" | "e" | "m" | "promo";

export type WeeklySlotEntry = {
  // 1=seg, 2=ter, 3=qua, 4=qui, 5=sex, 6=sab, 0=dom (usa getDay() do JS)
  dayOfWeek: number;
  slot: Slot;
  pillar: Pillar;
  format:
    | "carrossel"
    | "imagem"
    | "reels"
    | "stories"
    | "stories-poll"
    | "stories-question"
    | "stories-sequence";
  hour: number;
  minute: number;
  preferTrend: boolean;
};

// Matriz canonica: Seg-Sab x (FEED_AM | REEL | STORY) — 2 slots por dia util.
// Stories com formatos elaborados (poll/question/sequence) baseados no playbook.
// Domingo OFF. Total: 6 FEED + 3 REEL + 3 STORY = 12 posts/semana (balanceado, 2/dia).
export const WEEKLY_SCHEDULE: WeeklySlotEntry[] = [
  // SEG — carrossel S abre a semana + story sequencia
  { dayOfWeek: 1, slot: "FEED_AM", pillar: "s", format: "carrossel",        hour: 9, minute: 0, preferTrend: false },
  { dayOfWeek: 1, slot: "STORY",   pillar: "s", format: "stories-sequence", hour: 19, minute: 0, preferTrend: false },

  // TER — reel M trend + enquete engajamento
  { dayOfWeek: 2, slot: "REEL",    pillar: "m", format: "reels",        hour: 13, minute: 0, preferTrend: true },
  { dayOfWeek: 2, slot: "STORY",   pillar: "m", format: "stories-poll", hour: 11, minute: 0, preferTrend: false },

  // QUA — carrossel E emocional + caixa de pergunta
  { dayOfWeek: 3, slot: "FEED_AM", pillar: "e", format: "carrossel",        hour: 9, minute: 0, preferTrend: false },
  { dayOfWeek: 3, slot: "STORY",   pillar: "e", format: "stories-question", hour: 20, minute: 0, preferTrend: false },

  // QUI — carrossel S trend + reel S trend
  { dayOfWeek: 4, slot: "FEED_AM", pillar: "s", format: "carrossel", hour: 9,  minute: 0, preferTrend: true },
  { dayOfWeek: 4, slot: "REEL",    pillar: "s", format: "reels",     hour: 19, minute: 0, preferTrend: true },

  // SEX — reel E conexao + story E question (fecha a semana com engajamento)
  { dayOfWeek: 5, slot: "REEL",  pillar: "e", format: "reels",            hour: 13, minute: 0, preferTrend: false },
  { dayOfWeek: 5, slot: "STORY", pillar: "e", format: "stories-question", hour: 19, minute: 0, preferTrend: false },

  // SAB — promo feed + story poll (engajamento leve de fds)
  { dayOfWeek: 6, slot: "FEED_AM", pillar: "promo", format: "imagem",       hour: 10, minute: 0, preferTrend: false },
  { dayOfWeek: 6, slot: "STORY",   pillar: "s",     format: "stories-poll", hour: 18, minute: 0, preferTrend: false },
];

// Proxima ocorrencia (a partir de baseNow) do dayOfWeek na hora/minuto do slot.
// Se ja passou hoje, pula pra proxima semana.
export function computeSlotDate(baseNow: Date, entry: WeeklySlotEntry): Date {
  const d = new Date(baseNow.getTime());
  const current = d.getDay();
  let diff = (entry.dayOfWeek - current + 7) % 7;
  if (diff === 0) {
    // Mesmo dia: so vale se hora do slot ainda nao passou
    const candidate = new Date(d.getTime());
    candidate.setHours(entry.hour, entry.minute, 0, 0);
    if (candidate.getTime() <= baseNow.getTime()) diff = 7;
  }
  d.setDate(d.getDate() + diff);
  d.setHours(entry.hour, entry.minute, 0, 0);
  return d;
}

// Todas as ocorrencias da matriz dentro de [from, from + daysAhead dias).
// Usado pelo fill-gaps pra varrer N dias preenchendo slots vazios.
export function expandScheduleAhead(
  from: Date,
  daysAhead: number,
): Array<{ entry: WeeklySlotEntry; date: Date }> {
  const out: Array<{ entry: WeeklySlotEntry; date: Date }> = [];
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    const dow = d.getDay();
    for (const entry of WEEKLY_SCHEDULE) {
      if (entry.dayOfWeek !== dow) continue;
      const slotDate = new Date(d);
      slotDate.setHours(entry.hour, entry.minute, 0, 0);
      if (slotDate.getTime() <= from.getTime()) continue; // ja passou
      out.push({ entry, date: slotDate });
    }
  }
  return out;
}

// Slots virtuais pra commem high priority que cai em dia OFF (domingo).
// Cria 2 slots: FEED_AM 10h (carrossel/imagem) + STORY 19h.
// Se a commem tem storyTemplate, STORY herda o format (poll/question/sequence);
// senao, usa format "stories" generico (copy da commem como story).
export function virtualSlotsForOffDay(
  date: Date,
  pillar: Pillar,
  opts?: {
    preferredFormat?: "carrossel" | "imagem" | "reels" | "stories";
    storyTemplateType?: "poll" | "question" | "sequence";
  },
): Array<{ entry: WeeklySlotEntry; date: Date }> {
  const dow = date.getDay();
  const feedDate = new Date(date);
  feedDate.setHours(10, 0, 0, 0);
  const storyDate = new Date(date);
  storyDate.setHours(19, 0, 0, 0);

  const feedFormat =
    opts?.preferredFormat === "reels" || opts?.preferredFormat === "stories"
      ? "carrossel"
      : (opts?.preferredFormat ?? "carrossel");

  const storyFormat: WeeklySlotEntry["format"] = opts?.storyTemplateType
    ? (`stories-${opts.storyTemplateType}` as WeeklySlotEntry["format"])
    : "stories";

  return [
    {
      entry: {
        dayOfWeek: dow,
        slot: "FEED_AM",
        pillar,
        format: feedFormat,
        hour: 10,
        minute: 0,
        preferTrend: false,
      },
      date: feedDate,
    },
    {
      entry: {
        dayOfWeek: dow,
        slot: "STORY",
        pillar,
        format: storyFormat,
        hour: 19,
        minute: 0,
        preferTrend: false,
      },
      date: storyDate,
    },
  ];
}

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
