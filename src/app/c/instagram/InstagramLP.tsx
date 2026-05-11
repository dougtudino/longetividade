"use client";

import Image from "next/image";
import { useEffect } from "react";

const CTA_LABEL = "QUERO MEU EBOOK — APENAS R$67";

const COLORS = {
  bg: "#FDF8F3",
  bgAlt: "#FAF8F5",
  peach: "#F5E6D8",
  sageLight: "#E8F0E4",
  sage: "#7A9E7E",
  olive: "#3D5A3E",
  oliveHover: "#4a6e4b",
  text: "#2D2D2D",
  textMute: "#4A4A4A",
  gold: "#D4A94B",
  white: "#FFFFFF",
};

const FONT_DISPLAY = "var(--lp-font-display), Georgia, serif";
const FONT_BODY = "var(--lp-font-body), system-ui, sans-serif";

function CTAButton({
  checkoutUrl,
  label = CTA_LABEL,
  id,
}: {
  checkoutUrl: string;
  label?: string;
  id?: string;
}) {
  return (
    <a
      id={id}
      href={checkoutUrl}
      className="inline-block w-full md:w-auto bg-[#3D5A3E] hover:bg-[#4a6e4b] text-white font-bold text-base md:text-lg px-8 py-4 rounded-lg transition-colors text-center tracking-wide shadow-md hover:shadow-lg"
      style={{ fontFamily: FONT_BODY }}
    >
      {label}
    </a>
  );
}

