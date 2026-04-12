// Helpers centralizados para setar/limpar sessao do App VIP.
// Todos os endpoints de auth (login, register, google callback) usam
// esses helpers pra garantir consistencia.
//
// IMPORTANTE: Path=/ para que cookies sejam enviadas em client-side
// fetches para /api/app/* (bug corrigido 2026-04-11).

import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

export function setAppSessionCookies(response: NextResponse, email: string): string {
  const token = uuid();
  const isProduction = process.env.NODE_ENV === "production";
  const opts = `Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${isProduction ? "; Secure" : ""}`;

  response.headers.append("Set-Cookie", `app_token=${token}; ${opts}`);
  response.headers.append("Set-Cookie", `app_email=${email}; ${opts}`);

  return token;
}

export function clearAppSessionCookies(response: NextResponse): void {
  const expired = "Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
  response.headers.append("Set-Cookie", `app_token=; ${expired}`);
  response.headers.append("Set-Cookie", `app_email=; ${expired}`);
  // Legacy /app path cleanup
  response.headers.append("Set-Cookie", `app_token=; Path=/app; HttpOnly; SameSite=Lax; Max-Age=0`);
  response.headers.append("Set-Cookie", `app_email=; Path=/app; HttpOnly; SameSite=Lax; Max-Age=0`);
}
