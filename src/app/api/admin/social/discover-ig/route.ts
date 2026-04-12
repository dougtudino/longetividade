import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { discoverInstagramId } from "@/lib/social-poster";

// GET /api/admin/social/discover-ig
// Descobre o Instagram Business Account ID vinculado a Page
// e salva em AppSetting pra uso futuro.
export async function GET() {
  const result = await discoverInstagramId();

  if (result.ok && result.igId) {
    // Salva pra nao precisar descobrir de novo
    try {
      await prisma.appSetting.upsert({
        where: { key: "INSTAGRAM_ACCOUNT_ID" },
        update: { value: result.igId },
        create: { key: "INSTAGRAM_ACCOUNT_ID", value: result.igId },
      });
    } catch {
      /* silent */
    }
  }

  return NextResponse.json(result);
}
