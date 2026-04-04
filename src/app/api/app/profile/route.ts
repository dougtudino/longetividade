import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";
import { addXP, evaluateAchievements, XP_REWARDS } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const profile = await prisma.appProfile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();

  // Build partial update data — only include fields that were sent
  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.objective !== undefined) updateData.objective = body.objective;
  if (body.currentWeight !== undefined) updateData.currentWeight = body.currentWeight ?? null;
  if (body.height !== undefined) updateData.height = body.height ?? null;
  if (body.age !== undefined) updateData.age = body.age ?? null;
  if (body.goalType !== undefined) updateData.goalType = body.goalType;
  if (body.goalCustom !== undefined) updateData.goalCustom = body.goalCustom ?? null;
  if (body.goalWeight !== undefined) updateData.goalWeight = body.goalWeight ?? null;
  if (body.challenges !== undefined) updateData.challenges = body.challenges ?? [];
  if (body.onboardingDone !== undefined) updateData.onboardingDone = body.onboardingDone ?? false;
  if (body.waterGoal !== undefined) updateData.waterGoal = body.waterGoal;

  const profile = await prisma.appProfile.upsert({
    where: { userId: user.id },
    update: updateData,
    create: {
      userId: user.id,
      name: body.name ?? "",
      objective: body.objective ?? "",
      currentWeight: body.currentWeight ?? null,
      height: body.height ?? null,
      age: body.age ?? null,
      goalType: body.goalType ?? "",
      goalCustom: body.goalCustom ?? null,
      goalWeight: body.goalWeight ?? null,
      challenges: body.challenges ?? [],
      onboardingDone: body.onboardingDone ?? false,
      waterGoal: body.waterGoal ?? 8,
    },
  });

  // Award XP if onboarding completed
  if (body.onboardingDone) {
    await addXP(user.id, XP_REWARDS.checkin); // 10 XP for completing onboarding
  }

  // Evaluate achievements
  const newAchievements = await evaluateAchievements(user.id);

  return NextResponse.json({ profile, newAchievements });
}
