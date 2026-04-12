// Helper para construir URL publica do servidor corretamente
// no Railway (ou qualquer proxy reverso onde req.url retorna localhost).
//
// Railway internamente roda o app em localhost:PORT, mas o trafego
// externo vem via proxy com headers x-forwarded-host e x-forwarded-proto.
// NextResponse.redirect(new URL(path, req.url)) resulta em redirect
// pra localhost — que obviamente nao funciona pro browser do usuario.
//
// Uso: const base = getPublicBaseUrl(req);
//      return NextResponse.redirect(new URL("/admin/dashboard", base));

import { NextRequest } from "next/server";

const DEFAULT_DOMAIN = "www.longetividade.com.br";

export function getPublicBaseUrl(req: NextRequest): string {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host") || DEFAULT_DOMAIN;
  const proto = req.headers.get("x-forwarded-proto") || "https";
  // Remove port se vier (ex: "www.longetividade.com.br:443")
  const cleanHost = host.split(":")[0];
  return `${proto}://${cleanHost}`;
}
