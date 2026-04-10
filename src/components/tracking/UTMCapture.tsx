"use client";

import { useEffect } from "react";
import { captureUTMs } from "@/lib/utm";

/**
 * Componente cliente "fire-and-forget" para capturar UTMs da URL e
 * persistir em localStorage. Pode ser montado em qualquer layout/page
 * (incluindo Server Components) sem renderizar nada visivel.
 */
export default function UTMCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    captureUTMs(new URLSearchParams(window.location.search));
  }, []);
  return null;
}
