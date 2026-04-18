import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/blotato/history
// Lista todos os renders Blotato feitos via Uma + resultados:
//  - Creative rows com aiGenerated=true
//  - AgentDecision(uma, CREATIVE_BRIEF) com outputUrl no executionResult
//  - AgentDecision(uma, VISUAL_BRIEF) pra SocialPost
//
// Cada item mostra: quando, qual template, prompt resumido, URL final.

export async function GET() {
  try {
    const [creatives, creativeDecisions, socialDecisions] = await Promise.all([
      prisma.creative.findMany({
        where: { aiGenerated: true },
        include: { collection: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.agentDecision.findMany({
        where: { agentId: "uma", action: "CREATIVE_BRIEF" },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.agentDecision.findMany({
        where: { agentId: "uma", action: "VISUAL_BRIEF" },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    type Item = {
      source: "creative" | "social-post" | "orphan-brief";
      createdAt: string;
      title: string;
      templateId?: string;
      outputUrl?: string | null;
      mood?: string;
      reasoning?: string;
      targetId?: string;
      targetName?: string;
      ok?: boolean;
    };

    const items: Item[] = [];

    for (const c of creatives) {
      items.push({
        source: "creative",
        createdAt: c.createdAt.toISOString(),
        title: `${c.collection.name} · ${c.name}`,
        templateId: c.componentKey.replace(/^ai:/, ""),
        outputUrl: c.imageUrl,
        targetId: c.id,
        targetName: c.slug,
        ok: true,
      });
    }

    // decisions de CREATIVE_BRIEF que NAO tem Creative correspondente
    // (foram gerados mas nao salvos — falha entre render e DB insert)
    const savedCreativeIds = new Set(creatives.map((c) => c.id));
    for (const d of creativeDecisions) {
      if (savedCreativeIds.has(d.targetId)) continue;
      const result = (d.executionResult ?? {}) as {
        brief?: { templateId?: string; mood?: string };
        outputUrl?: string;
      };
      items.push({
        source: "orphan-brief",
        createdAt: d.createdAt.toISOString(),
        title: `ÓRFÃO: ${d.targetName}`,
        templateId: result.brief?.templateId,
        outputUrl: result.outputUrl,
        mood: result.brief?.mood,
        reasoning: d.reasoning,
        targetId: d.targetId,
        ok: false,
      });
    }

    // decisions de VISUAL_BRIEF pra SocialPost (fluxo social organico)
    for (const d of socialDecisions) {
      const post = await prisma.socialPost.findUnique({
        where: { id: d.targetId },
        select: { id: true, title: true, imageUrl: true, slot: true },
      });
      if (!post) continue;
      const params = (d.params ?? {}) as { templateId?: string; mood?: string };
      items.push({
        source: "social-post",
        createdAt: d.createdAt.toISOString(),
        title: `[${post.slot}] ${post.title}`,
        templateId: params.templateId,
        outputUrl: post.imageUrl,
        mood: params.mood,
        reasoning: d.reasoning,
        targetId: post.id,
        targetName: post.title,
        ok: !!post.imageUrl,
      });
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      ok: true,
      total: items.length,
      items: items.slice(0, 50),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
