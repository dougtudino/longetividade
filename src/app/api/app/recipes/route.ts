import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { RECIPES } from "@/data/recipes";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const pillar = searchParams.get("pillar");

  let filtered = RECIPES;

  if (category) {
    filtered = filtered.filter((r) => r.category === category);
  }
  if (pillar) {
    filtered = filtered.filter((r) => r.pillar === pillar);
  }

  // Check if user is logged in to include favorite status
  const user = await getAppUser(req);
  let favoriteIds: string[] = [];

  if (user) {
    const favs = await prisma.appFavoriteRecipe.findMany({
      where: { userId: user.id },
      select: { recipeId: true },
    });
    favoriteIds = favs.map((f) => f.recipeId);
  }

  const recipes = filtered.map((r) => ({
    ...r,
    isFavorite: favoriteIds.includes(r.id),
  }));

  return NextResponse.json({ recipes });
}
