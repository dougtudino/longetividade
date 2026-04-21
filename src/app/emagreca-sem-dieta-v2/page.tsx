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
import { SocialProofGallery } from "@/components/landing/social-proof-gallery";
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
    trackViewContent("Emagreca Sem Dieta V2", 37);
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

      {/* HERO — V2: CTA acima da dobra, headline direto com número (21 dias), badge pill emerald */}
      <section className="relative overflow-hidden px-6 pb-10 pt-20 md:pt-24 md:pb-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--accent-soft)" }}
          />
        </div>
        <div className="relative mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Texto — 55% */}
          <div className="flex-1 text-center md:text-left md:basis-[55%]">
            <div
              className="mb-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-emerald-50)",
                color: "var(--color-emerald-800)",
              }}
            >
              12.400+ alunas · 4.9 ★ · 97% satisfação
            </div>
            <h1
              className="mb-5 text-3xl font-semibold leading-tight tracking-tight md:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              Os 3 pilares que fazem mulheres 30+ emagrecerem em{" "}
              <span style={{ color: "var(--accent)" }}>21 dias</span>.
            </h1>
            <p
              className="mb-7 max-w-xl text-base leading-relaxed md:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Sem cortar alimentos, sem academia e sem aquela culpa de todo dia. Conheça o Método S.E.M
              — o passo a passo que inclui plano de 7 dias, cardápio, lista de compras e checklist diário.
            </p>
            <div
              className="mx-auto md:mx-0 mb-8 max-w-md rounded-2xl border p-6"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
            >
              <p className="mb-2 text-center text-xs md:text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Uma consulta com nutricionista custa R$ 200 a R$ 400. O método sai por:
              </p>
              <div className="mb-4 flex items-baseline justify-center gap-3 flex-wrap">
                <span className="text-5xl font-black leading-none" style={{ color: "var(--text-primary)" }}>R$37</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  ou 3x de R$ 12,33 sem juros
                </span>
              </div>
              <CTA ctaKey="hero-primary" mode="scroll" label="Quero começar agora" />
            </div>
          </div>
          {/* Hero visual — mulher real + mockup celular (45%) */}
          <div className="flex-shrink-0 w-full max-w-[340px] md:max-w-[420px] md:basis-[45%] relative">
            {/* Foto mulher — protagonista */}
            <Image
              src={resolveAsset("hero.woman", "/images/hero-woman2.png")}
              alt="Mulher sorridente e saudável com suco verde — resultado do Método S.E.M"
              width={420}
              height={560}
              className="w-full h-auto rounded-3xl object-cover"
              style={{ boxShadow: "0 20px 60px rgba(122,158,126,0.3)" }}
              priority
              unoptimized
            />
            {/* Mockup celular flutuante — canto inferior direito */}
            <div className="absolute -bottom-6 -right-4 md:-right-8 w-[130px] md:w-[160px]">
              <Image
                src={resolveAsset("hero.phone", "/images/ebook-phone.jpg")}
                alt="Ebook no celular"
                width={160}
                height={213}
                className="w-full h-auto drop-shadow-2xl rounded-2xl"
                unoptimized
              />
            </div>
            {/* Social proof badge */}
            <div
              className="absolute -bottom-3 left-4 flex items-center gap-3 rounded-2xl border px-4 py-2.5"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-default)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-sm">★★★★★</span>
                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>4.9</span>
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: "var(--border-subtle)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>12.400+ alunas</span>
            </div>
          </div>
        </div>
      </section>

      {/* GALERIA ROTATIVA DE PROVA SOCIAL */}
      <SocialProofGallery />

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
                desc: "Você vai aprender a montar refeições que ajudam a emagrecer sem pesar comida, sem contar caloria e sem eliminar nada do prato. Sem lista de proibido. Sem culpa. Comer de verdade, emagrecer de verdade.",
              },
              {
                letra: "E",
                nome: "Equilíbrio",
                desc: "Este é o pilar que ninguém fala. Você vai entender por que come quando não tem fome, por que a ansiedade dispara a noite, e o que fazer de verdade quando isso acontece.",
              },
              {
                letra: "M",
                nome: "Movimento",
                desc: "Esqueça academia. Aqui você vai aprender a integrar movimento no seu dia em 15 minutos, sem trocar de roupa, sem sair de casa. Movimento que queima gordura e melhora seu humor.",
              },
            ].map((p) => (
              <div
                key={p.letra}
                className="flex flex-col gap-4 rounded-2xl border p-7"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl font-black text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {p.letra}
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{p.nome}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{p.desc}</p>
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

      {/* O QUE VOCÊ VAI APRENDER */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Dentro do ebook, você vai descobrir:
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {bullets.map((section) => (
              <div
                key={section.cat}
                className="rounded-2xl border p-6"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
              >
                <h3 className="mb-4 font-bold" style={{ color: "var(--accent-text)" }}>{section.cat}</h3>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <CheckItem key={item} text={item} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
            {bonuses.map((b) => (
              <div
                key={b.titulo}
                className="flex gap-4 rounded-2xl border p-5"
                style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
              >
                <div className="text-3xl">{b.icon}</div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{b.titulo}</h3>
                    <span className="text-xs line-through" style={{ color: "var(--text-hint)" }}>{b.valor}</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent-text)" }}>GRÁTIS</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
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

      {/* PRICING — 3 planos com checkout Hotmart */}
      {/* COMPARATIVO — Tradicional vs Método S.E.M */}
      <MetodoComparativo />

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
