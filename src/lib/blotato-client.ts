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

// Blotato recentemente mudou e exige UUID puro em vez de path longo.
// Exemplo de path antigo: "/base/v2/ai-story-video/5903fe43-.../v1"
// Formato aceito hoje: "5903fe43-514d-40ee-a060-0d6628c5f8fd"
// Extraimos o UUID de forma defensiva — aceita UUID puro OU path longo.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
export function normalizeTemplateId(raw: string): string {
  const trimmed = raw.trim();
  if (UUID_RE.test(trimmed) && trimmed.length === 36) return trimmed;
  const match = trimmed.match(UUID_RE);
  return match ? match[0] : trimmed;
}

export async function createVisual(input: CreateVisualInput): Promise<BlotatoCreation> {
  const normalizedId = normalizeTemplateId(input.templateId);
  console.log(
    `[blotato] createVisual: raw="${input.templateId}" → normalized="${normalizedId}"`
  );
  try {
    const res = await request<{ item: BlotatoCreation }>("/videos/from-templates", {
      method: "POST",
      body: JSON.stringify({
        templateId: normalizedId,
        inputs: input.inputs ?? {},
        ...(input.prompt ? { prompt: input.prompt } : {}),
        ...(input.title ? { title: input.title } : {}),
        render: true,
      }),
    });
    return unwrap(res);
  } catch (err) {
    // Enriquece erro pra ficar claro qual ID falhou — crucial pra debug
    if (err instanceof BlotatoError && err.status === 404) {
      throw new BlotatoError(
        `Blotato 404 Unknown template ID: "${normalizedId}" (raw input: "${input.templateId}"). ` +
          `Isso significa que esse UUID nao existe no seu plano. ` +
          `Solucao: /admin/configuracoes → Blotato → Sincronizar templates, e tente de novo.`,
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
    if (c.status === "failed") {
      throw new BlotatoError(`creation ${id} falhou: ${c.error ?? "unknown"}`, 500, c);
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
