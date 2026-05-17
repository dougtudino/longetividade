import type { Metadata, Viewport } from "next";
import { AppHeaderWrapper } from "@/components/app/app-header-wrapper";
import { APP_BRAND } from "@/config/app-brand";

export const metadata: Metadata = {
  title: APP_BRAND.fullName,
  description: `${APP_BRAND.tagline} — desafio 21 dias, hábitos, água, peso e humor em loop. ${APP_BRAND.by}.`,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_BRAND.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#639922",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto min-h-screen bg-white"
      style={{ maxWidth: 430, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <AppHeaderWrapper />
      {children}
    </div>
  );
}
