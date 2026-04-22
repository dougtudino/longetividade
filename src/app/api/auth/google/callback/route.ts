import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGoogleCreds, exchangeCodeForToken, fetchUserInfo } from "@/lib/google-oauth";
import { setAppSessionCookies } from "@/lib/app-session";
import { signAdminToken, ADMIN_TOKEN_COOKIE, ADMIN_TOKEN_MAX_AGE } from "@/lib/admin-auth";
import { getPublicBaseUrl } from "@/lib/server-url";

function errorRedirect(baseUrl: string, context: string, error: string): NextResponse {
  const base = context === "admin" ? "/admin/login" : "/app/login";
  return NextResponse.redirect(new URL(`${base}?error=${encodeURIComponent(error)}`, baseUrl));
}

export async function GET(req: NextRequest) {
  const baseUrl = getPublicBaseUrl(req);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return errorRedirect(baseUrl, "app", `google_${error}`);
  }

  if (!code || !stateParam) {
    return errorRedirect(baseUrl, "app", "google_missing_code");
  }

  const [stateToken, context = "app"] = stateParam.split(":");
  const cookieState = req.cookies.get("google_oauth_state")?.value;

  if (!cookieState || cookieState !== stateToken) {
    return errorRedirect(baseUrl, context, "google_state_mismatch");
  }

  const creds = await getGoogleCreds();
  if (!creds) {
    return errorRedirect(baseUrl, context, "google_not_configured");
  }

  const tokenResult = await exchangeCodeForToken(creds, code);
  if (!tokenResult.ok) {
    return errorRedirect(baseUrl, context, `google_token_${tokenResult.error}`);
  }

  const userResult = await fetchUserInfo(tokenResult.token.access_token);
  if (!userResult.ok) {
    return errorRedirect(baseUrl, context, `google_userinfo_${userResult.error}`);
  }

  const gUser = userResult.user;
  const email = gUser.email.trim().toLowerCase();

  // ─── APP context ──────────────────────────────────────
  if (context === "app") {
    let appUser = await prisma.appUser.findFirst({
      where: { OR: [{ googleId: gUser.id }, { email }] },
    });

    if (!appUser) {
      const order = await prisma.order.findFirst({
        where: { email, status: "approved" },
        orderBy: { createdAt: "desc" },
      });
      if (!order) {
        return errorRedirect(
          baseUrl,
          "app",
          "Sem compra aprovada. Use o mesmo email da compra Hotmart."
        );
      }
      appUser = await prisma.appUser.create({
        data: {
          email,
          orderId: order.id,
          plan: order.plan,
          accessType: "lifetime",
          googleId: gUser.id,
        },
      });
    } else if (!appUser.googleId) {
      appUser = await prisma.appUser.update({
        where: { id: appUser.id },
        data: { googleId: gUser.id },
      });
    }

    try {
      const existing = await prisma.appProfile.findUnique({
        where: { userId: appUser.id },
      });
      if (!existing && gUser.name) {
        await prisma.appProfile.create({
          data: {
            userId: appUser.id,
            name: gUser.name,
            objective: "",
            goalType: "",
            challenges: [],
            onboardingDone: false,
          },
        });
      }
    } catch {
      /* silent */
    }

    const response = NextResponse.redirect(new URL("/app", baseUrl));
    await setAppSessionCookies(response, email, appUser.id, appUser.plan);
    const cookieDomain = getCookieDomain();
    response.cookies.set("google_oauth_state", "", {
      maxAge: 0,
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
    return response;
  }

  // ─── ADMIN context ────────────────────────────────────
  if (context === "admin") {
    let admin = await prisma.adminUser.findFirst({
      where: { OR: [{ googleId: gUser.id }, { email }] },
    });

    if (!admin) {
      return errorRedirect(
        baseUrl,
        "admin",
        "Admin nao cadastrado. Contate o administrador."
      );
    }

    if (!admin.googleId) {
      admin = await prisma.adminUser.update({
        where: { id: admin.id },
        data: { googleId: gUser.id, lastLoginAt: new Date() },
      });
    } else {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const token = await signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.redirect(new URL("/admin/dashboard", baseUrl));
    const cookieDomain = getCookieDomain();
    response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ADMIN_TOKEN_MAX_AGE,
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
    response.cookies.set("google_oauth_state", "", {
      maxAge: 0,
      path: "/",
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
    return response;
  }

  return errorRedirect(baseUrl, "app", "google_invalid_context");
}

function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV !== "production") return undefined;
  const raw = process.env.NEXT_PUBLIC_DOMAIN || "longetividade.com.br";
  const bare = raw.replace(/^www\./, "");
  return `.${bare}`;
}
