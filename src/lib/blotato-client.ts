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
}

export async function listTemplates(): Promise<BlotatoTemplate[]> {
  const res = await request<{ templates?: BlotatoTemplate[] } | BlotatoTemplate[]>(
    "/videos/templates",
    { method: "GET" },
  );
  return Array.isArray(res) ? res : (res.templates ?? []);
}

export interface CreateVisualInput {
  templateId: string;
  inputs?: Record<string, unknown>;
  prompt?: string;
}

export interface BlotatoCreation {
  id: string;
  status: "queueing" | "generating-media" | "done" | "failed" | string;
  outputUrl?: string;
  error?: string;
}

export async function createVisual(input: CreateVisualInput): Promise<BlotatoCreation> {
  return request<BlotatoCreation>("/videos/from-templates", {
    method: "POST",
    body: JSON.stringify({
      templateId: input.templateId,
      inputs: input.inputs ?? {},
      ...(input.prompt ? { prompt: input.prompt } : {}),
      render: true,
    }),
  });
}

export async function getCreation(id: string): Promise<BlotatoCreation> {
  return request<BlotatoCreation>(`/videos/creations/${id}`, { method: "GET" });
}

// Poll ate ficar `done` (ou falhar). Intervalo 3s, timeout 5min.
export async function waitForCreation(
  id: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<BlotatoCreation> {
  const interval = opts.intervalMs ?? 3000;
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
