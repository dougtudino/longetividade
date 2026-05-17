import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { listCycles, getCycleStats } from "@/lib/cycles";
import { brasilStartOfDay } from "@/lib/tz";

// GET /api/app/progress?days=30
// Agrega series temporais pra dashboard de evolucao em /app/progresso.
// Retorna tudo em uma chamada pra reduzir round-trips.
export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const daysParam = req.nextUrl.searchParams.get("days");
  const days = Math.min(Math.max(parseInt(daysParam ?? "30", 10), 7), 365);

  // Janela em BR (servidor eh UTC)
  const today = brasilStartOfDay();
  const since = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

  try {
    const [profile, weightLogs, measurements, moodLogs, checkins, cycles, cycleStats] =
      await Promise.all([
        prisma.appProfile.findUnique({
          where: { userId: user.id },
          select: { currentWeight: true, goalWeight: true, waterGoal: true },
        }),
        prisma.appWeightLog.findMany({
          where: { userId: user.id, loggedAt: { gte: since } },
          orderBy: { loggedAt: "asc" },
          select: { weight: true, loggedAt: true },
        }),
        prisma.appMeasurement.findMany({
          where: { userId: user.id, loggedAt: { gte: since } },
          orderBy: { loggedAt: "asc" },
          select: { waist: true, hip: true, loggedAt: true },
        }),
        prisma.appMoodLog.findMany({
          where: { userId: user.id, loggedAt: { gte: since } },
          orderBy: { loggedAt: "asc" },
          select: { mood: true, loggedAt: true },
        }),
        prisma.appCheckin.findMany({
          where: { userId: user.id, date: { gte: since } },
          orderBy: { date: "asc" },
          select: {
            date: true,
            habits: true,
            waterCount: true,
            exerciseDone: true,
          },
        }),
        listCycles(user.id),
        getCycleStats(user.id),
      ]);

    // Habit summary: % de habitos completados por dia
    const checkinSummary = checkins.map((c) => {
      const habits = (c.habits ?? {}) as Record<string, boolean>;
      const total = Object.keys(habits).length || 10;
      const done = Object.values(habits).filter(Boolean).length;
      return {
        date: c.date,
        habitsDone: done,
        habitsTotal: total,
        habitsPercent: total > 0 ? Math.round((done / total) * 100) : 0,
        waterCount: c.waterCount,
        exerciseDone: c.exerciseDone,
      };
    });

    // Mood distribution
    const moodCounts: Record<string, number> = {};
    for (const m of moodLogs) moodCounts[m.mood] = (moodCounts[m.mood] ?? 0) + 1;

    // Summary calculations
    const startWeight = weightLogs[0]?.weight ?? profile?.currentWeight ?? null;
    const currentWeight = weightLogs[weightLogs.length - 1]?.weight ?? startWeight;
    const goalWeight = profile?.goalWeight ?? null;
    const weightLost = startWeight && currentWeight ? startWeight - currentWeight : 0;
    const weightLeft = goalWeight && currentWeight ? currentWeight - goalWeight : null;

    const avgHabits = (window: number) => {
      const recent = checkinSummary.slice(-window);
      if (recent.length === 0) return 0;
      return Math.round(recent.reduce((s, c) => s + c.habitsPercent, 0) / recent.length);
    };

    return NextResponse.json({
      days,
      weights: weightLogs,
      measurements,
      moods: moodLogs,
      moodCounts,
      checkins: checkinSummary,
      cycles,
      cycleStats,
      summary: {
        startWeight,
        currentWeight,
        goalWeight,
        weightLost,
        weightLeft,
        avgHabitsPercent7d: avgHabits(7),
        avgHabitsPercent30d: avgHabits(30),
        checkinDays: checkinSummary.length,
        topMood: Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      },
    });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("GET /api/app/progress error:", msg);
    return NextResponse.json(
      { error: "progress_failed", detail: msg },
      { status: 500 }
    );
  }
}
