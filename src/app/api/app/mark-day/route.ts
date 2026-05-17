import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { addXP, evaluateAchievements, XP_REWARDS } from "@/lib/gamification";
import { ensureActiveCycle, markDayCompleted, currentDayInCycle } from "@/lib/cycles";
import { brasilStartOfDay, brasilEndOfDay } from "@/lib/tz";

// POST /api/app/mark-day
// O endpoint UNICO que o botao "Marcar meu dia" usa. Recebe o estado
// completo do dia (habits + agua + humor + peso opcional) e:
//   1. Upsert no AppCheckin (data = hoje em UTC)
//   2. Cria AppWaterLog se waterAdd > 0
//   3. Cria AppMoodLog se mood
//   4. Cria AppWeightLog se weight numero
//   5. Se >= 5 habitos true, auto-marca proximo dia do ciclo ativo
//   6. Gera XP por cada acao e roda evaluateAchievements
//
// Idempotente: chamar de novo no mesmo dia atualiza o checkin existente
// (mas evita criar log de agua/humor/peso duplicado se nao mudou).
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
  const habits = body.habits ?? {};
  const habitsCount = Object.values(habits).filter(Boolean).length;
  const exerciseDone = !!habits["movimento"];

  // 1) Upsert checkin (acumula waterCount se waterAdd > 0)
  const existingCheckin = await prisma.appCheckin.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });
  const waterAdd = Math.max(0, Number(body.waterAdd ?? 0));
  const newWaterCount = (existingCheckin?.waterCount ?? 0) + waterAdd;

  const checkin = await prisma.appCheckin.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: {
      habits,
      waterCount: newWaterCount,
      exerciseDone,
      note: body.note ?? existingCheckin?.note ?? null,
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

  // 2) Water log adicional (registra cada incremento)
  if (waterAdd > 0) {
    await prisma.appWaterLog.create({
      data: { userId: user.id, cups: waterAdd },
    });
    await addXP(user.id, XP_REWARDS.checkin); // micro-acao
    if (newWaterCount >= 8 && (existingCheckin?.waterCount ?? 0) < 8) {
      // bateu meta de agua agora
      await addXP(user.id, XP_REWARDS.water_goal);
    }
  }

  // 3) Mood log (so se nao tiver um do dia)
  let moodCreated = false;
  if (body.mood && typeof body.mood === "string") {
    const todayEnd = brasilEndOfDay();
    const existingMood = await prisma.appMoodLog.findFirst({
      where: { userId: user.id, loggedAt: { gte: today, lt: todayEnd } },
    });
    if (!existingMood) {
      await prisma.appMoodLog.create({
        data: {
          userId: user.id,
          mood: body.mood,
          triggers: body.moodTriggers ?? [],
        },
      });
      moodCreated = true;
      await addXP(user.id, XP_REWARDS.mood_log);
    } else if (existingMood.mood !== body.mood) {
      // atualiza mood do dia se mudou de ideia
      await prisma.appMoodLog.update({
        where: { id: existingMood.id },
        data: { mood: body.mood, triggers: body.moodTriggers ?? existingMood.triggers },
      });
    }
  }

  // 4) Weight log se passou um valor novo
  let weightCreated = false;
  if (typeof body.weight === "number" && body.weight > 0) {
    await prisma.appWeightLog.create({
      data: { userId: user.id, weight: body.weight, note: body.weightNote ?? null },
    });
    weightCreated = true;
    await addXP(user.id, XP_REWARDS.weight_log);
  }

  // 5) Marca dia do ciclo (modelo CALENDÁRIO) — dia atual = data hoje
  // relativa ao startDate do ciclo. Vitoria desse dia se habitsCount >= 5.
  // ensureActiveCycle ja auto-fecha ciclo expirado antes.
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

  // 6) XP base do checkin + bonus se all habits
  if (!existingCheckin) await addXP(user.id, XP_REWARDS.checkin);
  if (habitsCount >= 10 && Object.values(habits).every(Boolean)) {
    await addXP(user.id, XP_REWARDS.all_habits);
  }
  if (exerciseDone) await addXP(user.id, XP_REWARDS.exercise);

  const newAchievements = await evaluateAchievements(user.id);

  return NextResponse.json({
    ok: true,
    checkin,
    autoChallengeDay,
    moodCreated,
    weightCreated,
    newAchievements,
  });
}
