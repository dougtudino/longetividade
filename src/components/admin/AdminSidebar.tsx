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

interface NavSection {
  title: string;
  items: NavItem[];
}

const ICON_SIZE = 18;

const svgIcon = (d: string) => (
  <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Operacao",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1v22" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        ),
      },
      {
        label: "Abandonos",
        href: "/admin/abandonos",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
        ),
      },
      {
        label: "Trafego",
        href: "/admin/trafego",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Cadastros",
    items: [
      {
        label: "Clientes App",
        href: "/admin/app-users",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        label: "Admins",
        href: "/admin/admins",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Social organico",
    items: [
      {
        label: "Social Media 🌙",
        href: "/admin/social-media",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
          </svg>
        ),
      },
      {
        label: "Video Intel 🎬",
        href: "/admin/video-intelligence",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Meta Ads",
    items: [
      {
        label: "1. Campanhas",
        href: "/admin/campanhas",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l18-5v12L3 13v-2z" />
            <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
          </svg>
        ),
      },
      {
        label: "2. Criativos 🎨",
        href: "/admin/criativos",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        ),
      },
      {
        label: "3. Gaia 🌱",
        href: "/admin/agents/gaia",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M6 8c0-4 6-6 6-6s6 2 6 6-6 6-6 6-6-2-6-6z" />
            <path d="M6 16c0 4 6 6 6 6s6-2 6-6" />
          </svg>
        ),
      },
      {
        label: "4. Blueprint 📋",
        href: "/admin/campanhas/launch-blueprint",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 7h8" />
            <path d="M8 11h8" />
            <path d="M8 15h5" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "CRM",
    items: [
      {
        label: "Email Marketing",
        href: "/admin/email-marketing",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        label: "Ecossistema",
        href: "/admin/ecossistema",
        icon: <span style={{ fontSize: 16, lineHeight: 1 }}>{"\uD83D\uDDFA\uFE0F"}</span>,
      },
      {
        label: "App Icon",
        href: "/admin/app-icon",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <text x="12" y="16" fontSize="11" fontWeight="900" fill="currentColor" textAnchor="middle" stroke="none">L</text>
          </svg>
        ),
      },
      {
        label: "Setup",
        href: "/admin/setup",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        ),
      },
      {
        label: "Manual",
        href: "/admin/manual",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        ),
      },
      {
        label: "Demo & Roadmap",
        href: "/admin/demo",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        ),
      },
      {
        label: "Configuracoes",
        href: "/admin/configuracoes",
        icon: (
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
          </svg>
        ),
      },
    ],
  },
];

// Flat list derivada pra active check + compat
const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);
// svgIcon helper kept in case needed later (unused now)
void svgIcon;

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
type CurrentAdmin = {
  email: string;
  name: string;
  role: string;
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeKey, setThemeKey] = useState("dark");
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.admin) {
          setCurrentAdmin({
            email: d.admin.email,
            name: d.admin.name,
            role: d.admin.role,
          });
        }
      })
      .catch(() => {});
  }, []);

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

      {/* Current admin (nome de quem ta logado) */}
      {currentAdmin && (
        <div
          style={{
            margin: "0 12px 12px",
            padding: "10px 12px",
            background: "rgba(99,153,34,0.08)",
            border: "0.5px solid rgba(99,153,34,0.25)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#639922",
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {currentAdmin.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentAdmin.name}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {currentAdmin.role}
            </div>
          </div>
        </div>
      )}

      {/* Navigation — organizada em secoes */}
      <nav style={{ flex: 1, padding: "4px 8px 12px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.title} style={{ marginTop: sectionIdx === 0 ? 0 : 14 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0 12px 6px",
              }}
            >
              {section.title}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      height: 36,
                      padding: "0 12px",
                      borderRadius: 8,
                      fontSize: 13,
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
            </div>
          </div>
        ))}
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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .admin-sidebar-desktop { display: block !important; }
          .admin-hamburger { display: none !important; }
          .admin-mobile-overlay { display: none !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="admin-sidebar-desktop">{sidebarContent}</div>

      {/* Mobile hamburger */}
      <button
        className="admin-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Abrir menu"
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 80,
          width: 40,
          height: 40,
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          cursor: "pointer",
        }}
      >
        {mobileOpen ? CloseIcon : HamburgerIcon}
      </button>

      {/* Mobile overlay + sidebar */}
      {mobileOpen && (
        <div className="admin-mobile-overlay">
          {/* Backdrop */}
          <div
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
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 70,
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
