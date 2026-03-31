import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
