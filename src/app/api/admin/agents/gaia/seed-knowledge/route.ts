import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GAIA_KNOWLEDGE_SEED } from "@/lib/gaia-knowledge-seed";

// POST /api/admin/agents/gaia/seed-knowledge
// Popula a base de conhecimento inicial da Gaia.
// Idempotente: skip entries que ja existem (match por agentId + title).
export async function POST() {
  let created = 0;
  let skipped = 0;

  for (const entry of GAIA_KNOWLEDGE_SEED) {
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
        metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
      },
    });
    created += 1;
  }

  return NextResponse.json({
    ok: true,
    total: GAIA_KNOWLEDGE_SEED.length,
    created,
    skipped,
  });
}
