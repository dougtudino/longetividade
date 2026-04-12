import { NextRequest, NextResponse } from "next/server";
import { getGoogleCreds, buildAuthUrl, generateState, type OAuthContext } from "@/lib/google-oauth";
import { getPublicBaseUrl } from "@/lib/server-url";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const context = (url.searchParams.get("context") ?? "app") as OAuthContext;
  const baseUrl = getPublicBaseUrl(req);

  const creds = await getGoogleCreds();
  if (!creds) {
    const errorPath = context === "admin"
      ? "/admin/login?error=google_not_configured"
      : "/app/login?error=google_not_configured";
    return NextResponse.redirect(new URL(errorPath, baseUrl));
  }

  const state = generateState();
  const authUrl = buildAuthUrl(creds, state, context);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return response;
}
