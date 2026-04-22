// Bloco "O que outras mulheres estão vivendo" — prova social (WhatsApp + depoimentos).
// Grid de prints WhatsApp e screenshots de depoimentos.
// Fetch /api/social-proof → filtra row === 3 (Doug organiza manualmente no admin).
// Se < 3 items na linha 3, não renderiza.
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
const MAX_ITEMS = 9;

export function SocialProofBlock() {
  const [items, setItems] = useState<ApiItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/social-proof?lpSlug=${LP_SLUG}`);
        if (!res.ok) return;
        const data = (await res.json()) as { items: ApiItem[] };
        if (!alive) return;
        const filtered = data.items.filter((i) => i.row === 3);
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
      aria-label="O que outras mulheres estão vivendo"
      className="py-16 md:py-20 px-6"
      style={{ backgroundColor: "var(--shimmer)" }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <p
            className="mb-2 text-xs uppercase tracking-wider font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Prova social
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            O que outras mulheres estão vivendo
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((item) => (
            <figure
              key={item.id}
              className="relative aspect-[4/5] rounded-xl overflow-hidden border shadow-sm"
              style={{ borderColor: "var(--border-default)", backgroundColor: "var(--bg-card)" }}
            >
              <Image
                src={item.imageUrl}
                alt={item.alt}
                fill
                sizes="(min-width: 768px) 320px, (min-width: 640px) 50vw, 90vw"
                className="object-cover"
                loading="lazy"
                quality={80}
                unoptimized
              />
              <span
                className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  color: "#FAF8F5",
                  backdropFilter: "blur(4px)",
                }}
              >
                {item.kind === "whatsapp" ? "💬 WhatsApp" : "⭐ Depoimento"}
              </span>
              {item.caption && (
                <figcaption
                  className="absolute bottom-0 inset-x-0 px-3 py-2 text-xs font-medium"
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
          Publicado com autorização das alunas. Resultados variam de pessoa para pessoa.
        </p>
      </div>
    </section>
  );
}
