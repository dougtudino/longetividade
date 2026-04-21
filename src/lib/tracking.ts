// src/lib/tracking.ts — Tracking event helpers (Meta Pixel + GA4)
// Camada de alto nível: delega o Pixel pro pixelTrack() em lib/pixel.ts
// e mantém GA4 mirroring + suporte a eventID (CAPI dedup).
//
// Assinaturas aceitam tanto (value) quanto (contentName, value) pra
// compatibilidade com callers legacy (/c/[slug], /obrigado).

import { pixelTrack } from "@/lib/pixel";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) {
  pixelTrack(eventName, params, options);

  // GA4 mirror
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
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
