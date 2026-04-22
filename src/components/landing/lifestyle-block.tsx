// Bloco "Sem dieta. Na vida real." — posicionado logo abaixo do hero.
// Grid estático de 6 imagens lifestyle (idealmente mesma personagem).
// Fetch /api/social-proof → filtra kind IN (lifestyle, photo) — aceita legado `photo`.
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

// Captions default pra fallback (prompt especifica essas 6).
const FALLBACK_CAPTIONS = [
  "Sem pressa. Sem pressão.",
  "Comer bem… sem culpa.",
  "Se olhar com mais leveza.",
  "Uma rotina que cabe na sua vida.",
  "Sem culpa no fim do dia.",
  "Recomeçar… sem começar do zero.",
];

export function LifestyleBlock() {
  const [items, setItems] = useState<ApiItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/social-proof?lpSlug=${LP_SLUG}`);
        if (!res.ok) return;
        const data = (await res.json()) as { items: ApiItem[] };
        if (!alive) return;
        const filtered = data.items.filter((i) => i.kind === "lifestyle" || i.kind === "photo");
        setItems(filtered.slice(0, MAX_ITEMS));
      } catch {
        /* fallback vai mostrar nada */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Enquanto carrega, não renderiza (evita layout shift).
  if (items === null) return null;
  if (items.length < MIN_ITEMS) return null;

  return (
    <section
      aria-label="Sem dieta. Na vida real."
      className="py-16 md:py-20 px-6"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p
            className="mb-2 text-xs uppercase tracking-wider font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Prova de vida
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Sem dieta. Na vida real.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {items.map((item, idx) => (
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
                quality={78}
                unoptimized
              />
              <figcaption
                className="absolute bottom-0 inset-x-0 px-3 py-2.5 text-xs md:text-sm font-medium"
                style={{
                  color: "#FAF8F5",
                  background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))",
                }}
              >
                {item.caption || FALLBACK_CAPTIONS[idx % FALLBACK_CAPTIONS.length]}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
