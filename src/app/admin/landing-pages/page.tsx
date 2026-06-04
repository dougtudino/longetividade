"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Page = { id: string; slug: string; title: string; status: string; templateId: string | null; updatedAt: string };
type Tpl = { id: string; name: string; scope: string };

const card: React.CSSProperties = { background: "var(--bg-card)", border: "0.5px solid var(--border-default)", borderRadius: 12, padding: 20, marginBottom: 16 };
const input: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" };
const label: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 };
const btn: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };

export default function LandingPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [templates, setTemplates] = useState<Tpl[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", title: "", templateId: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([
        fetch("/api/admin/landing-pages").then((r) => r.json()),
        fetch("/api/admin/templates").then((r) => r.json()),
      ]);
      setPages(p.pages ?? []);
      setTemplates(t.templates ?? []);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(null), 2500); }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: form.slug, title: form.title, templateId: form.templateId || undefined }),
    });
    const data = await res.json();
    if (data.ok) { setForm({ slug: "", title: "", templateId: "" }); flash("LP criada"); load(); }
    else flash(data.error ?? "Falha");
  }

  return (
    <main style={{ padding: "28px 32px 48px", maxWidth: 920 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px" }}>Landing pages</h1>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        LPs do workspace ativo. Crie a partir de um template, edite os blocos e publique em <code>/lt/&lt;slug&gt;</code>.
      </p>

      {msg && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100, background: "var(--accent)", color: "#fff", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>{msg}</div>}

      <form onSubmit={create} style={{ ...card, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr auto", alignItems: "end" }}>
        <div><label style={label}>Slug (rota /lt/...)</label><input style={input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="corretor-blindado-frio" /></div>
        <div><label style={label}>Título interno</label><input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Variante frio" /></div>
        <div>
          <label style={label}>Template</label>
          <select style={input} value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })}>
            <option value="">— vazio —</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <button type="submit" style={btn}>Criar</button>
      </form>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando…</p>
      ) : pages.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "var(--text-muted)" }}>
          Nenhuma landing page neste workspace ainda. Crie a primeira acima.
        </div>
      ) : (
        pages.map((p) => (
          <div key={p.id} style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <strong style={{ color: "var(--text-primary)", fontSize: 15 }}>{p.title || p.slug}</strong>
                <code style={{ fontSize: 12, color: "var(--text-muted)" }}>/lt/{p.slug}</code>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: p.status === "published" ? "var(--accent-soft)" : "var(--bg-secondary)", color: p.status === "published" ? "var(--accent)" : "var(--text-muted)" }}>
                  {p.status === "published" ? "PUBLICADA" : "RASCUNHO"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`/lt/${p.slug}`} target="_blank" rel="noreferrer" style={{ ...btn, background: "transparent", color: "var(--text-muted)", border: "0.5px solid var(--border-default)", textDecoration: "none" }}>Ver</a>
              <Link href={`/admin/landing-pages/${p.id}`} style={{ ...btn, textDecoration: "none" }}>Editar</Link>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
