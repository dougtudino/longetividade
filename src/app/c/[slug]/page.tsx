// src/app/c/[slug]/page.tsx — Campaign landing pages (UTM-aware)
"use client";
import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { captureUTMs, appendUTMs } from "@/lib/utm";
import { trackViewContent, trackInitiateCheckout } from "@/lib/tracking";
import ThemeToggle from "@/components/ThemeToggle";

const HOTMART = "https://pay.hotmart.com/H105141835Q";
const KIWIFY = "https://pay.kiwify.com.br/3fle7dM";

interface CampaignVariant {
  headline: string;
  subheadline: string;
  cta: string;
  badge: string;
  utm_source: string;
}

const VARIANTS: Record<string, CampaignVariant> = {
  "meta-ads": {
    headline: "Cansada de dietas que nao funcionam?",
    subheadline:
      "Descubra o metodo que ajudou 12.400+ mulheres a emagrecer sem cortar alimentos e sem academia. Resultados em 21 dias.",
    cta: "Quero Conhecer o Metodo — R$37",
    badge: "Oferta Exclusiva",
    utm_source: "facebook",
  },
  google: {
    headline: "Como emagrecer sem dieta restritiva",
    subheadline:
      "Metodo SEM: 3 pilares cientificos para perder peso de forma permanente. Sem contar calorias, sem passar fome. Acesso imediato.",
    cta: "Ver Metodo Completo — R$37",
    badge: "Comprovado Cientificamente",
    utm_source: "google",
  },
  organico: {
    headline: "Voce merece emagrecer sem sofrimento",
    subheadline:
      "O ebook Emagreca Sem Dieta ja transformou a vida de mais de 12.000 pessoas. Um metodo simples que funciona no seu dia a dia corrido.",
    cta: "Quero Meu Ebook — Apenas R$37",
    badge: "Mais Vendido",
    utm_source: "organico",
  },
};

const DEFAULT_VARIANT: CampaignVariant = VARIANTS.organico;

export default function CampaignPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const variant = VARIANTS[slug] ?? DEFAULT_VARIANT;

  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    if (!sp.has("utm_source")) sp.set("utm_source", variant.utm_source);
    if (!sp.has("utm_medium")) sp.set("utm_medium", "campaign_page");
    if (!sp.has("utm_campaign")) sp.set("utm_campaign", slug);
    captureUTMs(sp);
    trackViewContent("Emagreca Sem Dieta", 37);
  }, [searchParams, slug, variant.utm_source]);

  const buyUrl = appendUTMs(HOTMART);

  function handleClick() {
    trackInitiateCheckout("Emagreca Sem Dieta", 37);
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white antialiased">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05] bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="text-xs font-bold text-white/60">
            Longetividade
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={buyUrl}
              onClick={handleClick}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold hover:bg-emerald-400 transition-colors text-white"
            >
              Comprar Agora
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-20 pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300">
              {variant.badge}
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            {variant.headline}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-white/50 leading-relaxed">
            {variant.subheadline}
          </p>
          <a
            href={buyUrl}
            onClick={handleClick}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-10 py-5 text-xl font-bold hover:bg-emerald-400 active:scale-95 transition-all shadow-2xl shadow-emerald-500/30"
          >
            {variant.cta}{" "}
            <span className="transition-transform group-hover:translate-x-1">
              &rarr;
            </span>
          </a>
          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-sm text-white/30">
              De{" "}
              <span className="line-through text-white/20">R$97</span>{" "}
              por{" "}
              <strong className="text-white/60">R$37</strong>
            </p>
            <p className="text-xs text-white/20">
              Pagamento seguro &middot; Acesso imediato &middot; Garantia 7 dias
            </p>
          </div>
        </div>
      </section>

      {/* METODO */}
      <section className="bg-white/[0.02] py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold">
            O Metodo SEM
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { s: "S", n: "Simplicidade", d: "Coma de verdade sem contar calorias, pesar ou seguir cardapio complicado.", c: "border-emerald-500/20" },
              { s: "E", n: "Equilibrio", d: "Entenda por que voce come por emocao e como resolver isso de vez.", c: "border-cyan-500/20" },
              { s: "M", n: "Movimento", d: "15 minutos de movimento integrado ao seu dia — sem academia.", c: "border-violet-500/20" },
            ].map((p) => (
              <div key={p.s} className={`flex flex-col gap-3 rounded-2xl border bg-white/[0.02] p-6 ${p.c}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl font-black">
                  {p.s}
                </div>
                <h3 className="text-lg font-bold">{p.n}</h3>
                <p className="text-sm text-white/50">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-lg text-center">
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 to-transparent p-10">
            <div className="mb-4 inline-flex rounded-full bg-red-500/15 px-4 py-1.5 text-xs font-bold text-red-300">
              72% OFF &mdash; Oferta limitada
            </div>
            <div className="my-6 flex items-baseline justify-center gap-3">
              <span className="text-lg text-white/30 line-through">R$97</span>
              <span className="text-6xl font-black">R$37</span>
            </div>
            <a
              href={buyUrl}
              onClick={handleClick}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 py-5 text-lg font-bold hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30"
            >
              Garantir Meu Acesso &rarr;
            </a>
            <p className="mt-4 text-xs text-white/30">
              Garantia incondicional de 7 dias
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.05] py-8 text-center">
        <Link href="/emagreca-sem-dieta" className="text-xs text-white/30 hover:text-white/60 transition-colors">
          Ver pagina completa
        </Link>
      </footer>
    </div>
  );
}
