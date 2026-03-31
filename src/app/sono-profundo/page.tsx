// src/app/sono-profundo/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import LeadCapture from "@/components/LeadCapture";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Sono Profundo — Protocolo de Cronobiologia | Longetividade",
  description:
    "Restaure seus ciclos de sono naturalmente em 30 dias. Sem remedios, sem hacks — so ciencia aplicada. Entre na lista VIP para ser o primeiro a saber do lancamento.",
};

const topicos = [
  {
    icon: "🌙",
    titulo: "Cronobiologia Aplicada",
    desc: "Entenda seu ritmo circadiano e como sincroniza-lo com luz, temperatura e alimentacao para sono profundo natural.",
  },
  {
    icon: "🧠",
    titulo: "Neurociencia do Sono",
    desc: "Descubra o que acontece no seu cerebro durante o sono e por que as fases REM e NREM sao fundamentais para saude.",
  },
  {
    icon: "😴",
    titulo: "Protocolo de 30 Dias",
    desc: "Um passo a passo gradual para recalibrar seu sono sem depender de medicamentos ou suplementos caros.",
  },
  {
    icon: "⚡",
    titulo: "Energia Transformada",
    desc: "Acordar descansada, com clareza mental e energia para o dia inteiro — sem cafeina em excesso.",
  },
];

const problemas = [
  "Voce leva mais de 30 minutos pra conseguir dormir",
  "Acorda varias vezes durante a noite",
  "Nao se sente descansada mesmo dormindo 8 horas",
  "Fica com sono durante o dia mas nao consegue dormir a noite",
  "Ja tentou melatonina e outros suplementos sem resultado permanente",
  "Usa o celular ate tarde e sabe que isso atrapalha mas nao consegue parar",
];

export default function SonoProfundoPage() {
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
              borderColor: "rgba(167,139,250,0.3)",
              color: "rgb(167,139,250)",
              backgroundColor: "rgba(167,139,250,0.08)",
            }}
          >
            🌙 Em Breve
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
            style={{ backgroundColor: "rgba(167,139,250,0.06)" }}
          />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              borderColor: "rgba(167,139,250,0.3)",
              backgroundColor: "rgba(167,139,250,0.08)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-semibold text-violet-400">
              Lancamento em breve — Lista VIP aberta
            </span>
          </div>
          <h1
            className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            Durma Como Nunca{" "}
            <span className="text-violet-400">Dormiu</span>
          </h1>
          <p
            className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Protocolo de 30 dias baseado em cronobiologia para restaurar seus
            ciclos de sono naturalmente. Sem remedios, sem hacks caros — so
            ciencia aplicada a sua rotina.
          </p>

          {/* EARLY ACCESS */}
          <div
            className="mx-auto max-w-md rounded-2xl border p-6"
            style={{
              borderColor: "rgba(167,139,250,0.2)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <p
              className="mb-2 font-bold text-violet-400"
            >
              🎁 Seja o primeiro a saber
            </p>
            <p
              className="mb-4 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Quem esta na lista VIP recebe acesso antecipado com{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                desconto exclusivo de lancamento.
              </strong>
            </p>
            <LeadCapture source="sono-profundo-vip" />
            <p className="mt-2 text-xs" style={{ color: "var(--text-hint)" }}>
              Sem spam. So novidades sobre o Sono Profundo.
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
            Voce se identifica com algum desses problemas?
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
                      borderColor: "rgba(167,139,250,0.3)",
                      backgroundColor: "rgba(167,139,250,0.08)",
                    }}
                  >
                    <div className="h-2 w-2 rounded-sm bg-violet-400" />
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
            <p
              className="mt-5 font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              O Sono Profundo foi desenvolvido especificamente para resolver
              esses problemas — sem solucoes temporarias.
            </p>
          </div>
        </div>
      </section>

      {/* O QUE VOCE VAI APRENDER */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              O que o protocolo vai transformar
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
            Nao perca o lancamento
          </h2>
          <p
            className="mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Preco de lancamento exclusivo para quem esta na lista VIP. Vagas
            limitadas na primeira turma.
          </p>
          <div
            className="rounded-2xl border p-6"
            style={{
              borderColor: "rgba(167,139,250,0.2)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <p
              className="mb-1 text-sm font-bold text-violet-400"
            >
              Preco previsto: R$37
            </p>
            <p
              className="mb-4 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              Lista VIP garante desconto especial de lancamento
            </p>
            <LeadCapture source="sono-profundo-vip-final" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t py-8 text-center"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-hint)" }}>
          © {new Date().getFullYear()} Longetividade. Este produto nao
          substitui acompanhamento medico profissional.
        </p>
      </footer>
    </div>
  );
}
