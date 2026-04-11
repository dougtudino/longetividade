import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GAIA_KNOWLEDGE_SEED } from "@/lib/gaia-knowledge-seed";

// POST /api/admin/agents/gaia/seed-knowledge
// Popula a base de conhecimento inicial da Gaia.
// Idempotente: skip entries que ja existem (match por agentId + title).
export async function POST() {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    for (const entry of GAIA_KNOWLEDGE_SEED) {
      try {
        const existing = await prisma.agentKnowledge.findFirst({
          where: { agentId: "gaia", title: entry.title },
        });

        if (existing) {
          skipped += 1;
          continue;
        }

        await prisma.agentKnowledge.create({
          data: {
            agentId: "gaia",
            kind: entry.kind,
            title: entry.title,
            body: entry.body,
            source: entry.source ?? null,
            metadata: entry.metadata
              ? JSON.parse(JSON.stringify(entry.metadata))
              : undefined,
          },
        });
        created += 1;
      } catch (entryErr) {
        errors.push(`${entry.title}: ${(entryErr as Error).message}`);
      }
    }

    return NextResponse.json({
      ok: errors.length === 0,
      total: GAIA_KNOWLEDGE_SEED.length,
      created,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    // Erro global — geralmente significa que a tabela AgentKnowledge
    // ainda nao existe no banco (Railway ainda deployando ou prisma db
    // push nao rodou). Mensagem clara em vez de response vazia.
    const msg = (e as Error).message;
    console.error("seed-knowledge global error:", msg);
    return NextResponse.json(
      {
        ok: false,
        error: `Falha na base: ${msg}. Se essa for a primeira vez apos deploy, aguarde 1-2 min pro Railway rodar prisma db push e tente de novo.`,
        created,
        skipped,
      },
      { status: 200 }
    );
  }
}

// GET e um atalho alternativo pra seed (alguns painters preferem GET)
export async function GET() {
  return POST();
}
