import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";

// GET /api/app/wellbeing-week
// Agrega ultima semana pra widget "Sua semana" na home:
//  - weightDelta: kg perdido/ganho vs 7d atras (null se nao tem dois pesos)
//  - currentWeight: ultimo registro
//  - daysSinceLastWeight: pra acionar lembrete de pesagem semanal
//  - dominantMood: humor mais frequente
//  - avgHabitsPercent: media de habitos% nos checkins da semana
//  - exerciseDays: quantos dias com exerciseDone na semana
//  - checkinDays: quantos dias com checkin
export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const [allWeights, lastWeight, prevWeight, moods, checkins] = await Promise.all([
      prisma.appWeightLog.count({ where: { userId: user.id } }),
      prisma.appWeightLog.findFirst({
        where: { userId: user.id },
        orderBy: { loggedAt: "desc" },
        select: { weight: true, loggedAt: true },
      }),
      prisma.appWeightLog.findFirst({
        where: { userId: user.id, loggedAt: { lte: sevenDaysAgo, gte: fourteenDaysAgo } },
        orderBy: { loggedAt: "desc" },
        select: { weight: true, loggedAt: true },
      }),
      prisma.appMoodLog.findMany({
        where: { userId: user.id, loggedAt: { gte: sevenDaysAgo } },
        select: { mood: true },
      }),
      prisma.appCheckin.findMany({
        where: { userId: user.id, date: { gte: sevenDaysAgo } },
        select: { habits: true, exerciseDone: true },
      }),
    ]);

    const currentWeight = lastWeight?.weight ?? null;
    const weightDelta =
      lastWeight && prevWeight ? Number((lastWeight.weight - prevWeight.weight).toFixed(2)) : null;
    const daysSinceLastWeight = lastWeight
      ? Math.floor((now.getTime() - new Date(lastWeight.loggedAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Mood dominante
    const moodCounts: Record<string, number> = {};
    for (const m of moods) moodCounts[m.mood] = (moodCounts[m.mood] ?? 0) + 1;
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // Habitos %
    let totalHabits = 0;
    let totalPercent = 0;
    let exerciseDays = 0;
    for (const c of checkins) {
      const h = (c.habits ?? {}) as Record<string, boolean>;
      const total = Object.keys(h).length || 10;
      const done = Object.values(h).filter(Boolean).length;
      totalPercent += total > 0 ? (done / total) * 100 : 0;
      totalHabits += 1;
      if (c.exerciseDone) exerciseDays += 1;
    }
    const avgHabitsPercent = totalHabits > 0 ? Math.round(totalPercent / totalHabits) : 0;

    // Pesagem semanal: pessoa deve pesar se nunca pesou OU passou >=7d desde a ultima
    const needsWeighIn = allWeights === 0 || (daysSinceLastWeight !== null && daysSinceLastWeight >= 7);

    return NextResponse.json({
      currentWeight,
      weightDelta,
      daysSinceLastWeight,
      needsWeighIn,
      totalWeightLogs: allWeights,
      dominantMood,
      moodLogsCount: moods.length,
      avgHabitsPercent,
      exerciseDays,
      checkinDays: checkins.length,
    });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("GET /api/app/wellbeing-week error:", msg);
    return NextResponse.json({ error: "wellbeing_failed", detail: msg }, { status: 500 });
  }
}
