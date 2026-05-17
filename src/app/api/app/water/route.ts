import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";
import { addXP, evaluateAchievements, XP_REWARDS } from "@/lib/gamification";
import { brasilStartOfDay, brasilEndOfDay } from "@/lib/tz";

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const cups = body.cups ?? 1;

  const log = await prisma.appWaterLog.create({
    data: { userId: user.id, cups },
  });

  // Atualizar checkin do dia tambem (em BR, nao UTC)
  const today = brasilStartOfDay();
  const checkin = await prisma.appCheckin.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });

  // Meta de agua do user (default 8 se o profile nao tiver waterGoal seteado).
  const profile = await prisma.appProfile.findUnique({
    where: { userId: user.id },
    select: { waterGoal: true },
  });
  const waterGoal = profile?.waterGoal ?? 8;

  if (checkin) {
    const newWaterCount = checkin.waterCount + cups;
    // Se bateu a meta, marca o habit "agua" automaticamente no checkin do dia.
    // Mantemos o que ja estava em habits e so adicionamos agua=true (merge).
    const prevHabits = (checkin.habits as Record<string, boolean>) ?? {};
    const newHabits =
      newWaterCount >= waterGoal && !prevHabits.agua
        ? { ...prevHabits, agua: true }
        : prevHabits;
    await prisma.appCheckin.update({
      where: { id: checkin.id },
      data: {
        waterCount: { increment: cups },
        habits: newHabits,
      },
    });
  } else {
    await prisma.appCheckin.create({
      data: {
        userId: user.id,
        date: today,
        habits: cups >= waterGoal ? { agua: true } : {},
        waterCount: cups,
      },
    });
  }

  // Check if daily water goal met
  const updatedCheckin = await prisma.appCheckin.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });
  if (updatedCheckin && updatedCheckin.waterCount >= waterGoal) {
    await addXP(user.id, XP_REWARDS.water_goal);
  }

  // Evaluate achievements
  const newAchievements = await evaluateAchievements(user.id);

  return NextResponse.json({ log, newAchievements });
}

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get("date");

  if (dateParam) {
    // Modo "ver dia passado": apenas logs do dia informado (em BR)
    const dayStart = brasilStartOfDay(dateParam);
    const dayEnd = brasilEndOfDay(dateParam);

    const logs = await prisma.appWaterLog.findMany({
      where: { userId: user.id, loggedAt: { gte: dayStart, lt: dayEnd } },
      orderBy: { loggedAt: "desc" },
    });
    return NextResponse.json({ logs });
  }

  // Default: historico dos ultimos 7 dias
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const logs = await prisma.appWaterLog.findMany({
    where: { userId: user.id, loggedAt: { gte: sevenDaysAgo } },
    orderBy: { loggedAt: "desc" },
  });

  return NextResponse.json({ logs });
}
