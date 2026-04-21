// src/lib/pixel.ts — Thin wrapper do Meta Pixel (fbq).
// Centraliza a chamada crua pro fbq. As funções de alto nível
// (trackViewContent, trackInitiateCheckout, trackPurchase) ficam
// em src/lib/tracking.ts e delegam pra cá — zero duplicação.

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

export const pixelTrack = (
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
) => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (options?.eventID) {
    window.fbq("track", event, params, { eventID: options.eventID });
  } else {
    window.fbq("track", event, params);
  }
};
