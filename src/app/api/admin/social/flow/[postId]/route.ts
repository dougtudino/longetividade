import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/social/flow/[postId]
// Retorna timeline completa de um SocialPost: Luna→Uma→Quinn→publish.
// Agrega SocialPost + AgentDecision relacionados + SocialPostImage preview.

export async function GET(_req: NextRequest, ctx: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await ctx.params;

    const post = await prisma.socialPost.findUnique({
      where: { id: postId },
      include: {
        images: {
          select: { slideIndex: true, mimeType: true, width: true, height: true },
          orderBy: { slideIndex: "asc" },
        },
      },
    });
    if (!post) {
      return NextResponse.json({ ok: false, error: "Post nao encontrado" }, { status: 404 });
    }

    const decisions = await prisma.agentDecision.findMany({
      where: {
        targetType: "socialPost",
        targetId: postId,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        agentId: true,
        action: true,
        params: true,
        reasoning: true,
        status: true,
        executedAt: true,
        rejectedReason: true,
        executionResult: true,
        createdAt: true,
      },
    });

    // Timeline normalizada
    const timeline = [
      {
        actor: "Luna",
        kind: "generate",
        at: post.createdAt,
        title: "Post gerado",
        detail: `Pilar=${post.pillar} · Slot=${post.slot} · Formato=${post.format}`,
      },
      ...decisions.map((d) => ({
        actor: d.agentId.charAt(0).toUpperCase() + d.agentId.slice(1),
        kind: d.action,
        at: d.createdAt,
        title: `${d.agentId.toUpperCase()} · ${d.action}`,
        detail: d.reasoning,
        status: d.status,
        rejectedReason: d.rejectedReason,
        params: d.params,
      })),
      ...(post.postedAt
        ? [
            {
              actor: "Blotato",
              kind: "publish",
              at: post.postedAt,
              title: "Publicado",
              detail: post.imageUrl ? `URL: ${post.imageUrl}` : "(sem URL)",
            },
          ]
        : []),
    ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    return NextResponse.json({
      ok: true,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status,
        pillar: post.pillar,
        slot: post.slot,
        format: post.format,
        scheduledAt: post.scheduledAt,
        postedAt: post.postedAt,
        imageUrl: post.imageUrl,
        imageBriefing: post.imageBriefing,
        reviewNote: post.reviewNote,
        engagementData: post.engagementData,
        imagesCount: post.images.length,
      },
      timeline,
      decisions,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
