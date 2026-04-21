// src/lib/useLpAssets.ts — hook pra LPs client-side resolverem imagens editáveis.
// Retorna função resolver(key) que prefere DB, com fallback estático configurado.
"use client";

import { useEffect, useState } from "react";

type AssetMap = Record<string, { imageUrl: string; alt: string }>;

export function useLpAssets(lpSlug: string) {
  const [assets, setAssets] = useState<AssetMap | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/lp-assets?lpSlug=${encodeURIComponent(lpSlug)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { assets: AssetMap };
        if (alive) setAssets(data.assets ?? {});
      } catch {
        // ignora: sem rede → usa fallback
      }
    })();
    return () => {
      alive = false;
    };
  }, [lpSlug]);

  /**
   * Resolve URL de um slot. Se ainda não carregou OU não tem no DB, retorna fallback.
   * Sempre retorna string (nunca null), garantindo que <Image> nunca quebra.
   */
  function resolveAsset(key: string, fallback: string): string {
    return assets?.[key]?.imageUrl ?? fallback;
  }

  return { assets, resolveAsset };
}
