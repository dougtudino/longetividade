// Quinn — variante pra Meta Ads Creative.
// Meta Ad Policy tem regras muito mais restritivas que post organico IG:
// - Proibido antes/depois
// - Proibido promessa de resultado quantitativo
// - Proibido exibir partes do corpo objetificadas
// - Limite de 20% de texto na imagem (nao conseguimos medir aqui, mas avisa)
// - Claims de saude precisam de disclaimer

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
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

Retorne APENAS JSON:
{
  "ok": boolean (true se severity!=block),
  "severity": "pass" | "warn" | "block",
  "issues": string[],
  "suggestedFix": string (opcional),
  "reasoning": string (1-2 frases)
}`;

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
    // Sem API, assume pass pra nao travar (loga warn).
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

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Quinn (creative) Claude ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const raw =
    data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n").trim() ?? "";
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

  let verdict: QuinnCreativeVerdict;
  try {
    verdict = JSON.parse(jsonStr) as QuinnCreativeVerdict;
  } catch (err) {
    throw new Error(
      `Quinn retornou JSON invalido: ${jsonStr.slice(0, 300)} (${(err as Error).message})`
    );
  }
  return verdict;
}
