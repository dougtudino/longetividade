// src/app/movimento-vital/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import LeadCapture from "@/components/LeadCapture";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Movimento Vital — Exercício que Rejuvenesce | Longetividade",
  description:
    "20 minutos por dia que ativam os hormônios da juventude. Sem academia, sem equipamentos. Ciência do movimento funcional para qualquer rotina.",
};

const topicos = [
  {
    icon: "💪",
    titulo: "Movimento Funcional",
    desc: "Exercícios baseados em padrões naturais de movimento que fortalecem, rejuvenescem e cabem em 20 minutos do seu dia.",
  },
  {
    icon: "🔬",
    titulo: "Ciência dos Hormônios",
    desc: "Entenda como o movimento certo ativa GH, testosterona e BDNF — os hormônios da juventude, força e clareza mental.",
  },
  {
    icon: "📈",
    titulo: "Progressão Inteligente",
    desc: "Protocolo progressivo que se adapta ao seu nível atual. Do iniciante ao avançado, sem risco de lesão.",
  },
  {
    icon: "🏠",
    titulo: "Sem Academia",
    desc: "Tudo o que você precisa é 20 minutos e espaço para um tapete de yoga. Sem equipamentos, sem horário fixo.",
  },
];

const resultados = [
  "Mais energia ao longo do dia — sem café extra",
  "Melhora na postura e redução de dores crônicas",
  "Aumento na massa muscular sem hipertrofia excessiva",
  "Melhora na qualidade do sono",
  "Humor e clareza mental visivelmente melhores",
  "Corpo mais firme e funcional em qualquer idade",
];

export default function MovimentoVitalPage() {
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
              borderColor: "rgba(34,211,238,0.3)",
              color: "rgb(34,211,238)",
              backgroundColor: "rgba(34,211,238,0.08)",
            }}
          >
            💪 Em Breve
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 pb-16 pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(34,211,238,0.05)" }}
          />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              borderColor: "rgba(34,211,238,0.3)",
              backgroundColor: "rgba(34,211,238,0.08)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-400">
              Lançamento em breve — Lista VIP aberta
            </span>
          </div>
          <h1
            className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            Mova-se.{" "}
            <span className="text-cyan-400">Rejuvenesce.</span>
          </h1>
          <p
            className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            20 minutos por dia que ativam os hormônios da juventude e
            transformam seu corpo — sem academia, sem equipamentos e sem
            horário fixo. Ciência do movimento funcional para qualquer rotina.
          </p>

          <div
            className="mx-auto max-w-md rounded-2xl border p-6"
            style={{
              borderColor: "rgba(34,211,238,0.2)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <p className="mb-2 font-bold text-cyan-400">
              🎁 Entre na Lista VIP
            </p>
            <p
              className="mb-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Preço de lançamento exclusivo para quem está na lista.
              Acesso prioritário à primeira turma.
            </p>
            <LeadCapture source="movimento-vital-vip" />
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
              O que 20 minutos certos podem fazer
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

      <section className="py-16 px-6">
        <div className="mx-auto max-w-2xl">
          <h2
            className="mb-8 text-center text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Resultados que você vai sentir
          </h2>
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "var(--border-default)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <ul className="space-y-3">
              {resultados.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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

      <section
        className="py-20 px-6"
        style={{ backgroundColor: "var(--shimmer)" }}
      >
        <div className="mx-auto max-w-md text-center">
          <h2
            className="mb-4 text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Reserve seu lugar
          </h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Preço de lançamento: R$57. Lista VIP garante desconto exclusivo.
          </p>
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "rgba(34,211,238,0.2)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <LeadCapture source="movimento-vital-vip-final" />
          </div>
        </div>
      </section>

      <footer
        className="border-t py-8 text-center"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-hint)" }}>
          © {new Date().getFullYear()} Longetividade. Consulte um profissional
          de saúde antes de iniciar qualquer programa de exercícios, especialmente
          se tiver condições médicas preexistentes.
        </p>
      </footer>
    </div>
  );
}
