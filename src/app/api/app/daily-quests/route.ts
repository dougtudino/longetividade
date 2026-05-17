import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { getCurrentCycle } from "@/lib/cycles";

// GET /api/app/daily-quests?date=YYYY-MM-DD
//
// Retorna 5 quests fixas do dia + recap do dia anterior. Quests sao
// "mirror" do estado real (nao geram XP duplicado — XP ja foi creditado
// pelas acoes em si). Servem como checklist visual + senso de jornada.
//
// Quests:
//   1. Faca check-in do dia
//   2. Beba 8 copos de agua
//   3. Marque 5+ habitos
//   4. Registre seu humor
//   5. Avance no Desafio 21 Dias
//
// Recap retorna: habitsPercent ontem, water, mood, exercicio, conquistas ganhas.
export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  try {
    const dateParam = req.nextUrl.searchParams.get("date");
    const today = dateParam ? dateParam : new Date().toISOString().slice(0, 10);
    const todayStart = new Date(today + "T00:00:00Z");
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);

    const [checkin, moods, challengesToday, cycle, yChecking, yMoods, recentAchievements] =
      await Promise.all([
        prisma.appCheckin.findUnique({
          where: { userId_date: { userId: user.id, date: todayStart } },
        }),
        prisma.appMoodLog.findMany({
          where: { userId: user.id, loggedAt: { gte: todayStart, lt: todayEnd } },
        }),
        prisma.appChallenge.findMany({
          where: { userId: user.id, completedAt: { gte: todayStart, lt: todayEnd } },
          select: { day: true, completedAt: true },
        }),
        getCurrentCycle(user.id),
        prisma.appCheckin.findUnique({
          where: { userId_date: { userId: user.id, date: yesterdayStart } },
        }),
        prisma.appMoodLog.findMany({
          where: { userId: user.id, loggedAt: { gte: yesterdayStart, lt: todayStart } },
          select: { mood: true, loggedAt: true },
        }),
        prisma.appUserAchievement.findMany({
          where: { userId: user.id, earnedAt: { gte: yesterdayStart, lt: todayEnd } },
          include: { achievement: { select: { name: true, icon: true, xp: true } } },
          orderBy: { earnedAt: "desc" },
          take: 5,
        }),
      ]);

    const habits = (checkin?.habits ?? {}) as Record<string, boolean>;
    const habitsDone = Object.values(habits).filter(Boolean).length;
    const habitsTotal = Object.keys(habits).length || 10;
    const waterCount = checkin?.waterCount ?? 0;
    const exerciseDone = checkin?.exerciseDone ?? false;

    const quests = [
      {
        id: "checkin",
        title: "Faca seu check-in",
        description: "Marque como esta hoje pra comecar o dia.",
        icon: "✅",
        xp: 10,
        done: !!checkin,
        ctaPath: "/app/habitos",
      },
      {
        id: "water",
        title: "Beba 8 copos de agua",
        description: "Pra manter o corpo hidratado.",
        icon: "💧",
        xp: 15,
        done: waterCount >= 8,
        progress: { current: waterCount, target: 8 },
        ctaPath: "/app/agua",
      },
      {
        id: "habits",
        title: "Complete 5 ou mais habitos",
        description: "Construa consistencia, um habito por vez.",
        icon: "🌿",
        xp: 25,
        done: habitsDone >= 5,
        progress: { current: habitsDone, target: 5 },
        ctaPath: "/app/habitos",
      },
      {
        id: "mood",
        title: "Registre seu humor",
        description: "Autoconhecimento da clareza pro caminho.",
        icon: "💚",
        xp: 10,
        done: moods.length > 0,
        ctaPath: "/app/emocional",
      },
      {
        id: "challenge",
        title: cycle
          ? `Avance no Ciclo ${cycle.cycleNumber} (dia ${Math.min(cycle.daysCompleted + 1, 21)})`
          : "Comece um novo ciclo do Desafio",
        description: cycle
          ? "Cada dia te aproxima de fechar 21."
          : "21 dias pra cristalizar o caminho.",
        icon: "🎯",
        xp: 20,
        done: challengesToday.length > 0,
        ctaPath: "/app/desafio",
      },
    ];

    const totalDone = quests.filter((q) => q.done).length;
    const allDone = totalDone === quests.length;

    // ─── Recap ontem ─────────────────────────────────
    const yHabits = (yChecking?.habits ?? {}) as Record<string, boolean>;
    const yHabitsDone = Object.values(yHabits).filter(Boolean).length;
    const yHabitsTotal = Object.keys(yHabits).length || 10;
    const yHabitsPercent = yHabitsTotal > 0 ? Math.round((yHabitsDone / yHabitsTotal) * 100) : 0;
    const yMood = yMoods.sort((a, b) => +new Date(b.loggedAt) - +new Date(a.loggedAt))[0]?.mood ?? null;

    return NextResponse.json({
      date: today,
      quests,
      summary: {
        totalQuests: quests.length,
        totalDone,
        allDone,
      },
      yesterday: yChecking
        ? {
            date: yesterdayStart.toISOString().slice(0, 10),
            habitsDone: yHabitsDone,
            habitsTotal: yHabitsTotal,
            habitsPercent: yHabitsPercent,
            waterCount: yChecking.waterCount,
            exerciseDone: yChecking.exerciseDone,
            mood: yMood,
          }
        : null,
      recentAchievements: recentAchievements.map((a) => ({
        name: a.achievement.name,
        icon: a.achievement.icon,
        xp: a.achievement.xp,
        earnedAt: a.earnedAt,
      })),
      challengeDayToday: challengesToday[0]?.day ?? null,
    });
  } catch (e) {
    const msg = (e as Error).message;
    console.error("GET /api/app/daily-quests error:", msg);
    return NextResponse.json({ error: "daily_quests_failed", detail: msg }, { status: 500 });
  }
}
