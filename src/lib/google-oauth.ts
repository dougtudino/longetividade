// Google OAuth 2.0 manual flow — sem dependencia de NextAuth
// Usa Authorization Code flow com state CSRF protection.
//
// Configuracao (AppSetting ou env):
//   GOOGLE_CLIENT_ID       — client_id do OAuth app
//   GOOGLE_CLIENT_SECRET   — client_secret
//   GOOGLE_REDIRECT_URI    — (opcional) URL de callback.
//     Default: https://www.longetividade.com.br/api/auth/google/callback
//
// Para gerar:
//   1. console.cloud.google.com → Create Project
//   2. APIs & Services → Credentials → Create OAuth Client ID
//   3. Application type: Web application
//   4. Authorized redirect URIs:
//      https://www.longetividade.com.br/api/auth/google/callback
//      http://localhost:3000/api/auth/google/callback (dev)
//   5. Copia Client ID + Client Secret → /admin/configuracoes

import { getSetting } from "./settings";

const OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
const OAUTH_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export const GOOGLE_SCOPES = ["openid", "email", "profile"] as const;

export type GoogleCreds = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export async function getGoogleCreds(): Promise<GoogleCreds | null> {
  const clientId = await getSetting("GOOGLE_CLIENT_ID");
  const clientSecret = await getSetting("GOOGLE_CLIENT_SECRET");
  const customRedirect = await getSetting("GOOGLE_REDIRECT_URI");

  if (!clientId || !clientSecret) return null;

  const redirectUri =
    customRedirect ||
    process.env.GOOGLE_REDIRECT_URI ||
    "https://www.longetividade.com.br/api/auth/google/callback";

  return { clientId, clientSecret, redirectUri };
}

export type OAuthContext = "app" | "admin";

export function buildAuthUrl(
  creds: GoogleCreds,
  state: string,
  context: OAuthContext
): string {
  const params = new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: creds.redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "online",
    prompt: "select_account",
    state: `${state}:${context}`,
  });
  return `${OAUTH_AUTH_URL}?${params}`;
}

export type GoogleTokenResponse = {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

export async function exchangeCodeForToken(
  creds: GoogleCreds,
  code: string
): Promise<{ ok: true; token: GoogleTokenResponse } | { ok: false; error: string }> {
  try {
    const params = new URLSearchParams({
      code,
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      redirect_uri: creds.redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
      cache: "no-store",
    });

    const data = (await res.json()) as GoogleTokenResponse & {
      error?: string;
      error_description?: string;
    };

    if (!res.ok || !data.access_token) {
      return {
        ok: false,
        error: data.error_description ?? data.error ?? `HTTP ${res.status}`,
      };
    }

    return { ok: true, token: data };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export type GoogleUserInfo = {
  id: string; // sub
  email: string;
  verified_email: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export async function fetchUserInfo(
  accessToken: string
): Promise<{ ok: true; user: GoogleUserInfo } | { ok: false; error: string }> {
  try {
    const res = await fetch(OAUTH_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const data = (await res.json()) as GoogleUserInfo & { error?: { message: string } };

    if (!res.ok || !data.email) {
      return {
        ok: false,
        error: data.error?.message ?? `HTTP ${res.status}`,
      };
    }

    return { ok: true, user: data };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Gera state aleatorio para CSRF protection
export function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
