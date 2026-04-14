// Parsers pra extrair componentes estruturados do content de Story
// baseado no format do SocialPost.
//
// Convencao universal: separador "---" em linha propria entre pecas.

export type PollParts = { question: string; optionA: string; optionB: string };
export type QuestionParts = { question: string; subtitle?: string };
export type SequencePart = { text: string; emoji?: string };

export function parsePollContent(content: string): PollParts {
  const parts = content.split(/\n---+\n/).map((s) => s.trim());
  const [question = "", rest = ""] = parts;
  const options = rest.split("\n").filter(Boolean);
  return {
    question: question || "Voce se identifica?",
    optionA: options[0] ?? "Sim",
    optionB: options[1] ?? "Nao",
  };
}

export function parseQuestionContent(content: string): QuestionParts {
  const parts = content.split(/\n---+\n/).map((s) => s.trim());
  return { question: parts[0] ?? "Me conta:", subtitle: parts[1] };
}

// Sequence: cada parte pode ter emoji no inicio "🥦 Texto"
// Detecta emoji por range surrogate-pair ou simbolo unicode >= 0x2000
const EMOJI_AT_START = /^([\u2000-\u3300]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|[0-9]\uFE0F\u20E3)\s+([\s\S]+)$/;

export function parseSequenceContent(content: string): SequencePart[] {
  const parts = content.split(/\n---+\n/).map((s) => s.trim()).filter(Boolean);
  return parts.map((raw) => {
    const m = raw.match(EMOJI_AT_START);
    if (m) return { emoji: m[1], text: m[2] };
    return { text: raw };
  });
}

// Helpers de detecccao por format
export function isPollFormat(format: string): boolean {
  return format === "stories-poll";
}
export function isQuestionFormat(format: string): boolean {
  return format === "stories-question";
}
export function isSequenceFormat(format: string): boolean {
  return format === "stories-sequence";
}
export function isAnyStoryFormat(format: string): boolean {
  return format.startsWith("stories");
}