function HeroSection({ checkoutUrl }: { checkoutUrl: string }) {
  return (
    <section className="px-4 md:px-8 pt-10 pb-16 md:pt-16 md:pb-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <p
            className="uppercase tracking-[0.2em] text-xs md:text-sm mb-5 text-[#3D5A3E] font-semibold"
            style={{ fontFamily: FONT_BODY }}
          >
            Método S.E.M · Para Mulheres
          </p>
          <h1
            className="text-4xl md:text-6xl leading-[1.05] mb-6 text-[#2D2D2D]"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
          >
            Emagreça de Vez — Sem Dieta, Sem Sofrimento, Sem Efeito Sanfona
          </h1>
          <p
            className="text-lg md:text-xl mb-8 text-[#4A4A4A] leading-relaxed max-w-xl"
            style={{ fontFamily: FONT_BODY }}
          >
            O Método S.E.M ensina mulheres a reprogramar a relação com a comida
            e perder peso de forma definitiva — mesmo após a gravidez, mesmo sem
            academia.
          </p>
          <CTAButton checkoutUrl={checkoutUrl} id="cta-hero" />
          <p
            className="mt-4 text-sm text-[#4A4A4A]"
            style={{ fontFamily: FONT_BODY }}
          >
            Acesso imediato · Garantia de 7 dias
          </p>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="relative w-[260px] md:w-[360px] aspect-[3/4]">
            <Image
              src="/images/ebook-mockup.png"
              alt="Ebook Emagreça Sem Dieta — Método S.E.M"
              fill
              priority
              sizes="(max-width: 768px) 260px, 360px"
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofBar() {
  return (
    <section className="bg-[#E8F0E4] py-5 px-4">
      <div
        className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-center text-[#2D2D2D]"
        style={{ fontFamily: FONT_BODY }}
      >
        <span className="text-base md:text-lg font-semibold">
          <span className="text-[#D4A94B]">★★★★★</span> Aprovado por mulheres reais
        </span>
        <span className="hidden md:inline text-[#7A9E7E]">·</span>
        <span className="text-sm md:text-base text-[#4A4A4A]">
          Comunidade ativa de mulheres em transformação
        </span>
      </div>
    </section>
  );
}

const PAINS = [
  "Você faz dieta, perde peso, e depois recupera tudo de volta",
  "Sente culpa toda vez que come algo \u201Cproibido\u201D",
  "Está exausta de contar calorias e viver em restrição",
  "Quer emagrecer mas não tem tempo nem energia pra academia",
];

function ProblemSection() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24 bg-[#FDF8F3]">
      <div className="max-w-4xl mx-auto">
        <h2
          className="text-3xl md:text-5xl text-center mb-12 text-[#2D2D2D] leading-tight"
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
        >
          Você se reconhece em algum desses?
        </h2>
        <ul className="grid md:grid-cols-2 gap-5">
          {PAINS.map((pain, i) => (
            <li
              key={i}
              className="bg-white border border-[#E8F0E4] rounded-xl p-6 flex gap-4 items-start"
              style={{ fontFamily: FONT_BODY }}
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3D5A3E] text-white flex items-center justify-center font-bold text-sm"
                aria-hidden
              >
                {i + 1}
              </span>
              <p className="text-[#2D2D2D] text-base md:text-lg leading-relaxed">
                {pain}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const PILLARS = [
  {
    letter: "S",
    title: "Sem Restrição",
    desc: "Aprenda a comer de tudo sem culpa e sem exageros. Liberdade alimentar baseada em consciência, não em proibições.",
  },
  {
    letter: "E",
    title: "Equilíbrio Mental",
    desc: "Reprograme os gatilhos emocionais que sabotam você. Identifique padrões e crie uma nova relação com a comida.",
  },
  {
    letter: "M",
    title: "Movimento Natural",
    desc: "Integre hábitos saudáveis na sua rotina real de mãe e mulher — sem academia, sem cronograma impossível.",
  },
];

function SolutionSection({ checkoutUrl }: { checkoutUrl: string }) {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto">
        <p
          className="uppercase tracking-[0.2em] text-xs md:text-sm mb-4 text-[#3D5A3E] font-semibold text-center"
          style={{ fontFamily: FONT_BODY }}
        >
          O Método
        </p>
        <h2
          className="text-3xl md:text-5xl text-center mb-4 text-[#2D2D2D] leading-tight"
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
        >
          Os 3 Pilares do S.E.M
        </h2>
        <p
          className="text-center text-[#4A4A4A] text-base md:text-lg max-w-2xl mx-auto mb-14"
          style={{ fontFamily: FONT_BODY }}
        >
          Uma metodologia construída para mulheres reais, com rotinas reais.
        </p>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {PILLARS.map((p) => (
            <div
              key={p.letter}
              className="bg-[#FDF8F3] border border-[#E8F0E4] rounded-2xl p-8 text-center"
            >
              <div
                className="w-16 h-16 rounded-full bg-[#3D5A3E] text-white flex items-center justify-center mx-auto mb-5 text-3xl"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
              >
                {p.letter}
              </div>
              <h3
                className="text-xl md:text-2xl mb-3 text-[#2D2D2D]"
                style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
              >
                {p.title}
              </h3>
              <p
                className="text-[#4A4A4A] leading-relaxed"
                style={{ fontFamily: FONT_BODY }}
              >
                {p.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <CTAButton checkoutUrl={checkoutUrl} id="cta-meio" />
        </div>
      </div>
    </section>
  );
}

const BONUSES = [
  "Ebook completo do Método S.E.M (digital, acesso imediato)",
  "Guia prático de reprogramação alimentar",
  "Cardápios de exemplo sem restrição extrema",
  "Plano de movimento para mulheres com rotina cheia",
  "Acesso definitivo — leia no seu ritmo, sem prazo",
];

function BonusSection() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24 bg-[#FDF8F3]">
      <div className="max-w-3xl mx-auto">
        <h2
          className="text-3xl md:text-5xl text-center mb-12 text-[#2D2D2D] leading-tight"
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
        >
          O que está incluso
        </h2>
        <ul className="space-y-4">
          {BONUSES.map((bonus, i) => (
            <li
              key={i}
              className="flex gap-4 items-start bg-white border border-[#E8F0E4] rounded-xl p-5"
            >
              <span
                className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#3D5A3E] text-white flex items-center justify-center text-sm font-bold"
                aria-hidden
              >
                ✓
              </span>
              <p
                className="text-[#2D2D2D] text-base md:text-lg leading-relaxed"
                style={{ fontFamily: FONT_BODY }}
              >
                {bonus}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: "Marina",
    avatar: "/images/avatar-marina.jpg",
    text: "Pela primeira vez consegui parar de fazer dietas malucas. O método me ensinou a entender meu corpo e meus gatilhos. Mudou tudo.",
  },
  {
    name: "Ana",
    avatar: "/images/avatar-ana.jpg",
    text: "Depois da gravidez eu não conseguia mais me sentir bem. O Método S.E.M me devolveu o equilíbrio, sem academia e sem sofrimento.",
  },
  {
    name: "Carla",
    avatar: "/images/avatar-carla.jpg",
    text: "Achei que ia ser mais uma dieta. Foi outra coisa: uma reprogramação real. Hoje como o que eu quero — e finalmente sem culpa.",
  },
];

function TestimonialSection() {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl md:text-5xl text-center mb-12 text-[#2D2D2D] leading-tight"
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
        >
          Quem já viveu o método
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-[#FDF8F3] border border-[#E8F0E4] rounded-2xl p-6 flex flex-col"
            >
              <p
                className="text-[#4A4A4A] italic leading-relaxed mb-6 flex-1"
                style={{ fontFamily: FONT_BODY }}
              >
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#E8F0E4]">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p
                    className="font-semibold text-[#2D2D2D]"
                    style={{ fontFamily: FONT_BODY }}
                  >
                    {t.name}
                  </p>
                  <p className="text-sm text-[#D4A94B]">★★★★★</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferSection({ checkoutUrl }: { checkoutUrl: string }) {
  return (
    <section className="px-4 md:px-8 py-16 md:py-24 bg-[#FDF8F3]">
      <div className="max-w-2xl mx-auto bg-white border-2 border-[#3D5A3E] rounded-3xl p-8 md:p-12 text-center shadow-xl">
        <p
          className="uppercase tracking-[0.2em] text-xs md:text-sm mb-4 text-[#3D5A3E] font-semibold"
          style={{ fontFamily: FONT_BODY }}
        >
          Oferta de lançamento
        </p>
        <h2
          className="text-3xl md:text-4xl mb-6 text-[#2D2D2D] leading-tight"
          style={{ fontFamily: FONT_DISPLAY, fontWeight: 700 }}
        >
          Acesso imediato ao ebook completo
        </h2>
        <div className="my-8">
          <p
            className="text-sm text-[#4A4A4A] mb-1"
            style={{ fontFamily: FONT_BODY }}
          >
            Investimento único
          </p>
          <p
            className="text-6xl md:text-7xl text-[#3D5A3E]"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 800 }}
          >
            R$67
          </p>
        </div>
        <CTAButton checkoutUrl={checkoutUrl} id="cta-final" />
        <div
          className="mt-6 inline-flex items-center gap-2 text-sm text-[#4A4A4A]"
          style={{ fontFamily: FONT_BODY }}
        >
          <span className="text-[#3D5A3E] font-bold">✓</span>
          Garantia de 7 dias ou seu dinheiro de volta
        </div>
      </div>
    </section>
  );
}

function FooterMinimal() {
  return (
    <footer
      className="px-4 md:px-8 py-10 bg-white border-t border-[#E8F0E4]"
      style={{ fontFamily: FONT_BODY }}
    >
      <div className="max-w-4xl mx-auto text-center text-xs md:text-sm text-[#4A4A4A] space-y-3">
        <p>
          Resultados podem variar de pessoa para pessoa. Este material tem
          finalidade educativa e não substitui acompanhamento médico ou
          nutricional individualizado.
        </p>
        <p>
          <a
            href="/privacidade"
            className="text-[#3D5A3E] hover:underline"
          >
            Política de privacidade
          </a>
        </p>
        <p>© Longetividade · Todos os direitos reservados</p>
      </div>
    </footer>
  );
}

export default function InstagramLP({ checkoutUrl }: { checkoutUrl: string }) {
  useEffect(() => {
    const w = window as unknown as {
      fbq?: (...args: unknown[]) => void;
    };
    if (typeof window !== "undefined" && w.fbq) {
      w.fbq("track", "ViewContent", {
        content_name: "Emagreca Sem Dieta — Metodo SEM",
        content_category: "ebook",
        value: 67.0,
        currency: "BRL",
      });
    }
  }, []);

  return (
    <main
      className="min-h-screen"
      style={{
        fontFamily: FONT_BODY,
        backgroundColor: COLORS.bg,
        color: COLORS.text,
      }}
    >
      <HeroSection checkoutUrl={checkoutUrl} />
      <ProofBar />
      <ProblemSection />
      <SolutionSection checkoutUrl={checkoutUrl} />
      <BonusSection />
      <TestimonialSection />
      <OfferSection checkoutUrl={checkoutUrl} />
      <FooterMinimal />
    </main>
  );
}
