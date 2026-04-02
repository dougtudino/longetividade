import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Longetividade — App",
  description: "Seu acompanhamento do Metodo S.E.M",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Longetividade",
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
      {children}
    </div>
  );
}
