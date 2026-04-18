// Quinn — QA Agent (aiox-core-main/.aiox-core/development/agents/qa.md)
// Papel aqui: porteiro de compliance antes da publicacao. Usa Claude Haiku
// (rapido/barato) pra verificar se o post viola:
//   - Meta Ad Policy (antes/depois, claims medicos nao verificaveis)
//   - Nicho saude/emagrecimento (linguagem proibida: "dieta milagrosa",
//     "perca 10kg em 1 semana", prescricoes sem CRN)
//   - Marca Longetividade (tom acolhedor, sem culpa)
//
// Grava AgentDecision(agentId="quinn", action="COMPLIANCE_CHECK").

import { prisma } from "../prisma";
import { callClaudeWithTool } from "./llm-json";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;

export interface QuinnVerdict {
  ok: boolean;
  severity: "pass" | "warn" | "block";
  issues: string[];
  suggestedFix?: string;
  reasoning: string;
}

const SYSTEM_PROMPT = `Voce e Quinn — QA Agent do Longetividade. Seu papel e verificar se um post de social media pode ser publicado sem colocar a marca em risco (Meta Ad Policy, legislacao brasileira de saude/nutricao, politica da marca).

Bandeiras VERMELHAS (severity=block):
- "Antes e depois" de corpo / promessa de resultado fisico especifico
- Claims medicos nao verificaveis ("cura", "elimina celulite", "derrete gordura")
- Promessas quantitativas sem fundamento ("perca 10kg em 30 dias")
- Prescricao/diagnostico (so pode CRN/CRM)
- Usar "dieta milagrosa", "segredo que medicos escondem", "pilula magica"
- Imagem de corpo objetificado / parcial
- CTA urgente/predatorio ("ultima chance!!!")

Bandeiras AMARELAS (severity=warn):
- Linguagem de culpa ("voce falhou na dieta")
- Comparacao com outros corpos
- Meta-claims gerais sem citar fonte ("cientificamente comprovado")
- Hashtags excessivas (>15) ou off-brand

Se tudo ok, severity=pass.

Regras de retorno:
- severity=pass → ok=true
- severity=warn → ok=true (deixa passar mas sinaliza)
- severity=block → ok=false

Chame a ferramenta submit_verdict com o veredito.`;

export async function reviewPostCompliance(socialPostId: string): Promise<QuinnVerdict> {
  const post = await prisma.socialPost.findUnique({
    where: { id: socialPostId },
    select: {
      id: true,
      title: true,
      content: true,
      hashtags: true,
      pillar: true,
      slot: true,
    },
  });
  if (!post) throw new Error(`SocialPost ${socialPostId} nao encontrado`);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nao configurada");

  const userPrompt = `Post:
- Slot: ${post.slot}
- Pilar: ${post.pillar}
- Titulo: ${post.title}
- Copy:
${post.content}

- Hashtags: ${post.hashtags ?? "(sem)"}

Avalie.`;

  const verdict = await callClaudeWithTool<QuinnVerdict>({
    apiKey,
    model: MODEL,
    maxTokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    userPrompt,
    toolName: "submit_verdict",
    toolDescription:
      "Retorna o veredito de compliance Meta Ad Policy + politica da marca",
    schema: {
      type: "object",
      properties: {
        ok: { type: "boolean" },
        severity: { type: "string", enum: ["pass", "warn", "block"] },
        issues: {
          type: "array",
          items: { type: "string" },
          description: "Lista de problemas detectados. Array vazio se pass.",
        },
        suggestedFix: {
          type: "string",
          description: "Sugestao de correcao (opcional, so se warn/block).",
        },
        reasoning: {
          type: "string",
          description: "1-2 frases explicando o veredito.",
        },
      },
      required: ["ok", "severity", "issues", "reasoning"],
    },
  });

  await prisma.agentDecision.create({
    data: {
      agentId: "quinn",
      action: "COMPLIANCE_CHECK",
      targetType: "socialPost",
      targetId: post.id,
      targetName: post.title,
      params: { slot: post.slot, pillar: post.pillar, severity: verdict.severity },
      reasoning: verdict.reasoning,
      status: verdict.severity === "block" ? "rejected" : "executed",
      executedAt: new Date(),
      rejectedReason: verdict.severity === "block" ? verdict.issues.join(" · ") : null,
      executionResult: JSON.parse(JSON.stringify(verdict)),
    },
  });

  // Se block: marca o post pra review humana antes de continuar o pipeline.
  if (verdict.severity === "block") {
    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        status: "review",
        reviewNote: `[Quinn BLOCK] ${verdict.issues.join(" · ")}${verdict.suggestedFix ? ` | Fix: ${verdict.suggestedFix}` : ""}`,
      },
    });
  } else if (verdict.severity === "warn") {
    await prisma.socialPost.update({
      where: { id: post.id },
      data: {
        reviewNote: `[Quinn WARN] ${verdict.issues.join(" · ")}`,
      },
    });
  }

  return verdict;
}
