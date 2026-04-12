import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LUNA_KNOWLEDGE_SEED } from "@/lib/social-knowledge-seed";

// POST /api/admin/social/seed-knowledge
// Popula a base de conhecimento da Luna com estrategias de growth,
// publico-alvo, referencias de especialistas, taticas de engagement.
// Idempotente: skip entries que ja existem (match por title).
export async function POST() {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    for (const entry of LUNA_KNOWLEDGE_SEED) {
      try {
        const existing = await prisma.agentKnowledge.findFirst({
          where: { agentId: "luna", title: entry.title },
        });
        if (existing) {
          skipped += 1;
          continue;
        }
        await prisma.agentKnowledge.create({
          data: {
            agentId: "luna",
            kind: entry.kind,
            title: entry.title,
            body: entry.body,
            source: entry.source ?? null,
            metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
          },
        });
        created += 1;
      } catch (e) {
        errors.push(`${entry.title}: ${(e as Error).message}`);
      }
    }

    return NextResponse.json({
      ok: errors.length === 0,
      total: LUNA_KNOWLEDGE_SEED.length,
      created,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: `Falha: ${(e as Error).message}. Se tabela nao existe, rode /api/admin/migrate/schema primeiro.`,
    });
  }
}
