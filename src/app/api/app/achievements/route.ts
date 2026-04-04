import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { getLevel } from "@/lib/gamification";
import { getStreak } from "@/lib/streaks";
import { ACHIEVEMENTS } from "@/data/achievements";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const [earned, level, streak] = await Promise.all([
    prisma.appUserAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    }),
    getLevel(user.id),
    getStreak(user.id),
  ]);

  return NextResponse.json({
    achievements: ACHIEVEMENTS,
    earned: earned.map((e) => ({
      id: e.achievementId,
      name: e.achievement.name,
      icon: e.achievement.icon,
      category: e.achievement.category,
      earnedAt: e.earnedAt,
    })),
    level,
    streak,
  });
}
