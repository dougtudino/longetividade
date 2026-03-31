// src/app/page.tsx — Homepage Master Longetividade
import type { Metadata } from "next";
import Link from "next/link";
import LeadCapture from "@/components/LeadCapture";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Longetividade — Viva Mais, Viva Melhor",
  description:
    "Programas de saude e longevidade baseados em ciencia. Metodos e protocolos para transformar seu peso, sono e energia.",
};

interface Produto {
  id: string;
  titulo: string;
  subtitulo: string;
  badge: string;
  badgeEmoji: string;
  preco: string;
  precoOriginal?: string;
  descricao: string;
  beneficios: string[];
  cta: string;
  href: string;
  disponivel: boolean;
  destaque?: boolean;
  gradientDark: string;
  gradientLight: string;
  accentColor: string;
}

const produtos: Produto[] = [
  {
    id: "emagreca-sem-dieta",
    titulo: "Emagreca Sem Dieta",
    subtitulo: "Metodo S.E.M",
    badge: "Mais Vendido",
    badgeEmoji: "🔥",
    preco: "R$ 27",
    precoOriginal: "R$ 97",
    descricao:
      "Perca peso de forma permanente sem passar fome, sem contar calorias e sem radicalismos. Um metodo que funciona na sua vida real.",
    beneficios: [
      "Sem dietas restritivas ou alimentos proibidos",
      "Metodo validado — resultados em 21 dias",
      "Plano de 7 dias + cardapio completo incluso",
      "Garantia incondicional de 7 dias",
    ],
    cta: "Quero Emagrecer Agora",
    href: "/emagreca-sem-dieta",
    disponivel: true,
    destaque: true,
    gradientDark: "from-emerald-950 to-teal-900",
    gradientLight: "from-emerald-50 to-teal-50",
    accentColor: "emerald",
  },
  {
    id: "sono-profundo",
    titulo: "Sono Profundo",
    subtitulo: "Cronobiologia Aplicada",
    badge: "Em Breve",
    badgeEmoji: "🌙",
    preco: "R$ 37",
    descricao:
      "Protocolo de 30 dias para restaurar seus ciclos de sono naturalmente. Sem remedios, sem hacks — so ciencia aplicada.",
    beneficios: [
      "Cronobiologia e ritmo circadiano",
      "Tecnicas neurocientificas comprovadas",
      "Protocolo step-by-step de 30 dias",
    ],
    cta: "Entrar na Lista VIP",
    href: "/sono-profundo",
    disponivel: false,
    gradientDark: "from-violet-950 to-indigo-900",
    gradientLight: "from-violet-50 to-indigo-50",
    accentColor: "violet",
  },
  {
    id: "detox-mental",
    titulo: "Detox Mental",
    subtitulo: "Clareza e Foco",
    badge: "Em Breve",
    badgeEmoji: "🧠",
    preco: "R$ 47",
    descricao:
      "Limpe o ruido mental e desenvolva foco sustentavel em 14 dias. Menos cortisol, mais clareza, mais resultado.",
    beneficios: [
      "Reducao de cortisol e ansiedade",
      "Mindfulness pratico para rotinas ocupadas",
      "Diario estruturado de transformacao",
    ],
    cta: "Entrar na Lista VIP",
    href: "/detox-mental",
    disponivel: false,
    gradientDark: "from-amber-950 to-orange-900",
    gradientLight: "from-amber-50 to-orange-50",
    accentColor: "amber",
  },
  {
    id: "jejum-inteligente",
    titulo: "Jejum Inteligente",
    subtitulo: "Autofagia & Longevidade",
    badge: "Em Breve",
    badgeEmoji: "⚡",
    preco: "R$ 47",
    descricao:
      "Jejum intermitente baseado nos estudos do Nobel Ohsumi sobre autofagia. Protocolos seguros e adaptados a vida real.",
    beneficios: [
      "Protocolos 16:8 e 18:6 passo a passo",
      "Cardapio de quebra de jejum",
      "Saude do microbioma intestinal",
    ],
    cta: "Entrar na Lista VIP",
    href: "/jejum-inteligente",
    disponivel: false,
    gradientDark: "from-rose-950 to-pink-900",
    gradientLight: "from-rose-50 to-pink-50",
    accentColor: "rose",
  },
  {
    id: "movimento-vital",
    titulo: "Movimento Vital",
    subtitulo: "Exercicio que Rejuvenesce",
    badge: "Em Breve",
    badgeEmoji: "💪",
    preco: "R$ 57",
    descricao:
      "20 minutos por dia que ativam os hormonios da juventude. Sem academia, sem equipamentos, sem horario fixo.",
    beneficios: [
      "Treinos progressivos sem academia",
      "Ciencia do movimento funcional",
      "Ativa GH e outros hormonios anabolicos",
    ],
    cta: "Entrar na Lista VIP",
    href: "/movimento-vital",
    disponivel: false,
    gradientDark: "from-cyan-950 to-sky-900",
    gradientLight: "from-cyan-50 to-sky-50",
    accentColor: "cyan",
  },
];

