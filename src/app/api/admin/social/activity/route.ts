import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/social/activity
// Retorna atividade recente da Luna pra exibir num box de logs.
// - Ultimos posts publicados (status=posted)
// - Ultimos runs dos crons (AgentKnowledge kind=learning, source luna-*)

export async function GET() {
  const [recentPosted, recentRuns] = await Promise.all([
    prisma.socialPost.findMany({
      where: { status: "posted" },
      orderBy: { postedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        format: true,
        pillar: true,
        postedAt: true,
        engagementData: true,
      },
    }),
    prisma.agentKnowledge.findMany({
      where: { agentId: "luna", kind: "learning" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { title: true, body: true, source: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    recentPosted,
    recentRuns,
  });
}
