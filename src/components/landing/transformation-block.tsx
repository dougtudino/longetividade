// Bloco "Mudanças reais. Sem extremos." — transformações (lifestyle, não academia).
// Grid de imagens antes/depois sutis, postura + expressão.
// Fetch /api/social-proof → filtra kind=transformation.
// Se < 3 items, não renderiza.
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ApiItem = {
  id: string;
  row: number;
  imageUrl: string;
  alt: string;
  caption: string | null;
  kind: string;
};

const LP_SLUG = "emagreca-sem-dieta";
const MIN_ITEMS = 3;
const MAX_ITEMS = 6;

export function TransformationBlock() {
  const [items, setItems] = useState<ApiItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/social-proof?lpSlug=${LP_SLUG}`);
        if (!res.ok) return;
        const data = (await res.json()) as { items: ApiItem[] };
        if (!alive) return;
        const filtered = data.items.filter((i) => i.kind === "transformation");
        setItems(filtered.slice(0, MAX_ITEMS));
      } catch {
        /* ignora */
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
      aria-label="Mudanças reais. Sem extremos."
      className="py-16 md:py-20 px-6"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p
            className="mb-2 text-xs uppercase tracking-wider font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Transformação
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Mudanças reais. Sem extremos.
          </h2>
          <p
            className="mt-3 text-sm md:text-base max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Não é sobre ser outra pessoa. É sobre recuperar a leveza que já foi sua.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {items.map((item) => (
            <figure
              key={item.id}
              className="relative aspect-[4/5] rounded-xl overflow-hidden border"
              style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-card)" }}
            >
              <Image
                src={item.imageUrl}
                alt={item.alt}
                fill
                sizes="(min-width: 768px) 320px, 50vw"
                className="object-cover"
                loading="lazy"
                quality={80}
                unoptimized
              />
              {item.caption && (
                <figcaption
                  className="absolute bottom-0 inset-x-0 px-3 py-2.5 text-xs md:text-sm font-medium"
                  style={{
                    color: "#FAF8F5",
                    background: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
                  }}
                >
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <p
          className="mt-8 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Resultados variam de pessoa para pessoa.
        </p>
      </div>
    </section>
  );
}
