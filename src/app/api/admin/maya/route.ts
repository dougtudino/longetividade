import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { buildMayaContext, type MayaContext } from "./context/route";

type ChatMessage = { role: "user" | "assistant"; content: string };

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

function fmtBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildSystemPrompt(ctx: MayaContext): string {
  const pendentesAtivas = ctx.pendencias.filter((p) => !p.done);
  const listaPendencias = pendentesAtivas.length
    ? pendentesAtivas.map((p) => `- ${p.title}`).join("\n")
    : "- (nenhuma pendencia aberta no momento)";

  // Saudacao explicita por bucket (AC-02 STORY-MAYA-003)
  const hour = parseInt(ctx.horaAtual.split(":")[0] ?? "0", 10);
  let saudacao = "Boa noite";
  if (hour >= 5 && hour < 12) saudacao = "Bom dia";
  else if (hour >= 12 && hour < 18) saudacao = "Boa tarde";

  return `Voce e Maya, assistente pessoal e de negocios da ${ctx.adminName}, gestora do projeto Longetividade.
Voce e inteligente, criativa, carinhosa e direta. Fala como uma amiga de confianca que
entende tanto de empreendedorismo quanto de vida feminina. E animada mas objetiva.

DADOS DO NEGOCIO HOJE:
- Receita hoje: R$ ${fmtBRL(ctx.vendasHoje.receita)} (${ctx.vendasHoje.count} vendas)
- Receita do mes: R$ ${fmtBRL(ctx.receitaMes)}
- Vendas totais (historico): ${ctx.totalVendas}
- Usuarios VIP no app: ${ctx.usuariosVip}
- Check-ins hoje: ${ctx.checkinsHoje}
- Data: ${ctx.dataHoje} — ${ctx.horaAtual}
- Saudacao do horario atual: "${saudacao}"
- Pendencias abertas: ${pendentesAtivas.length}

PENDENCIAS ABERTAS:
${listaPendencias}

REGRAS DE COMPORTAMENTO:
1. Saudacao inicial SEMPRE comeca com "${saudacao}, ${ctx.adminName}!" exatamente assim.
2. Em seguida, mencione o resumo do dia (1 frase: receita + vendas).
3. Aponte UMA pendencia prioritaria — escolha a mais critica.
4. Ofereca 1 acao concreta que ela pode fazer agora.
5. Responda sempre em portugues brasileiro. Maximo 3 paragrafos curtos.
6. Nunca invente dados — use apenas os dados reais acima.`;
}

async function callAnthropic(
  system: string,
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return "(Maya esta offline: variavel ANTHROPIC_API_KEY nao esta configurada no Railway. Adicione a chave nas variaveis de ambiente para me ativar.)";
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Anthropic API error:", res.status, errText);
    return `(Erro ao contatar Anthropic: ${res.status}. Verifique a chave ANTHROPIC_API_KEY.)`;
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content
    ?.filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("\n")
    .trim();

  return text || "(sem resposta)";
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit por admin (Claude API custa $)
  if (!rateLimit("maya", payload.adminId, { windowMs: 60_000, max: 20 })) {
    return NextResponse.json(
      { error: "Muitas mensagens em sequencia. Aguarde um minuto." },
      { status: 429 }
    );
  }

  let body: { message?: string; history?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userMessage = (body.message ?? "").trim();
  if (!userMessage) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const isInit = userMessage === "__init__";
  const ctx = await buildMayaContext(payload.name);
  const system = buildSystemPrompt(ctx);

  let storedHistory: ChatMessage[] = [];
  try {
    const rows = await prisma.mayaMessage.findMany({
      where: { adminId: payload.adminId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    storedHistory = rows
      .reverse()
      .map((r) => ({
        role: r.role === "assistant" ? "assistant" : "user",
        content: r.content,
      }));
  } catch {
    // tabela pode nao existir
  }

  const promptMessage = isInit
    ? "Me de uma saudacao animada (usando o horario atual), um resumo rapido do dia e aponte a pendencia mais importante para eu resolver agora."
    : userMessage;

  const messagesForApi: ChatMessage[] = isInit
    ? [{ role: "user", content: promptMessage }]
    : [...storedHistory, { role: "user", content: userMessage }];

  const reply = await callAnthropic(system, messagesForApi);

  if (!isInit) {
    try {
      await prisma.mayaMessage.create({
        data: {
          adminId: payload.adminId,
          role: "user",
          content: userMessage,
        },
      });
      await prisma.mayaMessage.create({
        data: {
          adminId: payload.adminId,
          role: "assistant",
          content: reply,
        },
      });
    } catch (e) {
      console.error("Failed to save maya message:", e);
    }
  }

  return NextResponse.json({ reply, context: ctx });
}
