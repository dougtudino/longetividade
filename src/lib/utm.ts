// src/lib/utm.ts — UTM parameter handling

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const STORAGE_KEY = "longetividade_utms";

export type UTMParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export function captureUTMs(searchParams: URLSearchParams): UTMParams {
  const utms: UTMParams = {};
  for (const key of UTM_KEYS) {
    const val = searchParams.get(key);
    if (val) utms[key] = val;
  }
  if (Object.keys(utms).length > 0 && typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
  }
  return utms;
}

export function getStoredUTMs(): UTMParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function appendUTMs(url: string, utms?: UTMParams): string {
  const params = utms ?? getStoredUTMs();
  if (Object.keys(params).length === 0) return url;
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v) u.searchParams.set(k, v);
  }
  return u.toString();
}
