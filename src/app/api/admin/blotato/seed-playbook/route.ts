import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildPlaybookKnowledgeBody,
  BLOTATO_TEMPLATES,
  BLOTATO_PLAYBOOK_VERSION,
} from "@/lib/blotato-playbook";

// POST /api/admin/blotato/seed-playbook
// Seeda playbook Blotato em AgentKnowledge(agentId=uma, source=blotato-playbook).
// Uma consulta isso antes de decidir template + inputs.
//
// Idempotente: substitui knowledge existente pelo novo (upsert manual).

export async function POST() {
  try {
    const body = buildPlaybookKnowledgeBody();

    // Remove versoes antigas do playbook
    await prisma.agentKnowledge.deleteMany({
      where: { agentId: "uma", source: "blotato-playbook" },
    });

    // Cria entrada principal (playbook resumido — cabe no contexto Uma)
    const main = await prisma.agentKnowledge.create({
      data: {
        agentId: "uma",
        kind: "reference",
        title: `Blotato Playbook v${BLOTATO_PLAYBOOK_VERSION}`,
        body,
        source: "blotato-playbook",
        metadata: {
          version: BLOTATO_PLAYBOOK_VERSION,
          templatesCount: BLOTATO_TEMPLATES.length,
          templates: BLOTATO_TEMPLATES.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            output: t.output,
          })),
        },
      },
    });

    return NextResponse.json({
      ok: true,
      knowledgeId: main.id,
      version: BLOTATO_PLAYBOOK_VERSION,
      templatesCount: BLOTATO_TEMPLATES.length,
      bodySize: body.length,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
