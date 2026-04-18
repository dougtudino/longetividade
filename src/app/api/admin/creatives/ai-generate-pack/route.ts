import { NextRequest, NextResponse } from "next/server";
import { createAiCreative } from "@/lib/creative-ai-pipeline";
import { CREATIVE_PACKS } from "@/lib/creative-packs";

// POST /api/admin/creatives/ai-generate-pack
// Gera N criativos (tipicamente 5) de uma so vez pra montar carrossel
// Meta Ads. Admin depois sobe manualmente no Ads Manager.
//
// Body: { collectionId, packId, slugBase }
//
// Executa em SERIE (nao paralelo) pra nao estourar rate limit Anthropic
// (Uma 30k tokens/min) e nem Blotato (30 renders/min).

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      collectionId?: string;
      packId?: string;
      slugBase?: string;
    };
    if (!body.collectionId || !body.packId || !body.slugBase) {
      return NextResponse.json(
        { ok: false, error: "collectionId, packId e slugBase obrigatorios" },
        { status: 400 }
      );
    }

    const pack = CREATIVE_PACKS.find((p) => p.id === body.packId);
    if (!pack) {
      return NextResponse.json(
        { ok: false, error: `Pack ${body.packId} nao encontrado` },
        { status: 404 }
      );
    }

    const results: Array<{
      slideName: string;
      ok: boolean;
      creativeId?: string;
      imageUrl?: string;
      error?: string;
    }> = [];

    for (const slide of pack.slides) {
      const slug = `${body.slugBase}-${slide.subSlug}`;
      // Delay 3s entre requests (rate limit Anthropic)
      if (results.length > 0) {
        await new Promise((r) => setTimeout(r, 3000));
      }
      try {
        const r = await createAiCreative({
          collectionId: body.collectionId,
          slug,
          name: `${body.slugBase} · ${slide.name}`,
          format: "feed",
          briefing: slide.briefing,
          angle: slide.angle,
          headline: slide.headline,
          cta: slide.angle === "cta" ? "Baixar agora" : undefined,
          style: slide.style,
        });
        results.push({
          slideName: slide.name,
          ok: true,
          creativeId: r.creativeId,
          imageUrl: r.imageUrl,
        });
      } catch (err) {
        results.push({
          slideName: slide.name,
          ok: false,
          error: (err as Error).message.slice(0, 300),
        });
      }
    }

    const succeeded = results.filter((r) => r.ok).length;

    return NextResponse.json({
      ok: succeeded > 0,
      packLabel: pack.label,
      total: results.length,
      succeeded,
      failed: results.length - succeeded,
      results,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
