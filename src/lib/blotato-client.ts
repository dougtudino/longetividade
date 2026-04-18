// Cliente Blotato — publish/schedule + AI image/video via templates.
// Docs: https://help.blotato.com/api/start
//
// Auth: header `blotato-api-key: <KEY>`
// Base: https://backend.blotato.com/v2
// Rate: 30/min posts, 60/min polling, 120/min uploads
//
// Envs:
//   BLOTATO_API_KEY — a key do dashboard (obrigatoria)
//   META_PAGE_ID    — reaproveitado pra target.pageId no Facebook

import { getSetting } from "./settings";

const BASE = "https://backend.blotato.com/v2";

export class BlotatoError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
  }
}

async function getApiKey(): Promise<string> {
  const key = process.env.BLOTATO_API_KEY || (await getSetting("BLOTATO_API_KEY"));
  if (!key) throw new BlotatoError("BLOTATO_API_KEY nao configurada", 500);
  return key;
}

async function request<T>(
  path: string,
  init: Omit<RequestInit, "headers"> & { headers?: Record<string, string> } = {},
): Promise<T> {
  const key = await getApiKey();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "blotato-api-key": key,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    // mantem texto cru
  }
  if (!res.ok) {
    const msg = typeof body === "object" && body && "message" in body ? String((body as { message: unknown }).message) : text;
    throw new BlotatoError(`Blotato ${res.status}: ${msg}`, res.status, body);
  }
  return body as T;
}

// ─── Accounts ──────────────────────────────────────────

export interface BlotatoAccount {
  id: string;
  platform: "instagram" | "facebook" | "tiktok" | "youtube" | "threads" | "linkedin" | "twitter" | "pinterest" | "bluesky";
  fullname?: string;
  username?: string;
}

export async function listAccounts(): Promise<BlotatoAccount[]> {
  const res = await request<{ items?: BlotatoAccount[]; accounts?: BlotatoAccount[] } | BlotatoAccount[]>(
    "/users/me/accounts",
    { method: "GET" },
  );
  if (Array.isArray(res)) return res;
  return res.items ?? res.accounts ?? [];
}

// ─── Media upload (presigned) ──────────────────────────

export interface PresignedUpload {
  presignedUrl: string;
  publicUrl: string;
}

export async function createPresignedUpload(filename: string): Promise<PresignedUpload> {
  return request<PresignedUpload>("/media/uploads", {
    method: "POST",
    body: JSON.stringify({ filename }),
  });
}

export async function uploadToPresigned(
  presignedUrl: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: data as unknown as BodyInit,
  });
  if (!res.ok) {
    throw new BlotatoError(`upload PUT falhou: ${res.status}`, res.status);
  }
}

// ─── Templates + create visual (AI image/video) ────────

export interface BlotatoTemplate {
  id: string;
  name: string;
  type?: "image" | "video" | string;
  description?: string;
  inputs?: Record<string, unknown>;
  aspectRatio?: string;
  category?: string;
}

// Lista templates reais do plano. Aceita parametro fields pra filtrar payload.
export async function listTemplates(opts?: { fields?: string[] }): Promise<BlotatoTemplate[]> {
  const query = opts?.fields?.length ? `?fields=${opts.fields.join(",")}` : "";
  const res = await request<
    { items?: BlotatoTemplate[]; templates?: BlotatoTemplate[] } | BlotatoTemplate[]
  >(`/videos/templates${query}`, { method: "GET" });
  if (Array.isArray(res)) return res;
  return res.items ?? res.templates ?? [];
}

export interface CreateVisualInput {
  templateId: string;
  inputs?: Record<string, unknown>;
  prompt?: string;
  title?: string; // nome pro rastreio no dashboard Blotato
}

// Helper especifico pra carrossel multi-slide via inputs.quotes
// Descoberto via doc: template Quote Card Carousel aceita array `quotes`
// em inputs, gerando N slides reais de uma vez.
export interface CreateCarouselInput {
  templateId: string; // tipicamente Quote Card Carousel with Paper Background
  quotes: string[]; // 3-10 quotes curtas — 1 por slide
  title?: string;
  extraInputs?: Record<string, unknown>; // outros inputs especificos do template
}

// Talking head — AI Selfie Talking (consistent character).
// Aceita scenes[] (description visual + narration verbal) + characterDescription
// (texto OU URL de imagem referencia). Se passar so texto, Blotato gera
// avatar consistente pelas cenas baseado na descricao.
export interface TalkingHeadScene {
  description: string; // descricao visual da cena (em ingles, da pra Blotato)
  narration: string; // texto que a personagem fala (portugues OK)
}

