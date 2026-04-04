import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";
import { addXP, evaluateAchievements, XP_REWARDS } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(dateParam + "T00:00:00Z") : new Date(new Date().toISOString().split("T")[0] + "T00:00:00Z");

  const checkin = await prisma.appCheckin.findUnique({
    where: { userId_date: { userId: user.id, date } },
  });

  return NextResponse.json({ checkin });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const date = body.date
    ? new Date(body.date + "T00:00:00Z")
    : new Date(new Date().toISOString().split("T")[0] + "T00:00:00Z");

  const checkin = await prisma.appCheckin.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: {
      habits: body.habits ?? {},
      waterCount: body.waterCount ?? 0,
      exerciseDone: body.exerciseDone ?? false,
      exerciseMin: body.exerciseMin ?? 0,
      note: body.note ?? null,
    },
    create: {
      userId: user.id,
      date,
      habits: body.habits ?? {},
      waterCount: body.waterCount ?? 0,
      exerciseDone: body.exerciseDone ?? false,
      exerciseMin: body.exerciseMin ?? 0,
      note: body.note ?? null,
    },
  });

  // Award XP
  await addXP(user.id, XP_REWARDS.checkin);

  // Check if all habits done
  const habits = body.habits as Record<string, boolean> | undefined;
  if (habits) {
    const vals = Object.values(habits);
    if (vals.length >= 10 && vals.every(Boolean)) {
      await addXP(user.id, XP_REWARDS.all_habits);
    }
  }

  // Check if exercise done
  if (body.exerciseDone) {
    await addXP(user.id, XP_REWARDS.exercise);
  }

  // Evaluate achievements
  const newAchievements = await evaluateAchievements(user.id);

  return NextResponse.json({ checkin, newAchievements });
}
