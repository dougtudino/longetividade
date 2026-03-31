// src/app/jejum-inteligente/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import LeadCapture from "@/components/LeadCapture";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Jejum Inteligente — Autofagia & Longevidade | Longetividade",
  description:
    "Protocolo de jejum intermitente baseado nos estudos do Nobel Yoshinori Ohsumi sobre autofagia. Protocolos 16:8 e 18:6 adaptados para a vida real.",
};

const topicos = [
  {
    icon: "🔬",
    titulo: "Ciencia da Autofagia",
    desc: "Baseado nos estudos premiados com o Nobel de Medicina 2016. Entenda como o jejum ativa os mecanismos naturais de limpeza celular.",
  },
  {
    icon: "⏰",
    titulo: "Protocolos 16:8 e 18:6",
    desc: "Passo a passo para iniciar e progredir nos protocolos de jejum de forma segura, sem fadiga e sem perda de massa muscular.",
  },
  {
    icon: "🥗",
    titulo: "Cardapio de Quebra de Jejum",
    desc: "O que comer (e o que evitar) ao quebrar o jejum para maximizar os beneficios e evitar os erros que a maioria comete.",
  },
  {
    icon: "🦠",
    titulo: "Saude do Microbioma",
    desc: "Como o jejum intermitente beneficia seu microbioma intestinal e por que isso impacta seu peso, humor e imunidade.",
  },
];

export default function JejumInteligentePage() {
  return (
    <div className="themed min-h-screen antialiased">
      <nav
        className="fixed top-0 inset-x-0 z-50 border-b"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xs font-bold"
            style={{ color: "var(--text-muted)" }}
          >
            ← Longetividade
          </Link>
          <span
            className="hidden rounded-full border px-3 py-1 text-xs font-medium sm:inline"
            style={{
              borderColor: "rgba(251,113,133,0.3)",
              color: "rgb(251,113,133)",
              backgroundColor: "rgba(251,113,133,0.08)",
            }}
          >
            ⚡ Em Breve
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(251,113,133,0.05)" }}
          />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              borderColor: "rgba(251,113,133,0.3)",
              backgroundColor: "rgba(251,113,133,0.08)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-xs font-semibold text-rose-400">
              Lancamento em breve — Lista VIP aberta
            </span>
          </div>
          <h1
            className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            Jejum que Ativa{" "}
            <span className="text-rose-400">Longevidade</span>
          </h1>
          <p
            className="mx-auto mb-4 max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Protocolo de jejum intermitente baseado nos estudos do Premio Nobel
            de Medicina 2016 sobre autofagia. Perca gordura, melhore a saude
            celular e aumente sua longevidade — sem radicalismos.
          </p>
          <p
            className="mx-auto mb-8 max-w-xl text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <strong style={{ color: "var(--text-primary)" }}>Importante:</strong>{" "}
            Este programa complementa acompanhamento medico e nao e indicado
            para pessoas com diabetes, historico de transtornos alimentares ou
            gestantes sem orientacao profissional.
          </p>

          <div
            className="mx-auto max-w-md rounded-2xl border p-6"
            style={{
              borderColor: "rgba(251,113,133,0.2)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <p className="mb-2 font-bold text-rose-400">
              🎁 Lista VIP — Desconto de Lancamento
            </p>
            <p
              className="mb-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Seja o primeiro a acessar o programa com preco exclusivo.
            </p>
            <LeadCapture source="jejum-inteligente-vip" />
          </div>
        </div>
      </section>

      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--shimmer)" }}
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              O que o Jejum Inteligente vai te ensinar
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {topicos.map((t) => (
              <div
                key={t.titulo}
                className="flex gap-4 rounded-2xl border p-6"
                style={{
                  borderColor: "var(--border-default)",
                  backgroundColor: "var(--bg-card)",
                }}
              >
                <div className="text-3xl">{t.icon}</div>
                <div>
                  <h3
                    className="mb-2 font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.titulo}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="mx-auto max-w-md text-center">
          <h2
            className="mb-4 text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Entre na lista VIP
          </h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Preco de lancamento: R$47. Lista VIP garante desconto exclusivo.
          </p>
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "rgba(251,113,133,0.2)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <LeadCapture source="jejum-inteligente-vip-final" />
          </div>
        </div>
      </section>

      <footer
        className="border-t py-8 text-center"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-hint)" }}>
          © {new Date().getFullYear()} Longetividade. Este programa nao
          substitui acompanhamento medico ou nutricional profissional. Consulte
          um profissional de saude antes de iniciar qualquer protocolo de jejum.
        </p>
      </footer>
    </div>
  );
}
