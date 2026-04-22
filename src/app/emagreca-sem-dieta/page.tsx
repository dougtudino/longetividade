// src/app/emagreca-sem-dieta/page.tsx — Página de vendas completa
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackViewContent, trackInitiateCheckout, trackAddToCart } from "@/lib/tracking";
import { captureUTMs } from "@/lib/utm";
import ThemeToggle from "@/components/ThemeToggle";
import { IdentificationChecklist } from "@/components/landing/identification-checklist";
import { MockupEbookCover } from "@/components/mockups/mockup-ebook-cover";
import { MockupPhoneTela } from "@/components/mockups/mockup-phone-tela";
import { MockupEbookSpread } from "@/components/mockups/mockup-ebook-spread";
import { PricingSection } from "@/components/landing/pricing-section";
import { LifestyleBlock } from "@/components/landing/lifestyle-block";
import { SocialProofBlock } from "@/components/landing/social-proof-block";
import { TransformationBlock } from "@/components/landing/transformation-block";
import { InlineCTA } from "@/components/landing/inline-cta";
import { AutoraSection } from "@/components/landing/autora-section";
import { MetodoComparativo } from "@/components/landing/metodo-comparativo";
import { StickyBottomCTA } from "@/components/landing/sticky-bottom-cta";
import { BadgeResultado } from "@/components/visual";
import Image from "next/image";
import LeadCapture from "@/components/LeadCapture";
import { useLpAssets } from "@/lib/useLpAssets";

// Fallbacks estáticos. Quando houver LpAsset avatar.<name> no DB, useLpAssets
// sobrescreve via resolveAsset(). Isso deixa deploy zero-downtime.
const AVATAR_FALLBACK_MAP: Record<string, string> = {
  fernanda: "/images/avatar-fernanda.png",
  camila: "/images/avatar-camila.png",
  patricia: "/images/avatar-patricia.jpg",
  ana: "/images/avatar-ana.jpg",
  carla: "/images/avatar-carla.jpg",
  juliana: "/images/avatar-juliana.png",
  marina: "/images/avatar-marina.jpg",
};

const LINKS = {
  hotmart: "https://pay.hotmart.com/H105141835Q?src=pagina-vendas",
  kiwify: "https://pay.kiwify.com.br/3fle7dM",
};

// Nova aba (target_blank) — a aba original mantém o fbq vivo pra
// terminar o send, então não precisa de setTimeout aqui.
function handleBuyClick() {
  trackInitiateCheckout("Método S.E.M", 37);
  trackAddToCart("Método S.E.M", 37);
}

const bullets = [
  {
    cat: "Alimentação sem restrição",
    items: [
      "Como montar refeições que ajudam a emagrecer sem pesar nada, contar caloria ou seguir cardápio complicado",
      "O alimento 'saudável' que pode estar sabotando seu emagrecimento sem você desconfiar (página 23)",
      "Como cozinhar UMA refeição pra família inteira e ainda emagrecer — sem fazer comida separada",
      "Por que 'comer menos' é exatamente o que está impedindo você de emagrecer — e o que fazer em vez disso",
      "Por que você NÃO precisa eliminar carboidrato, açúcar ou glúten pra perder peso de forma saudável",
    ],
  },
  {
    cat: "Controle emocional",
    items: [
      "Como controlar a fome da noite sem força de vontade — usando uma técnica simples de 3 minutos",
      "Como parar de comer por ansiedade sem se privar dos alimentos que você gosta",
      "O pilar que 99% dos programas de emagrecimento ignoram — e sem ele, nenhuma dieta sustenta",
      "A razão real pela qual você sente fome descontrolada a partir das 17h — e o ajuste simples que resolve",
    ],
  },
  {
    cat: "Movimento prático",
    items: [
      "Como encaixar movimento no seu dia sem pisar numa academia e sem acordar as 5h da manhã",
      "O tipo de movimento que queima mais gordura que 1 hora de esteira — e você já faz sem perceber",
      "15 minutos por dia: a rotina mínima de movimento que funciona pra quem não tem tempo pra mais nada",
    ],
  },
  {
    cat: "Verdades que mudam tudo",
    items: [
      "Por que a força de vontade NÃO é o fator que separa quem emagrece de quem não emagrece — e qual é",
      "Por que mulheres acima de 30 tem MAIS dificuldade com dietas tradicionais — e a abordagem que funciona",
      "A razão científica pela qual dietas restritivas fazem você ENGORDAR a médio prazo",
      "Os 3 sinais que realmente indicam progresso (e nenhum deles é o número na balança)",
    ],
  },
];

