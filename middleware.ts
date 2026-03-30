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

export function middleware(request: NextRequest) {
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
