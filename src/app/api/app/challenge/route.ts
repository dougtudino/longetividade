import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { addXP, XP_REWARDS } from "@/lib/gamification";
import { CHALLENGE_DAYS } from "@/data/challenge-days";
import { ensureActiveCycle, markDayCompleted, CYCLE_LENGTH_DAYS, currentDayInCycle, daysSinceStart } from "@/lib/cycles";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    return await getChallenge(user.id);
  } catch (e) {
    const msg = (e as Error).message;
    console.error("GET /api/app/challenge error:", msg);
    return NextResponse.json(
      { error: "challenge_failed", detail: msg },
      { status: 500 }
    );
  }
}

async function getChallenge(userId: string) {
  // ensureActiveCycle faz backfill + retorna ciclo vivo (ou null se ultimo
  // ciclo ficou completed e o user ainda nao iniciou o proximo).
  const cycle = await ensureActiveCycle(userId);

  // Lista challenges do ciclo vivo (se houver). Se nao tiver ciclo vivo,
  // mostra o ultimo ciclo completo (pra exibir 21/21 no UI).
  const targetCycle =
    cycle ??
    (await prisma.appCycle.findFirst({
      where: { userId },
      orderBy: { cycleNumber: "desc" },
    }));

  const completed = targetCycle
    ? await prisma.appChallenge.findMany({
        where: { userId, cycleId: targetCycle.id },
        select: { day: true },
        orderBy: { day: "asc" },
      })
    : [];

  const progress = completed.map((c) => c.day);
  const completedSet = new Set(progress);

  // currentDay agora vem do CALENDÁRIO (data hoje vs startDate).
  // Se ciclo expirou (passou 21d), retorna 22 (UI mostra "completo").
  let currentDay = CYCLE_LENGTH_DAYS + 1;
  let daysElapsed = 0;
  if (targetCycle && targetCycle.status !== "completed") {
    const cd = currentDayInCycle(targetCycle.startDate);
    if (cd != null) currentDay = cd;
    daysElapsed = Math.min(CYCLE_LENGTH_DAYS, daysSinceStart(targetCycle.startDate) + 1);
  } else if (targetCycle) {
    daysElapsed = CYCLE_LENGTH_DAYS;
  }

  // failedDays = dias do calendário que JÁ passaram mas NÃO foram marcados
  const failedDays: number[] = [];
  for (let d = 1; d < daysElapsed; d++) {
    if (!completedSet.has(d)) failedDays.push(d);
  }

  return NextResponse.json({
    days: CHALLENGE_DAYS,
    progress,
    currentDay,
    daysElapsed,
    failedDays,
    cycle: targetCycle
      ? {
          id: targetCycle.id,
          cycleNumber: targetCycle.cycleNumber,
          difficulty: targetCycle.difficulty ?? "normal",
          status: targetCycle.status,
          daysCompleted: targetCycle.daysCompleted,
          startDate: targetCycle.startDate,
          completedAt: targetCycle.completedAt,
        }
      : null,
    needsNewCycle: cycle === null && targetCycle !== null,
  });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const body = await req.json();
  const { day } = body as { day: number };

  if (!day || day < 1 || day > CYCLE_LENGTH_DAYS) {
    return NextResponse.json(
      { error: `Dia invalido (1-${CYCLE_LENGTH_DAYS})` },
      { status: 400 }
    );
  }

  try {
    const result = await markDayCompleted(user.id, day);
    if (result.alreadyDone) {
      return NextResponse.json({ error: "Dia ja completado", cycle: result.cycle }, { status: 409 });
    }

    const xpResult = await addXP(user.id, XP_REWARDS.challenge_day);

    return NextResponse.json({
      ok: true,
      day,
      xp: xpResult,
      cycle: result.cycle,
      justCompleted: result.justCompleted, // true se acabou de fechar 21/21
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