const bonuses = [
  {
    icon: "✅",
    titulo: "Checklist Diário Imprimível",
    desc: "Imprima, cole na geladeira e siga todos os dias. Nos dias que você não quiser pensar, é só seguir a lista.",
    valor: "R$ 19,90",
  },
  {
    icon: "🔄",
    titulo: "Tabela de Substituições Alimentares",
    desc: "Não gosta de brócolis? Troque. Não come peixe? Troque. Flexibilidade total pra adaptar ao SEU gosto.",
    valor: "R$ 14,90",
  },
  {
    icon: "⚡",
    titulo: "10 Atalhos que Quem Emagrece Usa Todo Dia",
    desc: "Ajustes pequenos que aceleram seus resultados sem esforço extra. Nenhum exige dinheiro ou força de vontade.",
    valor: "R$ 24,90",
  },
  {
    icon: "🛒",
    titulo: "Lista de Compras Estratégica",
    desc: "Chegue no mercado, siga a lista, gaste 20 minutos e saia com tudo que precisa pra semana inteira.",
    valor: "R$ 9,90",
  },
];

const faq = [
  {
    q: "Já comprei outros ebooks e não funcionaram. Por que esse seria diferente?",
    a: "A maioria dos ebooks de emagrecimento foca só em alimentação — te dá um cardápio e pronto. O Método S.E.M é diferente porque trabalha os 3 pilares que realmente importam: como você come, como você se sente e como você se move. Não adianta ter o cardápio perfeito se você come por ansiedade. O S.E.M trata isso.",
  },
  {
    q: "Não tenho tempo pra ler.",
    a: "O ebook tem 20-30 páginas de leitura direta e objetiva. Dá pra ler em 1 hora. E a aplicação leva 5 minutos por dia. Foi feito pra quem não tem tempo — inclusive pra ler.",
  },
  {
    q: "Funciona pra quem tem mais de 35 anos?",
    a: "Sim. Na verdade, o Método S.E.M é especialmente eficaz para mulheres acima de 30, porque não depende de metabolismo acelerado ou treinos intensos. Ele trabalha com hábitos simples que funcionam em qualquer fase da vida.",
  },
  {
    q: "Preciso ir na academia?",
    a: "Não. O Pilar 3 (Movimento) é baseado em movimento integrado a rotina: caminhar, subir escada, brincar com os filhos. 15 minutos por dia, sem sair de casa, sem trocar de roupa.",
  },
  {
    q: "Isso é mais uma dieta disfarçada?",
    a: "Não. Zero restrição alimentar. Zero alimento proibido. Zero contagem de calorias. O Método S.E.M te ensina a comer com inteligência, não com restrição. Você vai comer chocolate, pão, arroz — e emagrecer.",
  },
  {
    q: "E se não funcionar pra mim?",
    a: "Você tem 7 dias de garantia incondicional. Se não gostar, não sentir valor ou simplesmente mudar de ideia, é só pedir o reembolso. Devolvemos 100% sem perguntas.",
  },
  {
    q: "Esse ebook substitui nutricionista?",
    a: "Não. O ebook é um guia prático de hábitos alimentares, emocionais e de movimento. Se você tem condições médicas específicas, continue com seu profissional de saúde. O ebook complementa qualquer acompanhamento.",
  },
  {
    q: "Como recebo o ebook?",
    a: "Imediatamente após a confirmação do pagamento, você recebe o link de acesso por email. O download é instantâneo. Você pode ler no celular, tablet ou computador.",
  },
];

const depoimentos = [
  {
    nome: "Ana Paula M.",
    local: "São Paulo, SP",
    resultado: "-8kg em 6 semanas",
    texto:
      "Perdi 8kg em 6 semanas sem passar fome. O método é completamente diferente de tudo que tentei antes. Pela primeira vez não me sinto culpada por comer.",
  },
  {
    nome: "Fernanda R.",
    local: "Curitiba, PR",
    resultado: "-6kg em 3 semanas",
    texto:
      "Eu achava que o problema era eu. Falta de disciplina. O S.E.M me mostrou que era a estratégia. Em 3 semanas já sentia diferença na roupa.",
  },
  {
    nome: "Carla S.",
    local: "Rio de Janeiro, RJ",
    resultado: "-11kg em 3 meses",
    texto:
      "Finalmente um método que faz sentido. Aprendi a me relacionar com a comida de forma diferente. Não sinto mais aquela compulsão noturna.",
  },
];

