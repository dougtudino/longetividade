import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import InstagramLP from "./InstagramLP";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--lp-font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--lp-font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Emagreça Sem Dieta — Método S.E.M | R$67",
  robots: "noindex, nofollow",
};

function resolveCheckoutUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL;
  if (publicUrl) return publicUrl;

  const offer = process.env.HOTMART_OFFER_BASICO;
  if (offer) return `https://pay.hotmart.com/H105141835Q?off=${offer}&src=lp-instagram`;

  return "#";
}

export default function Page() {
  const checkoutUrl = resolveCheckoutUrl();

  return (
    <div className={`${playfair.variable} ${dmSans.variable}`}>
      <InstagramLP checkoutUrl={checkoutUrl} />
    </div>
  );
}
