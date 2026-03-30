// src/app/emagreca-sem-dieta/page.tsx
"use client";
import Link from "next/link";

const LINKS = {
  hotmart: "https://pay.hotmart.com/H105141835Q",
  kiwify: "https://pay.kiwify.com.br/3fle7dM",
  principal: "https://pay.hotmart.com/H105141835Q",
};

export default function EmagrecaSemDietaPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white antialiased">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05] bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500">
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.6 2 4 4 4 6c0 3 4 8 4 8s4-5 4-8c0-2-1.6-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/></svg>
            </div>
            <span className="text-xs font-bold text-white/60">Longetividade</span>
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse"/>
            <span className="text-xs font-medium text-red-300">Oferta por tempo limitado — R$27</span>
          </div>
          <a href={LINKS.principal} target="_blank" rel="noopener noreferrer" className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold hover:bg-emerald-400 transition-colors">Comprar Agora</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-3xl"/>
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <span className="text-xs font-semibold text-emerald-300">❆ Mais de 12.000 alunos transformados</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            Emagreça <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Sem Dieta</span><br/>
            <span className="text-white/70">e Sem Passar Fome</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/50 leading-relaxed md:text-xl">
            O Método SEM transforma sua relação com a comida e derruba os 3 bloqueios invisíveis que sabotam seu emagrecimento.
          </p>
          <div className="flex flex-col items-center gap-4">
            <a href={LINKS.principal} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-10 py-5 text-xl font-bold hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl shadow-emerald-500/30">
              Quero Emagrecer Agora <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-white/30">Por apenas <strong className="text-white/60">R$27</strong> <span className="mx-2 text-white/20">·</span> <span className="line-through text-white/20">R$97</span></p>
              <div className="flex items-center gap-4 text-xs text-white/20">
                <span>🔒 Pagamento 100% Seguro</span><span>·</span><span>⚡ Acesso Imediato</span><span>·</span><span>✅ Garantia 7 Dias</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="bg-white/[0.02] py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[{n:"12.400+",l:"alunos"},{n:"4.9★",l:"avaliação"},{n:"97%",l:"satisfação"},{n:"21 dias",l:"resultados"}].map(s=>(
              <div key={s.l} className="flex flex-col items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <span className="text-2xl font-bold text-white">{s.n}</span>
                <span className="text-xs text-white/40">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÉTODO SEM */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">A metodologia</p>
            <h2 className="text-4xl font-bold">O Método SEM</h2>
            <p className="mt-3 text-white/40">Três pilares científicos que trabalham juntos para transformar seu corpo.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {s:"S",n:"Saciedade",c:"from-emerald-500/20 to-teal-500/10 border-emerald-500/20",d:"Aprenda a comer o suficiente sem contar calorias. Alimentos que nutrem e saciam por mais tempo."},
              {s:"E",n:"Equilíbrio",c:"from-cyan-500/20 to-blue-500/10 border-cyan-500/20",d:"Elimine a relação tóxica com a comida. Coma o que gosta sem culpa, com inteligência."},
              {s:"M",n:"Metabolismo",c:"from-violet-500/20 to-indigo-500/10 border-violet-500/20",d:"Ative o metabolismo com hábitos simples. Faça seu corpo trabalhar para você, não contra."},
            ].map(p=>(
              <div key={p.s} className={`flex flex-col gap-4 rounded-2xl border bg-gradient-to-br p-7 ${p.c}`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl font-black">{p.s}</div>
                <h3 className="text-xl font-bold">{p.n}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="bg-white/[0.02] py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">Resultados reais</p>
            <h2 className="text-4xl font-bold">Quem já transformou</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {nome:"Ana Paula M.",resultado:"-8kg em 6 semanas",texto:"Perdi 8kg em 6 semanas sem passar fome. O método é completamente diferente de tudo que tentei antes."},
              {nome:"Roberto F.",resultado:"-11kg em 3 meses",texto:"Era cético, mas os resultados me convenceram. Minha disposição aumentou absurdamente."},
              {nome:"Carla S.",resultado:"-6kg em 5 semanas",texto:"Finalmente um método que faz sentido. Não sinto mais culpa ao comer."},
            ].map(d=>(
              <div key={d.nome} className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
                <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><svg key={i} className="h-3.5 w-3.5 text-amber-400" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.2L8 10.5l-3.8 2 .7-4.2-3-2.9 4.2-.6z"/></svg>)}</div>
                <span className="inline-flex w-fit rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">{d.resultado}</span>
                <p className="text-sm text-white/60 leading-relaxed flex-1">"{d.texto}"</p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/[0.05]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">{d.nome.charAt(0)}</div>
                  <p className="text-sm font-medium text-white/70">{d.nome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="comprar" className="py-24 px-6">
        <div className="mx-auto max-w-lg text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">Investimento</p>
          <h2 className="mb-8 text-4xl font-bold">Comece Hoje</h2>
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-8 md:p-10">
            <div className="mb-2 inline-flex rounded-full bg-red-500/15 px-4 py-1.5 text-xs font-bold text-red-300">72% de desconto — Oferta por tempo limitado</div>
            <div className="my-6 flex items-baseline justify-center gap-3">
              <span className="text-lg text-white/30 line-through">R$97</span>
              <span className="text-6xl font-black">R$27</span>
            </div>
            <p className="mb-2 text-sm text-white/40">Ou 3x de R$9,90 sem juros</p>
            <a href={LINKS.principal} target="_blank" rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-5 text-lg font-bold hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-2xl shadow-emerald-500/30">
              Garantir Meu Acesso →
            </a>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-white/30">
              <span>🔒 SSL Seguro</span><span>💳 Cartão, Pix, Boleto</span><span>⚡ Acesso em 5 min</span>
            </div>
            <div className="mt-6 border-t border-white/[0.05] pt-6">
              <p className="mb-3 text-xs text-white/30">Disponível em:</p>
              <div className="flex justify-center gap-4">
                <a href={LINKS.hotmart} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/50 hover:border-white/20 hover:text-white/80 transition-all">Hotmart</a>
                <a href={LINKS.kiwify} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/50 hover:border-white/20 hover:text-white/80 transition-all">Kiwify</a>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-2xl">🛡️</div>
            <div>
              <p className="mb-1 font-semibold">Garantia Incondicional de 7 Dias</p>
              <p className="text-sm text-white/40">Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro. Sem burocracia, sem perguntas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white/[0.02] py-24 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Perguntas Frequentes</h2>
          <div className="flex flex-col gap-3">
            {[
              {q:"Para quem é o Emagreça Sem Dieta?",a:"Para qualquer pessoa que tentou dietas tradicionais e não obteve resultados permanentes. Não é necessário ser atleta ou ter experiência com alimentação saudável."},
              {q:"Em quanto tempo vejo resultados?",a:"A maioria dos alunos relata mudanças perceptíveis entre 2 e 3 semanas. Os resultados em peso variam de pessoa para pessoa."},
              {q:"É para quem tem restrições alimentares?",a:"Sim. O método é adaptável para vegetarianos, veganos, intolerantes à lactose e ao glúten."},
              {q:"Como acesso o material?",a:"Após a confirmação do pagamento (menos de 5 minutos), você recebe o link de acesso por e-mail. O ebook é em PDF."},
              {q:"E se eu não gostar?",a:"Você tem 7 dias para solicitar o reembolso total, sem precisar dar nenhuma explicação. Basta entrar em contato."},
            ].map(f=>(
              <details key={f.q} className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 cursor-pointer hover:border-white/10 transition-colors">
                <summary className="flex items-center justify-between gap-4 list-none text-sm font-semibold text-white/80 group-hover:text-white">
                  {f.q}<span className="text-white/30 group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="mt-4 text-sm text-white/50 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-b from-emerald-950/30 to-transparent py-24 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">Sua transformação começa hoje.</h2>
          <p className="mb-10 text-lg text-white/50">R$27 que podem mudar a sua relação com o corpo para sempre.</p>
          <a href={LINKS.principal} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-10 py-5 text-xl font-bold hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl shadow-emerald-500/30">
            Quero Começar Agora →
          </a>
          <p className="mt-4 text-sm text-white/30">Garantia de 7 dias · Acesso imediato · Pagamento 100% seguro</p>
        </div>
      </section>

      <footer className="border-t border-white/[0.05] py-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="text-xs font-bold text-white/30 hover:text-white/60 transition-colors">← Voltar para Longetividade</Link>
          <p className="text-xs text-white/10">© {new Date().getFullYear()} Longetividade. Este produto não garante resultados específicos. Resultados variam.</p>
        </div>
      </footer>
    </div>
  );
}// src/app/emagreca-sem-dieta/page.tsx
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
