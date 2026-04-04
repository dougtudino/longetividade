import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { addXP, XP_REWARDS } from "@/lib/gamification";
import { CHALLENGE_DAYS } from "@/data/challenge-days";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const completed = await prisma.appChallenge.findMany({
    where: { userId: user.id },
    select: { day: true },
    orderBy: { day: "asc" },
  });

  const progress = completed.map((c) => c.day);
  const completedSet = new Set(progress);

  // Current day = first uncompleted day (1-21), or 22 if all done
  let currentDay = 22;
  for (let d = 1; d <= 21; d++) {
    if (!completedSet.has(d)) {
      currentDay = d;
      break;
    }
  }

  return NextResponse.json({
    days: CHALLENGE_DAYS,
    progress,
    currentDay,
  });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const body = await req.json();
  const { day } = body as { day: number };

  if (!day || day < 1 || day > 21) {
    return NextResponse.json({ error: "Dia invalido (1-21)" }, { status: 400 });
  }

  // Check if already completed
  const existing = await prisma.appChallenge.findUnique({
    where: { userId_day: { userId: user.id, day } },
  });

  if (existing) {
    return NextResponse.json({ error: "Dia ja completado" }, { status: 409 });
  }

  // Mark as completed
  await prisma.appChallenge.create({
    data: { userId: user.id, day },
  });

  // Award XP
  const xpResult = await addXP(user.id, XP_REWARDS.challenge_day);

  return NextResponse.json({
    ok: true,
    day,
    xp: xpResult,
  });
}
