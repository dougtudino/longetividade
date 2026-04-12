"use client";

import { useEffect, useState } from "react";
import PageHelp from "@/components/admin/PageHelp";

type Admin = {
  id: string;
  email: string;
  name: string;
  role: string;
  googleId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count: { mayaMessages: number };
};

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border-default)",
  borderRadius: 12,
  padding: 16,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "0.5px solid var(--border-default)",
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  fontSize: 13,
  outline: "none",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 4,
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "manager" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grantingVip, setGrantingVip] = useState<string | null>(null);
  const [vipResult, setVipResult] = useState<Record<string, string>>({});
  const [changingPw, setChangingPw] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [pwResult, setPwResult] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      setAdmins(data.admins ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setShowForm(false);
        setForm({ email: "", name: "", password: "", role: "manager" });
        await load();
      } else {
        setError(data.error ?? "Falha ao criar");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Cadastros · Administradores
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", margin: "4px 0 20px 0" }}>
          Administradores
        </h1>
      </div>

      <PageHelp
        pageId="admin-admins"
        agent={{ icon: "🛡", name: "Doug", role: "Admin Management" }}
        title="Gerenciar quem tem acesso ao painel"
        quickActions={[
          { label: "+ Novo admin", description: "Cria admin com email + senha (hash bcrypt). Pode também logar via Google depois." },
          { label: "Lista", description: "Todos os admins cadastrados com status Google link, último login, contagem Maya chat" },
        ]}
      >
        <p>
          Os admins aqui cadastrados podem logar em <code>/admin/login</code> com email e
          senha. Se você configurar <code>GOOGLE_CLIENT_ID</code> em configurações, eles
          também podem usar &ldquo;Continuar com Google&rdquo; — mas o email Google precisa
          bater com um admin cadastrado (Google não cria admin novo sozinho).
        </p>
        <p>
          <strong>Roles:</strong> <code>manager</code> (padrão) ou <code>owner</code>. No momento
          não há diferença funcional — tudo vem num sprint futuro.
        </p>
      </PageHelp>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            background: showForm ? "var(--bg-secondary)" : "var(--accent)",
            color: showForm ? "var(--text-primary)" : "#fff",
            border: showForm ? "0.5px solid var(--border-default)" : "none",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancelar" : "+ Novo admin"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createAdmin} style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={label}>Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bárbara Oliveira"
                required
                style={input}
              />
            </div>
            <div>
              <label style={label}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="barbara@longetividade.com.br"
                required
                style={input}
              />
            </div>
            <div>
              <label style={label}>Senha (min 6 chars)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                style={input}
              />
            </div>
            <div>
              <label style={label}>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={input}
              >
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          {error && (
            <div style={{ marginTop: 10, padding: 10, background: "rgba(196,120,122,0.12)", borderRadius: 8, color: "#C4787A", fontSize: 12 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={creating}
            style={{
              marginTop: 14,
              padding: "10px 22px",
              borderRadius: 10,
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {creating ? "Criando..." : "Criar admin"}
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Carregando...</div>
      ) : admins.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          Nenhum admin cadastrado ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {admins.map((a) => (
            <div
              key={a.id}
              style={{
                ...card,
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7A9E7E, #3D5A3E)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.email}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(122,158,126,0.2)", color: "#6B9E6B", fontWeight: 700, textTransform: "uppercase" }}>
                    {a.role}
                  </span>
                  {a.googleId && (
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(74,144,217,0.2)", color: "#4A90D9", fontWeight: 700 }}>
                      Google ✓
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Último login</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtDate(a.lastLoginAt)}</div>
                </div>
                {/* Botoes de acao */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {/* VIP + convite */}
                  <button
                    onClick={async () => {
                      setGrantingVip(a.id);
                      try {
                        const res = await fetch("/api/admin/grant-vip", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: a.email, name: a.name, sendInvite: true }),
                        });
                        const data = await res.json();
                        setVipResult((prev) => ({
                          ...prev,
                          [a.id]: data.ok ? data.message : data.error ?? "Erro",
                        }));
                      } catch (e) {
                        setVipResult((prev) => ({ ...prev, [a.id]: (e as Error).message }));
                      } finally {
                        setGrantingVip(null);
                      }
                    }}
                    disabled={grantingVip === a.id}
                    style={{
                      padding: "5px 12px", borderRadius: 8,
                      background: vipResult[a.id] ? "rgba(107,158,107,0.15)" : "#639922",
                      color: vipResult[a.id] ? "#6B9E6B" : "#fff",
                      border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >
                    {grantingVip === a.id ? "..." : vipResult[a.id] ?? "🎁 VIP + Convite"}
                  </button>

                  {/* Trocar senha */}
                  {changingPw === a.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        type="password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="Nova senha (min 6)"
                        style={{
                          width: 120, padding: "4px 8px", borderRadius: 6,
                          border: "0.5px solid var(--border-default)",
                          background: "var(--bg-secondary)", color: "var(--text-primary)",
                          fontSize: 11,
                        }}
                      />
                      <button
                        onClick={async () => {
                          if (newPw.length < 6) { setPwResult((p) => ({ ...p, [a.id]: "Min 6 chars" })); return; }
                          try {
                            const res = await fetch("/api/admin/admins/change-password", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ adminId: a.id, newPassword: newPw }),
                            });
                            const data = await res.json();
                            setPwResult((p) => ({ ...p, [a.id]: data.ok ? "Senha salva ✓" : data.error }));
                            if (data.ok) { setChangingPw(null); setNewPw(""); }
                          } catch (e) {
                            setPwResult((p) => ({ ...p, [a.id]: (e as Error).message }));
                          }
                        }}
                        style={{
                          padding: "4px 10px", borderRadius: 6, background: "var(--accent)",
                          color: "#fff", border: "none", fontSize: 10, fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => { setChangingPw(null); setNewPw(""); }}
                        style={{
                          padding: "4px 8px", borderRadius: 6, background: "var(--bg-secondary)",
                          color: "var(--text-muted)", border: "0.5px solid var(--border-default)",
                          fontSize: 10, cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setChangingPw(a.id)}
                      style={{
                        padding: "5px 12px", borderRadius: 8,
                        background: pwResult[a.id]?.includes("✓") ? "rgba(107,158,107,0.15)" : "var(--bg-secondary)",
                        color: pwResult[a.id]?.includes("✓") ? "#6B9E6B" : "var(--text-secondary)",
                        border: "0.5px solid var(--border-default)",
                        fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      {pwResult[a.id] ?? "🔑 Trocar senha"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
