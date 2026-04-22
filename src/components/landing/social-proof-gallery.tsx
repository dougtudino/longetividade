// Galeria de prova social com rotação contínua CSS-only.
// 3 linhas independentes, direções e velocidades diferentes.
// Fetch do DB via /api/social-proof; fallback pro array estático se vazio.
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SOCIAL_PROOF_CARDS } from "@/data/social-proof";

type ApiItem = {
  id: string;
  row: number;
  imageUrl: string;
  alt: string;
  caption: string | null;
  kind: string;
};

type Card = {
  id: string;
  row: 1 | 2 | 3;
  imageUrl: string;
  alt: string;
  caption?: string;
};

type RowConfig = {
  row: 1 | 2 | 3;
  duration: string;
  direction: "left" | "right";
};

const ROWS: RowConfig[] = [
  { row: 1, duration: "40s", direction: "left" },
  { row: 2, duration: "55s", direction: "right" },
  { row: 3, duration: "50s", direction: "left" },
];

const LP_SLUG = "emagreca-sem-dieta";

function CardView({ card }: { card: Card }) {
  return (
    <div
      className="flex-shrink-0 w-48 md:w-56 rounded-lg overflow-hidden relative aspect-[4/5] border"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
    >
      <Image
        src={card.imageUrl}
        alt={card.alt}
        fill
        sizes="(min-width: 768px) 224px, 192px"
        className="object-cover"
        loading="lazy"
        quality={75}
      />
      {card.caption && (
        <div
          className="absolute bottom-0 inset-x-0 px-3 py-2 text-xs font-medium"
          style={{
            color: "#FAF8F5",
            background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))",
          }}
        >
          {card.caption}
        </div>
      )}
    </div>
  );
}

function Row({ config, cards }: { config: RowConfig; cards: Card[] }) {
  const animationName = config.direction === "left" ? "sp-scroll-left" : "sp-scroll-right";
  return (
    <div className="sp-row overflow-hidden">
      <div
        className="sp-track flex gap-3 md:gap-4 w-max"
        style={{
          animation: `${animationName} ${config.duration} linear infinite`,
        }}
      >
        {[...cards, ...cards].map((card, idx) => (
          <CardView key={`${card.id}-${idx}`} card={card} />
        ))}
      </div>
    </div>
  );
}

// items opcional: quando vem via prop (preview do admin), pula o fetch.
export function SocialProofGallery({ items }: { items?: Card[] } = {}) {
  // State só é usado quando fetchamos do DB (modo produção).
  // Quando items vem via prop (preview do admin), deriva direto do prop.
  const [fetched, setFetched] = useState<Card[] | null>(null);

  useEffect(() => {
    if (items) return; // prop sobrepõe fetch, não precisa buscar
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/social-proof?lpSlug=${LP_SLUG}`);
        if (!res.ok) return;
        const data = (await res.json()) as { items: ApiItem[] };
        if (!alive) return;
        if (!data.items?.length) return;
        const mapped: Card[] = data.items.map((i) => ({
          id: i.id,
          row: (i.row === 1 || i.row === 2 || i.row === 3 ? i.row : 1) as 1 | 2 | 3,
          imageUrl: i.imageUrl,
          alt: i.alt,
          caption: i.caption ?? undefined,
        }));
        setFetched(mapped);
      } catch {
        // rede ruim? mantém fallback
      }
    })();
    return () => {
      alive = false;
    };
  }, [items]);

  const cards: Card[] = items ?? fetched ?? (SOCIAL_PROOF_CARDS as Card[]);

  const rowsData = ROWS.map((cfg) => ({
    cfg,
    cards: cards.filter((c) => c.row === cfg.row),
  }));

  // Fallback: se alguma linha tiver menos de 4 cards, não renderiza.
  const hasEnough = rowsData.every((r) => r.cards.length >= 4);
  if (!hasEnough) return null;

  return (
    <section
      aria-label="Galeria de prova social"
      className="py-10 md:py-14"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-6 text-center text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Reais. Inspiradores.
        </p>
        <div className="flex flex-col gap-3 md:gap-4">
          {rowsData.map(({ cfg, cards }) => (
            <Row key={cfg.row} config={cfg} cards={cards} />
          ))}
        </div>
        <p className="mt-6 text-center text-[11px]" style={{ color: "var(--text-hint)" }}>
          Resultados variam de pessoa para pessoa.
        </p>
      </div>
    </section>
  );
}
