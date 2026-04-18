// Quinn — variante pra Meta Ads Creative.
// Meta Ad Policy tem regras muito mais restritivas que post organico IG.
// Usa tool_use do Claude pra garantir JSON valido (evita aspas/commas mal escapados).

import { callClaudeWithTool } from "./llm-json";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;

export interface QuinnCreativeVerdict {
  ok: boolean;
  severity: "pass" | "warn" | "block";
  issues: string[];
  suggestedFix?: string;
  reasoning: string;
}

const SYSTEM_PROMPT = `Voce e Quinn — QA Agent do Longetividade em modo **Meta Ad Policy**.

Meta Ad Policy (BLOCK se qualquer um):
- "Antes e depois" de corpo / partes do corpo / circulo em barriga
- Promessa de resultado quantitativo ("perca 10kg em 30 dias", "7kg em 1 mes")
- Claim medico nao verificavel ("cura", "elimina", "derrete", "detox")
- "Dieta milagrosa", "segredo", "metodo secreto", "formula magica"
- "Garantido funciona" sem disclaimer
- Atributo pessoal implicito ("voce esta acima do peso?")
- CTA urgente predatorio ("ULTIMA CHANCE!!!", "HOJE ou NUNCA")
- Prescricao/diagnostico sem CRN/CRM

WARN se:
- Linguagem de culpa ("voce falhou")
- Comparacao com outras mulheres
- Meta-claim generico ("cientificamente comprovado") sem fonte
- Headline muito longa (>40 char) — Meta corta no feed
- CTA vago ("saiba mais")
- Texto provavelmente >20% da imagem (se headline tem >10 palavras)

PASS se nada acima.

Chame submit_verdict com:
- ok: true se severity != block
- severity: pass | warn | block
- issues: array de strings descrevendo problemas (vazio se pass)
- suggestedFix: sugestao de correcao (opcional)
- reasoning: 1-2 frases`;

interface CreativeComplianceInput {
  briefing: string;
  headline?: string;
  cta?: string;
  angle?: string;
  context?: "pre-render" | "post-render";
}

export async function reviewCreativeCompliance(
  input: CreativeComplianceInput
): Promise<QuinnCreativeVerdict> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      ok: true,
      severity: "warn",
      issues: ["ANTHROPIC_API_KEY nao configurada — Quinn skipped"],
      reasoning: "Quinn pulado por falta de API key.",
    };
  }

  const userPrompt = `Avalie este creative Meta Ad:

- Fase: ${input.context ?? "pre-render"}
- Angulo: ${input.angle ?? "(nao especificado)"}
- Headline: ${input.headline ?? "(vazio)"}
- CTA: ${input.cta ?? "(vazio)"}

Briefing / prompt visual:
${input.briefing}

Avalie segundo Meta Ad Policy + nicho saude.`;

  return await callClaudeWithTool<QuinnCreativeVerdict>({
    apiKey,
    model: MODEL,
    maxTokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    userPrompt,
    toolName: "submit_verdict",
    toolDescription:
      "Retorna o veredito de compliance Meta Ad Policy pro creative",
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
}
