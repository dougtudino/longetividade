"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Galeria "Mulheres que cansaram de recomecar" — DB-driven via /api/social-proof
// filter kind="women-gallery". So renderiza se tiver MIN_ITEMS ativas (compromisso
// de qualidade: galeria pequena vazia parece amador).

type SpItem = {
  id: string;
  imageUrl: string;
  alt: string;
  name: string | null;
  caption: string | null;
  kind: string;
  orderIndex: number;
};

const LP_SLUG = "emagreca-sem-dieta";
const MIN_ITEMS = 6;
const MAX_ITEMS = 12;

export function DetoxWomenGallery() {
  const [items, setItems] = useState<SpItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/social-proof?lpSlug=${LP_SLUG}`);
        if (!res.ok) return;
        const data = (await res.json()) as { items: SpItem[] };
        if (!alive) return;
        const filtered = data.items
          .filter((i) => i.kind === "women-gallery")
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .slice(0, MAX_ITEMS);
        setItems(filtered);
      } catch {
        /* falha silenciosa — galeria oculta */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (items === null) return null;
  if (items.length < MIN_ITEMS) return null;

  return (
    <section
      aria-label="Mulheres que cansaram de recomecar"
      className="py-20 md:py-28"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
          <span
            className="inline-block font-body text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] mb-3"
            style={{ color: "var(--accent)" }}
          >
            Voce nao esta sozinha
          </span>
          <h2
            className="font-heading font-extrabold text-3xl md:text-[2.5rem] lg:text-5xl leading-[1.1] mb-5"
            style={{
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Mulheres que cansaram de recomecar
          </h2>
          <p
            className="font-body text-base md:text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Elas comecaram um dia. Marcaram a primeira tarefa. Hoje sao outras
            pessoas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
          {items.map((item) => (
            <figure
              key={item.id}
              className="rounded-2xl overflow-hidden flex flex-col items-center text-center p-5 md:p-6 transition-transform hover:-translate-y-1"
              style={{
                backgroundColor: "var(--bg-page)",
                border: "1px solid var(--border-default)",
                boxShadow: "0 4px 18px -8px rgba(0,0,0,0.08)",
              }}
            >
              <div
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-4"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "3px solid var(--accent-soft)",
                  boxShadow: "0 6px 18px -8px rgba(0,0,0,0.12)",
                }}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.alt || item.name || "Aluna"}
                  fill
                  sizes="(min-width: 768px) 96px, 80px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              {item.caption && (
                <blockquote
                  className="font-body text-sm md:text-[15px] leading-relaxed mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  &ldquo;{item.caption}&rdquo;
                </blockquote>
              )}
              {item.name && (
                <figcaption
                  className="font-body text-[11px] md:text-xs font-bold uppercase tracking-[0.12em] mt-auto"
                  style={{ color: "var(--accent)" }}
                >
                  {item.name}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <p
          className="mt-12 text-center font-body text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Publicado com autorizacao. Resultados variam de pessoa para pessoa.
        </p>
      </div>
    </section>
  );
}
