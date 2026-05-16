import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";
import { addXP, evaluateAchievements, XP_REWARDS } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  if (!body.weight || typeof body.weight !== "number") {
    return NextResponse.json({ error: "Peso obrigatorio" }, { status: 400 });
  }

  const log = await prisma.appWeightLog.create({
    data: {
      userId: user.id,
      weight: body.weight,
      note: body.note ?? null,
    },
  });

  // Award XP for weight log
  await addXP(user.id, XP_REWARDS.weight_log);

  // Evaluate achievements
  const newAchievements = await evaluateAchievements(user.id);

  return NextResponse.json({ log, newAchievements });
}

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get("date");
  if (dateParam) {
    // Filtra logs do dia (UTC bounds)
    const dayStart = new Date(dateParam + "T00:00:00Z");
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const logs = await prisma.appWeightLog.findMany({
      where: { userId: user.id, loggedAt: { gte: dayStart, lt: dayEnd } },
      orderBy: { loggedAt: "desc" },
    });
    return NextResponse.json({ logs });
  }

  const logs = await prisma.appWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { loggedAt: "asc" },
  });

  return NextResponse.json({ logs });
}
