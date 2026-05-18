import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Cloudflare R2 — assets editáveis da LP (pub-*.r2.dev subdomains)
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
  env: {
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_CHECKOUT_URL: process.env.NEXT_PUBLIC_CHECKOUT_URL,
  },
  // Redirects de URLs antigas pra evitar 404 em bookmarks/push notifs/links
  // antigos apos a simplificacao radical de 2026-05-18 (12 paginas -> 4 abas).
  // Mantem permanente=false porque pode mudar com nova reestruturacao.
  async redirects() {
    return [
      { source: "/app/evolucao", destination: "/app/jornada", permanent: false },
      { source: "/app/progresso", destination: "/app/jornada", permanent: false },
      { source: "/app/mais", destination: "/app/eu", permanent: false },
    ];
  },
};

export default nextConfig;
