// Camada de IA do motor de blocos. A IA NUNCA produz HTML — só preenche o
// catálogo de blocos, e a saída SEMPRE passa pelo Zod (BlocksSchema) antes de
// voltar pra rota. Se a 1ª geração não validar, faz UMA tentativa de correção
// passando os erros do Zod; se ainda falhar, lança (a rota não persiste lixo).

import { callClaudeWithTool } from "../agents/llm-json";
import { BlocksSchema, type Blocks } from "./schema";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

// Catálogo de blocos descrito pro modelo. Mantido em sincronia com schema.ts.
const BLOCKS_SPEC = `
Cada bloco é um objeto { "type": <tipo>, "props": {...} }. NÃO inclua "id" nem
"order" (são preenchidos depois). Tipos e props válidos:

- hero: { badge, title, highlight, subtitle, ctaLabel, note, accent?, bg? }
    title é obrigatório. accent/bg são cores hex (ex "#d4af37"/"#0c1626").
- bullets: { title, variant: "pains"|"checklist"|"plain", items: [{ title?, text }] }
    use variant "pains" pra dores (cards), "checklist" pra lista do produto.
- reframe: { title, highlight, body }  (bloco narrativo de virada de chave)
- offer: { title, subtitle, planKey }  (planKey normalmente "lt"; preço vem do banco)
- guarantee: { text }
- socialProof: { title, source: "db" }  (galeria puxada do banco — não invente imagens)
- faq: { title, items: [{ q, a }] }
- videoSales: { title, videoUrl, poster? }  (videoUrl = URL de embed; "" se não houver)
- priceComparison: { title, columns: [{ label, price?, highlight?, items: [string] }] }
- testimonials: { title, items: [{ name, text, avatar? }] }
- cta: { label, planKey?, note? }

Ordem recomendada de uma LP de alta conversão: hero → reframe/bullets(pains) →
bullets(checklist) → (videoSales) → testimonials/socialProof → offer → guarantee
→ faq → cta. Escreva em português brasileiro, tom direto e específico do nicho.
`.trim();

const TOOL_SCHEMA = {
  type: "object" as const,
  properties: {
    blocks: {
      type: "array",
      description: "Array ordenado de blocos da landing page.",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          props: { type: "object" },
        },
        required: ["type", "props"],
      },
    },
  },
  required: ["blocks"],
};

type RawResult = { blocks: { type: string; props: Record<string, unknown> }[] };

// Normaliza: injeta id/order determinísticos (a IA não os gera) e descarta itens
// sem type. Depois o Zod valida o resto.
function normalize(raw: RawResult): unknown[] {
  if (!raw || !Array.isArray(raw.blocks)) return [];
  return raw.blocks
    .filter((b) => b && typeof b.type === "string")
    .map((b, i) => ({ id: `ai-${i}`, type: b.type, order: i, props: b.props ?? {} }));
}

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY não configurada");
  return key;
}

async function callAndValidate(system: string, userPrompt: string): Promise<Blocks> {
  const apiKey = getApiKey();
  const first = await callClaudeWithTool<RawResult>({
    apiKey, model: MODEL, maxTokens: MAX_TOKENS,
    system, userPrompt,
    toolName: "build_landing_page",
    toolDescription: "Monta a landing page como array de blocos tipados.",
    schema: TOOL_SCHEMA,
  });

  const firstParse = BlocksSchema.safeParse(normalize(first));
  if (firstParse.success) return firstParse.data.map((b, i) => ({ ...b, order: i }));

  // 1 tentativa de correção, passando os erros do Zod.
  const issues = firstParse.error.issues.slice(0, 15).map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n");
  const second = await callClaudeWithTool<RawResult>({
    apiKey, model: MODEL, maxTokens: MAX_TOKENS,
    system,
    userPrompt: `${userPrompt}\n\nA saída anterior tinha estes erros de validação. Corrija exatamente estes pontos e devolva os blocos de novo:\n${issues}`,
    toolName: "build_landing_page",
    toolDescription: "Monta a landing page como array de blocos tipados.",
    schema: TOOL_SCHEMA,
  });

  const secondParse = BlocksSchema.safeParse(normalize(second));
  if (secondParse.success) return secondParse.data.map((b, i) => ({ ...b, order: i }));

  throw new Error("A IA não produziu blocos válidos após correção");
}

// Gera uma LP do zero a partir de um brief. `base` (blocos de um template) é
// referência opcional de estrutura.
export async function generateBlocks(opts: { niche: string; brief: string; base?: Blocks }): Promise<Blocks> {
  const system = `Você é um copywriter sênior de landing pages de alta conversão para info-produtos.\nResponda SEMPRE chamando a tool build_landing_page.\n\n${BLOCKS_SPEC}`;
  const baseHint = opts.base && opts.base.length
    ? `\n\nUse esta estrutura de blocos como ponto de partida (mesma ordem/tipos, reescrevendo o conteúdo):\n${JSON.stringify(opts.base.map((b) => ({ type: b.type, props: b.props })))}`
    : "";
  const userPrompt = `Nicho: ${opts.niche || "info-produto"}\nBrief do produto:\n${opts.brief}${baseHint}`;
  return callAndValidate(system, userPrompt);
}

// Edita blocos existentes seguindo uma instrução em linguagem natural.
export async function improveBlocks(opts: { current: Blocks; instruction: string }): Promise<Blocks> {
  const system = `Você é um editor sênior de landing pages. Recebe os blocos atuais e uma instrução, e devolve a versão editada.\nResponda SEMPRE chamando a tool build_landing_page. Preserve o que a instrução não pede pra mudar.\n\n${BLOCKS_SPEC}`;
  const userPrompt = `Blocos atuais (JSON):\n${JSON.stringify(opts.current.map((b) => ({ type: b.type, props: b.props })))}\n\nInstrução:\n${opts.instruction}`;
  return callAndValidate(system, userPrompt);
}
