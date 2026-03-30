"use client";
import { useState } from "react";

export default function LeadCapture({ source = "homepage" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, utm_source: source }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium text-emerald-300">Pronto! Voce esta na lista VIP.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        placeholder="Seu melhor email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-500/50 transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50"
      >
        {status === "loading" ? "Enviando..." : "Entrar na Lista VIP"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-400 sm:absolute sm:bottom-0">Erro ao cadastrar. Tente novamente.</p>
      )}
    </form>
  );
}
