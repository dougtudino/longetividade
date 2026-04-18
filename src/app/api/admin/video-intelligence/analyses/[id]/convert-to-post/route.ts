import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/video-intelligence/analyses/[id]/convert-to-post
// Converte um VideoAnalysis em SocialPost(draft) pra Luna/Uma/Blotato
// consumirem. O admin escolhe qual dos 3 conceitos Luna vira o post.
//
// Body: { conceptIndex: 0 | 1 | 2, slot?: "REEL" | "FEED_AM" | "STORY", pillar?: "s" | "e" | "m" | "promo" }

function extractConceptN(
  lunaConcepts: string,
  index: number
): { title: string; hook: string; content: string } | null {
  // Luna retorna 3 conceitos numerados. Cada um tem ** Titulo **, ** Hook **,
  // ** Estrutura **, ** CTA **. Fazemos split grosso por "1." "2." "3.".
  const sections = lunaConcepts.split(/\n\s*(?:\d+\.\s*|##\s*Conceito\s*\d+)/).filter(Boolean);
  const section = sections[index];
  if (!section) return null;

  const titleMatch = section.match(/[Tt][íi]tulo[:\s*]*[\s\S]*?\n/);
  const hookMatch = section.match(/[Hh]ook[:\s*]*([\s\S]*?)(?=\n\s*\*\*|\n\s*##|$)/);
  const estruturaMatch = section.match(/[Ee]strutura[:\s*]*([\s\S]*?)(?=\n\s*\*\*[Cc][Tt][Aa]|\n\s*##|$)/);
  const ctaMatch = section.match(/[Cc][Tt][Aa][:\s*]*([\s\S]*?)(?=\n\s*\d+\.|\n\s*##|$)/);

  const title = titleMatch
    ? titleMatch[0]
        .replace(/^[\s\S]*[Tt][íi]tulo[:\s*]*/, "")
        .replace(/\*\*/g, "")
        .trim()
        .split("\n")[0]
        .slice(0, 120)
    : `Conceito ${index + 1}`;
  const hook = hookMatch ? hookMatch[1].replace(/\*\*/g, "").trim() : "";
  const estrutura = estruturaMatch ? estruturaMatch[1].replace(/\*\*/g, "").trim() : "";
  const cta = ctaMatch ? ctaMatch[1].replace(/\*\*/g, "").trim() : "";

  const content = [
    hook ? `${hook}` : "",
    "",
    estrutura,
    "",
    cta ? `→ ${cta}` : "",
  ]
    .filter(Boolean)
    .join("\n")
    .trim();

  return { title, hook, content };
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as {
      conceptIndex?: number;
      slot?: string;
      pillar?: string;
    };
    const conceptIndex = body.conceptIndex ?? 0;
    const slot = body.slot ?? "REEL";
    const pillar = body.pillar ?? "m";

    const analysis = await prisma.videoAnalysis.findUnique({
      where: { id },
      include: { competitor: true },
    });
    if (!analysis) {
      return NextResponse.json({ ok: false, error: "VideoAnalysis nao encontrado" }, { status: 404 });
    }
    if (!analysis.lunaConcepts) {
      return NextResponse.json(
        { ok: false, error: "Esse video ainda nao tem conceitos Luna gerados" },
        { status: 400 }
      );
    }

    const concept = extractConceptN(analysis.lunaConcepts, conceptIndex);
    if (!concept) {
      return NextResponse.json(
        { ok: false, error: `conceptIndex ${conceptIndex} fora do range (Luna retornou ${analysis.lunaConcepts.split(/\n\s*\d+\./).length - 1} conceitos)` },
        { status: 400 }
      );
    }

    const format =
      slot === "REEL" ? "reels" : slot === "STORY" ? "stories" : "imagem";

    const post = await prisma.socialPost.create({
      data: {
        title: concept.title,
        content: concept.content || concept.hook,
        platform: "instagram",
        format,
        pillar,
        slot,
        status: "draft",
        imageBriefing: `Inspirado em Reel viral @${analysis.competitor.username} (${analysis.views.toLocaleString("pt-BR")} views).
Conceito original: ${analysis.concept.slice(0, 300)}
Hook original (inspirar, nao copiar): ${analysis.hook.slice(0, 200)}`,
        createdBy: "video-intel-bridge",
      },
    });

    return NextResponse.json({
      ok: true,
      post: { id: post.id, title: post.title, status: post.status, slot: post.slot },
      analysisId: analysis.id,
      conceptUsed: conceptIndex,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
