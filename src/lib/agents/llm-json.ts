// Extrator robusto de JSON de respostas Claude.
// Modelos as vezes retornam:
//   - ```json { ... } ``` (fence markdown)
//   - { ... } texto explicativo apos
//   - texto antes { ... }
// Esta funcao pega o PRIMEIRO objeto JSON valido no texto, balanceando
// chaves corretamente (respeita strings e escapes).

export function extractFirstJsonObject(raw: string): string {
  let s = raw.trim();
  // 1. remove fence markdown ```json ... ```
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");

  // 2. acha o primeiro { e corta tudo antes
  const start = s.indexOf("{");
  if (start === -1) throw new Error("Nao encontrei '{' na resposta");
  s = s.slice(start);

  // 3. balanceia chaves respeitando strings/escapes
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return s.slice(0, i + 1);
      }
    }
  }
  throw new Error(`JSON incompleto (depth=${depth} no fim)`);
}

export function parseLlmJson<T>(raw: string): T {
  const jsonStr = extractFirstJsonObject(raw);
  return JSON.parse(jsonStr) as T;
}

// ─── Claude tool-use helper ───────────────────────────────
// Claude as vezes retorna JSON mal-formado (aspas nao escapadas, virgulas extras).
// Tool-use forca o modelo a preencher um schema JSON definido, garantindo
// saida valida sem precisar de parse fragil. A resposta vem em
// content[].tool_use.input como objeto javascript ja estruturado.

interface JsonSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

interface CallClaudeWithToolOpts {
  apiKey: string;
  model: string;
  maxTokens: number;
  system: string;
  userPrompt: string;
  toolName: string;
  toolDescription: string;
  schema: JsonSchema;
}

export async function callClaudeWithTool<T>(opts: CallClaudeWithToolOpts): Promise<T> {
  const body = {
    model: opts.model,
    max_tokens: opts.maxTokens,
    system: opts.system,
    tools: [
      {
        name: opts.toolName,
        description: opts.toolDescription,
        input_schema: opts.schema,
      },
    ],
    tool_choice: { type: "tool", name: opts.toolName },
    messages: [{ role: "user", content: opts.userPrompt }],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": opts.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    const err = new Error(`Claude ${res.status}: ${t.slice(0, 300)}`);
    // deixa status acessivel pra caller tratar 429
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  const data = (await res.json()) as {
    content?: Array<{
      type: string;
      name?: string;
      input?: unknown;
    }>;
  };
  const toolBlock = data.content?.find(
    (c) => c.type === "tool_use" && c.name === opts.toolName
  );
  if (!toolBlock || !toolBlock.input) {
    throw new Error(
      `Claude nao retornou tool_use '${opts.toolName}': ${JSON.stringify(data).slice(0, 300)}`
    );
  }
  return toolBlock.input as T;
}
