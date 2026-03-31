"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 24,
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