const depoimentos = [
  {
    nome: "Ana Paula M.",
    local: "Sao Paulo, SP",
    texto:
      "Perdi 8kg em 6 semanas sem passar fome. O metodo e completamente diferente de tudo que tentei antes. Pela primeira vez nao me sinto culpada por comer.",
    resultado: "-8kg",
  },
  {
    nome: "Fernanda R.",
    local: "Curitiba, PR",
    texto:
      "Eu achava que o problema era eu. Falta de disciplina. O S.E.M me mostrou que era a estrategia. Em 3 semanas ja sentia diferenca na roupa.",
    resultado: "-6kg",
  },
  {
    nome: "Carla S.",
    local: "Rio de Janeiro, RJ",
    texto:
      "Finalmente um metodo que faz sentido. Aprendi a me relacionar com a comida de forma diferente. Nao sinto mais aquela compulsao noturna.",
    resultado: "-11kg",
  },
  {
    nome: "Patricia L.",
    local: "Belo Horizonte, MG",
    texto:
      "3 tentativas anteriores fracassaram. Essa foi diferente porque ataca a causa raiz, nao so o cardapio. Em 2 meses transformei minha relacao com a comida.",
    resultado: "-9kg",
  },
  {
    nome: "Juliana K.",
    local: "Porto Alegre, RS",
    texto:
      "Comprei sem expectativa e fiquei surpresa. Conteudo denso, pratico e que funciona. O plano de 7 dias ja vale cada centavo.",
    resultado: "-7kg",
  },
  {
    nome: "Marina T.",
    local: "Florianopolis, SC",
    texto:
      "Melhor investimento que fiz na saude. R$ 27 que mudaram minha relacao com o corpo. Minha autoestima voltou.",
    resultado: "-5kg",
  },
];

