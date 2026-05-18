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
    const [level, todayLogs, customActivities] = await Promise.all([
      prisma.appUserLevel.findUnique({ where: { userId: user.id } }),
      prisma.appActivityLog.findMany({
        where: {
          userId: user.id,
          loggedAt: { gte: brasilStartOfDay(), lt: brasilEndOfDay() },
        },
        select: { activityId: true, minutes: true, xpAwarded: true },
      }),
      prisma.appCustomActivity.findMany({
        where: { userId: user.id, archived: false },
        orderBy: { createdAt: "asc" },
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

    const builtIn = ACTIVITIES.map((a: Activity) => {
      const locked = userLevel < a.requiredLevel;
      const today = todayByActivity.get(a.id) ?? null;
      return {
        ...a,
        locked,
        todayMinutes: today?.minutes ?? 0,
        todayXp: today?.xpAwarded ?? 0,
        isCustom: false,
      };
    });

    // Custom activities: ID interno usa prefixo "custom:" pra evitar
    // colisao com IDs built-in. Sempre desbloqueadas (a usuaria criou).
    // XP: 1 XP/min ate 60min, depois 0.8 XP/min — formula simples sem
    // depender de pesquisa cientifica especifica.
    const custom = customActivities.map((c) => {
      const id = `custom:${c.id}`;
      const today = todayByActivity.get(id) ?? null;
      return {
        id,
        name: c.name,
        icon: c.icon,
        category: c.category as Activity["category"],
        description: "Atividade criada por voce",
        timeOptions: [
          { minutes: 15, xp: 15 },
          { minutes: 30, xp: 30 },
          { minutes: 45, xp: 42 },
          { minutes: 60, xp: 55 },
          { minutes: 90, xp: 75 },
        ],
        requiredLevel: 1,
        locked: false,
        todayMinutes: today?.minutes ?? 0,
        todayXp: today?.xpAwarded ?? 0,
        isCustom: true,
        customId: c.id, // pra deletar via API
      };
    });

    const activities = [...builtIn, ...custom];

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

  const activityId = String(body.activityId ?? "");

  // Custom activity? IDs começam com "custom:<uuid>"
  if (activityId.startsWith("custom:")) {
    const customId = activityId.slice("custom:".length);
    const custom = await prisma.appCustomActivity.findFirst({
      where: { id: customId, userId: user.id, archived: false },
    });
    if (!custom) {
      return NextResponse.json({ error: "Atividade custom nao encontrada" }, { status: 404 });
    }
    // Aceita qualquer um dos timeOptions padrao das custom (15/30/45/60/90)
    const CUSTOM_OPTS: Record<number, number> = { 15: 15, 30: 30, 45: 42, 60: 55, 90: 75 };
    const minutes = Number(body.minutes);
    const xp = CUSTOM_OPTS[minutes];
    if (!xp) {
      return NextResponse.json(
        { error: "Tempo invalido. Opcoes: 15, 30, 45, 60, 90 min" },
        { status: 400 },
      );
    }
    const log = await prisma.appActivityLog.create({
      data: { userId: user.id, activityId, minutes, xpAwarded: xp },
    });
    await addXP(user.id, xp);
    const newAchievements = await evaluateAchievements(user.id);
    return NextResponse.json({
      ok: true,
      log,
      activity: { id: activityId, name: custom.name, icon: custom.icon },
      xpAwarded: xp,
      newAchievements,
    });
  }

  // Built-in activity
  const activity = ACTIVITIES.find((a) => a.id === activityId);
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
