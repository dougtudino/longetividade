import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGoogleCreds, exchangeCodeForToken, fetchUserInfo } from "@/lib/google-oauth";
import { setAppSessionCookies } from "@/lib/app-session";
import { signAdminToken, ADMIN_TOKEN_COOKIE, ADMIN_TOKEN_MAX_AGE } from "@/lib/admin-auth";

// GET /api/auth/google/callback?code=...&state=...
// Callback do Google OAuth. Fluxo:
//   1. Verifica state contra cookie (CSRF)
//   2. Exchange code → access_token
//   3. Fetch user info → { id (sub), email, name, picture }
//   4. Baseado no context (app|admin) salvo no state, cria/busca user:
//      - "app": busca/cria AppUser por googleId ou email.
//        Requer Order VIP aprovada (senao 403).
//      - "admin": busca AdminUser por googleId ou email.
//        NAO cria novos admins via Google — precisa ser pre-cadastrado.
//   5. Seta sessao correta e redireciona

function errorRedirect(req: NextRequest, context: string, error: string): NextResponse {
  const base = context === "admin" ? "/admin/login" : "/app/login";
  return NextResponse.redirect(new URL(`${base}?error=${encodeURIComponent(error)}`, req.url));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Usuario cancelou
  if (error) {
    return errorRedirect(req, "app", `google_${error}`);
  }

  if (!code || !stateParam) {
    return errorRedirect(req, "app", "google_missing_code");
  }

  // Parse state: "<random>:<context>"
  const [stateToken, context = "app"] = stateParam.split(":");
  const cookieState = req.cookies.get("google_oauth_state")?.value;

  if (!cookieState || cookieState !== stateToken) {
    return errorRedirect(req, context, "google_state_mismatch");
  }

  const creds = await getGoogleCreds();
  if (!creds) {
    return errorRedirect(req, context, "google_not_configured");
  }

  // Exchange
  const tokenResult = await exchangeCodeForToken(creds, code);
  if (!tokenResult.ok) {
    return errorRedirect(req, context, `google_token_${tokenResult.error}`);
  }

  // Fetch user
  const userResult = await fetchUserInfo(tokenResult.token.access_token);
  if (!userResult.ok) {
    return errorRedirect(req, context, `google_userinfo_${userResult.error}`);
  }

  const gUser = userResult.user;
  const email = gUser.email.trim().toLowerCase();

  // ─── APP context ──────────────────────────────────────
  if (context === "app") {
    // Busca AppUser por googleId primeiro, depois por email
    let appUser = await prisma.appUser.findFirst({
      where: { OR: [{ googleId: gUser.id }, { email }] },
    });

    // Se nao existe, precisa ter Order VIP aprovada
    if (!appUser) {
      const order = await prisma.order.findFirst({
        where: { email, plan: "vip", status: "approved" },
        orderBy: { createdAt: "desc" },
      });
      if (!order) {
        return errorRedirect(
          req,
          "app",
          "Sem compra VIP aprovada. Use o mesmo email da compra Hotmart."
        );
      }
      appUser = await prisma.appUser.create({
        data: {
          email,
          orderId: order.id,
          plan: "vip",
          accessType: "lifetime",
          googleId: gUser.id,
        },
      });
    } else if (!appUser.googleId) {
      // Linka o googleId no user existente
      appUser = await prisma.appUser.update({
        where: { id: appUser.id },
        data: { googleId: gUser.id },
      });
    }

    // Cria/atualiza AppProfile com nome do Google (se ainda sem nome)
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

    const response = NextResponse.redirect(new URL("/app", req.url));
    setAppSessionCookies(response, email);
    response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });
    return response;
  }

  // ─── ADMIN context ────────────────────────────────────
  if (context === "admin") {
    // Admin tem que estar pre-cadastrado no banco (nao cria automaticamente)
    let admin = await prisma.adminUser.findFirst({
      where: { OR: [{ googleId: gUser.id }, { email }] },
    });

    if (!admin) {
      return errorRedirect(
        req,
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

    const response = NextResponse.redirect(new URL("/admin/dashboard", req.url));
    response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ADMIN_TOKEN_MAX_AGE,
      path: "/",
    });
    response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });
    return response;
  }

  return errorRedirect(req, "app", "google_invalid_context");
}
