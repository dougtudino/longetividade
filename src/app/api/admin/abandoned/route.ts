import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminWorkspace, workspaceFilter } from "@/lib/workspace";

export async function GET(req: NextRequest) {
  const auth = await requireAdminWorkspace(req);
  if (!auth.ok) return auth.response;
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const abandoned = await prisma.abandonedCheckout.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, ...workspaceFilter(auth.workspaceId) },
      select: { id: true, email: true, plan: true, step: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ abandoned });
  } catch (error) {
    console.error("Abandoned API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
