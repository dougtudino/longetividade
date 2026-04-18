import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchInsightsByImageHashes, type InsightsPreset } from "@/lib/meta-ads";

// GET /api/admin/creatives/insights?preset=last_7d&collection=<slug?>
// Retorna CTR/ROAS/spend/clicks por Creative (cruzando metaImageHash com Meta insights).

const VALID_PRESETS: InsightsPreset[] = [
  "today",
  "yesterday",
  "last_7d",
  "last_30d",
  "lifetime",
];

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const presetParam = (url.searchParams.get("preset") ?? "last_7d") as InsightsPreset;
    const preset = VALID_PRESETS.includes(presetParam) ? presetParam : "last_7d";
    const collectionSlug = url.searchParams.get("collection");

    const creatives = await prisma.creative.findMany({
      where: {
        metaImageHash: { not: null },
        ...(collectionSlug ? { collection: { slug: collectionSlug } } : {}),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        format: true,
        metaImageHash: true,
        imageUrl: true,
        collectionId: true,
        aiGenerated: true,
      },
    });

    const hashes = creatives
      .map((c) => c.metaImageHash!)
      .filter((h, i, arr) => arr.indexOf(h) === i);

    if (hashes.length === 0) {
      return NextResponse.json({
        ok: true,
        preset,
        creatives: creatives.map((c) => ({
          ...c,
          insights: null,
          adsCount: 0,
        })),
        warning: "Nenhum creative com metaImageHash — gere creatives via IA ou faça upload Meta pra popular.",
      });
    }

    const res = await fetchInsightsByImageHashes(hashes, preset);
    if ("ok" in res && res.ok === false) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 500 });
    }

    const byHash = (res as { ok: true; byHash: Record<string, { insights: unknown; adsCount: number }> }).byHash;

    const enriched = creatives.map((c) => ({
      ...c,
      insights: c.metaImageHash ? byHash[c.metaImageHash]?.insights ?? null : null,
      adsCount: c.metaImageHash ? byHash[c.metaImageHash]?.adsCount ?? 0 : 0,
    }));

    return NextResponse.json({ ok: true, preset, creatives: enriched });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
