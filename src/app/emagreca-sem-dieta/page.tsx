// src/app/emagreca-sem-dieta/page.tsx
"use client";
import Link from "next/link";

const LINKS = {
  hotmart: "https://pay.hotmart.com/SEU_LINK_AQUI",
  kiwify: "https://kiwify.com.br/SEU_LINK_AQUI",
  principal: "https://pay.hotmart.com/SEU_LINK_AQUI",
};

export default function EmagrecaSemDietaPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white antialiased">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05] bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-bold text-white/60">Longetividade</span>
          </Link>
          <a href={LINKS.principal} target="_blank" rel="noopener noreferrer" className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold hover:bg-emerald-400 transition-colors">Comprar Agora</a>
        </div>
      </nav>
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Emagreça <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Sem Dieta</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/50">O Método SEM transforma sua relação com a comida.</p>
          <a href={LINKS.principal} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-10 py-5 text-xl font-bold hover:bg-emerald-400 transition-all">
            Quero Emagrecer Agora →
          </a>
          <p className="mt-4 text-sm text-white/30">R$27 (de R$97) — Garantia de 7 dias</p>
        </div>
      </section>
      <section className="bg-white/[0.02] py-24 px-6">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="mb-8 text-4xl font-bold">Comprar Agora</h2>
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-10">
            <div className="my-6 flex items-baseline justify-center gap-3">
              <span className="text-lg text-white/30 line-through">R$97</span>
              <span className="text-6xl font-black">R$27</span>
            </div>
            <a href={LINKS.principal} target="_blank" rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 py-5 text-lg font-bold hover:bg-emerald-400 transition-all">
              Garantir Meu Acesso →
            </a>
            <div className="mt-6 flex justify-center gap-4">
              <a href={LINKS.hotmart} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50 hover:text-white transition-all">Hotmart</a>
              <a href={LINKS.kiwify} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50 hover:text-white transition-all">Kiwify</a>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/[0.06] p-6 text-left">
            <span className="text-2xl">🛡️</span>
            <div><p className="font-semibold">Garantia de 7 Dias</p><p className="text-sm text-white/40">100% do dinheiro de volta, sem perguntas.</p></div>
          </div>
        </div>
      </section>
      <footer className="border-t border-white/[0.05] py-8 text-center">
        <Link href="/" className="text-xs text-white/30 hover:text-white/60">Voltar para Longetividade</Link>
      </footer>
    </div>
  );
}
