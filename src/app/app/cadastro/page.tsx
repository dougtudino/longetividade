"use client";
import { useState } from "react";
import Link from "next/link";

export default function AppCadastro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Senhas nao coincidem");
      return;
    }
    if (password.length < 6) {
      setError("Senha precisa ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.ok) {
        window.location.href = "/app";
      } else {
        setError(data.reason || "Erro ao criar conta.");
      }
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white"
          style={{ background: "linear-gradient(135deg, #639922 0%, #3D5A3E 100%)" }}
        >
          21
        </div>
        <h1 className="text-xl font-bold text-gray-900">Criar sua conta</h1>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Use o email da sua compra VIP e crie uma senha para acessar mais rápido na próxima vez.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email da sua compra
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none transition-colors focus:border-[#639922] focus:ring-2 focus:ring-[#639922]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Senha (min 6 caracteres)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="pelo menos 6 caracteres"
            required
            minLength={6}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none transition-colors focus:border-[#639922] focus:ring-2 focus:ring-[#639922]/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirmar senha
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="digite novamente"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none transition-colors focus:border-[#639922] focus:ring-2 focus:ring-[#639922]/20"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-base font-bold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: "#639922" }}
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-500">Ja tem conta? </span>
          <Link href="/app/login" className="font-semibold text-[#639922]">
            Entrar
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400">
          Precisa ter comprado o plano VIP no Hotmart. A gente verifica pelo email.
        </p>
      </form>
    </div>
  );
}
