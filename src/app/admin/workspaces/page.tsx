"use client";

import { useEffect, useState, useCallback } from "react";

type Plan = {
  id: string;
  planKey: string;
  label: string;
  priceCents: number;
  hotmartOffer: string;
  checkoutUrl: string;
  orderIndex: number;
  active: boolean;
};

type Workspace = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  status: string;
  domains: string[];
  metaPixelId: string | null;
  hotmartProductId: string | null;
  adAccountId: string | null;
  businessManagerId: string | null;
  fromEmail: string | null;
  plans: Plan[];
  _count?: { memberships: number };
};

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};
const input: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "0.5px solid var(--border-default)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};
const label: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 4,
};
const btn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  background: "var(--accent)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  ...btn,
  background: "transparent",
  color: "var(--text-muted)",
  border: "0.5px solid var(--border-default)",
};

const CONFIG_FIELDS: { key: keyof Workspace; label: string; hint?: string }[] = [
  { key: "name", label: "Nome" },
  { key: "brandName", label: "Marca (brand)" },
  { key: "domains", label: "Domínios (separados por vírgula)", hint: "ex: corretorblindado.com.br" },
  { key: "metaPixelId", label: "Meta Pixel ID" },
  { key: "hotmartProductId", label: "Hotmart Product ID" },
  { key: "adAccountId", label: "Meta Ad Account ID" },
  { key: "businessManagerId", label: "Business Manager ID" },
  { key: "fromEmail", label: "Email remetente" },
];

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newWs, setNewWs] = useState({ slug: "", name: "", brandName: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workspaces");
      const data = await res.json();
      setWorkspaces(data.workspaces ?? []);
      setActiveId(data.activeWorkspaceId ?? null);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(null), 2500);
  }

  // edição local de um workspace em memória
  function patchLocal(id: string, patch: Partial<Workspace>) {
    setWorkspaces((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }
  function patchPlanLocal(wsId: string, planId: string, patch: Partial<Plan>) {
    setWorkspaces((ws) =>
      ws.map((w) =>
        w.id === wsId
          ? { ...w, plans: w.plans.map((p) => (p.id === planId ? { ...p, ...patch } : p)) }
          : w
      )
    );
  }

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWs),
    });
    const data = await res.json();
    if (data.ok) {
      setShowNew(false);
      setNewWs({ slug: "", name: "", brandName: "" });
      flash("Workspace criado");
      load();
    } else {
      flash(data.error ?? "Falha");
    }
  }

  async function saveConfig(w: Workspace) {
    const res = await fetch(`/api/admin/workspaces/${w.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: w.name,
        brandName: w.brandName,
        domains: w.domains,
        metaPixelId: w.metaPixelId,
        hotmartProductId: w.hotmartProductId,
        adAccountId: w.adAccountId,
        businessManagerId: w.businessManagerId,
        fromEmail: w.fromEmail,
      }),
    });
    const data = await res.json();
    flash(data.ok ? "Config salva" : data.error ?? "Falha");
  }

  async function savePlan(wsId: string, p: Plan) {
    const res = await fetch(`/api/admin/workspaces/${wsId}/plans/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: p.label,
        priceCents: p.priceCents,
        hotmartOffer: p.hotmartOffer,
        checkoutUrl: p.checkoutUrl,
        orderIndex: p.orderIndex,
        active: p.active,
      }),
    });
    const data = await res.json();
    flash(data.ok ? "Plano salvo" : data.error ?? "Falha");
  }

  async function deletePlan(wsId: string, planId: string) {
    if (!confirm("Excluir este plano?")) return;
    const res = await fetch(`/api/admin/workspaces/${wsId}/plans/${planId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.ok) {
      flash("Plano excluído");
      load();
    } else flash(data.error ?? "Falha");
  }

  async function addPlan(wsId: string) {
    const planKey = prompt("planKey (ex: lt, bump, upsell):");
    if (!planKey) return;
    const res = await fetch(`/api/admin/workspaces/${wsId}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planKey: planKey.trim(),
        label: planKey.trim(),
        priceCents: 0,
        hotmartOffer: `${wsId}-${planKey.trim()}-${Date.now()}`,
        checkoutUrl: "#",
        orderIndex: 0,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      flash("Plano criado — edite os campos");
      load();
    } else flash(data.error ?? "Falha");
  }

  return (
    <main style={{ padding: "28px 32px 48px", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Workspaces</h1>
        <button style={btn} onClick={() => setShowNew((s) => !s)}>
          {showNew ? "Cancelar" : "+ Novo workspace"}
        </button>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 0, marginBottom: 24 }}>
        Cada produto/low-ticket é um workspace isolado. Troque o ativo na barra lateral pra ver vendas
        separadas. Edite aqui os planos e a config (Hotmart, Pixel, domínio) de cada um.
      </p>

      {msg && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 100,
            background: "var(--accent)",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {msg}
        </div>
      )}

      {showNew && (
        <form onSubmit={createWorkspace} style={{ ...card, display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr auto", alignItems: "end" }}>
          <div>
            <label style={label}>Slug</label>
            <input style={input} value={newWs.slug} onChange={(e) => setNewWs({ ...newWs, slug: e.target.value })} placeholder="corretor-blindado" />
          </div>
          <div>
            <label style={label}>Nome</label>
            <input style={input} value={newWs.name} onChange={(e) => setNewWs({ ...newWs, name: e.target.value })} placeholder="Corretor Blindado" />
          </div>
          <div>
            <label style={label}>Marca</label>
            <input style={input} value={newWs.brandName} onChange={(e) => setNewWs({ ...newWs, brandName: e.target.value })} placeholder="Corretor Blindado" />
          </div>
          <button type="submit" style={btn}>Criar</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Carregando…</p>
      ) : (
        workspaces.map((w) => (
          <div key={w.id} style={card}>
            {/* Header do workspace */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{w.name}</h2>
              <code style={{ fontSize: 12, color: "var(--text-muted)" }}>{w.slug}</code>
              {w.id === activeId && (
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", background: "var(--accent-soft)", padding: "2px 8px", borderRadius: 999 }}>
                  ATIVO
                </span>
              )}
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {w._count?.memberships ?? 0} login(s)</span>
            </div>

            {/* Config */}
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", marginBottom: 12 }}>
              {CONFIG_FIELDS.map((f) => (
                <div key={String(f.key)}>
                  <label style={label}>{f.label}</label>
                  <input
                    style={input}
                    value={
                      f.key === "domains"
                        ? (w.domains ?? []).join(", ")
                        : ((w[f.key] as string | null) ?? "")
                    }
                    placeholder={f.hint}
                    onChange={(e) =>
                      f.key === "domains"
                        ? patchLocal(w.id, { domains: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
                        : patchLocal(w.id, { [f.key]: e.target.value } as Partial<Workspace>)
                    }
                  />
                </div>
              ))}
            </div>
            <button style={btn} onClick={() => saveConfig(w)}>Salvar config</button>

            {/* Planos */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Planos</h3>
                <button style={btnGhost} onClick={() => addPlan(w.id)}>+ Plano</button>
              </div>
              {w.plans.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Nenhum plano.</p>}
              {w.plans.map((p) => (
                <div key={p.id} style={{ display: "grid", gap: 8, gridTemplateColumns: "80px 1fr 110px 120px 1fr auto auto", alignItems: "end", marginBottom: 10, paddingBottom: 10, borderBottom: "0.5px solid var(--border-subtle)" }}>
                  <div>
                    <label style={label}>key</label>
                    <input style={{ ...input, opacity: 0.7 }} value={p.planKey} disabled />
                  </div>
                  <div>
                    <label style={label}>Label</label>
                    <input style={input} value={p.label} onChange={(e) => patchPlanLocal(w.id, p.id, { label: e.target.value })} />
                  </div>
                  <div>
                    <label style={label}>Preço (R$)</label>
                    <input
                      style={input}
                      type="number"
                      step="0.01"
                      value={(p.priceCents / 100).toString()}
                      onChange={(e) => patchPlanLocal(w.id, p.id, { priceCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                    />
                  </div>
                  <div>
                    <label style={label}>Offer Hotmart</label>
                    <input style={input} value={p.hotmartOffer} onChange={(e) => patchPlanLocal(w.id, p.id, { hotmartOffer: e.target.value })} />
                  </div>
                  <div>
                    <label style={label}>Checkout URL</label>
                    <input style={input} value={p.checkoutUrl} onChange={(e) => patchPlanLocal(w.id, p.id, { checkoutUrl: e.target.value })} />
                  </div>
                  <button style={btn} onClick={() => savePlan(w.id, p)}>Salvar</button>
                  <button style={{ ...btnGhost, color: "#d9534f" }} onClick={() => deletePlan(w.id, p.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </main>
  );
}
