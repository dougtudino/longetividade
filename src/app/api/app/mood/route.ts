import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";
import { addXP, evaluateAchievements, XP_REWARDS } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const daysParam = req.nextUrl.searchParams.get("days");
  const days = daysParam ? parseInt(daysParam, 10) : 7;

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const logs = await prisma.appMoodLog.findMany({
    where: {
      userId: user.id,
      loggedAt: { gte: since },
    },
    orderBy: { loggedAt: "desc" },
  });

  // Today's log
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayLog = logs.find((l) => new Date(l.loggedAt) >= todayStart);

  // Most common mood this week
  const moodCounts: Record<string, number> = {};
  for (const log of logs) {
    moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  }
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Top 3 triggers
  const triggerCounts: Record<string, number> = {};
  for (const log of logs) {
    for (const t of log.triggers) {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    }
  }
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  return NextResponse.json({ logs, todayLog, topMood, topTriggers });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const { mood, note, triggers } = body as {
    mood: string;
    note?: string;
    triggers?: string[];
  };

  if (!mood) {
    return NextResponse.json({ error: "Mood obrigatorio" }, { status: 400 });
  }

  const log = await prisma.appMoodLog.create({
    data: {
      userId: user.id,
      mood,
      note: note ?? null,
      triggers: triggers ?? [],
    },
  });

  // Award XP
  await addXP(user.id, XP_REWARDS.mood_log);

  // Evaluate achievements
  const newAchievements = await evaluateAchievements(user.id);

  return NextResponse.json({ log, newAchievements });
}
