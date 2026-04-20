// Logica de seed de CreativeCopy default pra uma CreativeCollection.
// Exportada como funcao pra poder ser chamada tanto pelo endpoint
// /api/admin/creatives/collections/[slug]/seed-copies quanto pelo
// orquestrador /api/admin/campaigns/blueprint/[launchId]/prepare
// (que nao pode usar fetch loopback em ambiente serverless).

import { prisma } from "./prisma";

type CopyDef = {
  label: string;
  headline: string;
  description: string;
  cta: string;
  primaryText: string;
};

const LAUNCH_001_COPIES: Record<string, CopyDef> = {
  "feed-dor": {
    label: "A",
    headline: "Metodo S.E.M — Reeducacao alimentar",
    description: "A partir de R$ 37 · Sem restricao extrema",
    cta: "LEARN_MORE",
    primaryText: `Cansada de dietas que nao funcionam?

O problema nao e voce. E o metodo.

O S.E.M propoe uma nova relacao com a alimentacao:
✓ Sem restricao extrema
✓ Sem contar calorias
✓ Sem culpa no cafe da manha

Reeducacao alimentar real, feita pra mulher com rotina de verdade.

👉 Conheca o metodo`,
  },
  "feed-prova": {
    label: "B",
    headline: "Metodo S.E.M — Reeducacao alimentar",
    description: "A partir de R$ 37 · Sem restricao extrema",
    cta: "LEARN_MORE",
    primaryText: `+1.000 mulheres ja conheceram o Metodo S.E.M esse mes.

Barbara, 38 anos:
"Achei que ia ser mais um metodo. Era diferente. Eu como, estou feliz, e me sinto bem no meu corpo de novo."

Um jeito diferente de se relacionar com a comida.

👉 Comece hoje a partir de R$ 37`,
  },
  "feed-objecao": {
    label: "C",
    headline: "Metodo S.E.M — Reeducacao alimentar",
    description: "A partir de R$ 37 · Sem restricao extrema",
    cta: "LEARN_MORE",
    primaryText: `"Eu ja tentei tudo."

Sei como e. Um metodo novo por mes, resultado que nao dura, frustracao.

O problema nao e voce. E a abordagem.

Reeducacao alimentar nao e dieta — e aprender a comer com prazer, sem culpa e sem o peso emocional da balanca.

👉 Conheca o S.E.M`,
  },
  "story-stat": {
    label: "B",
    headline: "Metodo S.E.M",
    description: "Reeducacao alimentar real",
    cta: "LEARN_MORE",
    primaryText: `+1.000 mulheres descobriram o Metodo S.E.M.
Uma nova relacao com a comida — sem dieta, sem culpa.

👉 Comece hoje`,
  },
  "story-cta": {
    label: "D",
    headline: "Comece hoje — Metodo S.E.M",
    description: "A partir de R$ 37",
    cta: "SHOP_NOW",
    primaryText: `Uma nova relacao com a comida.
Sem dieta. Sem culpa.

Metodo S.E.M.
👆 Arraste pra cima`,
  },
  "banner-display": {
    label: "A",
    headline: "Emagreca Sem Dieta — Metodo S.E.M",
    description: "Reeducacao alimentar a partir de R$ 37",
    cta: "LEARN_MORE",
    primaryText: `Metodo S.E.M — uma nova relacao com a comida. Sem restricao, sem culpa, sem contar caloria. A partir de R$ 37.`,
  },
};

function defaultCopyFor(creative: { slug: string; name: string }): CopyDef {
  return {
    label: "A",
    headline: creative.name.slice(0, 40),
    description: "A partir de R$ 37",
    cta: "LEARN_MORE",
    primaryText: `Conheca ${creative.name} — uma nova abordagem pra emagrecer sem dieta.`,
  };
}

export type SeedCopyResult = {
  ok: boolean;
  error?: string;
  results: Array<{ slug: string; created: boolean; reason?: string }>;
  count: number;
};

export async function seedCopiesForCollection(slug: string): Promise<SeedCopyResult> {
  const collection = await prisma.creativeCollection.findUnique({
    where: { slug },
    include: {
      creatives: {
        where: { archived: false },
        include: { copies: true },
      },
    },
  });
  if (!collection) {
    return { ok: false, error: "Collection nao encontrada", results: [], count: 0 };
  }

  const results: Array<{ slug: string; created: boolean; reason?: string }> = [];
  for (const cr of collection.creatives) {
    if (cr.copies.length > 0) {
      results.push({ slug: cr.slug, created: false, reason: "ja tem copies" });
      continue;
    }
    const def = LAUNCH_001_COPIES[cr.slug] ?? defaultCopyFor(cr);
    try {
      await prisma.creativeCopy.create({
        data: {
          creativeId: cr.id,
          label: def.label,
          headline: def.headline,
          description: def.description,
          cta: def.cta,
          primaryText: def.primaryText,
          active: true,
        },
      });
      results.push({ slug: cr.slug, created: true });
    } catch (e) {
      results.push({ slug: cr.slug, created: false, reason: (e as Error).message });
    }
  }

  return {
    ok: true,
    results,
    count: results.filter((r) => r.created).length,
  };
}
