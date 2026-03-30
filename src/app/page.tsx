// src/app/page.tsx — Homepage Master Longetividade
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Longetividade — Viva Mais, Viva Melhor",
  description: "Programas de saúde e longevidade baseados em ciência.",
};

interface Produto { id:string; titulo:string; subtitulo:string; badge:string; badgeColor:string; preco:string; precoOriginal?:string; descricao:string; beneficios:string[]; cta:string; href:string; disponivel:boolean; destaque?:boolean; bgClass:string; }

const produtos: Produto[] = [
  { id:"emagreca-sem-dieta", titulo:"Emagreça Sem Dieta", subtitulo:"O Método SEM", badge:"Mais Vendido", badgeColor:"emerald", preco:"R$ 27", precoOriginal:"R$ 97", descricao:"Perca peso de forma permanente sem passar fome e sem radicalismos.", beneficios:["Emagreça sem contar calorias","Método validado por nutricionistas","Resultados em 21 dias","Acesso vitalício"], cta:"Quero Emagrecer Agora", href:"/emagreca-sem-dieta", disponivel:true, destaque:true, bgClass:"from-emerald-950 to-teal-900" },
  { id:"sono-profundo", titulo:"Sono Profundo", subtitulo:"Durma como nunca dormiu", badge:"Em Breve", badgeColor:"violet", preco:"R$ 37", descricao:"Protocolo de 30 dias para restaurar seus ciclos de sono.", beneficios:["Cronobiologia aplicada","Sem remédios","Técnicas neurocientíficas"], cta:"Entrar na Lista VIP", href:"#lista-vip", disponivel:false, bgClass:"from-violet-950 to-indigo-900" },
  { id:"detox-mental", titulo:"Detox Mental", subtitulo:"Clareza para uma nova fase", badge:"Em Breve", badgeColor:"amber", preco:"R$ 47", descricao:"Limpe o ruído mental e desenvolva foco sustentável em 14 dias.", beneficios:["Redução de cortisol","Mindfulness","Diário estruturado"], cta:"Entrar na Lista VIP", href:"#lista-vip", disponivel:false, bgClass:"from-amber-950 to-orange-900" },
  { id:"jejum-inteligente", titulo:"Jejum Inteligente", subtitulo:"Autofagia & Longevidade", badge:"Em Breve", badgeColor:"rose", preco:"R$ 47", descricao:"Jejum intermitente baseado nos estudos do Nobel Ohsumi sobre autofagia.", beneficios:["Protocolos 16:8 e 18:6","Cardápio de quebra","Microbioma"], cta:"Entrar na Lista VIP", href:"#lista-vip", disponivel:false, bgClass:"from-rose-950 to-pink-900" },
  { id:"movimento-vital", titulo:"Movimento Vital", subtitulo:"Exercício que rejuvenesce", badge:"Em Breve", badgeColor:"cyan", preco:"R$ 57", descricao:"20 minutos por dia que ativam os hormônios da juventude.", beneficios:["Sem academia","Treinos progressivos","Ciência do movimento"], cta:"Entrar na Lista VIP", href:"#lista-vip", disponivel:false, bgClass:"from-cyan-950 to-sky-900" },
];

const badgeMap: Record<string,string> = { emerald:"bg-emerald-500/20 text-emerald-300 border-emerald-500/30", violet:"bg-violet-500/20 text-violet-300 border-violet-500/30", amber:"bg-amber-500/20 text-amber-300 border-amber-500/30", rose:"bg-rose-500/20 text-rose-300 border-rose-500/30", cyan:"bg-cyan-500/20 text-cyan-300 border-cyan-500/30" };