// mode="scroll" → scroll âncora pra #pricing (usado no Hero; usuário vê pricing + VIP antes de decidir)
// mode="checkout" → abre Hotmart direto em nova aba + dispara InitiateCheckout + AddToCart (usado no CTA Final)
function CTA({
  label = "Garantir Meu Acesso — R$37",
  ctaKey = "hero-primary",
  mode = "checkout",
}: {
  label?: string;
  ctaKey?: "hero-primary" | "final-primary" | string;
  mode?: "scroll" | "checkout";
}) {
  const isScroll = mode === "scroll";
  const commonClasses =
    "group inline-flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl py-5 text-lg font-bold text-white transition-all active:scale-[0.98]";
  const commonStyle: React.CSSProperties = {
    backgroundColor: "var(--accent)",
    boxShadow: "0 8px 32px var(--accent-soft)",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {isScroll ? (
        <a href="#pricing" data-cta={ctaKey} className={commonClasses} style={commonStyle}>
          {label}{" "}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      ) : (
        <a
          href={LINKS.hotmart}
          onClick={handleBuyClick}
          data-cta={ctaKey}
          target="_blank"
          rel="noopener noreferrer"
          className={commonClasses}
          style={commonStyle}
        >
          {label}{" "}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      )}
      <div className="flex flex-wrap justify-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
        <span>🔒 Pagamento 100% seguro</span>
        <span>·</span>
        <span>📲 Acesso imediato</span>
        <span>·</span>
        <span>🛡️ Garantia 7 dias</span>
      </div>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
      <svg
        className="mt-0.5 h-4 w-4 flex-shrink-0"
        style={{ color: "var(--accent)" }}
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
      {text}
    </li>
  );
}

