import { prisma } from "./prisma";
import { ACHIEVEMENTS } from "@/data/achievements";
import { getStreak, getHabitStreak } from "./streaks";
import { brasilStartOfDay } from "./tz";

// ─── Level Names ─────────────────────────────────
const LEVEL_NAMES: Record<number, string> = {
  1: "Iniciante",
  2: "Curiosa",
  3: "Dedicada",
  4: "Comprometida",
  5: "Transformadora",
  6: "Inspiradora",
  7: "Guerreira",
  8: "Mestre S.E.M",
  9: "Lenda",
  10: "Fenix",
};

// ─── XP Rewards ──────────────────────────────────
export const XP_REWARDS = {
  checkin: 10,
  water_goal: 15,
  all_habits: 25,
  exercise: 20,
  weight_log: 15,
  mood_log: 10,
  recipe_fav: 5,
  challenge_day: 20,
} as const;

// ─── Level Calculation ───────────────────────────
function calculateLevel(xp: number): number {
  return Math.min(Math.floor(Math.sqrt(xp / 100)) + 1, 10);
}

function xpForLevel(level: number): number {
  // Inverse: level = floor(sqrt(xp/100)) + 1 => xp = (level-1)^2 * 100
  return (level - 1) * (level - 1) * 100;
}

// ─── addXP ───────────────────────────────────────
export async function addXP(userId: string, amount: number) {
  const userLevel = await prisma.appUserLevel.upsert({
    where: { userId },
    update: { xp: { increment: amount } },
    create: { userId, xp: amount, level: 1 },
  });

  const newLevel = calculateLevel(userLevel.xp);
  if (newLevel !== userLevel.level) {
    await prisma.appUserLevel.update({
      where: { userId },
      data: { level: newLevel },
    });
  }

  return { xp: userLevel.xp, level: newLevel };
}

// ─── getLevel ────────────────────────────────────
export async function getLevel(userId: string) {
  const userLevel = await prisma.appUserLevel.findUnique({
    where: { userId },
  });

  const xp = userLevel?.xp ?? 0;
  const level = userLevel?.level ?? 1;
  const levelName = LEVEL_NAMES[level] ?? LEVEL_NAMES[10]!;
  const nextLevelXp = level < 10 ? xpForLevel(level + 1) : xpForLevel(10);

  return { xp, level, levelName, nextLevelXp };
}

// ─── Evaluate Achievements ───────────────────────
export async function evaluateAchievements(userId: string) {
  // Get already earned
  const earned = await prisma.appUserAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const earnedIds = new Set(earned.map((e) => e.achievementId));

  // Gather user stats for condition evaluation
  const stats = await gatherStats(userId);

  const newlyEarned: { id: string; name: string; icon: string; xp: number }[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (earnedIds.has(ach.id)) continue;

    if (checkCondition(ach.condition, stats)) {
      // Garante que AppAchievement existe (idempotente)
      await prisma.appAchievement.upsert({
        where: { id: ach.id },
        update: {},
        create: {
          id: ach.id,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          condition: ach.condition,
          xp: ach.xp,
        },
      });

      // Upsert no AppUserAchievement (com @@unique([userId, achievementId])).
      // Antes era `create` que podia falhar com P2002 em race entre 2
      // requests simultaneos. count count antes/depois pra detectar se de
      // fato criou (e nao foi noop) — so credita XP se foi criacao real.
      const before = await prisma.appUserAchievement.count({
        where: { userId, achievementId: ach.id },
      });
      await prisma.appUserAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: ach.id } },
        update: {},
        create: { userId, achievementId: ach.id },
      });
      const wasNew = before === 0;

      if (wasNew) {
        await addXP(userId, ach.xp);
        newlyEarned.push({ id: ach.id, name: ach.name, icon: ach.icon, xp: ach.xp });
      }
    }
  }

  return newlyEarned;
}

