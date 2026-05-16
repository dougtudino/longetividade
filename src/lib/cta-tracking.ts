// src/lib/cta-tracking.ts — Tracking proprio de cliques no CTA
//
// Fonte da verdade INTERNA de cliques, independente do Hotmart (que mostra
// "Origem: Nao identificada") e do Pixel Meta (~30% bloqueado em mobile).
//
// Usa navigator.sendBeacon, que SOBREVIVE a fechamento de aba — sem isso,
// cliques que abrem nova aba (target=_blank) e fecham a original poderiam
// nunca chegar ao servidor. sendBeacon enfileira o request no user agent.

import { getStoredUTMs } from "./utm";

export type CtaClickPayload = {
  ctaId: string;
  planId?: string;
  destinationUrl: string;
};

export function trackCtaClick(payload: CtaClickPayload): void {
  if (typeof window === "undefined") return;

  const utms = getStoredUTMs();
  const body = JSON.stringify({
    ctaId: payload.ctaId,
    planId: payload.planId,
    destinationUrl: payload.destinationUrl,
    pathname: window.location.pathname,
    utm: {
      source: utms.utm_source,
      medium: utms.utm_medium,
      campaign: utms.utm_campaign,
      content: utms.utm_content,
      term: utms.utm_term,
    },
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([body], { type: "application/json" });
      const queued = navigator.sendBeacon("/api/track/cta-click", blob);
      if (queued) return;
    } catch {
      // fallback abaixo
    }
  }

  // Fallback pra browsers sem sendBeacon (~1% em 2026)
  fetch("/api/track/cta-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // silently ignore
  });
}