export interface CreateTalkingHeadInput {
  templateId: string; // tipicamente AI Selfie Talking 57f5a565
  scenes: TalkingHeadScene[];
  characterDescription: string; // descricao textual da personagem OU URL imagem
  style?: "realistic" | "cartoon" | "anime" | "watercolor" | "oil-painting" | "sketch" | "cyberpunk" | "fantasy" | "minimalist";
  aspectRatio?: "9:16" | "1:1" | "4:5";
  title?: string;
}

export async function createTalkingHead(
  input: CreateTalkingHeadInput
): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(
    `[blotato] createTalkingHead raw="${input.templateId}" → "${templateId}" scenes=${input.scenes.length}`
  );
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: {
          scenes: input.scenes,
          characterDescription: input.characterDescription,
          style: input.style ?? "realistic",
          aspectRatio: input.aspectRatio ?? "9:16",
        },
        ...(input.title ? { title: input.title } : {}),
        isDraft: false,
        render: true,
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `TalkingHead 404: template "${templateId}" nao encontrado.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

// Slideshow de imagens com texto por slide — cada slide tem imagePrompt
// (Blotato gera via AI) + textOverlay. Template: Image Slideshow with Text.
// Output: mp4 animado com N cenas distintas, cada uma com imagem real.
export interface SlideshowSlide {
  imagePrompt: string; // prompt pra AI gerar a cena
  textOverlay: string; // texto sobreposto (< 40 chars ideal)
}

export interface CreateImageSlideshowInput {
  templateId: string;
  slides: SlideshowSlide[];
  title?: string;
  textPosition?: "top" | "center" | "bottom";
  textColor?: string;
}

export async function createImageSlideshow(
  input: CreateImageSlideshowInput
): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(
    `[blotato] createImageSlideshow raw="${input.templateId}" → normalized="${templateId}" slides=${input.slides.length}`
  );
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: {
          slides: input.slides.map((s) => ({
            imageSource: s.imagePrompt,
            imagePrompt: s.imagePrompt,
            textOverlay: s.textOverlay,
            text: s.textOverlay,
          })),
          ...(input.textPosition ? { textPosition: input.textPosition } : {}),
          ...(input.textColor ? { textColor: input.textColor } : {}),
        },
        isDraft: false,
        render: true,
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `Slideshow 404: template "${templateId}" nao encontrado.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

