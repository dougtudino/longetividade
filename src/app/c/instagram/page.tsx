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
  title: "Emagreça Sem Dieta — Método S.E.M | R$37",
  robots: "noindex, nofollow",
};

export default function Page() {
  return (
    <div className={`${playfair.variable} ${dmSans.variable}`}>
      <InstagramLP />
    </div>
  );
}
