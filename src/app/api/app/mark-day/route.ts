import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { addXP, evaluateAchievements, XP_REWARDS } from "@/lib/gamification";
import { ensureActiveCycle, markDayCompleted, currentDayInCycle } from "@/lib/cycles";
import { brasilStartOfDay, brasilEndOfDay } from "@/lib/tz";

// POST /api/app/mark-day
// O endpoint UNICO que o botão "Marcar meu dia" usa. Recebe o estado
// completo do dia (habits + agua + humor + peso opcional) e:
//   1. (TX) Upsert no AppCheckin do dia (BR)
//   2. (TX) Cria AppWaterLog se waterAdd > 0
//   3. (TX) Cria/atualiza AppMoodLog se mood
//   4. (TX) Cria AppWeightLog se weight
//   5. (fora TX) Marca dia do ciclo se >=5 habitos (idempotente)
//   6. (fora TX) XP + evaluateAchievements
//
// Writes principais em `prisma.$transaction` pra evitar estado parcial em
// falha de rede. Resto fica em eventual consistency — re-disparar mark-day
// nao duplica nada porque XP/challenge sao idempotentes em re-chamada
// (challenge: already-done short-circuit; XP: addXP eh upsert no nivel).
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  let body: {
    habits?: Record<string, boolean>;
    waterAdd?: number;
    mood?: string | null;
    moodTriggers?: string[];
    weight?: number | null;
    weightNote?: string | null;
    note?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const today = brasilStartOfDay();
  const todayEnd = brasilEndOfDay();
  const habits = body.habits ?? {};
  const habitsCount = Object.values(habits).filter(Boolean).length;
  const exerciseDone = !!habits["movimento"];
  const waterAdd = Math.max(0, Number(body.waterAdd ?? 0));

  // ─── Transação: writes principais ────────────────────────
  const txResult = await prisma.$transaction(async (tx) => {
    const existing = await tx.appCheckin.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });
    const newWaterCount = (existing?.waterCount ?? 0) + waterAdd;

    const checkin = await tx.appCheckin.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {
        habits,
        waterCount: newWaterCount,
        exerciseDone,
        note: body.note ?? existing?.note ?? null,
      },
      create: {
        userId: user.id,
        date: today,
        habits,
        waterCount: waterAdd,
        exerciseDone,
        note: body.note ?? null,
      },
    });

    let waterLogCreated = false;
    if (waterAdd > 0) {
      await tx.appWaterLog.create({
        data: { userId: user.id, cups: waterAdd },
      });
      waterLogCreated = true;
    }

    let moodAction: "created" | "updated" | "none" = "none";
    if (body.mood && typeof body.mood === "string") {
      const existingMood = await tx.appMoodLog.findFirst({
        where: { userId: user.id, loggedAt: { gte: today, lt: todayEnd } },
      });
      if (!existingMood) {
        await tx.appMoodLog.create({
          data: {
            userId: user.id,
            mood: body.mood,
            triggers: body.moodTriggers ?? [],
          },
        });
        moodAction = "created";
      } else if (existingMood.mood !== body.mood) {
        await tx.appMoodLog.update({
          where: { id: existingMood.id },
          data: { mood: body.mood, triggers: body.moodTriggers ?? existingMood.triggers },
        });
        moodAction = "updated";
      }
    }

    let weightCreated = false;
    if (typeof body.weight === "number" && body.weight > 0) {
      await tx.appWeightLog.create({
        data: { userId: user.id, weight: body.weight, note: body.weightNote ?? null },
      });
      weightCreated = true;
    }

    return {
      checkin,
      waterLogCreated,
      moodAction,
      weightCreated,
      isNewCheckin: !existing,
      previousWaterCount: existing?.waterCount ?? 0,
      newWaterCount,
    };
  });

  // ─── Fora da transação: XP + challenge + achievements ────
  // Cada um eh idempotente em re-chamada: addXP/challenge nao duplicam
  // se mark-day rodar de novo no mesmo dia.

  if (txResult.waterLogCreated) {
    await addXP(user.id, XP_REWARDS.checkin); // micro-acao
    if (txResult.newWaterCount >= 8 && txResult.previousWaterCount < 8) {
      await addXP(user.id, XP_REWARDS.water_goal);
    }
  }

  if (txResult.moodAction === "created") {
    await addXP(user.id, XP_REWARDS.mood_log);
  }

  if (txResult.weightCreated) {
    await addXP(user.id, XP_REWARDS.weight_log);
  }

  let autoChallengeDay: number | null = null;
  if (habitsCount >= 5) {
    try {
      const cycle = await ensureActiveCycle(user.id);
      if (cycle && cycle.status === "active") {
        const dayInCycle = currentDayInCycle(cycle.startDate);
        if (dayInCycle != null) {
          const result = await markDayCompleted(user.id, dayInCycle);
          if (!result.alreadyDone) {
            autoChallengeDay = dayInCycle;
            await addXP(user.id, XP_REWARDS.challenge_day);
          }
        }
      }
    } catch {
      // silencioso
    }
  }

  if (txResult.isNewCheckin) await addXP(user.id, XP_REWARDS.checkin);
  if (habitsCount >= 10 && Object.values(habits).every(Boolean)) {
    await addXP(user.id, XP_REWARDS.all_habits);
  }
  if (exerciseDone) await addXP(user.id, XP_REWARDS.exercise);

  const newAchievements = await evaluateAchievements(user.id);

  return NextResponse.json({
    ok: true,
    checkin: txResult.checkin,
    autoChallengeDay,
    moodCreated: txResult.moodAction === "created",
    weightCreated: txResult.weightCreated,
    newAchievements,
  });
}
