import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const abandoned = await prisma.abandonedCheckout.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { id: true, email: true, plan: true, step: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ abandoned });
  } catch (error) {
    console.error("Abandoned API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
