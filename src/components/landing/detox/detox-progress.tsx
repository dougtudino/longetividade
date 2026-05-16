"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { trackCtaClick } from "@/lib/cta-tracking";
import { useLpAssets } from "@/lib/useLpAssets";
import { MockupAppDetox } from "@/components/mockups/mockup-app-detox";

type SpItem = {
  id: string;
  imageUrl: string;
  alt: string;
  name: string | null;
  caption: string | null;
  kind: string;
  orderIndex: number;
};

type Quote = {
  id: string;
  imageUrl?: string;
  alt?: string;
  name: string;
  text: string;
};

// Fallback hardcoded — renderiza se o admin nao cadastrou kind="progress-quote".
const FALLBACK_QUOTES: Quote[] = [
  {
    id: "fallback-1",
    name: "Camila R.",
    text: "Nao acreditei que ia conseguir 21 dias. No dia 18 nem pensava mais — ja era automatico.",
  },
  {
    id: "fallback-2",
    name: "Patricia M.",
    text: "Marcar o calendario virou meu momento do dia. E bobo, mas funciona.",
  },
  {
    id: "fallback-3",
    name: "Fernanda B.",
    text: "Nao emagreci 10kg. Emagreci 4kg e parei de odiar segunda-feira.",
  },
];

const LP_SLUG = "emagreca-sem-dieta";

export function DetoxProgress() {
  const [quotes, setQuotes] = useState<Quote[]>(FALLBACK_QUOTES);
  // Foto/screenshot do app editavel via /admin/lp-assets slot "hero.phone".
  const { resolveAsset } = useLpAssets("emagreca-sem-dieta");
  const appPhotoUrl = resolveAsset("hero.phone", "");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/social-proof?lpSlug=${LP_SLUG}`);
        if (!res.ok) return;
        const data = (await res.json()) as { items: SpItem[] };
        const fromDb = data.items
          .filter((i) => i.kind === "progress-quote" && i.caption && i.name)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .slice(0, 3)
          .map<Quote>((i) => ({
            id: i.id,
            imageUrl: i.imageUrl,
            alt: i.alt || i.name || "Depoimento",
            name: i.name as string,
            text: i.caption as string,
          }));
        if (alive && fromDb.length === 3) setQuotes(fromDb);
      } catch {
        /* mantem fallback */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  function handleCtaClick() {
    trackCtaClick({ ctaId: "progress-primary", destinationUrl: "#pricing" });
  }

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: "var(--bg-page)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <span
            className="font-body text-xs md:text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            Pequenas vitorias
          </span>
          <h2
            className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mt-2 mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Pequenas vitorias criam resultados reais.
          </h2>
          <p
            className="font-body text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Cada habito marcado e um passo. 21 passos depois, voce esta em
            outro lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
          <div className="flex justify-center">
            {appPhotoUrl ? (
              <div
                className="relative w-full max-w-[280px] aspect-[3/4] rounded-3xl overflow-hidden"
                style={{ boxShadow: "0 24px 60px -20px rgba(0,0,0,0.25)" }}
              >
                <Image
                  src={appPhotoUrl}
                  alt="App de acompanhamento detox"
                  fill
                  sizes="(min-width: 1024px) 280px, 80vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <MockupAppDetox />
            )}
          </div>

          <div className="space-y-5">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="rounded-2xl p-6 flex items-start gap-4"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                {q.imageUrl && (
                  <div
                    className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--bg-page)" }}
                  >
                    <Image
                      src={q.imageUrl}
                      alt={q.alt ?? q.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className="font-body text-base md:text-lg leading-relaxed mb-3 italic"
                    style={{ color: "var(--text-primary)" }}
                  >
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <p
                    className="font-body text-sm font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    — {q.name}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <a
                href="#pricing"
                onClick={handleCtaClick}
                data-cta="progress-primary"
                className="inline-flex items-center justify-center gap-3 rounded-2xl py-4 px-7 text-base md:text-lg font-bold text-white transition-all hover:scale-[1.02]"
                style={{
                  background:
                    "linear-gradient(145deg, var(--accent), var(--accent-hover))",
                  boxShadow: "0 10px 32px -8px var(--accent-soft)",
                }}
              >
                Comecar meus 21 dias
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
