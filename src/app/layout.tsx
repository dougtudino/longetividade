import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import TrackingScripts from "@/components/tracking/TrackingScripts";
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
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.remove('light')}else{document.documentElement.classList.add('light')}}catch(e){document.documentElement.classList.add('light')}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-body">
        <TrackingScripts />
        {children}
      </body>
    </html>
  );
}
