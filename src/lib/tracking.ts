// src/lib/tracking.ts — Tracking event helpers (Meta Pixel + GA4 + CAPI)
// Camada de alto nível: delega o Pixel pro pixelTrack() em lib/pixel.ts
// e mantém GA4 mirroring + suporte a eventID (CAPI dedup).
//
// Todo evento client-side gera um eventID único e é espelhado pro CAPI
// via POST /api/meta-capi — Meta deduplica via eventID, entao se o Pixel
// browser foi bloqueado (adblock/ATT/in-app), o server-side garante entrega.
//
// Assinaturas aceitam tanto (value) quanto (contentName, value) pra
// compatibilidade com callers legacy (/c/[slug], /obrigado).

import { pixelTrack } from "@/lib/pixel";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

// Gera um eventID unico. Usa crypto.randomUUID quando disponivel (browsers
// modernos + HTTPS/localhost), fallback pra timestamp+random.
function newEventId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Fire-and-forget POST pro endpoint CAPI. Nao espera resposta, nao bloqueia.
// Falhas sao silenciosas (o Pixel browser-side ainda pode ter funcionado).
function mirrorToCAPI(
  eventName: string,
  eventId: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  const payload: Record<string, unknown> = {
    eventName,
    eventId,
    sourceUrl: window.location.href,
  };

  // Mapeia params do Pixel (snake_case do fbq) pro formato do endpoint
  if (params) {
    if (typeof params.value === "number") payload.value = params.value;
    if (typeof params.currency === "string") payload.currency = params.currency;
    if (typeof params.content_name === "string") payload.contentName = params.content_name;
    if (typeof params.content_category === "string") payload.contentCategory = params.content_category;
    if (Array.isArray(params.content_ids)) payload.contentIds = params.content_ids;
    if (typeof params.content_type === "string") payload.contentType = params.content_type;
    if (typeof params.num_items === "number") payload.numItems = params.num_items;
  }

  fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true, // garante que o POST sobrevive a navegacoes/fecham de aba
  }).catch(() => {
    // silently ignore
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) {
  // Se o caller ja passou eventID (ex: Purchase com orderId), respeita.
  // Senao gera um novo — sempre eventID pra permitir dedup no Meta.
  const eventId = options?.eventID ?? newEventId(eventName.toLowerCase());

  pixelTrack(eventName, params, { eventID: eventId });

  // GA4 mirror
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }

  // CAPI mirror (dedup via eventID)
  mirrorToCAPI(eventName, eventId, params);
}

// ─── Defaults do produto (LP Método S.E.M) ───────────────
const DEFAULT_CONTENT_NAME = "Método S.E.M";
const DEFAULT_CONTENT_CATEGORY = "ebook";
const DEFAULT_CONTENT_IDS = ["sem-ebook"];
const DEFAULT_CONTENT_TYPE = "product";

function resolveArgs(
  nameOrValue?: string | number,
  maybeValue?: number
): { contentName: string; value: number } {
  if (typeof nameOrValue === "number") {
    return { contentName: DEFAULT_CONTENT_NAME, value: nameOrValue };
  }
  if (typeof nameOrValue === "string") {
    return { contentName: nameOrValue, value: maybeValue ?? 37 };
  }
  return { contentName: DEFAULT_CONTENT_NAME, value: 37 };
}

export function trackViewContent(nameOrValue?: string | number, value?: number) {
  const { contentName, value: v } = resolveArgs(nameOrValue, value);
  trackEvent("ViewContent", {
    content_name: contentName,
    content_category: DEFAULT_CONTENT_CATEGORY,
    content_ids: DEFAULT_CONTENT_IDS,
    content_type: DEFAULT_CONTENT_TYPE,
    value: v,
    currency: "BRL",
  });
}

export function trackInitiateCheckout(nameOrValue?: string | number, value?: number) {
  const { contentName, value: v } = resolveArgs(nameOrValue, value);
  trackEvent("InitiateCheckout", {
    content_name: contentName,
    content_category: DEFAULT_CONTENT_CATEGORY,
    content_ids: DEFAULT_CONTENT_IDS,
    content_type: DEFAULT_CONTENT_TYPE,
    value: v,
    currency: "BRL",
    num_items: 1,
  });
}

export function trackAddToCart(nameOrValue?: string | number, value?: number) {
  const { contentName, value: v } = resolveArgs(nameOrValue, value);
  trackEvent("AddToCart", {
    content_name: contentName,
    content_category: DEFAULT_CONTENT_CATEGORY,
    content_ids: DEFAULT_CONTENT_IDS,
    content_type: DEFAULT_CONTENT_TYPE,
    value: v,
    currency: "BRL",
  });
}

// trackPurchase mantém assinatura legada (name, value, eventID) pra não
// quebrar /obrigado/page.tsx.
export function trackPurchase(contentName: string, value: number, eventID?: string) {
  trackEvent(
    "Purchase",
    {
      content_name: contentName,
      content_category: DEFAULT_CONTENT_CATEGORY,
      content_ids: DEFAULT_CONTENT_IDS,
      content_type: DEFAULT_CONTENT_TYPE,
      value,
      currency: "BRL",
      num_items: 1,
    },
    eventID ? { eventID } : undefined
  );
}

// ─── Handler unificado de CTA ───────────────────────────
// Dispara InitiateCheckout + AddToCart e então redireciona após
// 150ms (pro fbq terminar o send antes de mudar de página).
export function fireCheckoutAndGo(
  url: string,
  opts: { targetBlank?: boolean; value?: number; contentName?: string } = {}
) {
  const value = opts.value ?? 37;
  const name = opts.contentName ?? DEFAULT_CONTENT_NAME;
  trackInitiateCheckout(name, value);
  trackAddToCart(name, value);
  const go = () => {
    if (opts.targetBlank) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
  };
  setTimeout(go, 150);
}
