import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";

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

  const profile = await prisma.appProfile.upsert({
    where: { userId: user.id },
    update: {
      name: body.name,
      objective: body.objective,
      currentWeight: body.currentWeight ?? null,
      height: body.height ?? null,
      age: body.age ?? null,
      goalType: body.goalType,
      goalCustom: body.goalCustom ?? null,
      goalWeight: body.goalWeight ?? null,
      challenges: body.challenges ?? [],
      onboardingDone: body.onboardingDone ?? false,
    },
    create: {
      userId: user.id,
      name: body.name,
      objective: body.objective,
      currentWeight: body.currentWeight ?? null,
      height: body.height ?? null,
      age: body.age ?? null,
      goalType: body.goalType,
      goalCustom: body.goalCustom ?? null,
      goalWeight: body.goalWeight ?? null,
      challenges: body.challenges ?? [],
      onboardingDone: body.onboardingDone ?? false,
    },
  });

  return NextResponse.json({ profile });
}
