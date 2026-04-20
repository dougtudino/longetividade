import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import path from "path";
import fs from "fs/promises";

// POST /api/admin/agents/gaia/checklist/[itemId]/approve
// Sprint 1: marca item como in_progress + gera doc placeholder em
// docs/checklist-items/<itemId>.md (mock — Sprint 2 vai chamar agente real).
// Tambem auto-marca decision.progressStatus = 'completed' se todos os
// items chegaram em done/skipped.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ itemId: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await ctx.params;
  const item = await prisma.decisionChecklistItem.findUnique({
    where: { id: itemId },
    include: { decision: true },
  });
  if (!item) {
    return NextResponse.json({ ok: false, error: "Item nao encontrado" }, { status: 404 });
  }
  if (item.status !== "pending") {
    return NextResponse.json(
      { ok: false, error: `Item ja esta em status ${item.status}` },
      { status: 409 }
    );
  }

  const now = new Date();
  const docsDir = path.join(process.cwd(), "docs", "checklist-items");
  await fs.mkdir(docsDir, { recursive: true });
  const docPath = path.join(docsDir, `${item.id}.md`);
  const agentList = item.assignedAgents.length > 0 ? item.assignedAgents.join(", ") : "(nenhum)";
  const docContent = `# Task para ${agentList}: ${item.title}

Gerado em: ${now.toISOString()}
Aprovado por: ${payload.email}
Decision: ${item.decision.action} · ${item.decision.targetName} (id ${item.decision.id})

## Justificativa

${item.description}

## Status

aguardando execucao do agente

---

_Sprint 1: este arquivo eh placeholder. Em Sprint 2, o agente AIOX vai
ler este doc, executar a acao, e atualizar o status pra 'done' com link
do artefato (PR, doc, asset)._
`;
  await fs.writeFile(docPath, docContent, "utf8");
  const relPath = `docs/checklist-items/${item.id}.md`;

  await prisma.decisionChecklistItem.update({
    where: { id: item.id },
    data: {
      status: "in_progress",
      approvedAt: now,
      artifactPath: relPath,
    },
  });

  // Auto-completa a decision se todos items terminaram (done|skipped)
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

  return NextResponse.json({ ok: true, item: { ...item, status: "in_progress", artifactPath: relPath } });
}
