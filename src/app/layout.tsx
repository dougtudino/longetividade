import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Emagreca sem Dieta (mesmo sem tempo) | Metodo S.E.M",
  description:
    "Descubra o Metodo S.E.M - 3 pilares simples que estao ajudando mulheres ocupadas a emagrecerem sem cortar alimentos, sem academia e sem culpa.",
  openGraph: {
    title: "Emagreca sem Dieta (mesmo sem tempo) | Metodo S.E.M",
    description:
      "3 pilares simples para emagrecer sem cortar alimentos, sem academia e sem culpa.",
    type: "website",
    locale: "pt_BR",
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
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
