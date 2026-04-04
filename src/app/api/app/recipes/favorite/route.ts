import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";
import { addXP, XP_REWARDS } from "@/lib/gamification";

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const favs = await prisma.appFavoriteRecipe.findMany({
    where: { userId: user.id },
    select: { recipeId: true },
  });

  return NextResponse.json({ favoriteIds: favs.map((f) => f.recipeId) });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const body = await req.json();
  const { recipeId } = body as { recipeId: string };

  if (!recipeId) {
    return NextResponse.json({ error: "recipeId obrigatorio" }, { status: 400 });
  }

  // Check if already favorited
  const existing = await prisma.appFavoriteRecipe.findUnique({
    where: { userId_recipeId: { userId: user.id, recipeId } },
  });

  if (existing) {
    // Remove favorite
    await prisma.appFavoriteRecipe.delete({
      where: { id: existing.id },
    });
    return NextResponse.json({ action: "removed", recipeId });
  }

  // Check if this is the user's first favorite ever (for XP)
  const totalFavs = await prisma.appFavoriteRecipe.count({
    where: { userId: user.id },
  });

  // Add favorite
  await prisma.appFavoriteRecipe.create({
    data: { userId: user.id, recipeId },
  });

  // Award XP on first favorite
  if (totalFavs === 0) {
    await addXP(user.id, XP_REWARDS.recipe_fav);
  }

  return NextResponse.json({ action: "added", recipeId });
}
