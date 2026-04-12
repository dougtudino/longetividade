"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Componente client-side que registra pageview no banco local via
// POST /api/track a cada navegacao. Coloca no layout raiz.
//
// Nao bloqueia renderizacao — fetch e fire-and-forget.
// Nao duplica: usa ref pra garantir 1x por pathname change.
// Le UTMs do URL params (se existirem) e envia junto.
export default function TrackPageView() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // Nao trackear rotas admin ou api
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    // Previne duplicacao na mesma navegacao
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    // Extrai UTMs do URL
    const params = new URLSearchParams(window.location.search);

    const payload = {
      page: pathname,
      referrer: document.referrer || null,
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      utm_campaign: params.get("utm_campaign") || null,
    };

    // Fire and forget — nao espera resposta
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently fail — never block user navigation
    });
  }, [pathname]);

  return null;
}
