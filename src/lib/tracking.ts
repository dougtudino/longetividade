// src/lib/tracking.ts — Tracking event helpers (Meta Pixel + GA4)

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) {
  // Meta Pixel — se eventID fornecido, vai como 4o argumento pro fbq permitir
  // que o servidor (CAPI) dedup com mesmo eventID.
  if (typeof window !== "undefined" && window.fbq) {
    if (options?.eventID) {
      window.fbq("track", eventName, params, { eventID: options.eventID });
    } else {
      window.fbq("track", eventName, params);
    }
  }

  // GA4
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

export function trackViewContent(contentName: string, value?: number) {
  trackEvent("ViewContent", {
    content_name: contentName,
    content_type: "product",
    ...(value && { value, currency: "BRL" }),
  });
}

export function trackInitiateCheckout(contentName: string, value: number) {
  trackEvent("InitiateCheckout", {
    content_name: contentName,
    value,
    currency: "BRL",
    num_items: 1,
  });
}

export function trackPurchase(contentName: string, value: number, eventID?: string) {
  trackEvent(
    "Purchase",
    {
      content_name: contentName,
      value,
      currency: "BRL",
      num_items: 1,
    },
    eventID ? { eventID } : undefined
  );
}
