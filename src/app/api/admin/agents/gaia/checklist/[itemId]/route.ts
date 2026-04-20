import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

// PATCH /api/admin/agents/gaia/checklist/[itemId]
// Body: { status: 'skipped' | 'done' }
// Transicao manual de items (pular, marcar como concluido). Approve usa
// rota dedicada /approve que gera doc placeholder.
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ itemId: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const target = body.status;
  if (target !== "skipped" && target !== "done") {
    return NextResponse.json(
      { ok: false, error: "status deve ser 'skipped' ou 'done'" },
      { status: 400 }
    );
  }

  const item = await prisma.decisionChecklistItem.findUnique({ where: { id: (await ctx.params).itemId } });
  if (!item) {
    return NextResponse.json({ ok: false, error: "Item nao encontrado" }, { status: 404 });
  }

  const updated = await prisma.decisionChecklistItem.update({
    where: { id: item.id },
    data: {
      status: target,
      completedAt: target === "done" ? new Date() : item.completedAt,
    },
  });

  // Auto-completa a decision se todos items terminaram
  const remaining = await prisma.decisionChecklistItem.count({
    where: {
      decisionId: item.decisionId,
      status: { in: ["pending", "approved", "in_progress"] },
    },
  });
  if (remaining === 0) {
    await prisma.agentDecision.update({
      where: { id: item.decisionId },
      data: { progressStatus: "completed" },
    });
  }

  return NextResponse.json({ ok: true, item: updated });
}
