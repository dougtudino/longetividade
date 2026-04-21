// Seção "Sobre a Autora" — apresenta a criadora do Método S.E.M.
// Se tiver imagem real no slot `author.barbara` (via admin), usa ela.
// Senão, fallback pro SVG ilustrativo HeroAutora.
"use client";

import Image from "next/image";
import { useLpAssets } from "@/lib/useLpAssets";
import HeroAutora from "@/components/visual/HeroAutora";

type AutoraSectionProps = {
  lpSlug?: string;
};

export function AutoraSection({ lpSlug = "emagreca-sem-dieta" }: AutoraSectionProps) {
  const { assets } = useLpAssets(lpSlug);
  const authorAsset = assets?.["author.barbara"];

  return (
    <section
      className="py-16 md:py-20 px-6"
      style={{ backgroundColor: "var(--shimmer)" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
          {/* Foto / Ilustração */}
          <div className="mx-auto md:mx-0 w-full max-w-[240px] md:w-[260px] flex-shrink-0">
            {authorAsset ? (
              <Image
                src={authorAsset.imageUrl}
                alt={authorAsset.alt || "Barbara — criadora do Método S.E.M"}
                width={260}
                height={312}
                className="w-full h-auto rounded-2xl object-cover"
                style={{ boxShadow: "0 12px 32px rgba(0,0,0,0.15)" }}
                unoptimized
              />
            ) : (
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "linear-gradient(145deg, var(--bg-card), var(--accent-soft))",
                  border: "0.5px solid var(--border-default)",
                }}
              >
                <HeroAutora />
              </div>
            )}
          </div>

          {/* Texto */}
          <div className="text-center md:text-left">
            <p
              className="mb-2 text-xs uppercase tracking-wider font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Sobre o Método S.E.M
            </p>
            <h2
              className="mb-4 text-3xl md:text-4xl font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Criado por quem vive a vida real de uma mulher 30+.
            </h2>
            <div
              className="space-y-4 text-base leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              <p>
                O Método S.E.M nasceu da experiência de uma mulher como você — mãe, profissional,
                gente que tem jornada dupla, que tentou dieta da sopa, low-carb, jejum, shake,
                contar caloria. E descobriu, na prática, que <strong style={{ color: "var(--text-primary)" }}>
                nada disso sustenta no mundo real</strong>.
              </p>
              <p>
                O que funcionou de verdade foram 3 pilares simples: <strong style={{ color: "var(--accent)" }}>
                Simplicidade</strong> na nutrição, <strong style={{ color: "var(--accent)" }}>Equilíbrio</strong>{" "}
                emocional e <strong style={{ color: "var(--accent)" }}>Movimento</strong> compatível com a
                vida real. Hoje, mais de 12.400 mulheres aplicam esses pilares no dia a dia.
              </p>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Este ebook é o mesmo passo a passo que guiou todas elas — e que pode guiar você.
              </p>
            </div>

            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
              style={{
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent-text)",
              }}
            >
              ✓ Método testado por 12.400+ alunas desde 2022
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
