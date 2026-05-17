import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { ACTIVITIES, type Activity } from "@/data/activities";
import { addXP, evaluateAchievements } from "@/lib/gamification";
import { brasilStartOfDay, brasilEndOfDay } from "@/lib/tz";

// GET /api/app/activities
// Retorna catálogo com locked status baseado em user.level + log do dia
// pra cada atividade desbloqueada.
export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  try {
    const [level, todayLogs] = await Promise.all([
      prisma.appUserLevel.findUnique({ where: { userId: user.id } }),
      prisma.appActivityLog.findMany({
        where: {
          userId: user.id,
          loggedAt: { gte: brasilStartOfDay(), lt: brasilEndOfDay() },
        },
        select: { activityId: true, minutes: true, xpAwarded: true },
      }),
    ]);

    const userLevel = level?.level ?? 1;
    const todayByActivity = new Map<string, { minutes: number; xpAwarded: number }>();
    for (const log of todayLogs) {
      const existing = todayByActivity.get(log.activityId);
      if (existing) {
        existing.minutes += log.minutes;
        existing.xpAwarded += log.xpAwarded;
      } else {
        todayByActivity.set(log.activityId, { minutes: log.minutes, xpAwarded: log.xpAwarded });
      }
    }

    const activities = ACTIVITIES.map((a: Activity) => {
      const locked = userLevel < a.requiredLevel;
      const today = todayByActivity.get(a.id) ?? null;
      return { ...a, locked, todayMinutes: today?.minutes ?? 0, todayXp: today?.xpAwarded ?? 0 };
    });

    return NextResponse.json({ activities, userLevel });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/app/activities
// Body: { activityId: string, minutes: number }
// Cria log + credita XP proporcional + roda evaluateAchievements.
// Idempotente: chamar de novo cria OUTRO log (pessoa pode fazer
// caminhada de manhã e à tarde — soma os dois).
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  let body: { activityId?: string; minutes?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const activity = ACTIVITIES.find((a) => a.id === body.activityId);
  if (!activity) {
    return NextResponse.json({ error: "Atividade nao encontrada" }, { status: 404 });
  }

  // Valida nivel
  const level = await prisma.appUserLevel.findUnique({ where: { userId: user.id } });
  const userLevel = level?.level ?? 1;
  if (userLevel < activity.requiredLevel) {
    return NextResponse.json(
      { error: `Essa atividade desbloqueia no Nv ${activity.requiredLevel}` },
      { status: 403 }
    );
  }

  // Valida minutes (precisa bater com uma das timeOptions)
  const timeOpt = activity.timeOptions.find((t) => t.minutes === body.minutes);
  if (!timeOpt) {
    return NextResponse.json(
      { error: `Tempo invalido. Opcoes: ${activity.timeOptions.map((t) => t.minutes).join(", ")} min` },
      { status: 400 }
    );
  }

  // Cria log + credita XP
  const log = await prisma.appActivityLog.create({
    data: {
      userId: user.id,
      activityId: activity.id,
      minutes: timeOpt.minutes,
      xpAwarded: timeOpt.xp,
    },
  });
  await addXP(user.id, timeOpt.xp);

  const newAchievements = await evaluateAchievements(user.id);

  return NextResponse.json({
    ok: true,
    log,
    activity: { id: activity.id, name: activity.name, icon: activity.icon },
    xpAwarded: timeOpt.xp,
    newAchievements,
  });
}
