import { prisma } from "./prisma";
import { scrapeReels } from "./video-apify";
import { uploadVideo, analyzeVideo, parseAnalysis } from "./video-gemini";

// Video Intelligence pipeline: scrapeia N concorrentes → filtra top K por views →
// baixa video → upload Gemini → analisa → Luna gera 3 conceitos → salva em
// VideoAnalysis + espelha em AgentKnowledge pra Luna consultar nos proximos Reels.

// Gemini free tier: 10 req/min no 2.5 Flash + Files API limita upload.
// CONCURRENCY=1 evita disparar 429. Se voce habilitar billing no Gemini,
// pode subir pra 2-3.
const CONCURRENCY = 1;
const RETRY_DELAYS_MS = [5_000, 15_000, 45_000];
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// Guardrails de memoria — evitam travar o dev server com Reels grandes.
// 80MB cobre ~95% dos Reels IG (a maioria fica 10-40MB).
const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 60_000;
const MAX_LOG_LINES = 200;

export interface VideoPipelineProgress {
  status: "running" | "completed" | "error";
  phase: "scraping" | "analyzing" | "done";
  log: string[];
  errors: string[];
  videosTotal: number;
  videosAnalyzed: number;
}

// Retry com backoff pra erros transitorios do Gemini:
// - 429 (rate limit / quota excedida)
// - 503 UNAVAILABLE (model overloaded, alta demanda global)
// Damos 3 tentativas com 5s/15s/45s.
async function withRetry429<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const transient = msg.includes("429") || msg.includes("503") || msg.includes("UNAVAILABLE");
      if (!transient || attempt === RETRY_DELAYS_MS.length) throw err;
      const delay = RETRY_DELAYS_MS[attempt];
      const kind = msg.includes("429") ? "429 quota" : "503 overload";
      console.log(`[${label}] ${kind}, aguardando ${delay}ms (tentativa ${attempt + 2})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

function memSnapshot(): string {
  const m = process.memoryUsage();
  const mb = (n: number) => Math.round(n / 1024 / 1024);
  return `heap=${mb(m.heapUsed)}MB rss=${mb(m.rss)}MB`;
}

async function downloadVideoWithLimits(
  url: string
): Promise<{ buf: Buffer; mime: string; sizeMB: number }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), DOWNLOAD_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
    const lenHdr = res.headers.get("content-length");
    if (lenHdr && Number(lenHdr) > MAX_VIDEO_BYTES) {
      throw new Error(
        `Video grande demais: ${Math.round(Number(lenHdr) / 1024 / 1024)}MB (limite 80MB)`
      );
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_VIDEO_BYTES) {
      throw new Error(
        `Video grande demais apos download: ${Math.round(buf.length / 1024 / 1024)}MB`
      );
    }
    const mime = res.headers.get("content-type") || "video/mp4";
    return { buf, mime, sizeMB: Math.round((buf.length / 1024 / 1024) * 10) / 10 };
  } finally {
    clearTimeout(timer);
  }
}

async function generateLunaConcepts(rawAnalysis: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nao configurada");

  const prompt = `Você é a Luna, agente editorial do Longetividade. A marca ensina reeducação alimentar sem dieta para mulheres 30-55 anos pelo Método S.E.M (Simplicidade, Equilíbrio, Movimento).

Baseado na análise deste Reel viral de concorrente, gere 3 conceitos de Reel adaptados para o Longetividade.

ANÁLISE DO CONCORRENTE:
${rawAnalysis}

Para cada conceito:
- **Título** (máx 8 palavras)
- **Hook** (frase exata para falar nos primeiros 3s)
- **Estrutura** (3-5 bullets do roteiro)
- **CTA** (chamada para ação alinhada ao S.E.M)

Voz: acolhedora, prática, sem culpa, baseada em evidências. Nunca use: "dieta", "proibido", "emagrecer rápido", "perder peso rápido".

Retorne apenas os 3 conceitos numerados, sem introdução.`;

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  return (
    data.content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("\n")
      .trim() ?? ""
  );
}

export async function runVideoPipeline(
  usernames: string[],
  maxVideos: number,
  topK: number,
  nDays: number,
  onProgress: (p: VideoPipelineProgress) => void
): Promise<void> {
  const progress: VideoPipelineProgress = {
    status: "running",
    phase: "scraping",
    log: [],
    errors: [],
    videosTotal: 0,
    videosAnalyzed: 0,
  };
  const emit = () =>
    onProgress({
      ...progress,
      log: [...progress.log],
      errors: [...progress.errors],
    });
  const log = (msg: string) => {
    progress.log.push(`[${new Date().toLocaleTimeString("pt-BR")}] ${msg}`);
    if (progress.log.length > MAX_LOG_LINES) {
      progress.log.splice(0, progress.log.length - MAX_LOG_LINES);
    }
    emit();
  };

  try {
    log(`Iniciando: ${usernames.length} concorrentes, ${nDays} dias, top ${topK}/perfil`);
    const cutoff = new Date(Date.now() - nDays * 24 * 60 * 60 * 1000);

    type VideoItem = {
      competitorId: string;
      username: string;
      videoUrl: string;
      postUrl: string;
      views: number;
      likes: number;
      comments: number;
      thumbnail: string;
      datePosted: string;
    };
    const allTopVideos: VideoItem[] = [];

    // Scraping sequencial — o plano Apify tem limite de memoria total (8GB)
    // e cada actor pede ~4GB. Rodar em paralelo estoura `actor-memory-limit-exceeded`.
    for (const username of usernames) {
      try {
        log(`@${username}: raspando...`);
        const competitor = await prisma.videoCompetitor.findUnique({ where: { username } });
        if (!competitor) {
          log(`@${username}: nao cadastrado, pulando`);
          continue;
        }

        const reels = await scrapeReels(username, maxVideos, nDays);
        const videos = reels
          .filter((r) => r.videoUrl && r.timestamp && new Date(r.timestamp) >= cutoff)
          .map((r) => ({
            competitorId: competitor.id,
            username,
            videoUrl: r.videoUrl,
            postUrl: r.url,
            views: r.videoPlayCount || 0,
            likes: r.likesCount || 0,
            comments: r.commentsCount || 0,
            thumbnail: r.images?.[0] || "",
            datePosted: r.timestamp?.slice(0, 10) || "",
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, topK);

        allTopVideos.push(...videos);
        log(`@${username}: ${reels.length} reels → ${videos.length} selecionados`);
      } catch (err) {
        const msg = `@${username}: erro — ${err instanceof Error ? err.message : String(err)}`;
        progress.errors.push(msg);
        log(msg);
      }
    }

    progress.videosTotal = allTopVideos.length;
    progress.phase = "analyzing";
    log(`Scraping OK. ${allTopVideos.length} videos para analisar`);
    emit();

    let idx = 0;
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, Math.max(allTopVideos.length, 1)) }, async () => {
        while (idx < allTopVideos.length) {
          const video = allTopVideos[idx++];
          const label = `${video.views.toLocaleString("pt-BR")} views`;
          try {
            log(`@${video.username} (${label}): baixando... [${memSnapshot()}]`);
            const { buf, mime, sizeMB } = await downloadVideoWithLimits(video.videoUrl);

            log(`@${video.username} (${label}): Gemini upload (${sizeMB}MB) [${memSnapshot()}]`);
            const fileData = await withRetry429("upload", () => uploadVideo(buf, mime));

            log(`@${video.username} (${label}): Gemini analisando...`);
            const rawAnalysis = await withRetry429("analyze", () =>
              analyzeVideo(fileData.uri, fileData.mimeType)
            );
            const parsed = parseAnalysis(rawAnalysis);

            log(`@${video.username} (${label}): Luna gerando conceitos...`);
            const lunaConcepts = await generateLunaConcepts(rawAnalysis);

            const record = await prisma.videoAnalysis.create({
              data: {
                competitorId: video.competitorId,
                instagramUrl: video.postUrl,
                thumbnail: video.thumbnail,
                views: video.views,
                likes: video.likes,
                comments: video.comments,
                datePosted: video.datePosted,
                concept: parsed.concept,
                hook: parsed.hook,
                retention: parsed.retention,
                reward: parsed.reward,
                script: parsed.script,
                rawAnalysis,
                lunaConcepts,
              },
            });

            const knowledge = await prisma.agentKnowledge.create({
              data: {
                agentId: "luna",
                kind: "reference",
                title: `Reel viral @${video.username} — ${video.views.toLocaleString("pt-BR")} views`,
                body: `## Reel viral @${video.username} — ${video.views.toLocaleString("pt-BR")} views

**Conceito:** ${parsed.concept}

**Hook:** ${parsed.hook}

**Retenção:** ${parsed.retention}

**Recompensa:** ${parsed.reward}

**Roteiro:** ${parsed.script}

---

### Conceitos Luna:
${lunaConcepts}`,
                source: `video-intelligence:${record.id}`,
                metadata: {
                  videoAnalysisId: record.id,
                  username: video.username,
                  views: video.views,
                  hook: parsed.hook,
                  concept: parsed.concept,
                },
              },
            });

            await prisma.videoAnalysis.update({
              where: { id: record.id },
              data: { savedToKnowledge: true, knowledgeId: knowledge.id },
            });

            progress.videosAnalyzed++;
            log(`@${video.username} (${label}): ✓ salvo no knowledge da Luna`);
            emit();
          } catch (err) {
            const msg = `@${video.username} (${label}): ${err instanceof Error ? err.message : String(err)}`;
            progress.errors.push(msg);
            log(`Erro — ${msg}`);
            emit();
          }
        }
      })
    );

    progress.phase = "done";
    progress.status = "completed";
    log(`Concluido! ${progress.videosAnalyzed}/${progress.videosTotal} analisados, ${progress.errors.length} erros.`);
    emit();
  } catch (err) {
    progress.status = "error";
    const msg = `Erro fatal: ${err instanceof Error ? err.message : String(err)}`;
    progress.errors.push(msg);
    log(msg);
    emit();
  }
}
