// src/lib/meta-capi.ts — Meta Conversions API (server-side events)
//
// Envia eventos de conversao direto pro Meta via server, complementando
// o Pixel browser-side. Vantagens:
//   - Nao depende de ad blockers (30%+ dos browsers bloqueiam pixel)
//   - Dados mais confiaveis (server-to-server)
//   - Meta deduplica automaticamente via event_id
//
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
//
// Credenciais:
//   - META_ACCESS_TOKEN (env ou AppSetting)
//   - NEXT_PUBLIC_META_PIXEL_ID (pixel/dataset ID)

import { getSetting, getSettingWithFallback } from "./settings";
import { createHash } from "crypto";

const GRAPH_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Meta exige hash SHA-256 para dados de usuario (email, phone, etc.)
function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

type UserData = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // _fbc cookie
  fbp?: string; // _fbp cookie
};

type CustomData = {
  value?: number;
  currency?: string;
  contentName?: string;
  contentType?: string;
  orderId?: string;
};

type ServerEvent = {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  action_source: "website" | "email" | "app" | "system_generated";
  user_data: Record<string, string | undefined>;
  custom_data?: Record<string, unknown>;
};

async function getCreds(): Promise<{ token: string; pixelId: string } | null> {
  const token =
    process.env.META_ACCESS_TOKEN ||
    (await getSettingWithFallback("META_ACCESS_TOKEN", "META_ADS_ACCESS_TOKEN"));
  const pixelId = await getSetting("NEXT_PUBLIC_META_PIXEL_ID");
  if (!token || !pixelId) return null;
  return { token, pixelId };
}

function buildUserData(data: UserData): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  if (data.email) result.em = sha256(data.email);
  if (data.phone) result.ph = sha256(data.phone.replace(/\D/g, ""));
  if (data.firstName) result.fn = sha256(data.firstName);
  if (data.lastName) result.ln = sha256(data.lastName);
  if (data.clientIpAddress) result.client_ip_address = data.clientIpAddress;
  if (data.clientUserAgent) result.client_user_agent = data.clientUserAgent;
  if (data.fbc) result.fbc = data.fbc;
  if (data.fbp) result.fbp = data.fbp;

  return result;
}

function buildCustomData(data: CustomData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (data.value !== undefined) result.value = data.value;
  if (data.currency) result.currency = data.currency;
  if (data.contentName) result.content_name = data.contentName;
  if (data.contentType) result.content_type = data.contentType;
  if (data.orderId) result.order_id = data.orderId;
  return result;
}

export type CAPIResult =
  | { ok: true; eventsReceived: number }
  | { ok: false; error: string };

async function sendEvents(events: ServerEvent[]): Promise<CAPIResult> {
  const creds = await getCreds();
  if (!creds) {
    return { ok: false, error: "META_ACCESS_TOKEN ou NEXT_PUBLIC_META_PIXEL_ID nao configurados" };
  }

  try {
    const res = await fetch(`${BASE}/${creds.pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: events,
        access_token: creds.token,
      }),
      cache: "no-store",
    });

    const json = (await res.json()) as {
      events_received?: number;
      error?: { message: string };
    };

    if (!res.ok || json.error) {
      return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
    }

    return { ok: true, eventsReceived: json.events_received ?? 0 };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─────────────────────────────────────────────────────────────────────
// Public API — eventos prontos pra usar
// ─────────────────────────────────────────────────────────────────────

// Campos de identificacao do visitante — Meta usa pra match quality.
// fbp/fbc vem de cookies do pixel, IP/UA do request headers.
// Quanto mais campos, maior qualidade do match (meta 8+/10).
export type VisitorContext = {
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
};

export async function sendPurchaseEvent(opts: {
  email: string;
  phone?: string | null;
  name?: string;
  value: number; // em reais (ex: 37.00)
  currency?: string;
  orderId: string;
  contentName?: string;
  eventId?: string;
  sourceUrl?: string;
  visitor?: VisitorContext;
}): Promise<CAPIResult> {
  const nameParts = (opts.name ?? "").split(" ");
  const firstName = nameParts[0] || undefined;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined;

  const event: ServerEvent = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId ?? `purchase_${opts.orderId}`,
    event_source_url: opts.sourceUrl ?? "https://www.longetividade.com.br/emagreca-sem-dieta",
    action_source: "website",
    user_data: buildUserData({
      email: opts.email,
      phone: opts.phone ?? undefined,
      firstName,
      lastName,
      ...opts.visitor,
    }),
    custom_data: buildCustomData({
      value: opts.value,
      currency: opts.currency ?? "BRL",
      contentName: opts.contentName ?? "Metodo S.E.M",
      contentType: "product",
      orderId: opts.orderId,
    }),
  };

  return sendEvents([event]);
}

export async function sendLeadEvent(opts: {
  email: string;
  name?: string;
  source?: string;
  eventId?: string;
  sourceUrl?: string;
  visitor?: VisitorContext;
}): Promise<CAPIResult> {
  const event: ServerEvent = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId ?? `lead_${Date.now()}`,
    event_source_url: opts.sourceUrl ?? "https://www.longetividade.com.br",
    action_source: "website",
    user_data: buildUserData({
      email: opts.email,
      firstName: opts.name?.split(" ")[0],
      ...opts.visitor,
    }),
    custom_data: opts.source ? { content_name: opts.source } : undefined,
  };

  return sendEvents([event]);
}

export async function sendInitiateCheckoutEvent(opts: {
  email: string;
  value: number;
  contentName?: string;
  eventId?: string;
  sourceUrl?: string;
  visitor?: VisitorContext;
}): Promise<CAPIResult> {
  const event: ServerEvent = {
    event_name: "InitiateCheckout",
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.eventId ?? `checkout_${Date.now()}`,
    event_source_url: opts.sourceUrl ?? "https://www.longetividade.com.br/emagreca-sem-dieta",
    action_source: "website",
    user_data: buildUserData({ email: opts.email, ...opts.visitor }),
    custom_data: buildCustomData({
      value: opts.value,
      currency: "BRL",
      contentName: opts.contentName ?? "Metodo S.E.M",
      contentType: "product",
    }),
  };

  return sendEvents([event]);
}

// Helper: extrai fbp/fbc/IP/UA de um NextRequest. fbp/fbc vem dos cookies
// que o pixel client-side grava (_fbp, _fbc). fbclid cai nos cookies tambem
// apos o primeiro click, ou pode ser capturado da URL e convertido em fbc.
export function extractVisitorContext(req: {
  headers: Headers;
  cookies?: { get: (name: string) => { value: string } | undefined };
}): VisitorContext {
  const h = req.headers;
  const xff = h.get("x-forwarded-for") ?? "";
  const clientIpAddress = xff.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
  const clientUserAgent = h.get("user-agent") ?? undefined;
  const fbp = req.cookies?.get("_fbp")?.value;
  const fbc = req.cookies?.get("_fbc")?.value;
  return { fbp, fbc, clientIpAddress, clientUserAgent };
}
