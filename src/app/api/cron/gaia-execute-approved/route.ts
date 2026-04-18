import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeDecision } from "@/lib/gaia-executor";

// GET /api/cron/gaia-execute-approved
// Worker que roda de hora em hora: pega decisions Gaia com status=approved
// mas sem executedAt, e aplica no Meta Ads API. Substitui a execucao manual
// via botao em /admin/agents/gaia.
//
// Schedule sugerido: 0 * * * * (a cada hora no minuto 0)
//
// Security: header x-cron-secret OU ?secret=<CRON_SECRET>. Rejeita sem isso
// porque executa acoes reais em dinheiro de anuncios.

const MAX_PER_RUN = 20;

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

  const pending = await prisma.agentDecision.findMany({
    where: {
      agentId: "gaia",
      status: "approved",
      executedAt: null,
    },
    orderBy: [{ priority: "desc" }, { approvedAt: "asc" }],
    take: MAX_PER_RUN,
  });

  const results: Array<{
    id: string;
    action: string;
    targetId: string;
    ok: boolean;
    error?: string;
  }> = [];

  for (const d of pending) {
    try {
      const r = await executeDecision({
        action: d.action,
        targetId: d.targetId,
        params: (d.params ?? {}) as Record<string, unknown>,
      });

      await prisma.agentDecision.update({
        where: { id: d.id },
        data: {
          status: r.ok ? "executed" : "failed",
          executedAt: new Date(),
          executionResult: r.result
            ? (JSON.parse(JSON.stringify(r.result)) as object)
            : { note: r.error ?? "no result" },
          rejectedReason: r.ok ? null : r.error ?? "erro desconhecido",
        },
      });

      results.push({
        id: d.id,
        action: d.action,
        targetId: d.targetId,
        ok: r.ok,
        error: r.error,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await prisma.agentDecision.update({
        where: { id: d.id },
        data: {
          status: "failed",
          executedAt: new Date(),
          rejectedReason: msg.slice(0, 500),
        },
      });
      results.push({
        id: d.id,
        action: d.action,
        targetId: d.targetId,
        ok: false,
        error: msg,
      });
    }
  }

  const succeeded = results.filter((r) => r.ok).length;
  const failed = results.length - succeeded;

  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    attempted: pending.length,
    succeeded,
    failed,
    results,
  });
}
