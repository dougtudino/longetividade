import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-token";
import { verifyAppToken, APP_TOKEN_COOKIE } from "@/lib/app-token";

const SUBDOMAIN_MAP: Record<string, string> = {
  emagrecer: "/emagreca-sem-dieta",
  "emagreca-sem-dieta": "/emagreca-sem-dieta",
  sono: "/sono-profundo",
  "sono-profundo": "/sono-profundo",
  detox: "/detox-mental",
  jejum: "/jejum-inteligente",
  movimento: "/movimento-vital",
};

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "longetividade.com.br";

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  return payload !== null;
}

async function isAppAuthenticated(request: NextRequest): Promise<boolean> {
  // Check signed token first, fallback to legacy app_email cookie
  const token = request.cookies.get(APP_TOKEN_COOKIE)?.value;
  if (token) {
    const payload = await verifyAppToken(token);
    if (payload) return true;
  }
  // Legacy: unsigned app_email cookie (existing sessions before token signing)
  const email = request.cookies.get("app_email")?.value;
  return !!email;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth — /admin/login e /admin/cadastro públicos; demais /admin/* protegidos
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/admin/cadastro")
  ) {
    const ok = await isAdminAuthenticated(request);
    if (!ok) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // API admin — protegida exceto /api/admin/auth/* e /api/admin/migrate
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth") &&
    !pathname.startsWith("/api/admin/migrate")
  ) {
    const ok = await isAdminAuthenticated(request);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // App auth — /app/login e /app/cadastro públicos; demais /app/* protegidos
  if (
    pathname.startsWith("/app") &&
    !pathname.startsWith("/app/login") &&
    !pathname.startsWith("/app/cadastro")
  ) {
    const ok = await isAppAuthenticated(request);
    if (!ok) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/app/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // API app — protegida exceto /api/app/auth e /api/app/register e /api/app/demo-login
  if (
    pathname.startsWith("/api/app") &&
    !pathname.startsWith("/api/app/auth") &&
    !pathname.startsWith("/api/app/register") &&
    !pathname.startsWith("/api/app/demo-login")
  ) {
    const ok = await isAppAuthenticated(request);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Subdomain routing
  const hostname = request.headers.get("host") || "";
  const hostWithoutPort = hostname.split(":")[0];
  const subdomain = hostWithoutPort
    .replace(`.${MAIN_DOMAIN}`, "")
    .replace(`www.${MAIN_DOMAIN}`, "");

  if (
    subdomain &&
    subdomain !== "www" &&
    subdomain !== MAIN_DOMAIN &&
    subdomain !== hostWithoutPort
  ) {
    const targetPath = SUBDOMAIN_MAP[subdomain];
    if (targetPath) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = targetPath;
      return NextResponse.rewrite(rewriteUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