export default function EmagrecaSemDietaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { resolveAsset } = useLpAssets("emagreca-sem-dieta");

  // Resolve avatar de depoimento: tenta avatar.<firstName> no DB, fallback estático.
  function avatarSrc(nome: string): string | null {
    const firstName = nome.split(" ")[0].toLowerCase();
    const fallback = AVATAR_FALLBACK_MAP[firstName];
    if (!fallback) return null;
    return resolveAsset(`avatar.${firstName}`, fallback);
  }

  useEffect(() => {
    // Captura UTMs da URL e persiste em localStorage para anexar ao link do Hotmart
    if (typeof window !== "undefined") {
      captureUTMs(new URLSearchParams(window.location.search));
    }
    trackViewContent("Emagreca Sem Dieta", 37);
  }, []);

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
            className="flex items-center gap-2"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="flex h-7 w-5 items-center justify-center rounded-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #7A9E7E, #FAF8F5)', boxShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
              <span className="text-[5px] font-bold text-white leading-none" style={{ fontFamily: 'Playfair Display, serif' }}>S.E.M</span>
            </div>
            <span className="text-xs font-bold">Longetividade</span>
          </Link>
          <div
            className="hidden items-center gap-2 rounded-full border px-4 py-1.5 sm:flex"
            style={{
              borderColor: "rgba(239,68,68,0.3)",
              backgroundColor: "rgba(239,68,68,0.08)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-medium text-red-400">
              Oferta por tempo limitado — R$37
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={LINKS.hotmart}
              onClick={handleBuyClick}
              data-cta="nav-primary"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-colors"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Comprar Agora
            </a>
          </div>
        </div>
      </nav>

      {/* HERO — full-width, 90vh, high-conversion */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--accent-soft) 100%)",
        }}
      >
        {/* Glow decorativo bottom-left */}
        <div
          className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_1.15fr] lg:grid-cols-[1fr_1.2fr] md:min-h-[90vh]">
          {/* ═══ LEFT — texto + CTA (desktop first, mobile second) ═══ */}
          <div className="order-2 md:order-1 flex flex-col justify-center px-5 sm:px-8 md:px-10 lg:px-16 pt-8 pb-12 md:py-16">
            <div className="max-w-[560px] mx-auto md:mx-0 w-full">
              {/* Urgency pill — warm tone, premium */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 mb-4 text-xs font-bold"
                style={{
                  background: "rgba(196, 120, 122, 0.12)",
                  border: "1px solid rgba(196, 120, 122, 0.3)",
                  color: "#C4787A",
                }}
              >
                🔥 Oferta por tempo limitado — R$37
              </div>

              {/* Social proof pill — soft green */}
              <div
                className="block mb-6 text-xs font-semibold"
              >
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent-text)",
                    boxShadow: "0 2px 8px -2px var(--accent-soft)",
                  }}
                >
                  ✨ +12.400 mulheres transformadas
                </span>
              </div>

              {/* Headline */}
              <h1
                className="mb-4 text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold leading-[1.04] tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Você não precisa de mais uma dieta.
              </h1>

              {/* Subheadline forte */}
              <p
                className="mb-5 text-lg md:text-xl leading-snug"
                style={{ color: "var(--text-secondary)" }}
              >
                Você precisa de um <strong style={{ color: "var(--text-primary)" }}>método simples</strong> que funcione na sua vida real —{" "}
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>sem culpa, sem restrição e sem recomeçar toda segunda.</span>
              </p>

              {/* Subheadline curto (deliverables) */}
              <p
                className="mb-7 text-sm md:text-base font-semibold"
                style={{ color: "var(--accent-text)" }}
              >
                Plano prático de 7 dias · lista de compras · rotina fácil de seguir
              </p>

              {/* Price block */}
              <div className="mb-6">
                <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                  De <span className="line-through">R$97</span> por apenas
                </p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    className="text-6xl md:text-7xl font-black leading-none tracking-tight"
                    style={{ color: "var(--accent)" }}
                  >
                    R$37
                  </span>
                  <span className="text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
                    ou 3x de R$ 12,33
                  </span>
                </div>
              </div>

              {/* CTA grande — direto scroll #pricing */}
              <a
                href="#pricing"
                data-cta="hero-primary"
                className="group inline-flex items-center justify-center gap-3 rounded-2xl py-5 px-8 text-lg md:text-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                style={{
                  background: "linear-gradient(145deg, var(--accent), var(--accent-hover))",
                  boxShadow:
                    "0 12px 40px -8px var(--accent-soft), 0 6px 16px -4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                Quero começar sem dieta
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>

              {/* Secondary proof */}
              <div className="mt-5 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 text-base" aria-hidden="true">★★★★★</span>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>4.9</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>avaliação real</span>
                </div>
                <div className="h-4 w-px" style={{ background: "var(--border-default)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>+12.400 alunas</span>
                <div className="h-4 w-px" style={{ background: "var(--border-default)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>🛡️ Garantia 7 dias</span>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT — imagem dominante (desktop second, mobile first) ═══
              Altura fixa (~60vh mobile, 90vh desktop) pra manter o hero compacto.
              object-position "center top" prioriza o rosto no crop inevitavel
              (imagem 3:4 num container de aspect diferente vai sempre ter algum corte). */}
          <div className="order-1 md:order-2 relative h-[60vh] min-h-[460px] md:h-auto md:min-h-[90vh]">
            <Image
              src={resolveAsset("hero.woman", "/images/hero-woman2.png")}
              alt="Mulher sorridente e saudável com suco verde — resultado do Método S.E.M"
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-cover"
              priority
              unoptimized
              style={{ objectPosition: "center top" }}
            />

            {/* Overlay gradient leve na imagem pra legibilidade no mobile */}
            <div
              className="pointer-events-none absolute inset-0 md:hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15) 100%)",
              }}
              aria-hidden="true"
            />

            {/* Floating badge topo-direito: "-4kg em 21 dias" */}
            <div
              className="absolute top-20 md:top-24 right-4 md:right-8 rounded-full px-4 py-2 backdrop-blur-md z-10"
              style={{
                background: "rgba(255,255,255,0.92)",
                boxShadow: "0 8px 28px -6px rgba(0,0,0,0.2), 0 3px 10px -2px rgba(0,0,0,0.08)",
              }}
            >
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                -4kg em 21 dias
              </span>
            </div>

            {/* Badge secundária bottom-left imagem: "Sem dieta. Sem culpa." */}
            <div
              className="absolute bottom-6 left-4 md:bottom-10 md:left-8 rounded-full px-4 py-2 backdrop-blur-md z-10"
              style={{
                background: "rgba(255,255,255,0.85)",
                boxShadow: "0 8px 28px -6px rgba(0,0,0,0.2)",
              }}
            >
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                ✨ Sem dieta. Sem culpa.
              </span>
            </div>

            {/* Phone mockup overlap — bottom-right, premium */}
            <div
              className="absolute bottom-6 right-4 md:bottom-10 md:right-8 w-[120px] md:w-[150px] z-20"
              style={{ transform: "rotate(-4deg)" }}
            >
              <div
                className="relative rounded-[24px] p-[4px]"
                style={{
                  background: "linear-gradient(160deg, #1a1a1a, #2d2d2d 40%, #0f0f0f)",
                  boxShadow:
                    "0 24px 48px -10px rgba(0,0,0,0.5), 0 8px 18px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
                }}
              >
                <div
                  className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[38%] h-[3px] rounded-full z-10"
                  style={{ background: "#0a0a0a" }}
                  aria-hidden="true"
                />
                <Image
                  src={resolveAsset("hero.phone", "/images/ebook-phone.jpg")}
                  alt="Ebook Método S.E.M no celular"
                  width={150}
                  height={200}
                  className="w-full h-auto rounded-[20px] object-cover block"
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-[4px] rounded-[20px]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 100%)",
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 1 — LIFESTYLE ("Sem dieta. Na vida real.") */}
      <LifestyleBlock />

      {/* STATS */}
      <div className="border-y py-8" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-around gap-6 px-6">
          {[
            { n: "12.400+", l: "alunas" },
            { n: "4.9 ★", l: "avaliação" },
            { n: "97%", l: "satisfação" },
            { n: "21 dias", l: "resultados" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{s.n}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LEAD STORY */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-3xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
            Sabe aquele momento em que você abre o guarda-roupa de manhã...
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <p>
              Você pega aquela calça jeans que cabia perfeitamente há 2 anos. Tenta vestir. Não fecha.
              Então você respira fundo, guarda de volta e pega a mesma legging preta de sempre. E sai
              de casa fingindo que está tudo bem.
            </p>
            <p>
              Mas não está tudo bem. Porque enquanto você dirige pro trabalho, cuida das crianças,
              resolve problema dos outros o dia inteiro... tem uma voz lá no fundo repetindo:{" "}
              <em>&ldquo;Você precisava cuidar de você. Mas quando? Como? Se você já tentou de tudo e
              nada funcionou?&rdquo;</em>
            </p>
            <p>
              E aí chega a noite, você está exausta, e o único conforto que aparece é aquele pacote
              de bolacha. E você come. E depois sente culpa. E promete: &ldquo;Segunda eu começo de novo.&rdquo;
            </p>
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Se você se reconheceu nessas linhas, preciso te dizer uma coisa importante:{" "}
              <span style={{ color: "var(--accent)" }}>o problema nunca foi você.</span>
            </p>
            <p>
              Nunca foi falta de disciplina, de força de vontade ou de comprometimento. O problema foi
              o método. Ou melhor — a falta de um método que funcione pra quem vive na vida real.
            </p>
          </div>
          <InlineCTA ctaKey="emotional-primary" label="Quero sair desse ciclo" size="md" />
        </div>
      </section>

      {/* IDENTIFICAÇÃO — componente interativo com barra de progresso e contador */}
      <IdentificationChecklist />

      {/* PROBLEMA NÃO É VOCÊ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Por que nada funcionou até agora (e por que NÃO é culpa sua)
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <p>
              Se dietas funcionassem de verdade, a indústria de emagrecimento não faturaria bilhões
              todo ano. Se o produto resolvesse o problema, você não precisaria voltar. Mas você
              volta. E volta. E volta.
            </p>
            <div
              className="rounded-xl border-l-4 p-4"
              style={{ borderColor: "var(--accent)", backgroundColor: "var(--accent-soft)" }}
            >
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Pesquisas mostram que mais de 93% das pessoas que fazem dieta restritiva recuperam
                todo o peso em até 2 anos. Muitas recuperam com juros.
              </p>
            </div>
            <p>
              Porque dietas restritivas trabalham CONTRA o seu corpo. Elas criam privação. Privação
              gera compulsão. Compulsão gera culpa. Culpa gera mais restrição. E o ciclo não para nunca.
            </p>
            <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              O problema nunca foi disciplina. Foi estratégia.
            </p>
            <p>
              Você não precisa de mais força de vontade. Você precisa de um método que trabalhe COM
              o seu corpo, COM a sua rotina e COM as suas emoções. Não contra elas.
            </p>
          </div>
        </div>
      </section>

      {/* AUTORIDADE — sobre a autora do método */}
      <AutoraSection lpSlug="emagreca-sem-dieta" />

      {/* MÉTODO S.E.M */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>A metodologia</p>
            <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>Conheça o Método S.E.M</h2>
            <p className="mt-3 text-lg" style={{ color: "var(--text-secondary)" }}>Simplicidade. Equilíbrio. Movimento.</p>
            <p className="mt-2 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Não é mais uma dieta. É um sistema de 3 pilares que funcionam juntos pra criar um
              emagrecimento que dura — sem sofrimento, sem privação e que cabe na sua rotina real.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                letra: "S",
                nome: "Simplicidade",
                emoji: "🥗",
                subtitle: "Na nutrição",
                desc: "Refeições que ajudam a emagrecer sem pesar comida, sem contar caloria e sem eliminar nada do prato.",
                bullets: [
                  "Montar prato sem pesar",
                  "Sem alimento proibido",
                  "Cardápio 7 dias pronto",
                ],
              },
              {
                letra: "E",
                nome: "Equilíbrio",
                emoji: "💛",
                subtitle: "No emocional",
                desc: "O pilar que ninguém fala. Por que come sem fome, por que a ansiedade dispara à noite — e o que fazer.",
                bullets: [
                  "Fome real × emocional",
                  "Técnica de 3 minutos",
                  "Sem força de vontade",
                ],
              },
              {
                letra: "M",
                nome: "Movimento",
                emoji: "🌿",
                subtitle: "Na rotina",
                desc: "Movimento integrado ao dia em 15 minutos. Sem academia, sem sair de casa, sem trocar de roupa.",
                bullets: [
                  "15 min/dia em casa",
                  "Queima mais que esteira",
                  "Melhora o humor no ato",
                ],
              },
            ].map((p) => (
              <div
                key={p.letra}
                className="group flex flex-col gap-3 rounded-2xl border p-6 transition-all hover:-translate-y-1"
                style={{
                  borderColor: "var(--border-default)",
                  background: "linear-gradient(155deg, var(--bg-card), var(--shimmer))",
                  boxShadow: "0 4px 14px -4px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-md transition-transform group-hover:scale-105"
                    style={{
                      background: "linear-gradient(145deg, var(--accent), var(--accent-hover))",
                      boxShadow: "0 6px 16px -4px var(--accent-soft)",
                    }}
                  >
                    {p.letra}
                  </div>
                  <div className="text-3xl opacity-80" aria-hidden="true">{p.emoji}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    {p.subtitle}
                  </p>
                  <h3 className="mt-0.5 text-xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                    {p.nome}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.desc}</p>
                <ul className="mt-1 space-y-1.5 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }}>✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="mt-8 rounded-xl border p-5 text-center"
            style={{ borderColor: "var(--border-default)", backgroundColor: "var(--accent-soft)" }}
          >
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Enquanto dietas tratam só a alimentação, o Método S.E.M trata você por inteiro: corpo,
              mente e rotina.{" "}
              <span style={{ color: "var(--accent)" }}>Esse é o diferencial.</span>
            </p>
          </div>
        </div>
      </section>

      {/* O QUE VOCÊ VAI APRENDER — highlights + accordion */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Conteúdo do ebook
            </p>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Dentro do ebook, você vai descobrir:
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {bullets.map((section) => {
              const highlights = section.items.slice(0, 2);
              const rest = section.items.slice(2);
              return (
                <div
                  key={section.cat}
                  className="group rounded-2xl border p-6 transition-all hover:border-[var(--border-hover)]"
                  style={{
                    borderColor: "var(--border-default)",
                    background: "linear-gradient(160deg, var(--bg-card), var(--shimmer))",
                  }}
                >
                  <h3
                    className="mb-4 flex items-center gap-2 text-base font-bold uppercase tracking-wider"
                    style={{ color: "var(--accent-text)" }}
                  >
                    <span
                      className="h-1 w-8 rounded-full"
                      style={{ background: "var(--accent)" }}
                      aria-hidden="true"
                    />
                    {section.cat}
                  </h3>
                  <ul className="space-y-3 mb-3">
                    {highlights.map((item) => (
                      <CheckItem key={item} text={item} />
                    ))}
                  </ul>
                  {rest.length > 0 && (
                    <details className="group/d">
                      <summary
                        className="cursor-pointer select-none text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        style={{ color: "var(--accent)" }}
                      >
                        <span>Ver mais {rest.length} {rest.length === 1 ? "tópico" : "tópicos"}</span>
                        <span className="transition-transform group-open/d:rotate-180" aria-hidden="true">▾</span>
                      </summary>
                      <ul className="mt-3 space-y-3 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                        {rest.map((item) => (
                          <CheckItem key={item} text={item} />
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
          <InlineCTA ctaKey="pillars-primary" label="Quero aplicar o S.E.M" size="md" />
        </div>
      </section>

      {/* BONUSES */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Incluso no seu pedido</p>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Você ainda recebe esses bônus exclusivos</h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Valor total dos bônus: <strong>R$ 69,60</strong> —{" "}
              <span style={{ color: "var(--accent)" }}>Hoje, tudo GRÁTIS com o ebook.</span>
            </p>
          </div>
          {/* Mockup das páginas internas */}
          <div className="flex justify-center mb-10">
            <div className="w-full max-w-[700px]">
              <Image
                src={resolveAsset("mockup.spread", "/images/ebook-spread.png")}
                alt="Páginas internas do ebook — checklist e plano de 7 dias"
                width={700}
                height={338}
                className="w-full h-auto rounded-xl shadow-lg"
                unoptimized
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {bonuses.map((b, idx) => (
              <div
                key={b.titulo}
                className="group relative flex gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: "var(--border-default)",
                  background: "linear-gradient(160deg, var(--bg-card), var(--shimmer))",
                  boxShadow: "0 4px 14px -6px rgba(0,0,0,0.08)",
                }}
              >
                {/* Badge "GRÁTIS" flutuante no canto */}
                <div
                  className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md"
                  style={{
                    background: "linear-gradient(145deg, var(--accent), var(--accent-hover))",
                    color: "white",
                  }}
                >
                  Grátis
                </div>
                {/* Ícone num círculo colorido */}
                <div
                  className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition-transform group-hover:scale-105"
                  style={{
                    background: "var(--accent-soft)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {b.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Bônus {String(idx + 1).padStart(2, "0")}
                      </p>
                      <h3 className="font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                        {b.titulo}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                    {b.desc}
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Valor avulso:</span>
                    <span
                      className="text-sm font-bold line-through"
                      style={{ color: "var(--text-hint)" }}
                    >
                      {b.valor}
                    </span>
                    <span
                      className="ml-auto text-xs font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      Você paga R$ 0
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <InlineCTA ctaKey="bonus-primary" label="Quero o método com todos os bônus" size="md" />
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Resultados reais</p>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Quem já transformou sua vida</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {depoimentos.map((d) => (
              <div
                key={d.nome}
                className="flex flex-col gap-4 rounded-2xl border p-6"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-amber-400" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.2L8 10.5l-3.8 2 .7-4.2-3-2.9 4.2-.6z" />
                      </svg>
                    ))}
                  </div>
                  <BadgeResultado resultado={d.resultado} />
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>
                  &ldquo;{d.texto}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  {avatarSrc(d.nome) ? (
                    <Image
                      src={avatarSrc(d.nome)!}
                      alt={d.nome}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      style={{ width: 40, height: 40 }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-text)" }}
                    >
                      {d.nome.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{d.nome}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{d.local}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCO 2 — PROVA SOCIAL ("O que outras mulheres estão vivendo") */}
      <SocialProofBlock />

      {/* PARA QUEM É */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border p-7" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
              <h3 className="mb-5 text-xl font-bold" style={{ color: "var(--accent)" }}>
                ✅ Este ebook é pra você se:
              </h3>
              <ul className="space-y-3">
                {[
                  "Você é mulher entre 25 e 55 anos com rotina corrida",
                  "Você já tentou várias dietas e não conseguiu manter o resultado",
                  "Você quer emagrecer sem abrir mão da qualidade de vida",
                  "Você precisa de algo prático, direto e aplicável a partir de amanhã",
                  "Você está cansada de se sentir culpada por comer",
                  "Você não tem tempo (nem vontade) pra academia",
                  "Você come por ansiedade ou emoção e quer entender por que",
                ].map((item) => <CheckItem key={item} text={item} />)}
              </ul>
            </div>
            <div className="rounded-2xl border p-7" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}>
              <h3 className="mb-5 text-xl font-bold" style={{ color: "var(--text-muted)" }}>
                ❌ Este ebook NÃO é pra você se:
              </h3>
              <ul className="space-y-3">
                {[
                  "Você busca resultado mágico em 3 dias (isso não existe)",
                  "Você quer mais um cardápio ultra-restritivo",
                  "Você não está disposta a fazer pequenas mudanças",
                  "Você quer substituir acompanhamento médico especializado",
                  "Você quer ouvir que existe pílula mágica ou atalho sem esforço",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                    <span className="mt-0.5 text-red-400">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARATIVO — Tradicional vs Método S.E.M */}
      <MetodoComparativo />

      {/* BLOCO 3 — TRANSFORMAÇÃO ("Mudanças reais. Sem extremos.") */}
      <TransformationBlock />

      {/* PRICING — 3 planos com checkout Hotmart */}
      <PricingSection />

      {/* GARANTIA */}
      <section className="py-16 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-6 rounded-2xl border p-8" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}>
            <div className="text-5xl">🛡️</div>
            <div>
              <h3 className="mb-3 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Garantia Incondicional de 7 Dias: Risco ZERO pra Você
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Eu sei que você já foi enganada antes. Sei que já comprou coisas que prometiam o mundo
                e entregaram nada. Por isso, a garantia é simples:{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  Compre o ebook. Leia. Aplique. Se nos próximos 7 dias você sentir que não valeu cada
                  centavo, me mande um email e eu devolvo 100% do seu dinheiro. Sem perguntas. Sem burocracia.
                </strong>{" "}
                O único risco que você corre é continuar fazendo a mesma coisa e esperando resultados diferentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Perguntas Frequentes
          </h2>
          <div className="flex flex-col gap-3">
            {faq.map((f, idx) => (
              <div
                key={f.q}
                className="rounded-2xl border transition-colors"
                style={{ borderColor: openFaq === idx ? "var(--border-hover)" : "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
              >
                <button
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{f.q}</span>
                  <span
                    className="flex-shrink-0 text-lg leading-none transition-transform"
                    style={{ color: "var(--text-muted)", transform: openFaq === idx ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6" style={{ backgroundColor: "var(--shimmer)" }}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl" style={{ color: "var(--text-primary)" }}>
            Você tem duas opções agora.
          </h2>
          <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2 text-left">
            <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.04)" }}>
              <p className="mb-1 font-bold text-red-400">Opção 1</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Fechar essa página, continuar fazendo o que sempre fez e esperar que algo mude.
                Começar mais uma dieta na segunda. Desistir na quarta. Se sentir culpada na sexta. Repetir.
              </p>
            </div>
            <div className="rounded-2xl border p-5" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--accent-soft)" }}>
              <p className="mb-1 font-bold" style={{ color: "var(--accent)" }}>Opção 2</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Investir R$ 37 — o preço de um delivery — e dar uma chance pra um método que respeita
                sua rotina, seu corpo e suas emoções. Com plano de 7 dias pronto. Para começar AMANHÃ.
              </p>
            </div>
          </div>
          <p className="mb-8 text-lg" style={{ color: "var(--text-secondary)" }}>
            A escolha é sua. Mas se você chegou até aqui, lá no fundo você já sabe qual é.
          </p>
          <CTA ctaKey="final-primary" mode="checkout" label="SIM, EU QUERO O MÉTODO S.E.M — R$37" />
          <div className="mt-10 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>P.S.</strong> — Se você está pensando
              &ldquo;talvez depois&rdquo;: quantas vezes você já adiou cuidar de você? Quantas
              &ldquo;segundas-feiras&rdquo; já passaram? R$37 e 1 hora de leitura podem ser o início
              de uma mudança que você vai agradecer daqui a 6 meses.
            </p>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>P.P.S.</strong> — Você tem 7 dias de
              garantia. Se não gostar, devolvo seu dinheiro. O único risco é não tentar.
            </p>
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE — pra quem nao comprou */}
      <section className="py-16 px-6" style={{ background: "var(--bg-primary)" }}>
        <div className="mx-auto max-w-lg">
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ borderColor: "var(--border-subtle)", background: "var(--bg-card)" }}
          >
            <div className="mb-2 text-3xl">📧</div>
            <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Ainda nao decidiu?
            </h3>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Receba <strong>3 dicas gratuitas</strong> do Metodo S.E.M no seu email.
              Sem spam, sem compromisso — so conteudo que ajuda.
            </p>
            <LeadCapture source="sales-page" />
            <p className="mt-4 text-xs" style={{ color: "var(--text-hint)" }}>
              Ao se cadastrar, voce entra na lista VIP e recebe dicas exclusivas.
            </p>
          </div>
        </div>
      </section>

      {/* DISCLAIMER + FOOTER */}
      <footer className="border-t py-10 px-6" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="mx-auto max-w-2xl text-center">
          <div
            className="mb-6 rounded-xl border p-4 text-xs leading-relaxed"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
          >
            <strong>Aviso importante:</strong> Este produto é um guia de hábitos alimentares, emocionais
            e de movimento. Não substitui acompanhamento médico ou nutricional profissional. Se você tem
            condições de saúde específicas, consulte seu médico ou nutricionista antes de iniciar qualquer
            mudança alimentar. Resultados podem variar de pessoa para pessoa.
          </div>
          <div className="flex flex-col items-center gap-3">
            <Link href="/" className="text-xs font-bold transition-colors" style={{ color: "var(--text-muted)" }}>
              ← Voltar para Longetividade
            </Link>
            <p className="text-xs" style={{ color: "var(--text-hint)" }}>
              © {new Date().getFullYear()} Longetividade. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* CTA sticky mobile */}
      <StickyBottomCTA />
    </div>
  );
}
