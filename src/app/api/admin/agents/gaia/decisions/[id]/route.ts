import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

// PATCH /api/admin/agents/gaia/decisions/[id]
// Body: { progressStatus: 'proposed' | 'in_progress' | 'completed' | 'archived' }
// Controla a tab onde o card aparece no painel Gaia. Independente do
// status (approve/execute) que controla o ciclo de execucao Meta.
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { progressStatus?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const allowed = new Set(["proposed", "in_progress", "completed", "archived"]);
  if (!body.progressStatus || !allowed.has(body.progressStatus)) {
    return NextResponse.json(
      { ok: false, error: "progressStatus invalido" },
      { status: 400 }
    );
  }

  const { id } = await ctx.params;
  try {
    const updated = await prisma.agentDecision.update({
      where: { id },
      data: { progressStatus: body.progressStatus },
    });
    return NextResponse.json({ ok: true, decision: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
