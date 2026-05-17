import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { brasilStartOfDay } from "@/lib/tz";

// GET /api/admin/app-users
// Lista todos os AppUsers com metadata enriquecida.
//
// Refator 2026-05-17 (Onda 2 do diagnostico): antes fazia ~35 queries
// POR USER (4 paralelas + LOOP DE 30 sequenciais pra streak). Com 100
// users = ~3500 queries por request → connection pool Railway estourava.
//
// Agora: ~7 queries TOTAIS pra qualquer N de users:
//   1. AppUser.findMany com profile + level + _count
//   2. Order.findMany dos orderIds (1 query agrupada)
//   3. AppCheckin.findMany dos ultimos 31 dias agrupado por user
//   4. AppWeightLog primeiro de cada user (window via Prisma)
//   5. AppWeightLog ultimo de cada user
//   6/7. ... (na pratica usamos findMany e agrupamos em memoria)
//
// Streak calculada em memoria a partir do dataset de checkins.
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

    if (users.length === 0) {
      return NextResponse.json({ ok: true, users: [] });
    }

    const userIds = users.map((u) => u.id);
    const orderIds = users.map((u) => u.orderId);

    // Janela de 31 dias pra cobrir streak max 30
    const thirtyOneDaysAgo = new Date(brasilStartOfDay().getTime() - 31 * 24 * 60 * 60 * 1000);

    const [orders, recentCheckins, allWeights] = await Promise.all([
      prisma.order.findMany({
        where: { id: { in: orderIds } },
        select: { id: true, amount: true, createdAt: true, status: true, hotmartTransactionId: true },
      }),
      prisma.appCheckin.findMany({
        where: { userId: { in: userIds }, date: { gte: thirtyOneDaysAgo } },
        orderBy: { date: "desc" },
        select: { userId: true, date: true, waterCount: true, exerciseDone: true },
      }),
      prisma.appWeightLog.findMany({
        where: { userId: { in: userIds } },
        orderBy: { loggedAt: "asc" },
        select: { userId: true, weight: true, loggedAt: true },
      }),
    ]);

    // Indexa orders por id
    const ordersById = new Map(orders.map((o) => [o.id, o]));

    // Agrupa checkins por user (ordenados desc por date)
    const checkinsByUser = new Map<string, typeof recentCheckins>();
    for (const c of recentCheckins) {
      const list = checkinsByUser.get(c.userId) ?? [];
      list.push(c);
      checkinsByUser.set(c.userId, list);
    }

    // Agrupa weights por user (ordenados asc por loggedAt)
    const weightsByUser = new Map<string, typeof allWeights>();
    for (const w of allWeights) {
      const list = weightsByUser.get(w.userId) ?? [];
      list.push(w);
      weightsByUser.set(w.userId, list);
    }

    // Helper: converte Date (@db.Date eh UTC midnight) pra YYYY-MM-DD BR
    function dateToBrDay(d: Date): string {
      const br = new Date(d.getTime() - 3 * 60 * 60 * 1000);
      return br.toISOString().split("T")[0];
    }

    function shiftBrDay(yyyyMmDd: string, n: number): string {
      const d = new Date(yyyyMmDd + "T03:00:00Z");
      d.setUTCDate(d.getUTCDate() + n);
      return d.toISOString().split("T")[0];
    }

    function todayBr(): string {
      return new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().split("T")[0];
    }

    function calcStreak(userCheckins: typeof recentCheckins): number {
      if (userCheckins.length === 0) return 0;
      const days = new Set(userCheckins.map((c) => dateToBrDay(c.date)));
      let cursor = todayBr();
      if (!days.has(cursor)) cursor = shiftBrDay(cursor, -1);
      let streak = 0;
      while (days.has(cursor) && streak < 31) {
        streak++;
        cursor = shiftBrDay(cursor, -1);
      }
      return streak;
    }

    const enriched = users.map((user) => {
      const userCheckins = checkinsByUser.get(user.id) ?? [];
      const userWeights = weightsByUser.get(user.id) ?? [];
      const lastCheckin = userCheckins[0]
        ? {
            date: userCheckins[0].date,
            waterCount: userCheckins[0].waterCount,
            exerciseDone: userCheckins[0].exerciseDone,
          }
        : null;
      const firstWeight = userWeights[0]
        ? { weight: userWeights[0].weight, loggedAt: userWeights[0].loggedAt }
        : null;
      const lastWeight = userWeights[userWeights.length - 1]
        ? {
            weight: userWeights[userWeights.length - 1].weight,
            loggedAt: userWeights[userWeights.length - 1].loggedAt,
          }
        : null;
      const weightLost = firstWeight && lastWeight ? firstWeight.weight - lastWeight.weight : 0;
      const streak = calcStreak(userCheckins);
      const order = ordersById.get(user.orderId) ?? null;

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
        order,
      };
    });

    return NextResponse.json({ ok: true, users: enriched });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      users: [],
      warning: `Tabela AppUser indisponivel: ${(e as Error).message}`,
    });
  }
}
