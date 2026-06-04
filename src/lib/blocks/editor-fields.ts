// Descritor declarativo dos campos de cada tipo de bloco, consumido pelo editor
// visual (/admin/landing-pages/[id]). Mantém o editor genérico e compacto: pra
// adicionar um campo novo, basta editar aqui. Client-safe (só tipos + dados).

import type { Block, BlockType } from "./schema";

export type FieldKind =
  | "text"
  | "textarea"
  | "enum"
  | "pairs" // ListItem[] — "Título | Texto" por linha (title opcional)
  | "strings" // string[] — 1 por linha
  | "faq" // {q,a}[] — "Pergunta | Resposta" por linha
  | "testimonials" // {name,text,avatar?}[] — "Nome | Texto | avatarUrl?" por linha
  | "columns"; // priceComparison — "Label | Preço | item;item;item | *destaque?" por linha

export type FieldSpec = {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[]; // pra enum
  hint?: string;
};

export const BLOCK_FIELDS: Record<BlockType, FieldSpec[]> = {
  hero: [
    { key: "badge", label: "Badge", kind: "text" },
    { key: "title", label: "Título (linha 1)", kind: "text" },
    { key: "highlight", label: "Destaque (linha 2)", kind: "text" },
    { key: "subtitle", label: "Subtítulo", kind: "textarea" },
    { key: "ctaLabel", label: "Texto do botão (o preço é anexado)", kind: "text" },
    { key: "note", label: "Nota abaixo do botão", kind: "text" },
    { key: "accent", label: "Cor de destaque (hex)", kind: "text", hint: "ex: #d4af37" },
    { key: "bg", label: "Cor de fundo (hex)", kind: "text", hint: "ex: #0c1626" },
  ],
  bullets: [
    { key: "title", label: "Título da seção", kind: "text" },
    { key: "variant", label: "Estilo", kind: "enum", options: ["pains", "checklist", "plain"] },
    { key: "items", label: "Itens (1 por linha — 'Título | Texto'; título opcional)", kind: "pairs" },
  ],
  reframe: [
    { key: "title", label: "Título", kind: "text" },
    { key: "highlight", label: "Destaque", kind: "text" },
    { key: "body", label: "Texto", kind: "textarea" },
  ],
  offer: [
    { key: "title", label: "Título", kind: "text" },
    { key: "subtitle", label: "Subtítulo do preço", kind: "text" },
    { key: "planKey", label: "planKey (puxa preço do WorkspacePlan)", kind: "text", hint: "ex: lt" },
  ],
  guarantee: [{ key: "text", label: "Texto da garantia", kind: "textarea" }],
  socialProof: [
    { key: "title", label: "Título", kind: "text" },
    { key: "source", label: "Origem", kind: "enum", options: ["db"] },
  ],
  faq: [
    { key: "title", label: "Título", kind: "text" },
    { key: "items", label: "Perguntas (1 por linha — 'Pergunta | Resposta')", kind: "faq" },
  ],
  videoSales: [
    { key: "title", label: "Título", kind: "text" },
    { key: "videoUrl", label: "URL do embed do vídeo", kind: "text", hint: "ex: https://www.youtube.com/embed/ID" },
    { key: "poster", label: "Poster (opcional)", kind: "text" },
  ],
  priceComparison: [
    { key: "title", label: "Título", kind: "text" },
    { key: "columns", label: "Colunas (1 por linha — 'Label | Preço | item;item | *')", kind: "columns", hint: "* no fim = destaque" },
  ],
  testimonials: [
    { key: "title", label: "Título", kind: "text" },
    { key: "items", label: "Depoimentos (1 por linha — 'Nome | Texto | avatarUrl?')", kind: "testimonials" },
  ],
  cta: [
    { key: "label", label: "Texto do botão", kind: "text" },
    { key: "planKey", label: "planKey (opcional — anexa preço)", kind: "text" },
    { key: "note", label: "Nota", kind: "text" },
  ],
};

// Props default ao adicionar um bloco novo no editor.
export function defaultProps(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "hero":
      return { badge: "", title: "Novo título", highlight: "", subtitle: "", ctaLabel: "Quero agora — ", note: "" };
    case "bullets":
      return { title: "", variant: "checklist", items: [] };
    case "reframe":
      return { title: "", highlight: "", body: "" };
    case "offer":
      return { title: "", subtitle: "", planKey: "lt" };
    case "guarantee":
      return { text: "" };
    case "socialProof":
      return { title: "", source: "db" };
    case "faq":
      return { title: "", items: [] };
    case "videoSales":
      return { title: "", videoUrl: "" };
    case "priceComparison":
      return { title: "", columns: [] };
    case "testimonials":
      return { title: "", items: [] };
    case "cta":
      return { label: "Quero agora", planKey: "lt", note: "" };
    default:
      return {};
  }
}

// ─── serialização texto ↔ estrutura pros campos de lista ─────────────────────

export function pairsToText(items: { title?: string; text: string }[]): string {
  return items.map((i) => (i.title ? `${i.title} | ${i.text}` : i.text)).join("\n");
}
export function textToPairs(t: string): { title?: string; text: string }[] {
  return t.split("\n").filter((l) => l.trim()).map((l) => {
    const idx = l.indexOf("|");
    if (idx === -1) return { text: l.trim() };
    return { title: l.slice(0, idx).trim(), text: l.slice(idx + 1).trim() };
  });
}

export function faqToText(items: { q: string; a: string }[]): string {
  return items.map((i) => `${i.q} | ${i.a}`).join("\n");
}
export function textToFaq(t: string): { q: string; a: string }[] {
  return t.split("\n").filter((l) => l.trim()).map((l) => {
    const idx = l.indexOf("|");
    return { q: l.slice(0, idx === -1 ? l.length : idx).trim(), a: idx === -1 ? "" : l.slice(idx + 1).trim() };
  });
}

export function testimonialsToText(items: { name: string; text: string; avatar?: string }[]): string {
  return items.map((i) => [i.name, i.text, i.avatar ?? ""].join(" | ")).join("\n");
}
export function textToTestimonials(t: string): { name: string; text: string; avatar?: string }[] {
  return t.split("\n").filter((l) => l.trim()).map((l) => {
    const [name = "", text = "", avatar = ""] = l.split("|").map((s) => s.trim());
    return avatar ? { name, text, avatar } : { name, text };
  });
}

export function columnsToText(cols: { label: string; price?: string; items: string[]; highlight: boolean }[]): string {
  return cols.map((c) => [c.label, c.price ?? "", c.items.join(";"), c.highlight ? "*" : ""].join(" | ")).join("\n");
}
export function textToColumns(t: string): { label: string; price?: string; items: string[]; highlight: boolean }[] {
  return t.split("\n").filter((l) => l.trim()).map((l) => {
    const parts = l.split("|").map((s) => s.trim());
    const [label = "", price = "", items = "", flag = ""] = parts;
    return {
      label,
      price: price || undefined,
      items: items ? items.split(";").map((s) => s.trim()).filter(Boolean) : [],
      highlight: flag === "*",
    };
  });
}

// Helper de tipo: extrai props como objeto editável.
export function blockProps(b: Block): Record<string, unknown> {
  return b.props as Record<string, unknown>;
}
