// src/app/detox-mental/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import LeadCapture from "@/components/LeadCapture";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Detox Mental — Clareza e Foco em 14 Dias | Longetividade",
  description:
    "Limpe o ruido mental e desenvolva foco sustentavel em 14 dias. Reducao de cortisol, mindfulness pratico e diario estruturado para uma mente mais clara.",
};

const topicos = [
  {
    icon: "🧘",
    titulo: "Reducao de Cortisol",
    desc: "Tecnicas baseadas em neurociencia para reduzir o cortisol cronico que drena sua energia e prejudica sua saude.",
  },
  {
    icon: "🎯",
    titulo: "Foco Sustentavel",
    desc: "Aprenda a treinar sua atencao para trabalhar em blocos produtivos sem o cansaco mental que vem depois.",
  },
  {
    icon: "📓",
    titulo: "Diario Estruturado",
    desc: "Um metodo de journaling cientifico que organiza pensamentos, reduz ansiedade e aumenta clareza mental diariamente.",
  },
  {
    icon: "💆",
    titulo: "Mindfulness Pratico",
    desc: "Sem meditacao de 1 hora. Tecnicas de 5 minutos que voce usa em qualquer lugar, mesmo no meio da correria.",
  },
];

const problemas = [
  "Voce se sente constantemente sobrecarregada mentalmente",
  "Tem dificuldade de focar por mais de 10 minutos em uma tarefa",
  "Sua mente fica acelerada quando tenta relaxar",
  "Voce dorme mas acorda ja cansada, como se nao tivesse descansado",
  "Sente ansiedade sem um motivo especifico",
  "Procrastina nao por preguica, mas porque parece que nao tem energia mental",
];

export default function DetoxMentalPage() {
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
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xs font-bold transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            ← Longetividade
          </Link>
          <span
            className="hidden rounded-full border px-3 py-1 text-xs font-medium sm:inline"
            style={{
              borderColor: "rgba(251,191,36,0.3)",
              color: "rgb(251,191,36)",
              backgroundColor: "rgba(251,191,36,0.08)",
            }}
          >
            🧠 Em Breve
          </span>
          <ThemeToggle />
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div
            className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(251,191,36,0.05)" }}
          />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              borderColor: "rgba(251,191,36,0.3)",
              backgroundColor: "rgba(251,191,36,0.08)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400">
              Lancamento em breve — Lista VIP aberta
            </span>
          </div>
          <h1
            className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            Clareza Mental em{" "}
            <span className="text-amber-400">14 Dias</span>
          </h1>
          <p
            className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Limpe o ruido mental, reduza o cortisol cronico e desenvolva foco
            sustentavel. Um protocolo pratico para quem nao tem tempo para
            meditar 1 hora por dia — mas precisa urgentemente de mais clareza.
          </p>

          <div
            className="mx-auto max-w-md rounded-2xl border p-6"
            style={{
              borderColor: "rgba(251,191,36,0.2)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <p className="mb-2 font-bold text-amber-400">
              🎁 Acesso antecipado com desconto
            </p>
            <p
              className="mb-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Lista VIP recebe preco de lancamento exclusivo e acesso
              prioritario ao programa.
            </p>
            <LeadCapture source="detox-mental-vip" />
            <p className="mt-2 text-xs" style={{ color: "var(--text-hint)" }}>
              Sem spam. So novidades sobre o Detox Mental.
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEMAS */}
      <section
        className="py-16 px-6"
        style={{ backgroundColor: "var(--shimmer)" }}
      >
        <div className="mx-auto max-w-2xl">
          <h2
            className="mb-8 text-center text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Voce reconhece algum desses sinais de sobrecarga mental?
          </h2>
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "var(--border-default)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <ul className="space-y-3">
              {problemas.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border"
                    style={{
                      borderColor: "rgba(251,191,36,0.3)",
                      backgroundColor: "rgba(251,191,36,0.08)",
                    }}
                  >
                    <div className="h-2 w-2 rounded-sm bg-amber-400" />
                  </div>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TOPICOS */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              O que o Detox Mental vai transformar
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

      {/* CTA FINAL */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: "var(--shimmer)" }}
      >
        <div className="mx-auto max-w-md text-center">
          <h2
            className="mb-4 text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Garanta seu lugar na lista VIP
          </h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Preco de lancamento exclusivo. Vagas limitadas na primeira turma.
          </p>
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "rgba(251,191,36,0.2)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <p className="mb-1 text-sm font-bold text-amber-400">
              Preco previsto: R$47
            </p>
            <p
              className="mb-4 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Lista VIP garante desconto especial de lancamento
            </p>
            <LeadCapture source="detox-mental-vip-final" />
          </div>
        </div>
      </section>

      <footer
        className="border-t py-8 text-center"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-hint)" }}>
          © {new Date().getFullYear()} Longetividade. Este produto nao
          substitui acompanhamento medico ou psicologico profissional.
        </p>
      </footer>
    </div>
  );
}
