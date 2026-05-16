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

// Comprime UTMs em uma string curta pra passar via Hotmart `sck` (Source Code).
// Formato: "src|med|cmp|cnt|trm" (vazios viram "-"). Hotmart aceita ate 50 chars
// no sck e mostra como "Origem" nos relatorios — resolve "Origem: Nao identificada".
function packSck(utms: UTMParams): string | null {
  const has = Object.values(utms).some((v) => !!v);
  if (!has) return null;
  const parts = [
    utms.utm_source ?? "-",
    utms.utm_medium ?? "-",
    utms.utm_campaign ?? "-",
    utms.utm_content ?? "-",
    utms.utm_term ?? "-",
  ].map((p) => p.replace(/[|&?#]/g, "_").slice(0, 16));
  return parts.join("|").slice(0, 50);
}

export function appendUTMs(url: string, utms?: UTMParams): string {
  const params = utms ?? getStoredUTMs();
  if (Object.keys(params).length === 0) return url;
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v) u.searchParams.set(k, v);
  }
  // sck = Hotmart Source Code, mostra como "Origem" no painel de vendas.
  // Sem isso, Hotmart marca todas as compras como "Origem: Nao identificada"
  // mesmo com UTM completo na URL — eles so leem o sck.
  const sck = packSck(params);
  if (sck && !u.searchParams.has("sck")) {
    u.searchParams.set("sck", sck);
  }
  return u.toString();
}
