// Motor de blocos data-driven das Landing Pages (block-based).
// O conteúdo de uma LandingPage = array ordenado de blocos tipados, validado
// por Zod (discriminated union por `type`). Isto SUBSTITUI o LtContent JSON
// arbitrário: nada entra no banco sem casar com um schema aqui.
//
// Ponto único de verdade do formato. Usado por:
//   - blocksFromLegacy() (lib/blocks/from-legacy.ts) — migra LtContent → blocos
//   - BlockRenderer (componente) — renderiza /lt/[slug]
//   - API /api/admin/landing-pages/* — valida no servidor antes de persistir
//   - camada de IA — modelo gera blocos validados, nunca HTML solto

import { z } from "zod";

// ─── Props por tipo de bloco ────────────────────────────────────────────────

const HeroProps = z.object({
  badge: z.string().default(""),
  title: z.string(),
  highlight: z.string().default(""),
  subtitle: z.string().default(""),
  ctaLabel: z.string().default("Quero agora"),
  note: z.string().default(""),
  // tema opcional (default navy+gold no renderer)
  accent: z.string().optional(),
  bg: z.string().optional(),
});

// Item de lista que serve tanto pra "dores" (título + texto) quanto pra
// "módulos/checklist" (só texto). title opcional cobre os dois casos.
const ListItem = z.object({
  title: z.string().optional(),
  text: z.string(),
});

const BulletsProps = z.object({
  title: z.string().default(""),
  // "pains" = cards de dor; "checklist" = itens do produto; "plain" = lista simples
  variant: z.enum(["pains", "checklist", "plain"]).default("checklist"),
  items: z.array(ListItem).default([]),
});

// Bloco narrativo (legado "reframe"): título + destaque + corpo.
const ReframeProps = z.object({
  title: z.string().default(""),
  highlight: z.string().default(""),
  body: z.string().default(""),
});

// Oferta/preço — puxa o preço do WorkspacePlan pelo planKey (não hardcoda valor).
const OfferProps = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
  planKey: z.string().default("lt"),
});

const GuaranteeProps = z.object({
  text: z.string(),
});

// Galeria de prova social — renderiza os SocialProofItem do banco (por LP).
const SocialProofProps = z.object({
  title: z.string().default(""),
  // de onde vêm os itens; hoje só "db" (SocialProofItem). Futuro: "inline".
  source: z.enum(["db"]).default("db"),
});

const FaqProps = z.object({
  title: z.string().default(""),
  items: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
});

const VideoSalesProps = z.object({
  title: z.string().default(""),
  videoUrl: z.string(),
  poster: z.string().optional(),
});

const PriceComparisonProps = z.object({
  title: z.string().default(""),
  columns: z
    .array(
      z.object({
        label: z.string(),
        price: z.string().optional(),
        highlight: z.boolean().default(false),
        items: z.array(z.string()).default([]),
      })
    )
    .default([]),
});

const TestimonialsProps = z.object({
  title: z.string().default(""),
  items: z
    .array(
      z.object({
        name: z.string(),
        text: z.string(),
        avatar: z.string().optional(),
      })
    )
    .default([]),
});

const CtaProps = z.object({
  label: z.string().default("Quero agora"),
  planKey: z.string().optional(),
  note: z.string().default(""),
});

// ─── União discriminada ─────────────────────────────────────────────────────
// Cada bloco: { id, type, order, props }. order define a posição na página.

// Genérico em T extends string pra preservar o LITERAL do tipo (ex: "hero"):
// sem isso z.literal(type:string) viraria ZodLiteral<string> e a discriminated
// union perderia a narrowing no TypeScript.
function block<T extends string, P extends z.ZodTypeAny>(type: T, props: P) {
  return z.object({
    id: z.string(),
    type: z.literal(type),
    order: z.number().int().nonnegative(),
    props,
  });
}

export const BlockSchema = z.discriminatedUnion("type", [
  block("hero", HeroProps),
  block("bullets", BulletsProps),
  block("reframe", ReframeProps),
  block("offer", OfferProps),
  block("guarantee", GuaranteeProps),
  block("socialProof", SocialProofProps),
  block("faq", FaqProps),
  block("videoSales", VideoSalesProps),
  block("priceComparison", PriceComparisonProps),
  block("testimonials", TestimonialsProps),
  block("cta", CtaProps),
]);

export const BlocksSchema = z.array(BlockSchema);

export type Block = z.infer<typeof BlockSchema>;
export type Blocks = z.infer<typeof BlocksSchema>;
export type BlockType = Block["type"];

// Lista dos tipos disponíveis (pra UI do editor "adicionar bloco").
export const BLOCK_TYPES: { type: BlockType; label: string }[] = [
  { type: "hero", label: "Hero (topo)" },
  { type: "bullets", label: "Lista / Dores / Módulos" },
  { type: "reframe", label: "Virada de chave (narrativa)" },
  { type: "offer", label: "Oferta / Preço" },
  { type: "guarantee", label: "Garantia" },
  { type: "socialProof", label: "Prova social (galeria)" },
  { type: "faq", label: "FAQ" },
  { type: "videoSales", label: "Vídeo de vendas (VSL)" },
  { type: "priceComparison", label: "Comparativo de planos" },
  { type: "testimonials", label: "Depoimentos" },
  { type: "cta", label: "Chamada pra ação (CTA)" },
];

// Valida e devolve só os blocos válidos (tolerante): ordena por `order` e
// descarta blocos que não casam com o schema, logando quantos caíram. Usado na
// LEITURA (renderer) — uma LP nunca quebra por causa de um bloco corrompido.
export function parseBlocksLenient(raw: unknown): Blocks {
  if (!Array.isArray(raw)) return [];
  const out: Blocks = [];
  for (const item of raw) {
    const r = BlockSchema.safeParse(item);
    if (r.success) out.push(r.data);
  }
  return out.sort((a, b) => a.order - b.order);
}

// Valida ESTRITO (escrita): lança/retorna erro se qualquer bloco for inválido.
// Usado nas rotas de salvar — mata o problema do JSON sem shape.
export function parseBlocksStrict(raw: unknown): Blocks {
  return BlocksSchema.parse(raw).sort((a, b) => a.order - b.order);
}
