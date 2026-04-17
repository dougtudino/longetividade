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

export async function analyzeVideo(
  fileUri: string,
  mimeType: string,
  retries = 3
): Promise<string> {
  const key = getKey();
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
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
        const text = await res.text().catch(() => "");
        throw new Error(`Gemini analise erro ${res.status}: ${text.slice(0, 200)}`);
      }
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const idx = text.indexOf("#");
      return idx >= 0 ? text.substring(idx) : text;
    } catch (err) {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Gemini: falhou apos retries");
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