export async function createCarousel(
  input: CreateCarouselInput
): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(
    `[blotato] createCarousel raw="${input.templateId}" → normalized="${templateId}" slides=${input.quotes.length}`
  );
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: {
          quotes: input.quotes,
          ...(input.extraInputs ?? {}),
        },
        ...(input.title ? { title: input.title } : {}),
        isDraft: false,
        render: true,
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `Carrossel 404: template "${templateId}" nao encontrado.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

export interface BlotatoCreation {
  id: string;
  status: "queueing" | "generating-media" | "done" | "failed" | string;
  imageUrls?: string[] | null;
  mediaUrl?: string | null;
  error?: string;
  createdAt?: string;
}

// Blotato respostas de creations vem envelopadas: { item: { ... } }
async function unwrap<T>(res: { item?: T } | T): Promise<T> {
  return (res && typeof res === "object" && "item" in res ? (res as { item: T }).item : res) as T;
}

// Blotato EXIGE path completo "/base/v2/<category>/<uuid>/v1" pra templates
// da biblioteca base. UUID puro retorna 404 (testado empiricamente).
// Doc publica diz "use UUID" — esta errada pro plano base.
//
// Mapeamento UUID → path completo pros templates conhecidos. Se vier UUID
// e existir mapeamento, converte. Se vier path, deixa passar.
const UUID_TO_PATH: Record<string, string> = {
  "5903b592-1255-43b4-b9ac-f8ed7cbf6a5f":
    "/base/v2/image-slideshow/5903b592-1255-43b4-b9ac-f8ed7cbf6a5f/v1",
  "f941e306-76f7-45da-b3d9-7463af630e91":
    "/base/v2/quote-card/f941e306-76f7-45da-b3d9-7463af630e91/v1",
  "ba413be6-a840-4e60-8fd6-0066d3b427df":
    "/base/v2/tweet-card/ba413be6-a840-4e60-8fd6-0066d3b427df/v1",
  "5903fe43-514d-40ee-a060-0d6628c5f8fd":
    "/base/v2/ai-story-video/5903fe43-514d-40ee-a060-0d6628c5f8fd/v1",
  "57f5a565-fd17-458b-be43-4a2d8ccaca75":
    "/base/v2/ai-selfie-video/57f5a565-fd17-458b-be43-4a2d8ccaca75/v1",
  "7c26a1cd-d5b3-42da-9c73-2413333873b3":
    "/base/v2/ai-avatar-broll/7c26a1cd-d5b3-42da-9c73-2413333873b3/v1",
  "53cfec04-2500-41cf-8cc1-ba670d2c341a":
    "/base/v2/instagram-carousel/53cfec04-2500-41cf-8cc1-ba670d2c341a/v1",
  "2491f97b-1b47-4efa-8b96-8c651fa7b3d5":
    "/base/v2/tutorial-carousel/2491f97b-1b47-4efa-8b96-8c651fa7b3d5/v1",
  "e095104b-e6c5-4a81-a89d-b0df3d7c5baf":
    "/base/v2/tutorial-carousel/e095104b-e6c5-4a81-a89d-b0df3d7c5baf/v1",
  "77f65d2b-48cc-4adb-bfbb-5bc86f8c01bd":
    "/base/v2/quote-card/77f65d2b-48cc-4adb-bfbb-5bc86f8c01bd/v1",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function normalizeTemplateId(raw: string): string {
  const trimmed = raw.trim();
  // Se ja eh path, deixa passar
  if (trimmed.startsWith("/base/")) return trimmed;
  // Se eh UUID puro e tem path conhecido, converte
  if (UUID_REGEX.test(trimmed) && UUID_TO_PATH[trimmed]) {
    return UUID_TO_PATH[trimmed];
  }
  // Caso contrario, manda como veio (deixa Blotato decidir)
  return trimmed;
}

export async function createVisual(input: CreateVisualInput): Promise<BlotatoCreation> {
  const templateId = normalizeTemplateId(input.templateId);
  console.log(`[blotato] createVisual raw="${input.templateId}" → normalized="${templateId}"`);
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId,
        inputs: input.inputs ?? {},
        ...(input.prompt ? { prompt: input.prompt } : {}),
        ...(input.title ? { title: input.title } : {}),
        // CRITICO: sem isDraft=false + render=true, templates de video
        // complexos (talking head) ficam parados em script-ready aguardando
        // render manual no dashboard Blotato.
        isDraft: false,
        render: true,
      }),
    });
    return unwrap(res);
  } catch (err) {
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `Blotato 404: template "${templateId}" nao encontrado. ` +
          `Rode sync em /admin/configuracoes → Blotato.`,
        404,
        err.body
      );
    }
    throw err;
  }
}

export async function getCreation(id: string): Promise<BlotatoCreation> {
  const res = await request<{ item: BlotatoCreation }>(`/videos/creations/${id}`, { method: "GET" });
  return unwrap(res);
}

// Poll ate ficar `done` (ou falhar). Intervalo 5s, timeout 5min — imagens
// ficam prontas em ~10s, videos podem demorar 1-3min.
//
// Status Blotato (confirmados via doc):
//   queueing | generating-script | script-ready | generating-media |
//   media-ready | exporting | done | creation-from-template-failed
export async function waitForCreation(
  id: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<BlotatoCreation> {
  const interval = opts.intervalMs ?? 5000;
  const timeout = opts.timeoutMs ?? 5 * 60_000;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const c = await getCreation(id);
    if (c.status === "done") return c;
    const statusLower = (c.status ?? "").toLowerCase();
    // Aceita qualquer status que contenha "fail" ou "error" — pra cobrir
    // `failed`, `creation-from-template-failed`, `error`, etc.
    if (statusLower.includes("fail") || statusLower.includes("error")) {
      throw new BlotatoError(
        `creation ${id} falhou (status=${c.status}): ${c.error ?? "sem detalhes — veja no dashboard Blotato"}`,
        500,
        c
      );
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new BlotatoError(`creation ${id} timeout apos ${timeout}ms`, 504);
}

// Helper: URL final do output. Imagens em imageUrls[0], videos em mediaUrl.
export function getOutputUrl(c: BlotatoCreation): string | null {
  return c.imageUrls?.[0] ?? c.mediaUrl ?? null;
}

// ─── Publish / Schedule post ───────────────────────────

export type BlotatoPlatform = "instagram" | "facebook";

export interface PublishInput {
  accountId: string;
  platform: BlotatoPlatform;
  text: string;
  mediaUrls: string[];
  pageId?: string; // obrigatorio no Facebook
  scheduledTime?: string; // ISO 8601 UTC; se omitir, publica imediato
}

export interface PublishResponse {
  postSubmissionId: string;
}

export async function publishPost(input: PublishInput): Promise<PublishResponse> {
  const target: Record<string, unknown> = { targetType: input.platform };
  if (input.platform === "facebook") {
    if (!input.pageId) throw new BlotatoError("facebook requer pageId", 400);
    target.pageId = input.pageId;
  }
  const body: Record<string, unknown> = {
    post: {
      accountId: input.accountId,
      content: {
        text: input.text,
        mediaUrls: input.mediaUrls,
        platform: input.platform,
      },
      target,
    },
  };
  if (input.scheduledTime) body.scheduledTime = input.scheduledTime;
  return request<PublishResponse>("/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
