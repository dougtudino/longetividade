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
  const templateId = input.templateId.trim();
  console.log(
    `[blotato] createImageSlideshow templateId="${templateId}" slides=${input.slides.length}`
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
  const templateId = input.templateId.trim();
  console.log(
    `[blotato] createCarousel templateId="${templateId}" slides=${input.quotes.length}`
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

// Blotato usa 2 formatos de templateId:
// 1. Path completo "/base/v2/<category>/<uuid>/v1" — templates da BIBLIOTECA base
// 2. UUID puro "5903fe43-..." — templates clonados/customizados da conta
// A listagem GET /videos/templates retorna o formato 1 (path) e devemos
// enviar EXATAMENTE como veio no POST /videos/from-templates. A doc publica
// diz "use UUID" mas testamos e 404; path funciona pro plano base.
export function normalizeTemplateId(raw: string): string {
  return raw.trim();
}

export async function createVisual(input: CreateVisualInput): Promise<BlotatoCreation> {
  const templateId = input.templateId.trim();
  console.log(`[blotato] createVisual templateId="${templateId}"`);
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
