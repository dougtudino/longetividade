"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { APP_BRAND } from "@/config/app-brand";

export default function AppLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Se redirect veio com erro do OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get("error");
    if (errParam) {
      setError(decodeURIComponent(errParam).replace(/google_/g, "Google: "));
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/app/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: showPassword ? password : undefined }),
      });
      const data = await res.json();

      if (data.ok) {
        window.location.href = "/app";
      } else if (data.requiresPassword) {
        setShowPassword(true);
        setError("Sua conta tem senha configurada. Digite abaixo.");
      } else {
        setError(data.reason || "Erro ao acessar. Tente novamente.");
      }
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white"
          style={{ background: "linear-gradient(135deg, #639922 0%, #3D5A3E 100%)" }}
        >
          21
        </div>
        <h1 className="text-2xl font-black text-gray-900">{APP_BRAND.name}</h1>
        <p className="text-sm text-gray-500">{APP_BRAND.tagline}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{APP_BRAND.by}</p>
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

        {showPassword && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="sua senha"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none transition-colors focus:border-[#639922] focus:ring-2 focus:ring-[#639922]/20"
            />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-base font-bold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: "#639922" }}
        >
          {loading ? "Verificando..." : "Acessar meu app"}
        </button>

        {/* Google OAuth — usa <button> com window.location.assign pra
            evitar problemas de evento de <a> dentro de <form> em alguns
            browsers/PWAs. Tambem mostra estado "Conectando..." imediato
            pra usuario saber que o click registrou. */}
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setError("");
            // Navigation imperativa — evita interferencia do form pai
            window.location.assign("/api/auth/google/start?context=app");
          }}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
          </svg>
          {loading ? "Conectando ao Google..." : "Continuar com Google"}
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-500">Nao tem senha? </span>
          <Link href="/app/cadastro" className="font-semibold text-[#639922]">
            Criar senha
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400">
          Use o mesmo email que voce usou na compra do plano VIP.
        </p>
      </form>

      {/* Demo access — visivel so para admin */}
      <div className="mt-8 border-t border-gray-100 pt-6 w-full max-w-sm">
        <button
          onClick={async () => {
            setLoading(true);
            const res = await fetch("/api/app/demo-login", { method: "POST" });
            const data = await res.json();
            if (data.ok) {
              window.location.href = "/app";
            } else {
              setError(data.error ?? "Falha ao criar acesso admin.");
            }
            setLoading(false);
          }}
          disabled={loading}
          className="w-full rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 transition-colors hover:border-[#639922] hover:text-[#639922] disabled:opacity-60"
        >
          {loading ? "Criando..." : "Entrar como Admin (apenas para admins logados)"}
        </button>
      </div>
    </div>
  );
}
