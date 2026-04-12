import { NextRequest, NextResponse } from "next/server";
import { getGoogleCreds, buildAuthUrl, generateState, type OAuthContext } from "@/lib/google-oauth";

// GET /api/auth/google/start?context=app|admin
// Redireciona o usuario pro Google OAuth consent screen.
// O context define se apos autenticar vamos criar AppUser ou AdminUser.
//
// State CSRF: gera token aleatorio, salva em cookie http-only, e anexa
// ao state param. No callback, compara pra prevenir CSRF.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const context = (url.searchParams.get("context") ?? "app") as OAuthContext;

  const creds = await getGoogleCreds();
  if (!creds) {
    // Redireciona de volta pro login com erro
    const errorUrl = context === "admin" ? "/admin/login?error=google_not_configured" : "/app/login?error=google_not_configured";
    return NextResponse.redirect(new URL(errorUrl, req.url));
  }

  const state = generateState();
  const authUrl = buildAuthUrl(creds, state, context);

  const response = NextResponse.redirect(authUrl);
  // Cookie CSRF — 10min ttl, http-only
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return response;
}
