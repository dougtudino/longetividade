// Helpers centralizados para setar/limpar sessao do App VIP.
// Todos os endpoints de auth (login, register, google callback) usam
// esses helpers pra garantir consistencia.
//
// IMPORTANTE: Path=/ para que cookies sejam enviadas em client-side
// fetches para /api/app/* (bug corrigido 2026-04-11).
// Token agora é assinado com HMAC-SHA256 (seguranca reforçada 2026-04-12).

import { NextResponse } from "next/server";
import { signAppToken, APP_TOKEN_COOKIE, APP_TOKEN_MAX_AGE } from "./app-token";

// Cookie compartilhado entre apex (longetividade.com.br) e subdomínios (www.*) em prod.
// Resolve: usuário que entra em apex e termina em www (ou vice-versa) perderia o cookie.
function getCookieDomainAttr(): string {
  if (process.env.NODE_ENV !== "production") return "";
  const raw = process.env.NEXT_PUBLIC_DOMAIN || "longetividade.com.br";
  const bare = raw.replace(/^www\./, "");
  return `; Domain=.${bare}`;
}

export async function setAppSessionCookies(
  response: NextResponse,
  email: string,
  userId: string,
  plan: string
): Promise<string> {
  const token = await signAppToken({ userId, email, plan });
  const isProduction = process.env.NODE_ENV === "production";
  const domainAttr = getCookieDomainAttr();
  const opts = `Path=/; HttpOnly; SameSite=Lax; Max-Age=${APP_TOKEN_MAX_AGE}${isProduction ? "; Secure" : ""}${domainAttr}`;

  response.headers.append("Set-Cookie", `${APP_TOKEN_COOKIE}=${token}; ${opts}`);
  // Keep app_email for backward compat with getAppUser()
  response.headers.append("Set-Cookie", `app_email=${email}; ${opts}`);

  return token;
}

export function clearAppSessionCookies(response: NextResponse): void {
  const domainAttr = getCookieDomainAttr();
  const expired = `Path=/; HttpOnly; SameSite=Lax; Max-Age=0${domainAttr}`;
  response.headers.append("Set-Cookie", `${APP_TOKEN_COOKIE}=; ${expired}`);
  response.headers.append("Set-Cookie", `app_email=; ${expired}`);
  // Legacy /app path cleanup
  response.headers.append("Set-Cookie", `app_token=; Path=/app; HttpOnly; SameSite=Lax; Max-Age=0${domainAttr}`);
  response.headers.append("Set-Cookie", `app_email=; Path=/app; HttpOnly; SameSite=Lax; Max-Age=0${domainAttr}`);
}
