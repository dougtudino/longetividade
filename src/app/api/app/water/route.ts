import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";
import { addXP, evaluateAchievements, XP_REWARDS } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const cups = body.cups ?? 1;

  const log = await prisma.appWaterLog.create({
    data: { userId: user.id, cups },
  });

  // Atualizar checkin do dia tambem
  const today = new Date(new Date().toISOString().split("T")[0] + "T00:00:00Z");
  const checkin = await prisma.appCheckin.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });

  if (checkin) {
    await prisma.appCheckin.update({
      where: { id: checkin.id },
      data: { waterCount: { increment: cups } },
    });
  } else {
    await prisma.appCheckin.create({
      data: {
        userId: user.id,
        date: today,
        habits: {},
        waterCount: cups,
      },
    });
  }

  // Check if daily water goal met (8+ cups)
  const updatedCheckin = await prisma.appCheckin.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });
  if (updatedCheckin && updatedCheckin.waterCount >= 8) {
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
    // Modo "ver dia passado": apenas logs do dia informado (UTC bound)
    const dayStart = new Date(dateParam + "T00:00:00Z");
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

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
