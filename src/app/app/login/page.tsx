"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AppLogin() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/app/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.ok) {
        router.push("/app");
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
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white"
          style={{ backgroundColor: "#639922" }}
        >
          L
        </div>
        <h1 className="text-xl font-bold text-gray-900">Longetividade</h1>
        <p className="text-sm text-gray-500">App de Acompanhamento — Metodo S.E.M</p>
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

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-base font-bold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: "#639922" }}
        >
          {loading ? "Verificando..." : "Acessar meu app"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Use o mesmo email que voce usou na compra do plano VIP.
        </p>
      </form>
    </div>
  );
}
