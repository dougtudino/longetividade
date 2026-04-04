"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Sidebar-specific backgrounds per theme (not covered by CSS vars)  */
/* ------------------------------------------------------------------ */
const SIDEBAR_THEMES: Record<string, { bg: string; border: string }> = {
  light: { bg: "#F5F5F0", border: "1px solid #E5E5E5" },
  dark: { bg: "#0f1523", border: "1px solid rgba(255,255,255,0.08)" },
  neon: { bg: "#07000f", border: "1px solid rgba(255,31,143,0.2)" },
};

function getThemeKey(): string {
  if (typeof document === "undefined") return "dark";
  const html = document.documentElement;
  if (html.classList.contains("light")) return "light";
  if (html.classList.contains("neon")) return "neon";
  return "dark";
}

/* ------------------------------------------------------------------ */
/*  Navigation items                                                   */
/* ------------------------------------------------------------------ */
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Ecossistema",
    href: "/admin/ecossistema",
    icon: (
      <span style={{ fontSize: 16, lineHeight: 1 }}>{"\uD83D\uDDFA\uFE0F"}</span>
    ),
  },
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7" width="4" height="14" rx="1" />
        <rect x="17" y="3" width="4" height="18" rx="1" />
      </svg>
    ),
  },
  {
    label: "Vendas",
    href: "/admin/vendas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1v22" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: "Campanhas",
    href: "/admin/campanhas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l18-5v12L3 13v-2z" />
        <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
      </svg>
    ),
  },
  {
    label: "Trafego",
    href: "/admin/trafego",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    label: "Abandonos",
    href: "/admin/abandonos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    label: "Configuracoes",
    href: "/admin/configuracoes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Logout icon                                                        */
/* ------------------------------------------------------------------ */
const LogoutIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Hamburger icon                                                     */
/* ------------------------------------------------------------------ */
const HamburgerIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeKey, setThemeKey] = useState("dark");

  // Observe theme changes on <html>
  useEffect(() => {
    setThemeKey(getThemeKey());
    const observer = new MutationObserver(() => setThemeKey(getThemeKey()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }, [router]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === "/admin" || pathname === "/admin/dashboard"
      : pathname.startsWith(href);

  const sidebarTheme = SIDEBAR_THEMES[themeKey] || SIDEBAR_THEMES.dark;

  const sidebarContent = (
    <div
      style={{
        width: 220,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: sidebarTheme.bg,
        borderRight: sidebarTheme.border,
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#639922",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>L</span>
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--text-primary)",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              Longetividade
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginTop: 1,
              }}
            >
              Admin v2.0
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 40,
                padding: "0 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--accent)" : "var(--text-secondary)",
                background: active ? "var(--accent-soft)" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "8px 8px 16px" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            height: 40,
            padding: "0 12px",
            borderRadius: 8,
            fontSize: 14,
            color: "var(--text-muted)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-card-hover)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          {LogoutIcon}
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 50,
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          cursor: "pointer",
        }}
      >
        {HamburgerIcon}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              background: "rgba(0,0,0,0.5)",
            }}
          />
          {/* Sidebar panel */}
          <div
            className="md:hidden"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 70,
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
              style={{
                position: "absolute",
                top: 12,
                right: -48,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                cursor: "pointer",
                zIndex: 71,
              }}
            >
              {CloseIcon}
            </button>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
