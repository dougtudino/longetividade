// src/app/obrigado/page.tsx — Thank you page with upsell
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { trackPurchase } from "@/lib/tracking";
import LeadCapture from "@/components/LeadCapture";
import { getPlanById } from "@/config/plans";

type PlanId = "basico" | "completo" | "vip";

export default function ObrigadoPage() {
  const [countdown, setCountdown] = useState(15 * 60); // 15 min
  const [plan, setPlan] = useState<PlanId>("basico");

  useEffect(() => {
    // Hotmart pode passar ?plan=basico|completo|vip ou ?transaction=...
    // Detecta plano pelo query param e dispara Purchase com valor canonical
    // (fonte unica em src/config/plans.ts).
    const params = new URLSearchParams(window.location.search);
    const planParam = (params.get("plan") || "").toLowerCase();
    const resolved: PlanId =
      planParam === "vip" || planParam === "completo" || planParam === "basico"
        ? planParam
        : "basico";
    setPlan(resolved);
    const info = getPlanById(resolved);
    if (info) {
      trackPurchase(`Metodo S.E.M — ${info.name}`, info.price);
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2D2D] antialiased">
      {/* NAV */}
      <nav className="border-b border-[#7A9E7E]/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7A9E7E]">
              <span className="text-xs font-bold text-white">L</span>
            </div>
            <span className="text-sm font-bold text-[#2D2D2D]/60">Longetividade</span>
          </Link>
        </div>
      </nav>

      {/* CONFIRMATION */}
      <section className="px-6 pt-16 pb-12">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#7A9E7E]/30 bg-[#7A9E7E]/10">
            <svg className="h-10 w-10 text-[#7A9E7E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            Parabéns pela sua decisão!
          </h1>
          <p className="text-lg text-[#2D2D2D]/50">
            Seu acesso ao <strong className="text-[#2D2D2D]/80">Emagreça Sem Dieta</strong> foi confirmado.
          </p>
        </div>
      </section>

      {/* VIP — Acesso ao App */}
      {plan === "vip" && (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-lg">
            <div className="rounded-2xl border border-[#639922]/30 bg-gradient-to-b from-[#639922]/10 to-transparent p-6 md:p-8 text-center">
              <div className="mb-2 inline-flex rounded-full bg-[#639922]/20 px-3 py-1">
                <span className="text-xs font-bold text-[#3D5A3E]">PLANO VIP</span>
              </div>
              <h2 className="mb-2 text-xl font-bold">Seu app vitalicio esta liberado</h2>
              <p className="mb-5 text-sm text-[#2D2D2D]/60 leading-relaxed">
                Acesse o App de Acompanhamento usando o mesmo email da compra.
              </p>
              <Link
                href="/app/login"
                className="inline-block rounded-xl px-6 py-3.5 text-base font-bold text-white"
                style={{ backgroundColor: "#639922" }}
              >
                Acessar meu App VIP
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* STEPS */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-[#7A9E7E]/15 bg-white p-6 md:p-8">
            <h2 className="mb-5 text-lg font-bold">Próximos passos:</h2>
            <div className="space-y-4">
              {[
                { n: "1", t: "Verifique seu email", d: "(inclusive a pasta de spam) — você receberá o link de download em poucos minutos." },
                { n: "2", t: "Baixe o ebook", d: "e leia a Introdução e o Capítulo 1 hoje (15 minutos)." },
                { n: "3", t: "Imprima o checklist diário", d: "e cole na geladeira." },
                { n: "4", t: "Amanhã, comece o Dia 1.", d: "Não espere a segunda-feira." },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7A9E7E]/20 text-sm font-bold text-[#3D5A3E]">
                    {s.n}
                  </span>
                  <p className="text-sm text-[#2D2D2D]/70 leading-relaxed">
                    <strong className="text-[#2D2D2D]/90">{s.t}</strong> {s.d}
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
          <div className="rounded-2xl border border-[#D4A94B]/20 bg-gradient-to-b from-[#D4A94B]/10 to-transparent p-6 md:p-8">
            {/* Timer */}
            {countdown > 0 && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-medium text-red-500">
                  Oferta especial expira em{" "}
                  <strong>
                    {mins}:{secs.toString().padStart(2, "0")}
                  </strong>
                </span>
              </div>
            )}

            <div className="mb-2 inline-flex rounded-full bg-[#D4A94B]/20 border border-[#D4A94B]/30 px-3 py-1">
              <span className="text-xs font-semibold text-[#8B7332]">Em Breve</span>
            </div>
            <h3 className="mb-2 text-2xl font-bold">Sono Profundo</h3>
            <p className="mb-4 text-sm text-[#2D2D2D]/50 leading-relaxed">
              Protocolo de 30 dias para restaurar seus ciclos de sono. Cronobiologia aplicada, sem remédios, técnicas neurocientíficas.
            </p>
            <p className="mb-6 text-[#2D2D2D]/40 text-sm">
              Quem comprou o Emagreça Sem Dieta terá <strong className="text-[#3D5A3E]">desconto exclusivo</strong> no lançamento.
            </p>

            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-[#2D2D2D]/40 uppercase tracking-wider">
                Entre na lista VIP para garantir seu desconto:
              </p>
              <LeadCapture source="obrigado-upsell" />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#7A9E7E]/10 py-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="text-xs font-bold text-[#2D2D2D]/30 hover:text-[#2D2D2D]/60 transition-colors">
            &larr; Voltar para Longetividade
          </Link>
          <p className="text-xs text-[#2D2D2D]/30">
            Dúvidas?{" "}
            <a href="mailto:contato@longetividade.com.br" className="text-[#2D2D2D]/40 underline">
              contato@longetividade.com.br
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