// ─── Gather Stats ────────────────────────────────
async function gatherStats(userId: string) {
  // Hoje em BR (servidor eh UTC). Checkin foi salvo com brasilStartOfDay.
  const today = brasilStartOfDay();

  const [
    totalCheckins,
    totalWaterLogs,
    totalWeightLogs,
    totalMoodLogs,
    totalMeasurements,
    todayCheckin,
    weightLogs,
    profile,
    streak,
    habitStreak,
    exerciseDays,
    waterStreakDays,
  ] = await Promise.all([
    prisma.appCheckin.count({ where: { userId } }),
    prisma.appWaterLog.count({ where: { userId } }),
    prisma.appWeightLog.count({ where: { userId } }),
    prisma.appMoodLog.count({ where: { userId } }),
    prisma.appMeasurement.count({ where: { userId } }),
    prisma.appCheckin.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
    prisma.appWeightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: "asc" },
      select: { weight: true },
    }),
    prisma.appProfile.findUnique({
      where: { userId },
      select: { onboardingDone: true },
    }),
    getStreak(userId),
    getHabitStreak(userId),
    prisma.appCheckin.count({
      where: { userId, exerciseDone: true },
    }),
    countWaterStreakDays(userId),
  ]);

  // Today's water count
  const dailyWater = todayCheckin?.waterCount ?? 0;

  // Today's habits check
  const habits = todayCheckin?.habits as Record<string, boolean> | null;
  const habitsChecked = habits ? Object.values(habits).filter(Boolean).length : 0;
  const totalHabitsChecked = habitsChecked;

  // Perfect days count
  const allCheckins = await prisma.appCheckin.findMany({
    where: { userId },
    select: { habits: true },
  });
  let perfectDayCount = 0;
  for (const c of allCheckins) {
    const h = c.habits as Record<string, boolean> | null;
    if (h) {
      const vals = Object.values(h);
      if (vals.length >= 10 && vals.every(Boolean)) perfectDayCount++;
    }
  }

  // Weight lost
  let weightLost = 0;
  if (weightLogs.length >= 2) {
    weightLost = weightLogs[0].weight - weightLogs[weightLogs.length - 1].weight;
  }

  // Last checkin date for "returned after days" check
  let returnedAfterDays = 0;
  if (totalCheckins >= 2) {
    const lastTwo = await prisma.appCheckin.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 2,
      select: { date: true },
    });
    if (lastTwo.length === 2) {
      const diff = Math.round(
        (new Date(lastTwo[0].date).getTime() - new Date(lastTwo[1].date).getTime()) / (1000 * 60 * 60 * 24)
      );
      returnedAfterDays = diff;
    }
  }

  return {
    total_water_logs: totalWaterLogs,
    daily_water: dailyWater,
    water_streak_days: waterStreakDays,
    total_habits_checked: totalHabitsChecked,
    perfect_day: perfectDayCount,
    perfect_streak_days: habitStreak,
    total_exercise_days: exerciseDays,
    total_weight_logs: totalWeightLogs,
    weight_lost: weightLost,
    streak_days: streak,
    onboarding_done: profile?.onboardingDone ?? false,
    screens_visited: 0, // tracked client-side, not evaluated here
    returned_after_days: returnedAfterDays,
    total_checkins: totalCheckins,
    total_mood_logs: totalMoodLogs,
    total_measurements: totalMeasurements,
  };
}

async function countWaterStreakDays(userId: string): Promise<number> {
  // Dias consecutivos com waterCount >= 8 (em BR)
  const checkins = await prisma.appCheckin.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true, waterCount: true },
  });

  const waterDays = new Set<string>();
  for (const c of checkins) {
    if (c.waterCount >= 8) {
      // Date eh @db.Date; converte pra YYYY-MM-DD BR
      const br = new Date(c.date.getTime() - 3 * 60 * 60 * 1000);
      waterDays.add(br.toISOString().split("T")[0]);
    }
  }

  if (waterDays.size === 0) return 0;

  // Importacao tardia pra evitar circular se necessario
  const { brasilToday, brasilStartOfDay: brStart } = await import("./tz");
  let cursorStr = brasilToday();
  if (!waterDays.has(cursorStr)) {
    const d = brStart(cursorStr);
    d.setUTCDate(d.getUTCDate() - 1);
    cursorStr = d.toISOString().split("T")[0];
  }

  let streak = 0;
  while (waterDays.has(cursorStr)) {
    streak++;
    const d = brStart(cursorStr);
    d.setUTCDate(d.getUTCDate() - 1);
    cursorStr = d.toISOString().split("T")[0];
  }

  return streak;
}

// ─── Condition Checker ───────────────────────────
function checkCondition(condition: string, stats: Record<string, number | boolean>): boolean {
  // Parse conditions like "streak_days >= 7", "onboarding_done == true"
  const match = condition.match(/^(\w+)\s*(>=|==|>|<|<=)\s*(.+)$/);
  if (!match) return false;

  const [, key, op, rawValue] = match;
  if (!key || !op) return false;
  const statValue = stats[key];
  if (statValue === undefined) return false;

  // Handle boolean comparison
  if (rawValue === "true" || rawValue === "false") {
    const boolVal = rawValue === "true";
    return statValue === boolVal;
  }

  const numValue = parseFloat(rawValue!);
  const numStat = typeof statValue === "boolean" ? (statValue ? 1 : 0) : (statValue as number);

  switch (op) {
    case ">=": return numStat >= numValue;
    case ">":  return numStat > numValue;
    case "<=": return numStat <= numValue;
    case "<":  return numStat < numValue;
    case "==": return numStat === numValue;
    default:   return false;
  }
}
