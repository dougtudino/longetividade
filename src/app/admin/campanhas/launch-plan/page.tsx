"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";

// DEPRECATED 2026-04-20 (Sprint 6) — substituida por /admin/campanhas/launch-blueprint
//
// O fluxo de 8 passos manuais + auto-launcher antigo (rota /api/admin/campaigns/launch
// com blueprint TypeScript hardcoded em launch-001.ts) foi 100% substituido pelo
// blueprint editavel com launcher automatico end-to-end.
//
// Mantida como redirect pra preservar bookmarks. Auto-redireciona em 3s.
export default function LaunchPlanPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push("/admin/campanhas/launch-blueprint");
    }, 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <PageHeader title="Launch Plan" subtitle="Página obsoleta" icon="📋" />
      <div
        style={{
          padding: 28,
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
          borderRadius: 14,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 12 }}>📋 → 🗺️</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>
          Esta página foi substituída pelo Blueprint
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
          O fluxo manual de 8 passos virou um blueprint editável que cria
          campanha + audiences + lookalike + ad sets + ads automaticamente em 1 clique.
          Redirecionando em 3 segundos...
        </p>
        <Link
          href="/admin/campanhas/launch-blueprint"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Abrir Blueprint agora →
        </Link>
      </div>
    </div>
  );
}
