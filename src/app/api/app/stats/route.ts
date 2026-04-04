import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { getLevel } from "@/lib/gamification";
import { getStreak, getLongestStreak } from "@/lib/streaks";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const userId = user.id;

  const [
    streak,
    longestStreak,
    totalCheckins,
    allCheckins,
    weightLogs,
    level,
    achievementsCount,
    profile,
  ] = await Promise.all([
    getStreak(userId),
    getLongestStreak(userId),
    prisma.appCheckin.count({ where: { userId } }),
    prisma.appCheckin.findMany({
      where: { userId },
      select: { waterCount: true, exerciseMin: true, habits: true },
    }),
    prisma.appWeightLog.findMany({
      where: { userId },
      orderBy: { loggedAt: "asc" },
      select: { weight: true },
    }),
    getLevel(userId),
    prisma.appUserAchievement.count({ where: { userId } }),
    prisma.appProfile.findUnique({
      where: { userId },
      select: { createdAt: true },
    }),
  ]);

  // Aggregate stats from checkins
  let totalWaterCups = 0;
  let totalExerciseMinutes = 0;
  let totalHabitsCompleted = 0;
  let totalHabitsPossible = 0;

  for (const c of allCheckins) {
    totalWaterCups += c.waterCount;
    totalExerciseMinutes += c.exerciseMin;
    const habits = c.habits as Record<string, boolean> | null;
    if (habits) {
      const vals = Object.values(habits);
      totalHabitsCompleted += vals.filter(Boolean).length;
      totalHabitsPossible += 10; // always 10 habits possible per day
    }
  }

  const habitsCompletionRate = totalHabitsPossible > 0
    ? Math.round((totalHabitsCompleted / totalHabitsPossible) * 100)
    : 0;

  // Weight progress
  let weightProgress = null;
  if (weightLogs.length > 0) {
    const start = weightLogs[0].weight;
    const current = weightLogs[weightLogs.length - 1].weight;
    weightProgress = {
      start,
      current,
      lost: Math.round((start - current) * 10) / 10,
    };
  }

  // Days in method
  const daysInMethod = profile?.createdAt
    ? Math.max(1, Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return NextResponse.json({
    streak,
    longestStreak,
    totalCheckins,
    totalWaterCups,
    totalExerciseMinutes,
    habitsCompletionRate,
    weightProgress,
    level: level.level,
    levelName: level.levelName,
    xp: level.xp,
    nextLevelXp: level.nextLevelXp,
    achievementsEarned: achievementsCount,
    daysInMethod,
  });
}