export default function HomePage() {
  return (
    <div className="themed min-h-screen antialiased">
      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2C5.6 2 4 4 4 6c0 3 4 8 4 8s4-5 4-8c0-2-1.6-4-4-4zm0 5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span
              className="text-sm font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Longetividade
            </span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="#cursos"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              Programas
            </Link>
            <Link
              href="#depoimentos"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              Depoimentos
            </Link>
            <Link
              href="#lista-vip"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              Lista VIP
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/emagreca-sem-dieta"
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Comecar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-14">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div
            className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--accent-soft)" }}
          />
        </div>
        <div className="relative flex flex-col items-center text-center">
          <div
            className="mb-6 flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              borderColor: "var(--border-default)",
              backgroundColor: "var(--accent-soft)",
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "var(--accent)" }}
            />
            <span
              className="text-xs font-medium tracking-wide"
              style={{ color: "var(--accent-text)" }}
            >
              Ciencia da Longevidade ao seu alcance
            </span>
          </div>
          <h1
            className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl"
            style={{ color: "var(--text-primary)" }}
          >
            Viva Mais.
            <br />
            <span style={{ color: "var(--accent)" }}>Viva Melhor.</span>
          </h1>
          <p
            className="mt-6 max-w-xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Programas baseados em ciencia para transformar sua saude, peso e
            energia. Metodos que funcionam na vida real.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/emagreca-sem-dieta"
              className="rounded-2xl px-8 py-4 text-base font-bold text-white transition-all active:scale-95"
              style={{
                backgroundColor: "var(--accent)",
                boxShadow: "0 8px 32px var(--accent-soft)",
              }}
            >
              Ver Programas →
            </Link>
            <Link
              href="#depoimentos"
              className="rounded-2xl border px-8 py-4 text-base font-medium transition-all"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              Ver Resultados
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div
        className="border-y py-6"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--shimmer)",
        }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-around gap-8 px-6">
          {[
            { n: "12.400+", l: "alunos ativos" },
            { n: "4.9 ★", l: "avaliacao media" },
            { n: "97%", l: "satisfacao" },
            { n: "21 dias", l: "primeiros resultados" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center gap-1">
              <span
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {s.n}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {s.l}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CURSOS */}
      <section id="cursos" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Nossa colecao
          </p>
          <h2
            className="text-4xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Programas de Longevidade
          </h2>
          <p
            className="mt-3 max-w-lg mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Cada programa foi desenvolvido para uma area especifica da saude,
            com metodos praticos e resultados mensuráveis.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured card — spans 2 cols */}
          {produtos
            .filter((p) => p.destaque)
            .map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01] md:col-span-2 lg:col-span-2"
                style={{
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--border-hover), transparent)",
                  }}
                />
                <div className="absolute top-5 right-5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold"
                    style={{
                      borderColor: "var(--border-default)",
                      backgroundColor: "var(--accent-soft)",
                      color: "var(--accent-text)",
                    }}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                    {p.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-4 p-7 flex-1 md:flex-row md:items-center md:gap-12">
                  <div className="flex flex-col gap-3 md:flex-1">
                    <p
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {p.badgeEmoji} {p.subtitulo}
                    </p>
                    <h2
                      className="text-3xl font-bold leading-tight md:text-4xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {p.titulo}
                    </h2>
                    <p
                      className="text-sm leading-relaxed max-w-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {p.descricao}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {p.beneficios.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-2 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <svg
                            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                            style={{ color: "var(--accent)" }}
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3 md:items-start md:min-w-[220px]">
                    <div className="flex items-baseline gap-2">
                      {p.precoOriginal && (
                        <span
                          className="text-sm line-through"
                          style={{ color: "var(--text-hint)" }}
                        >
                          {p.precoOriginal}
                        </span>
                      )}
                      <span
                        className="text-4xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.preco}
                      </span>
                    </div>
                    <button
                      className="w-full rounded-xl py-3.5 px-6 text-base font-semibold text-white transition-all duration-200 active:scale-95"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {p.cta} →
                    </button>
                    <p
                      className="text-center text-xs"
                      style={{ color: "var(--text-hint)" }}
                    >
                      Pagamento seguro · Acesso imediato
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          {/* Other cards */}
          {produtos
            .filter((p) => !p.destaque)
            .map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01]"
                style={{
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-card)",
                  minHeight: "300px",
                }}
              >
                <div className="absolute top-5 right-5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                    style={{
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {p.badgeEmoji} {p.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-3 p-7 flex-1">
                  <p
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {p.subtitulo}
                  </p>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {p.titulo}
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {p.descricao}
                  </p>
                  <ul className="flex flex-col gap-1.5 mt-1">
                    {p.beneficios.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <svg
                          className="mt-0.5 h-3 w-3 flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3 mt-auto pt-4">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {p.preco}
                      </span>
                    </div>
                    <button
                      className="w-full rounded-xl border py-3 px-4 text-sm font-medium transition-all"
                      style={{
                        borderColor: "var(--border-default)",
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--shimmer)",
                      }}
                    >
                      {p.cta}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* GARANTIA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="rounded-2xl border p-8 md:p-12"
            style={{
              borderColor: "var(--border-default)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border"
              style={{
                borderColor: "var(--border-default)",
                backgroundColor: "var(--accent-soft)",
              }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: "var(--accent)" }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              className="mb-3 text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Garantia Incondicional de 7 Dias
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              Devolvemos 100% do seu dinheiro. Sem burocracia, sem perguntas.
              O risco e todo nosso.
            </p>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section
        id="depoimentos"
        className="py-24"
        style={{ backgroundColor: "var(--shimmer)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Resultados reais
            </p>
            <h2
              className="text-4xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Quem ja transformou
            </h2>
            <p
              className="mt-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Mais de 12.400 pessoas ja usaram o Metodo S.E.M para emagrecer sem sofrimento.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {depoimentos.map((d) => (
              <div
                key={d.nome}
                className="flex flex-col gap-4 rounded-2xl border p-6 transition-colors"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 text-amber-400"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.2L8 10.5l-3.8 2 .7-4.2-3-2.9 4.2-.6z" />
                      </svg>
                    ))}
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor: "var(--accent-soft)",
                      color: "var(--accent-text)",
                    }}
                  >
                    {d.resultado}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed flex-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  &ldquo;{d.texto}&rdquo;
                </p>
                <div
                  className="mt-auto flex items-center gap-3 pt-3 border-t"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: "var(--accent-soft)",
                      color: "var(--accent-text)",
                    }}
                  >
                    {d.nome.charAt(0)}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {d.nome}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {d.local}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LISTA VIP */}
      <section id="lista-vip" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent-text)" }}
          >
            Novos lancamentos
          </p>
          <h3
            className="mb-4 text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Entre na Lista VIP
          </h3>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Seja o primeiro a saber dos novos programas com desconto exclusivo
            para quem esta na lista.
          </p>
          <LeadCapture source="homepage-vip" />
          <p className="mt-3 text-xs" style={{ color: "var(--text-hint)" }}>
            Sem spam. Apenas novidades que importam.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t py-10"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 px-6 md:flex-row md:justify-between">
          <span
            className="text-sm font-bold"
            style={{ color: "var(--text-muted)" }}
          >
            Longetividade
          </span>
          <div className="flex gap-6 text-xs" style={{ color: "var(--text-hint)" }}>
            <Link
              href="/privacidade"
              className="transition-colors hover:opacity-70"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="transition-colors hover:opacity-70"
            >
              Termos
            </Link>
            <Link
              href="mailto:contato@longetividade.com.br"
              className="transition-colors hover:opacity-70"
            >
              Contato
            </Link>
          </div>
          <p className="text-xs" style={{ color: "var(--text-hint)" }}>
            © {new Date().getFullYear()} Longetividade.
          </p>
        </div>
      </footer>
    </div>
  );
}
