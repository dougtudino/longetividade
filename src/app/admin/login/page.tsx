"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao autenticar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border-default)",
        }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-heading font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Longetividade
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Painel Administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha de admin"
              required
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "0.5px solid var(--border-default)",
              }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#C4787A" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
