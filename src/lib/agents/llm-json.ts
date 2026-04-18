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
