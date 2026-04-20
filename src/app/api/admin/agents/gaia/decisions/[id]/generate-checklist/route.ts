import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { callClaudeWithTool } from "@/lib/agents/llm-json";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

const ALLOWED_AGENTS = [
  "atlas",
  "morgan",
  "pax",
  "aria",
  "dara",
  "dex",
  "quinn",
  "gage",
  "river",
  "uma",
  "uma-creative",
  "quinn-creative",
] as const;

type ChecklistResponse = {
  items: Array<{
    title: string;
    description: string;
    assignedAgents: string[];
  }>;
};

// POST /api/admin/agents/gaia/decisions/[id]/generate-checklist
// Expande um diagnostico (DIAGNOSE_FUNNEL ou PROPOSE_ITERATION) em
// 3-5 items acionaveis com agentes AIOX atribuidos. Atualiza
// AgentDecision.progressStatus = 'in_progress'.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const decision = await prisma.agentDecision.findUnique({
    where: { id },
    include: { checklistItems: true },
  });
  if (!decision) {
    return NextResponse.json({ ok: false, error: "Decision nao encontrada" }, { status: 404 });
  }
  if (decision.action !== "DIAGNOSE_FUNNEL" && decision.action !== "PROPOSE_ITERATION") {
    return NextResponse.json(
      { ok: false, error: `Checklist disponivel apenas para DIAGNOSE_FUNNEL/PROPOSE_ITERATION (action=${decision.action})` },
      { status: 400 }
    );
  }
  if (decision.checklistItems.length > 0) {
    return NextResponse.json(
      { ok: false, error: "Checklist ja existe pra essa decision" },
      { status: 409 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY nao configurada" },
      { status: 500 }
    );
  }

  const params = (decision.params as Record<string, unknown>) ?? {};
  const funnelBreakdown = params.funnelBreakdown ?? null;
  const bottleneck = (params.bottleneck as string | undefined) ?? "indefinido";
  const recommendation =
    (params.recommendationText as string | undefined) ??
    (params.reason as string | undefined) ??
    decision.reasoning;

  const userPrompt = `Diagnostico Gaia (action=${decision.action}):

Target: ${decision.targetName}
Bottleneck identificado: ${bottleneck}
Recomendacao original: ${recommendation}
Reasoning: ${decision.reasoning}
Funnel breakdown: ${funnelBreakdown ? JSON.stringify(funnelBreakdown) : "n/a"}

Gere 3-5 itens de checklist acionavel pra resolver esse diagnostico.

Cada item deve:
- title: acao concreta em portugues, max 60 chars (ex: "Reescrever copy do hero pra falar de pos-parto")
- description: justificativa concisa, max 200 chars (por que esse item resolve o bottleneck)
- assignedAgents: array de IDs de agentes AIOX. IDs validos: ${ALLOWED_AGENTS.join(", ")}.
  - atlas: arquitetura/sistema
  - morgan: copywriting/posicionamento
  - pax: produto/UX strategy
  - aria: dados/analytics
  - dara: data engineering
  - dex: dev/implementacao
  - quinn: QA/compliance
  - gage: growth/aquisicao
  - river: research/insights
  - uma / uma-creative: design visual
  - quinn-creative: revisao Meta Ad Policy

Use 1-3 agentes por item. Priorize quem realmente faz a acao.`;

  let parsed: ChecklistResponse;
  try {
    parsed = await callClaudeWithTool<ChecklistResponse>({
      apiKey,
      model: MODEL,
      maxTokens: MAX_TOKENS,
      system:
        "Voce e a Gaia, growth operator do Longetividade. Expande diagnosticos em checklists acionaveis para a equipe AIOX executar.",
      userPrompt,
      toolName: "save_checklist",
      toolDescription: "Salva 3-5 itens de checklist acionavel pra resolver o diagnostico.",
      schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: {
              type: "object",
              properties: {
                title: { type: "string", maxLength: 60 },
                description: { type: "string", maxLength: 200 },
                assignedAgents: {
                  type: "array",
                  minItems: 1,
                  maxItems: 3,
                  items: { type: "string", enum: [...ALLOWED_AGENTS] },
                },
              },
              required: ["title", "description", "assignedAgents"],
            },
          },
        },
        required: ["items"],
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Falha ao chamar Claude: ${(e as Error).message}` },
      { status: 502 }
    );
  }

  const items = parsed.items ?? [];
  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Claude nao retornou items" },
      { status: 502 }
    );
  }

  // Salva tudo numa transaction: items + progressStatus
  const created = await prisma.$transaction(async (tx) => {
    await tx.decisionChecklistItem.createMany({
      data: items.map((it, i) => ({
        decisionId: decision.id,
        orderIndex: i,
        title: it.title,
        description: it.description,
        assignedAgents: it.assignedAgents.filter((a) =>
          (ALLOWED_AGENTS as readonly string[]).includes(a)
        ),
      })),
    });
    await tx.agentDecision.update({
      where: { id: decision.id },
      data: { progressStatus: "in_progress" },
    });
    return tx.decisionChecklistItem.findMany({
      where: { decisionId: decision.id },
      orderBy: { orderIndex: "asc" },
    });
  });

  return NextResponse.json({ ok: true, items: created, count: created.length });
}
