import { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { verifyAppToken, APP_TOKEN_COOKIE } from "./app-token";

// Autentica request do app VIP. SEMPRE valida via app_token (HMAC).
// O cookie `app_email` legacy NAO eh mais aceito sozinho — qualquer
// pessoa podia setar esse cookie via document.cookie e logar como
// qualquer email cadastrado. Vetor de auth bypass corrigido em 2026-05-17.
export async function getAppUser(req: NextRequest) {
  const token = req.cookies.get(APP_TOKEN_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyAppToken(token);
  if (!payload?.email) return null;

  const user = await prisma.appUser.findUnique({ where: { email: payload.email } });
  return user;
}