function ProdutoCard({ produto }: { produto: Produto }) {
  return (
    <Link href={produto.href} className={`group relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${produto.bgClass} border border-white/[0.06] transition-all duration-500 hover:border-white/[0.15] hover:scale-[1.015] hover:shadow-2xl ${produto.destaque?"md:col-span-2 min-h-[420px]":"min-h-[320px]"}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
      <div className="absolute top-5 right-5">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${badgeMap[produto.badgeColor]}`}>
          {produto.disponivel && <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>}
          {produto.badge}
        </span>
      </div>
      <div className={`flex flex-col gap-4 p-7 flex-1 ${produto.destaque?"md:flex-row md:items-center md:gap-12":""}`}>
        <div className={`flex flex-col gap-3 ${produto.destaque?"md:flex-1":""}`}>
          <p className="text-xs font-semibold tracking-widest uppercase text-white/40">{produto.subtitulo}</p>
          <h2 className={`font-bold text-white leading-tight ${produto.destaque?"text-3xl md:text-4xl":"text-2xl"}`}>{produto.titulo}</h2>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm">{produto.descricao}</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {produto.beneficios.map(b=>(
              <li key={b} className="flex items-start gap-2 text-xs text-white/70">
                <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className={`flex flex-col gap-3 ${produto.destaque?"md:items-start md:min-w-[220px]":"mt-auto"}`}>
          <div className="flex items-baseline gap-2">
            {produto.precoOriginal&&<span className="text-sm text-white/30 line-through">{produto.precoOriginal}</span>}
            <span className={`font-bold text-white ${produto.destaque?"text-4xl":"text-2xl"}`}>{produto.preco}</span>
          </div>
          <button className={`w-full rounded-xl font-semibold transition-all duration-200 ${produto.disponivel?"bg-white text-gray-950 hover:bg-white/90 active:scale-95":"bg-white/10 text-white/60 border border-white/10 cursor-default"} ${produto.destaque?"py-3.5 px-6 text-base":"py-3 px-4 text-sm"}`}>
            {produto.cta}{produto.disponivel&&" →"}
          </button>
          {produto.disponivel&&<p className="text-center text-xs text-white/30">Pagamento seguro · Acesso imediato</p>}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white antialiased">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500"><svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.6 2 4 4 4 6c0 3 4 8 4 8s4-5 4-8c0-2-1.6-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/></svg></div>
            <span className="text-sm font-bold tracking-tight">Longetividade</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#cursos" className="text-sm text-white/50 hover:text-white transition-colors">Programas</Link>
            <Link href="#depoimentos" className="text-sm text-white/50 hover:text-white transition-colors">Depoimentos</Link>
            <Link href="#lista-vip" className="text-sm text-white/50 hover:text-white transition-colors">Lista VIP</Link>
          </div>
          <Link href="/emagreca-sem-dieta" className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold hover:bg-emerald-400 transition-colors">Começar Agora</Link>
        </div>
      </nav>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl"/>
        </div>
        <div className="mb-6 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-xs font-medium text-emerald-300 tracking-wide">Ciência da Longevidade ao seu alcance</span>
        </div>
        <h1 className="max-w-3xl text-center text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl">
          Viva Mais.<br/>
          <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">Viva Melhor.</span>
        </h1>
        <p className="mt-6 max-w-xl text-center text-lg text-white/50 leading-relaxed">Programas baseados em ciência para transformar sua saúde, peso e energia.</p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/emagreca-sem-dieta" className="rounded-2xl bg-emerald-500 px-8 py-4 text-base font-bold hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/25">Ver Programas →</Link>
          <Link href="#depoimentos" className="rounded-2xl border border-white/10 px-8 py-4 text-base font-medium text-white/70 hover:border-white/20 hover:text-white transition-all">Ver Resultados</Link>
        </div>
      </section>
      <div className="border-y border-white/[0.06] bg-white/[0.02] py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-around gap-8 px-6">
          {[{n:"12.400+",l:"alunos ativos"},{n:"4.9",l:"avaliação média"},{n:"97%",l:"satisfação"},{n:"21 dias",l:"primeiros resultados"}].map(s=>(
            <div key={s.l} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold">{s.n}</span>
              <span className="text-xs text-white/40">{s.l}</span>
            </div>
          ))}
        </div>
      </div>
      <section id="cursos" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">Nossa coleção</p>
          <h2 className="text-4xl font-bold">Programas de Longevidade</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {produtos.filter(p=>p.destaque).map(p=><ProdutoCard key={p.id} produto={p}/>)}
          {produtos.filter(p=>!p.destaque).map(p=><ProdutoCard key={p.id} produto={p}/>)}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 md:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
              <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 className="mb-3 text-2xl font-bold">Garantia de 7 Dias</h3>
            <p className="text-white/60">Devolvemos 100% do seu dinheiro. Sem burocracia, sem perguntas.</p>
          </div>
        </div>
      </section>
      <section id="depoimentos" className="bg-white/[0.015] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/30">Resultados reais</p>
            <h2 className="text-4xl font-bold">Quem já transformou</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {n:"Ana Paula M.",l:"São Paulo, SP",t:"Perdi 8kg em 6 semanas sem passar fome. O método é completamente diferente de tudo que tentei antes."},
              {n:"Roberto F.",l:"Curitiba, PR",t:"Eu era cético, mas os resultados me convenceram. Minha disposição aumentou absurdamente."},
              {n:"Carla S.",l:"Rio de Janeiro, RJ",t:"Finalmente um método que faz sentido. Aprendi a me relacionar com a comida de forma diferente."},
              {n:"Marcos T.",l:"Belo Horizonte, MG",t:"3 tentativas anteriores fracassaram. Essa foi diferente porque ataca a causa raiz."},
              {n:"Juliana K.",l:"Porto Alegre, RS",t:"Comprei sem expectativa e fiquei surpresa. Conteúdo denso, prático e que funciona."},
              {n:"Diego L.",l:"Florianópolis, SC",t:"Melhor investimento que fiz na saúde. R$ 27 que mudaram minha relação com o corpo."},
            ].map(d=>(
              <div key={d.n} className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 hover:border-white/10 transition-colors">
                <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.2L8 10.5l-3.8 2 .7-4.2-3-2.9 4.2-.6z"/></svg>)}</div>
                <p className="text-sm text-white/70 leading-relaxed">"{d.t}"</p>
                <div className="mt-auto flex items-center gap-3 pt-3 border-t border-white/[0.05]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">{d.n.charAt(0)}</div>
                  <div><p className="text-sm font-medium text-white/80">{d.n}</p><p className="text-xs text-white/40">{d.l}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="lista-vip" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">Novos lançamentos</p>
          <h3 className="mb-4 text-3xl font-bold">Entre na Lista VIP</h3>
          <p className="mb-8 text-white/50">Seja o primeiro a saber dos novos programas com preço especial.</p>
          <form className="flex flex-col gap-3 sm:flex-row" action="/api/lista-vip" method="POST">
            <input type="email" name="email" required placeholder="seu@email.com" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder-white/30 focus:border-violet-500/50 focus:outline-none transition-all"/>
            <button type="submit" className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold hover:bg-violet-500 active:scale-95 transition-all whitespace-nowrap">Entrar na Lista</button>
          </form>
          <p className="mt-3 text-xs text-white/30">Sem spam. Apenas novidades que importam.</p>
        </div>
      </section>
      <footer className="border-t border-white/[0.05] py-10">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 px-6 md:flex-row md:justify-between">
          <span className="text-sm font-bold text-white/40">Longetividade</span>
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/privacidade" className="hover:text-white/60 transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white/60 transition-colors">Termos</Link>
            <Link href="mailto:contato@longetividade.com.br" className="hover:text-white/60 transition-colors">Contato</Link>
          </div>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} Longetividade.</p>
        </div>
      </footer>
    </div>
  );
}
