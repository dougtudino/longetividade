import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import TrackingScripts, { TrackingNoscripts } from "@/components/tracking/TrackingScripts";
import UTMCapture from "@/components/tracking/UTMCapture";
import TrackPageView from "@/components/tracking/TrackPageView";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_DOMAIN}`
  : "https://longetividade-production.up.railway.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Longetividade — Viva Mais, Viva Melhor",
    template: "%s | Longetividade",
  },
  description:
    "Programas de saude e longevidade baseados em ciencia. Ebooks, metodos e protocolos para transformar sua vida.",
  openGraph: {
    title: "Longetividade — Viva Mais, Viva Melhor",
    description:
      "Programas de saude e longevidade baseados em ciencia.",
    type: "website",
    locale: "pt_BR",
    siteName: "Longetividade",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Longetividade — Viva Mais, Viva Melhor",
    description:
      "Programas de saude e longevidade baseados em ciencia.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('longetividade-theme');var h=document.documentElement;h.classList.remove('light','neon');if(t==='dark'){}else if(t==='neon'){h.classList.add('neon')}else{h.classList.add('light')}}catch(e){document.documentElement.classList.add('light')}})()`,
          }}
        />
        {/* Preconnect pixel CDN — handshake TLS antes do script inline pedir
            fbevents.js, corta ~150-300ms em mobile lento (story-ads fast-scroll
            perde LPV se PageView demora). dns-prefetch como fallback. */}
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://www.facebook.com" crossOrigin="anonymous" />
        {/* Tracking no head: script inline executa antes do body renderizar,
            reduzindo perda de LPV em mobile lento (Story/Reels fast-scroll) */}
        <TrackingScripts />
      </head>
      <body className="min-h-full flex flex-col font-body">
        <TrackingNoscripts />
        <UTMCapture />
        <TrackPageView />
        {children}
      </body>
    </html>
  );
}
