"use client";

import { useEffect, useState, useCallback } from "react";

type Tpl = { id: string; name: string; niche: string | null; scope: string; workspaceId: string | null; blocks: unknown[]; updatedAt: string };

const card: React.CSSProperties = { background: "var(--bg-card)", border: "0.5px solid var(--border-default)", borderRadius: 12, padding: 18, marginBottom: 12 };
const input: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--border-default)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" };
const label: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 };
const btn: React.CSSProperties = { padding: "8px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnGhost: React.CSSProperties = { ...btn, background: "transparent", color: "var(--text-muted)", border: "0.5px solid var(--border-default)" };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Tpl[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", niche: "", scope: "global" });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/admin/templates").then((r) => r.json());
    setTemplates(data.templates ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(null), 2500); }

  async function seed() {
    const data = await fetch("/api/admin/templates/seed", { method: "POST" }).then((r) => r.json());
    flash(data.ok ? `Seed: criados ${data.created.length}, pulados ${data.skipped.length}` : data.error ?? "Falha");
    load();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const data = await fetch("/api/admin/templates", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, niche: form.niche, scope: form.scope }),
    }).then((r) => r.json());
    if (data.ok) { setForm({ name: "", niche: "", scope: "global" }); flash("Template criado"); load(); }
    else flash(data.error ?? "Falha");
  }

  return (
    <main style={{ padding: "28px 32px 48px", maxWidth: 820 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Templates</h1>
        <button style={btnGhost} onClick={seed}>Seedar padrões</button>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        Templates reutilizáveis de LP. Cada landing page nasce de um template (copia os blocos) e pode divergir depois.
      </p>

      {msg && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100, background: "var(--accent)", color: "#fff", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>{msg}</div>}

      <form onSubmit={create} style={{ ...card, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 150px auto", alignItems: "end" }}>
        <div><label style={label}>Nome</label><input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Meu template" /></div>
        <div><label style={label}>Nicho</label><input style={input} value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="info-produto" /></div>
        <div>
          <label style={label}>Escopo</label>
          <select style={input} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
            <option value="global">Global</option>
            <option value="workspace">Só este workspace</option>
          </select>
        </div>
        <button type="submit" style={btn}>Criar (vazio)</button>
      </form>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando…</p>
      ) : templates.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "var(--text-muted)" }}>
          Nenhum template. Clique em “Seedar padrões” pra criar o “Padrão Longetividade” e o “12 Dobras”.
        </div>
      ) : (
        templates.map((t) => (
          <div key={t.id} style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <strong style={{ color: "var(--text-primary)", fontSize: 15 }}>{t.name}</strong>
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 10 }}>
                {t.niche ?? "—"} · {t.scope === "global" ? "global" : "workspace"} · {Array.isArray(t.blocks) ? t.blocks.length : 0} blocos
              </span>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
