import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

// GET /api/admin/app-users/[id]
// Retorna detalhe completo de um AppUser: profile, level, todas as
// series temporais (weight, water, mood, measurements, challenges),
// conquistas ganhas, checkins dos ultimos 30 dias.
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  try {
    const user = await prisma.appUser.findUnique({
      where: { id },
      include: {
        profile: true,
        level: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Usuario nao encontrado" },
        { status: 404 }
      );
    }

    const [
      weightLogs,
      waterLogs,
      moodLogs,
      measurements,
      challenges,
      achievements,
      recentCheckins,
      order,
    ] = await Promise.all([
      prisma.appWeightLog.findMany({
        where: { userId: id },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.appWaterLog.findMany({
        where: { userId: id },
        orderBy: { loggedAt: "desc" },
        take: 30,
      }),
      prisma.appMoodLog.findMany({
        where: { userId: id },
        orderBy: { loggedAt: "desc" },
        take: 30,
      }),
      prisma.appMeasurement.findMany({
        where: { userId: id },
        orderBy: { loggedAt: "asc" },
      }),
      prisma.appChallenge.findMany({
        where: { userId: id },
        orderBy: { day: "asc" },
      }),
      prisma.appUserAchievement.findMany({
        where: { userId: id },
        orderBy: { earnedAt: "desc" },
        include: { achievement: true },
      }),
      prisma.appCheckin.findMany({
        where: { userId: id },
        orderBy: { date: "desc" },
        take: 30,
      }),
      prisma.order.findUnique({
        where: { id: user.orderId },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        accessType: user.accessType,
        createdAt: user.createdAt,
        profile: user.profile,
        level: user.level ?? { xp: 0, level: 1 },
      },
      order,
      weightLogs,
      waterLogs,
      moodLogs,
      measurements,
      challenges,
      achievements,
      recentCheckins,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
