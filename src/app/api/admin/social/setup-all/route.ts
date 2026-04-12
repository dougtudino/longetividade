import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTENT_BANK } from "@/lib/social-content-bank";
import { LUNA_KNOWLEDGE_SEED } from "@/lib/social-knowledge-seed";

// POST /api/admin/social/setup-all
// One-click: seed conteudo + seed knowledge + verificar config
export async function POST() {
  const results = {
    content: { created: 0, skipped: 0, error: "" },
    knowledge: { created: 0, skipped: 0, error: "" },
  };

  // 1. Seed content
  try {
    for (const tmpl of CONTENT_BANK) {
      const existing = await prisma.socialPost.findFirst({
        where: { title: tmpl.title },
      });
      if (existing) { results.content.skipped++; continue; }

      const dayOffset = results.content.created * 2;
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + dayOffset + 1);
      scheduledDate.setHours(12, 0, 0, 0);

      await prisma.socialPost.create({
        data: {
          title: tmpl.title,
          content: tmpl.content,
          platform: tmpl.platform,
          format: tmpl.format,
          pillar: tmpl.pillar,
          hashtags: tmpl.hashtags,
          imageBriefing: tmpl.imageBriefing,
          status: "draft",
          scheduledAt: scheduledDate,
        },
      });
      results.content.created++;
    }
  } catch (e) {
    results.content.error = (e as Error).message;
  }

  // 2. Seed knowledge
  try {
    for (const entry of LUNA_KNOWLEDGE_SEED) {
      try {
        const existing = await prisma.agentKnowledge.findFirst({
          where: { agentId: "luna", title: entry.title },
        });
        if (existing) { results.knowledge.skipped++; continue; }
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
        results.knowledge.created++;
      } catch (e) {
        results.knowledge.error = (e as Error).message;
      }
    }
  } catch (e) {
    results.knowledge.error = (e as Error).message;
  }

  return NextResponse.json({
    ok: true,
    ...results,
    summary: `Conteudo: ${results.content.created} criados, ${results.content.skipped} ja existiam. Knowledge: ${results.knowledge.created} criados, ${results.knowledge.skipped} ja existiam.`,
  });
}
