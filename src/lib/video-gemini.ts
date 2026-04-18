// Google Gemini 2.0 Flash — upload de video + analise multimodal.
// Usado pelo Video Intelligence pra extrair Conceito/Hook/Retencao/Roteiro
// de cada Reel viral antes da Luna gerar conceitos adaptados.

const UPLOAD_URL = "https://generativelanguage.googleapis.com/upload/v1beta/files";
const GENERATE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

function getKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY nao configurado");
  return key;
}

export async function uploadVideo(
  buf: Buffer,
  mimeType: string
): Promise<{ uri: string; mimeType: string }> {
  const key = getKey();
  const res = await fetch(`${UPLOAD_URL}?key=${key}`, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Command": "start, upload, finalize",
      "X-Goog-Upload-Header-Content-Length": String(buf.length),
      "X-Goog-Upload-Header-Content-Type": mimeType,
      "Content-Type": mimeType,
    },
    body: new Uint8Array(buf),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini upload erro ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { file: { name: string; uri: string; mimeType: string } };
  await waitForActive(data.file.name);
  return { uri: data.file.uri, mimeType: data.file.mimeType };
}

async function waitForActive(fileName: string, maxMs = 120000): Promise<void> {
  const key = getKey();
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${key}`
    );
    if (r.ok) {
      const d = (await r.json()) as { state?: string };
      if (d.state === "ACTIVE") return;
      if (d.state === "FAILED") throw new Error("Gemini: falha no processamento do arquivo");
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Gemini: timeout aguardando ACTIVE");
}

const ANALYSIS_PROMPT = `Você é especialista em conteúdo viral para Instagram no nicho de saúde feminina e reeducação alimentar sem dieta (público: mulheres 30-55 anos brasileiras).

Analise este Reel viral e responda EXATAMENTE neste formato markdown (sem texto antes do primeiro #):

# Conceito
[O que esse vídeo ensina/comunica em 1-2 frases objetivas]

# Hook
[Os primeiros 3 segundos: o que aparece, o que é dito, por que prende]

# Retenção
[Como mantém atenção do início ao fim — técnicas específicas]

# Recompensa
[O que o espectador ganha ao assistir — transformação, info, emoção]

# Roteiro
[Estrutura em bullets: o que acontece em cada etapa]

# Por que viralizou
[2-3 razões concretas que explicam o alto engajamento]`;

export class GeminiQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiQuotaError";
  }
}

export async function analyzeVideo(
  fileUri: string,
  mimeType: string,
  retries = 3
): Promise<string> {
  const key = getKey();
  let lastStatus = 0;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${GENERATE_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { fileData: { fileUri, mimeType } },
                { text: ANALYSIS_PROMPT },
              ],
            },
          ],
        }),
      });
      if (!res.ok) {
        lastStatus = res.status;
        const text = await res.text().catch(() => "");
        // 429 = quota exceeded, 503 = service overloaded -> backoff exponencial
        const isQuota = res.status === 429;
        const isTransient = res.status === 503 || res.status === 500;
        if (i < retries - 1 && (isQuota || isTransient)) {
          const wait = isQuota ? 15000 * Math.pow(2, i) : 5000 * Math.pow(2, i);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        if (isQuota) {
          throw new GeminiQuotaError(
            `Gemini quota esgotada (429): ${text.slice(0, 200)}`
          );
        }
        throw new Error(`Gemini analise erro ${res.status}: ${text.slice(0, 200)}`);
      }
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const idx = text.indexOf("#");
      return idx >= 0 ? text.substring(idx) : text;
    } catch (err) {
      if (err instanceof GeminiQuotaError) throw err;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 5000 * Math.pow(2, i)));
        continue;
      }
      throw err;
    }
  }
  if (lastStatus === 429) {
    throw new GeminiQuotaError("Gemini: quota esgotada apos retries");
  }
  throw new Error("Gemini: falhou apos retries");
}

// Fallback quando Gemini não está disponível — analise "light" baseada apenas
// em caption + metadata do Reel (sem visao). Claude Haiku consegue inferir
// razoavelmente conceito/hook a partir do texto da caption + metricas.
export async function analyzeFromCaptionFallback(input: {
  caption: string;
  username: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  durationSec?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Sem Claude tampouco — retorna markdown minimo pra nao quebrar pipeline.
    return [
      "# Conceito",
      `(fallback sem visao — inferido da caption de @${input.username})`,
      input.caption.slice(0, 400),
      "",
      "# Hook",
      "(nao analisado — Gemini indisponivel)",
      "",
      "# Retenção",
      "(nao analisado)",
      "",
      "# Recompensa",
      "(nao analisado)",
      "",
      "# Roteiro",
      "(nao analisado)",
      "",
      "# Por que viralizou",
      `Metricas: ${input.viewCount.toLocaleString("pt-BR")} views, ${input.likeCount.toLocaleString("pt-BR")} likes`,
    ].join("\n");
  }

  const prompt = `Voce e especialista em conteudo viral de Instagram (nicho saude feminina BR).
Gemini nao esta disponivel pra analisar o video diretamente. Use APENAS a caption e metricas pra inferir o padrao viral.

Reel:
- Criador: @${input.username}
- Views: ${input.viewCount.toLocaleString("pt-BR")}
- Likes: ${input.likeCount.toLocaleString("pt-BR")}
- Comentarios: ${input.commentCount.toLocaleString("pt-BR")}
- Duracao: ${input.durationSec ? `${input.durationSec}s` : "desconhecida"}

Caption:
${input.caption.slice(0, 2000)}

Responda EXATAMENTE neste formato markdown (sem texto antes do primeiro #):

# Conceito
[infira o que o Reel ensina/comunica a partir da caption]

# Hook
[qual provavel abertura do video, baseado na caption]

# Retenção
[(inferido da caption) qual tecnica de retencao pode ter usado]

# Recompensa
[o que o espectador ganha]

# Roteiro
[estrutura provavel em bullets]

# Por que viralizou
[2-3 razoes concretas, use tambem as metricas]`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Claude fallback erro ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = (await r.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("\n") ?? "";
  const idx = text.indexOf("#");
  return idx >= 0 ? text.substring(idx) : text;
}

export function parseAnalysis(raw: string): {
  concept: string;
  hook: string;
  retention: string;
  reward: string;
  script: string;
} {
  const get = (section: string): string => {
    const m = raw.match(new RegExp(`# ${section}\\n([\\s\\S]*?)(?=\\n#|$)`, "i"));
    return m?.[1]?.trim() || "";
  };
  return {
    concept: get("Conceito"),
    hook: get("Hook"),
    retention: get("Retenção"),
    reward: get("Recompensa"),
    script: get("Roteiro"),
  };
}
