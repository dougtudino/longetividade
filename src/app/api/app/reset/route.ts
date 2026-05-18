import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";

// POST /api/app/reset
// Apaga TODOS os dados de progresso do user e volta pro onboarding.
// Preserva: AppUser (conta), AppPushSubscription (dispositivos),
// Order (acesso VIP). Apaga: Profile, Cycles, Challenges, Checkins,
// Water/Weight/Mood logs, Achievements, Level, Favorites, Measurements,
// ActivityLogs, NotificationPrefs, NotificationLogs.
//
// Exige body { confirm: "RESETAR" } literal — qualquer outra coisa devolve 400.
// Reset é destrutivo e não tem desfazer, então duas confirmações na UI + token
// literal no body funcionam como triple-check.
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  let body: { confirm?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "body invalido" }, { status: 400 });
  }
  if (body.confirm !== "RESETAR") {
    return NextResponse.json(
      { error: "Confirme com 'RESETAR' no campo confirm" },
      { status: 400 }
    );
  }

  try {
    // Ordem importa por causa de FKs:
    // AppChallenge -> AppCycle, AppUser
    // AppUserAchievement -> AppAchievement, AppUser
    // AppFavoriteRecipe -> AppRecipe, AppUser
    // Todos os outros App* -> AppUser
    //
    // Postgres trata como uma única transação — se algo falhar, rollback.
    const deleted = await prisma.$transaction(async (tx) => {
      const challenges = await tx.appChallenge.deleteMany({ where: { userId: user.id } });
      const cycles = await tx.appCycle.deleteMany({ where: { userId: user.id } });
      const checkins = await tx.appCheckin.deleteMany({ where: { userId: user.id } });
      const water = await tx.appWaterLog.deleteMany({ where: { userId: user.id } });
      const weight = await tx.appWeightLog.deleteMany({ where: { userId: user.id } });
      const moods = await tx.appMoodLog.deleteMany({ where: { userId: user.id } });
      const userAchievements = await tx.appUserAchievement.deleteMany({ where: { userId: user.id } });
      const level = await tx.appUserLevel.deleteMany({ where: { userId: user.id } });
      const favorites = await tx.appFavoriteRecipe.deleteMany({ where: { userId: user.id } });
      const measurements = await tx.appMeasurement.deleteMany({ where: { userId: user.id } });
      const activities = await tx.appActivityLog.deleteMany({ where: { userId: user.id } });
      const notifPrefs = await tx.appNotificationPref.deleteMany({ where: { userId: user.id } });
      const notifLogs = await tx.appNotificationLog.deleteMany({ where: { userId: user.id } });
      const milestones = await tx.appBrotoMilestone.deleteMany({ where: { userId: user.id } });
      const profile = await tx.appProfile.deleteMany({ where: { userId: user.id } });

      return {
        challenges: challenges.count,
        cycles: cycles.count,
        checkins: checkins.count,
        water: water.count,
        weight: weight.count,
        moods: moods.count,
        userAchievements: userAchievements.count,
        level: level.count,
        favorites: favorites.count,
        measurements: measurements.count,
        activities: activities.count,
        notifPrefs: notifPrefs.count,
        notifLogs: notifLogs.count,
        milestones: milestones.count,
        profile: profile.count,
      };
    });

    return NextResponse.json({ ok: true, deleted });
  } catch (e) {
    console.error("POST /api/app/reset error:", e);
    return NextResponse.json(
      { error: "reset_failed", detail: (e as Error).message },
      { status: 500 }
    );
  }
}
