import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

// GET /api/admin/app-users
// Lista todos os AppUsers com metadata enriquecida:
//  - profile (name, objective, onboardingDone)
//  - ultimo checkin
//  - total de checkins
//  - streak atual (dias consecutivos)
//  - XP + level
//  - peso inicial vs atual (perda)
//  - total conquistas ganhas
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  try {
    const users = await prisma.appUser.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        level: true,
        _count: {
          select: {
            checkins: true,
            waterLogs: true,
            weightLogs: true,
            moodLogs: true,
            achievements: true,
            challenges: true,
            measurements: true,
          },
        },
      },
    });

    // Enriquece com ultimo checkin + primeiro/ultimo peso
    const enriched = await Promise.all(
      users.map(async (user) => {
        const [lastCheckin, firstWeight, lastWeight, order] = await Promise.all([
          prisma.appCheckin.findFirst({
            where: { userId: user.id },
            orderBy: { date: "desc" },
            select: { date: true, waterCount: true, exerciseDone: true },
          }),
          prisma.appWeightLog.findFirst({
            where: { userId: user.id },
            orderBy: { loggedAt: "asc" },
            select: { weight: true, loggedAt: true },
          }),
          prisma.appWeightLog.findFirst({
            where: { userId: user.id },
            orderBy: { loggedAt: "desc" },
            select: { weight: true, loggedAt: true },
          }),
          prisma.order.findUnique({
            where: { id: user.orderId },
            select: { amount: true, createdAt: true, status: true, hotmartTransactionId: true },
          }),
        ]);

        // Streak: contar dias consecutivos com checkin (max 30d lookback)
        let streak = 0;
        try {
          const today = new Date();
          for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            const c = await prisma.appCheckin.findUnique({
              where: { userId_date: { userId: user.id, date: d } },
            });
            if (c) streak += 1;
            else break;
          }
        } catch {
          streak = 0;
        }

        const weightLost =
          firstWeight && lastWeight ? firstWeight.weight - lastWeight.weight : 0;

        return {
          id: user.id,
          email: user.email,
          plan: user.plan,
          accessType: user.accessType,
          createdAt: user.createdAt,
          profile: user.profile
            ? {
                name: user.profile.name,
                objective: user.profile.objective,
                goalType: user.profile.goalType,
                goalWeight: user.profile.goalWeight,
                currentWeight: user.profile.currentWeight,
                height: user.profile.height,
                age: user.profile.age,
                waterGoal: user.profile.waterGoal,
                onboardingDone: user.profile.onboardingDone,
                challenges: user.profile.challenges,
              }
            : null,
          level: user.level
            ? { xp: user.level.xp, level: user.level.level }
            : { xp: 0, level: 1 },
          counts: user._count,
          lastCheckin,
          firstWeight,
          lastWeight,
          weightLost,
          streak,
          order: order ?? null,
        };
      })
    );

    return NextResponse.json({ ok: true, users: enriched });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      users: [],
      warning: `Tabela AppUser indisponivel: ${(e as Error).message}`,
    });
  }
}
