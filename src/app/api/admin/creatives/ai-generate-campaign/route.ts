import { NextRequest, NextResponse } from "next/server";
import { createAiCreative } from "@/lib/creative-ai-pipeline";
import { CAMPAIGN_PACKS } from "@/lib/creative-campaign-packs";
import { CREATIVE_PRESETS } from "@/lib/creative-presets";

// POST /api/admin/creatives/ai-generate-campaign
// Gera bateria completa de N criativos × M formatos (feed + story + reel)
// pra uma campanha Meta Ads. Todos na mesma collection.
//
// Body: { collectionId, campaignPackId, slugBase }

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      collectionId?: string;
      campaignPackId?: string;
      slugBase?: string;
    };
    if (!body.collectionId || !body.campaignPackId || !body.slugBase) {
      return NextResponse.json(
        { ok: false, error: "collectionId, campaignPackId e slugBase obrigatorios" },
        { status: 400 }
      );
    }

    const pack = CAMPAIGN_PACKS.find((p) => p.id === body.campaignPackId);
    if (!pack) {
      return NextResponse.json(
        { ok: false, error: `Campaign pack ${body.campaignPackId} nao encontrado` },
        { status: 404 }
      );
    }

    const results: Array<{
      angleLabel: string;
      formatLabel: string;
      ok: boolean;
      creativeId?: string;
      imageUrl?: string;
      error?: string;
    }> = [];

    // Executa em SERIE pra nao estourar rate limits Anthropic + Blotato
    for (const angle of pack.angles) {
      const preset = CREATIVE_PRESETS.find((p) => p.id === angle.angleId);
      if (!preset) {
        results.push({
          angleLabel: angle.label,
          formatLabel: "—",
          ok: false,
          error: `Preset ${angle.angleId} nao encontrado`,
        });
        continue;
      }

      for (const variation of pack.variations) {
        const slug = `${body.slugBase}-${preset.slug}${variation.slugSuffix}`;
        const name = `${preset.name} (${variation.nameSuffix})`;
        // Delay 3s entre requests pra evitar rate limit Anthropic
        if (results.length > 0) {
          await new Promise((r) => setTimeout(r, 3000));
        }
        try {
          const r = await createAiCreative({
            collectionId: body.collectionId,
            slug,
            name,
            format: variation.format,
            briefing: preset.briefing,
            angle: preset.angle,
            headline: preset.headline,
            cta: preset.angle === "cta" ? "Baixar agora" : undefined,
            style: variation.styleOverride ?? preset.style,
          });
          results.push({
            angleLabel: angle.label,
            formatLabel: variation.nameSuffix,
            ok: true,
            creativeId: r.creativeId,
            imageUrl: r.imageUrl,
          });
        } catch (err) {
          results.push({
            angleLabel: angle.label,
            formatLabel: variation.nameSuffix,
            ok: false,
            error: (err as Error).message.slice(0, 200),
          });
        }
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
