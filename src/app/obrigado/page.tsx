// src/app/obrigado/page.tsx — Thank you page with upsell
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { trackPurchase } from "@/lib/tracking";
import LeadCapture from "@/components/LeadCapture";

export default function ObrigadoPage() {
  const [countdown, setCountdown] = useState(15 * 60); // 15 min

  useEffect(() => {
    trackPurchase("Emagreca Sem Dieta", 27);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="min-h-screen bg-[#080808] text-white antialiased">
      {/* NAV */}
      <nav className="border-b border-white/[0.05] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500">
              <span className="text-xs font-bold">L</span>
            </div>
            <span className="text-sm font-bold text-white/60">Longetividade</span>
          </Link>
        </div>
      </nav>

      {/* CONFIRMATION */}
      <section className="px-6 pt-16 pb-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/10">
            <svg className="h-10 w-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            Parabens pela sua decisao!
          </h1>
          <p className="text-lg text-white/50">
            Seu acesso ao <strong className="text-white/80">Emagreca Sem Dieta</strong> foi confirmado.
          </p>
        </div>
      </section>

      {/* STEPS */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8">
            <h2 className="mb-5 text-lg font-bold">Proximos passos:</h2>
            <div className="space-y-4">
              {[
                { n: "1", t: "Verifique seu email", d: "(inclusive a pasta de spam) — voce recebera o link de download em poucos minutos." },
                { n: "2", t: "Baixe o ebook", d: "e leia a Introducao e o Capitulo 1 hoje (15 minutos)." },
                { n: "3", t: "Imprima o checklist diario", d: "e cole na geladeira." },
                { n: "4", t: "Amanha, comece o Dia 1.", d: "Nao espere a segunda-feira." },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">
                    {s.n}
                  </span>
                  <p className="text-sm text-white/70 leading-relaxed">
                    <strong className="text-white/90">{s.t}</strong> {s.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* UPSELL — Proximo Produto */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-transparent p-6 md:p-8">
            {/* Timer */}
            {countdown > 0 && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-medium text-red-300">
                  Oferta especial expira em{" "}
                  <strong>
                    {mins}:{secs.toString().padStart(2, "0")}
                  </strong>
                </span>
              </div>
            )}

            <div className="mb-2 inline-flex rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-1">
              <span className="text-xs font-semibold text-violet-300">Em Breve</span>
            </div>
            <h3 className="mb-2 text-2xl font-bold">Sono Profundo</h3>
            <p className="mb-4 text-sm text-white/50 leading-relaxed">
              Protocolo de 30 dias para restaurar seus ciclos de sono. Cronobiologia aplicada, sem remedios, tecnicas neurocientificas.
            </p>
            <p className="mb-6 text-white/40 text-sm">
              Quem comprou o Emagreca Sem Dieta tera <strong className="text-violet-300">desconto exclusivo</strong> no lancamento.
            </p>

            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                Entre na lista VIP para garantir seu desconto:
              </p>
              <LeadCapture source="obrigado-upsell" />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] py-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="text-xs font-bold text-white/30 hover:text-white/60 transition-colors">
            &larr; Voltar para Longetividade
          </Link>
          <p className="text-xs text-white/15">
            Duvidas?{" "}
            <a href="mailto:contato@longetividade.com.br" className="text-white/30 underline">
              contato@longetividade.com.br
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
