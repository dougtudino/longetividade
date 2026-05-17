import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { getCurrentCycle } from "@/lib/cycles";
import { RECIPES } from "@/data/recipes";
import { CHALLENGE_DAYS } from "@/data/challenge-days";

// GET /api/app/recipe-of-day
// Sugere UMA receita alinhada ao pilar (S/E/M) do dia atual do desafio.
// Filtra receitas trancadas que a usuaria ainda nao desbloqueou.
// Determinismo: usa userId + data como seed pra mesmo dia sugerir mesma receita.
export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  try {
    const [cycle, level] = await Promise.all([
      getCurrentCycle(user.id),
      prisma.appUserLevel.findUnique({ where: { userId: user.id } }),
    ]);

    const userLevel = level?.level ?? 1;

    // Pilar do dia atual: pega day = daysCompleted + 1 e olha em CHALLENGE_DAYS
    const dayNumber = Math.min(21, (cycle?.daysCompleted ?? 0) + 1);
    const dayInfo = CHALLENGE_DAYS.find((d) => d.day === dayNumber);
    const pillar = dayInfo?.pillar ?? "S";

    // Filtra: do pilar + nao trancada (ou trancada mas user.level >= requiredLevel)
    const candidates = RECIPES.filter((r) => {
      if (r.pillar !== pillar) return false;
      const req = r.requiredLevel ?? 1;
      return userLevel >= req;
    });

    if (candidates.length === 0) {
      // Fallback: qualquer receita do pilar
      const any = RECIPES.find((r) => r.pillar === pillar) ?? RECIPES[0];
      return NextResponse.json({ recipe: any, pillar, dayNumber });
    }

    // Seed deterministico: mesmo dia + mesmo user = mesma receita
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    const seed = `${user.id}-${today}`;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    const chosen = candidates[hash % candidates.length];

    return NextResponse.json({
      recipe: chosen,
      pillar,
      dayNumber,
      pillarLabel: pillar === "S" ? "Simplicidade" : pillar === "E" ? "Equilibrio" : "Movimento",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
