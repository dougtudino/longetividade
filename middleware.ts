import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

function isAdminAuthenticated(request: NextRequest): boolean {
  const cookie = request.cookies.get("admin_session");
  if (!cookie?.value) return false;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const secret = process.env.ADMIN_SECRET || "longetividade-admin-2024";
  const expected = btoa(`${password}:${secret}`);
  return cookie.value === expected;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth check — protect all /admin routes except /admin/login and /api/admin/auth
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    if (!isAdminAuthenticated(request)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect admin API routes (except auth)
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    if (!isAdminAuthenticated(request)) {
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
