import { prisma } from "./prisma";
import { brasilToday, brasilStartOfDay } from "./tz";

// AppCheckin.date eh @db.Date (sem hora). Quando salvamos com
// brasilStartOfDay(), Postgres armazena apenas YYYY-MM-DD em UTC.
// Comparamos no streak usando strings YYYY-MM-DD (BR) pra consistencia.

function dateToBrDayString(d: Date): string {
  // Date eh UTC. Pra obter o "dia BR" desse Date, subtrai 3h e pega YYYY-MM-DD.
  // Como o checkin foi salvo com brasilStartOfDay() (= 03h UTC = 00h BR), o
  // resultado eh idempotente em ambas direcoes.
  const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
  return br.toISOString().split("T")[0];
}

function shiftBrDay(yyyyMmDd: string, days: number): string {
  const d = brasilStartOfDay(yyyyMmDd);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * Conta dias consecutivos com pelo menos 1 checkin (de hoje BR pra tras).
 * Permite que ontem conte como inicio do streak se hoje ainda nao teve checkin.
 */
export async function getStreak(userId: string): Promise<number> {
  const checkins = await prisma.appCheckin.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (checkins.length === 0) return 0;

  const dateSet = new Set<string>();
  for (const c of checkins) dateSet.add(dateToBrDayString(c.date));

  // Comeca em hoje BR. Se nao tem hoje, comeca em ontem (gentil).
  let cursor = brasilToday();
  if (!dateSet.has(cursor)) cursor = shiftBrDay(cursor, -1);

  let streak = 0;
  while (dateSet.has(cursor)) {
    streak++;
    cursor = shiftBrDay(cursor, -1);
  }
  return streak;
}

/**
 * Conta dias consecutivos com TODOS os habitos do dia marcados (>=10 keys, todas true).
 */
export async function getHabitStreak(userId: string): Promise<number> {
  const checkins = await prisma.appCheckin.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true, habits: true },
  });

  if (checkins.length === 0) return 0;

  const perfectDays = new Set<string>();
  for (const c of checkins) {
    const habits = c.habits as Record<string, boolean> | null;
    if (!habits) continue;
    const values = Object.values(habits);
    if (values.length >= 10 && values.every(Boolean)) {
      perfectDays.add(dateToBrDayString(c.date));
    }
  }

  if (perfectDays.size === 0) return 0;

  let cursor = brasilToday();
  if (!perfectDays.has(cursor)) cursor = shiftBrDay(cursor, -1);

  let streak = 0;
  while (perfectDays.has(cursor)) {
    streak++;
    cursor = shiftBrDay(cursor, -1);
  }
  return streak;
}

/**
 * Maior streak alguma vez (longest run consecutivo no historico).
 */
export async function getLongestStreak(userId: string): Promise<number> {
  const checkins = await prisma.appCheckin.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  });

  if (checkins.length === 0) return 0;

  const dateSet = new Set<string>();
  for (const c of checkins) dateSet.add(dateToBrDayString(c.date));

  let longest = 0;
  let current = 0;
  let prev: string | null = null;

  // Iterar em ordem (set nao garante ordem; ordenar)
  const sorted = Array.from(dateSet).sort();
  for (const day of sorted) {
    if (prev === null || day === shiftBrDay(prev, 1)) {
      current++;
    } else {
      current = 1;
    }
    if (current > longest) longest = current;
    prev = day;
  }

  return longest;
}
