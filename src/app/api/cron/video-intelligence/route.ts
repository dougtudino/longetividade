// cron-job.org: 0 20 * * 6 (Sab 20h BRT = 23h UTC)
// Roda o pipeline completo em todos os concorrentes ativos.
// Usa os mesmos defaults do spec: topK=5, nDays=7, maxVideos=20.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runVideoPipeline, type VideoPipelineProgress } from "@/lib/video-pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 800;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET nao configurado" },
      { status: 503 }
    );
  }
  const provided =
    req.headers.get("x-cron-secret") ??
    new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const active = await prisma.videoCompetitor.findMany({
    where: { active: true },
    select: { username: true },
  });
  const usernames = active.map((c) => c.username);

  if (usernames.length === 0) {
    return NextResponse.json({ ok: false, error: "nenhum concorrente ativo" });
  }

  let final: VideoPipelineProgress | null = null;
  await runVideoPipeline(usernames, 20, 5, 7, (p) => {
    final = p;
  });

  // Espelha em AgentKnowledge (kind=learning) pra aparecer em logs da Luna
  const f = final as VideoPipelineProgress | null;
  if (f) {
    try {
      await prisma.agentKnowledge.create({
        data: {
          agentId: "luna",
          kind: "learning",
          title: `Video Intelligence — ${f.videosAnalyzed}/${f.videosTotal} analisados`,
          body: [
            `Concorrentes: ${usernames.length}`,
            `Videos analisados: ${f.videosAnalyzed}/${f.videosTotal}`,
            `Erros: ${f.errors.length}`,
            ``,
            `Log:`,
            ...f.log.slice(-30),
            ``,
            `Erros:`,
            ...f.errors.slice(-10),
          ].join("\n"),
          source: "luna-video-intelligence-cron",
          metadata: {
            videosAnalyzed: f.videosAnalyzed,
            videosTotal: f.videosTotal,
            errors: f.errors.length,
          },
        },
      });
    } catch {
      /* silent */
    }
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    usernames,
    progress: final,
  });
}
