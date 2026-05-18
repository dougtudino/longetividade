// GET  /api/app/broto/milestones — lista os marcos do Broto (mais recente primeiro)
// POST /api/app/broto/milestones — registra um marco
//
// Marcos sao imutaveis. Cliente envia body { kind, stage?, cycleNumber?, streakDays?, message }.
// O endpoint NAO valida unicidade — eh responsabilidade do cliente nao enviar
// duplicatas (ex: stage_up so registra quando localStorage.lastStage muda).
//
// Apagados pelo /api/app/reset (junto com tudo do usuario).
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const milestones = await prisma.appBrotoMilestone.findMany({
    where: { userId: user.id },
    orderBy: { achievedAt: "desc" },
    take: 50, // mais que isso vira ruido — limite saudavel
  });

  return NextResponse.json({ milestones });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  const { kind, stage, cycleNumber, streakDays, message } = body ?? {};

  if (!kind || !message) {
    return NextResponse.json({ error: "kind e message obrigatorios" }, { status: 400 });
  }

  const ALLOWED_KINDS = new Set([
    "stage_up",
    "cycle_complete",
    "first_checkin",
    "streak_milestone",
  ]);
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: "kind invalido" }, { status: 400 });
  }

  const milestone = await prisma.appBrotoMilestone.create({
    data: {
      userId: user.id,
      kind,
      stage: typeof stage === "number" ? stage : null,
      cycleNumber: typeof cycleNumber === "number" ? cycleNumber : null,
      streakDays: typeof streakDays === "number" ? streakDays : null,
      message: String(message).slice(0, 200),
    },
  });

  return NextResponse.json({ milestone });
}
