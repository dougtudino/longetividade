import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { RECIPES } from "@/data/recipes";
import { LOCKED_RECIPES } from "@/data/recipes-locked";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const pillar = searchParams.get("pillar");

  // Junta receitas base com as "trancadas" (premio extra por nivel)
  let filtered = [...RECIPES, ...LOCKED_RECIPES];

  if (category) {
    filtered = filtered.filter((r) => r.category === category);
  }
  if (pillar) {
    filtered = filtered.filter((r) => r.pillar === pillar);
  }

  // Check if user is logged in to include favorite status + level
  const user = await getAppUser(req);
  let favoriteIds: string[] = [];
  let userLevel = 1;

  if (user) {
    const [favs, lvl] = await Promise.all([
      prisma.appFavoriteRecipe.findMany({
        where: { userId: user.id },
        select: { recipeId: true },
      }),
      prisma.appUserLevel.findUnique({ where: { userId: user.id } }),
    ]);
    favoriteIds = favs.map((f) => f.recipeId);
    userLevel = lvl?.level ?? 1;
  }

  const recipes = filtered.map((r) => {
    const requiredLevel = r.requiredLevel ?? 1;
    const locked = userLevel < requiredLevel;
    return {
      ...r,
      isFavorite: favoriteIds.includes(r.id),
      requiredLevel,
      locked,
    };
  });

  return NextResponse.json({ recipes, userLevel });
}
