import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { executeDecision } from "@/lib/gaia-executor";

// GET /api/admin/agents/gaia/decisions?status=proposed
// Lista decisoes da Gaia, filtradas por status
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);

  const decisions = await prisma.agentDecision.findMany({
    where: {
      agentId: "gaia",
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  // Agrega contagem por status (sempre retorna, independente do filtro)
  const counts = await prisma.agentDecision.groupBy({
    by: ["status"],
    where: { agentId: "gaia" },
    _count: true,
  });

  const countsMap: Record<string, number> = {};
  for (const c of counts) countsMap[c.status] = c._count;

  return NextResponse.json({
    ok: true,
    decisions,
    counts: countsMap,
  });
}

// POST /api/admin/agents/gaia/decisions
// Body: { decisionId, action: "approve" | "reject" | "execute", rejectedReason? }
//
// approve: status proposed → approved (apenas marca, nao executa ainda)
// execute: status approved → executed (dispara acao no Meta)
// reject: status proposed → rejected
//
// Flow normal: Doug/Barbara revisam, aprovam (sem executar), e dao
// "execute" individualmente (ou em batch). Fluxo mais cauteloso.
//
// Flow rapido: aprovar-e-executar num clique so (action="approve_execute")
export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    decisionId?: string;
    action?: string;
    rejectedReason?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  if (!body.decisionId || !body.action) {
    return NextResponse.json(
      { ok: false, error: "decisionId e action obrigatorios" },
      { status: 400 }
    );
  }

  const decision = await prisma.agentDecision.findUnique({
    where: { id: body.decisionId },
  });

  if (!decision) {
    return NextResponse.json({ ok: false, error: "Decision nao encontrada" }, { status: 404 });
  }

  const approvedBy = payload.email;

  // ─── APPROVE ────────────────────────────────────────────────
  if (body.action === "approve") {
    if (decision.status !== "proposed") {
      return NextResponse.json({
        ok: false,
        error: `Nao posso aprovar decisao com status ${decision.status}`,
      });
    }
    const updated = await prisma.agentDecision.update({
      where: { id: decision.id },
      data: {
        status: "approved",
        approvedBy,
        approvedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, decision: updated });
  }

  // ─── REJECT ─────────────────────────────────────────────────
  if (body.action === "reject") {
    if (decision.status !== "proposed") {
      return NextResponse.json({
        ok: false,
        error: `Nao posso rejeitar decisao com status ${decision.status}`,
      });
    }
    const updated = await prisma.agentDecision.update({
      where: { id: decision.id },
      data: {
        status: "rejected",
        approvedBy,
        rejectedReason: body.rejectedReason ?? null,
      },
    });
    return NextResponse.json({ ok: true, decision: updated });
  }

  // ─── EXECUTE ────────────────────────────────────────────────
  if (body.action === "execute") {
    if (decision.status !== "approved") {
      return NextResponse.json({
        ok: false,
        error: `Nao posso executar decisao com status ${decision.status}. Aprove primeiro.`,
      });
    }

    const result = await executeDecision({
      action: decision.action,
      targetId: decision.targetId,
      params: (decision.params as Record<string, unknown>) ?? {},
    });

    const updated = await prisma.agentDecision.update({
      where: { id: decision.id },
      data: {
        status: result.ok ? "executed" : "failed",
        executedAt: new Date(),
        executionResult: JSON.parse(
          JSON.stringify(result.ok ? result.result ?? {} : { error: result.error })
        ),
      },
    });
    return NextResponse.json({
      ok: result.ok,
      decision: updated,
      error: result.error,
    });
  }

  // ─── APPROVE_EXECUTE (combo) ────────────────────────────────
  if (body.action === "approve_execute") {
    if (decision.status !== "proposed") {
      return NextResponse.json({
        ok: false,
        error: `Nao posso aprovar-e-executar decisao com status ${decision.status}`,
      });
    }

    await prisma.agentDecision.update({
      where: { id: decision.id },
      data: {
        status: "approved",
        approvedBy,
        approvedAt: new Date(),
      },
    });

    const result = await executeDecision({
      action: decision.action,
      targetId: decision.targetId,
      params: (decision.params as Record<string, unknown>) ?? {},
    });

    const updated = await prisma.agentDecision.update({
      where: { id: decision.id },
      data: {
        status: result.ok ? "executed" : "failed",
        executedAt: new Date(),
        executionResult: JSON.parse(
          JSON.stringify(result.ok ? result.result ?? {} : { error: result.error })
        ),
      },
    });
    return NextResponse.json({
      ok: result.ok,
      decision: updated,
      error: result.error,
    });
  }

  return NextResponse.json(
    { ok: false, error: `action desconhecida: ${body.action}` },
    { status: 400 }
  );
}
