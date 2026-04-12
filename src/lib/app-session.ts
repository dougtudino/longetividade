// Helpers centralizados para setar/limpar sessao do App VIP.
// Todos os endpoints de auth (login, register, google callback) usam
// esses helpers pra garantir consistencia.
//
// IMPORTANTE: Path=/ para que cookies sejam enviadas em client-side
// fetches para /api/app/* (bug corrigido 2026-04-11).
// Token agora é assinado com HMAC-SHA256 (seguranca reforçada 2026-04-12).

import { NextResponse } from "next/server";
import { signAppToken, APP_TOKEN_COOKIE, APP_TOKEN_MAX_AGE } from "./app-token";

export async function setAppSessionCookies(
  response: NextResponse,
  email: string,
  userId: string,
  plan: string
): Promise<string> {
  const token = await signAppToken({ userId, email, plan });
  const isProduction = process.env.NODE_ENV === "production";
  const opts = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${APP_TOKEN_MAX_AGE}${isProduction ? "; Secure" : ""}`;

  response.headers.append("Set-Cookie", `${APP_TOKEN_COOKIE}=${token}; ${opts}`);
  // Keep app_email for backward compat with getAppUser()
  response.headers.append("Set-Cookie", `app_email=${email}; ${opts}`);

  return token;
}

export function clearAppSessionCookies(response: NextResponse): void {
  const expired = "Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
  response.headers.append("Set-Cookie", `${APP_TOKEN_COOKIE}=; ${expired}`);
  response.headers.append("Set-Cookie", `app_email=; ${expired}`);
  // Legacy /app path cleanup
  response.headers.append("Set-Cookie", `app_token=; Path=/app; HttpOnly; SameSite=Lax; Max-Age=0`);
  response.headers.append("Set-Cookie", `app_email=; Path=/app; HttpOnly; SameSite=Lax; Max-Age=0`);
}
