export type AppTokenPayload = {
  userId: string;
  email: string;
  plan: string;
  exp: number;
};

export const APP_TOKEN_COOKIE = "app_token";
export const APP_TOKEN_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getSecret(): string {
  const secret =
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.ADMIN_PASSWORD;
  if (secret) return secret;
  // Em prod, nunca aceitar fallback — token forjavel eh risco critico.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET (ou NEXTAUTH_SECRET) ausente em producao — app token nao pode ser assinado/verificado com seguranca."
    );
  }
  return "longetividade-app-dev-fallback-secret";
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function hmacSha256(key: string, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data)
  );
  return new Uint8Array(sig);
}

export async function signAppToken(
  payload: Omit<AppTokenPayload, "exp">
): Promise<string> {
  const full: AppTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + APP_TOKEN_MAX_AGE,
  };
  const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify(full)));
  const sig = await hmacSha256(getSecret(), body);
  return `${body}.${base64UrlEncode(sig)}`;
}

export async function verifyAppToken(
  token: string | undefined | null
): Promise<AppTokenPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sigPart] = parts;

  try {
    const expected = await hmacSha256(getSecret(), body);
    const received = base64UrlDecode(sigPart);
    if (expected.length !== received.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ received[i];
    if (diff !== 0) return null;

    const json = new TextDecoder().decode(base64UrlDecode(body));
    const payload = JSON.parse(json) as AppTokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000))
      return null;
    return payload;
  } catch {
    return null;
  }
}
