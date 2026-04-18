import { NextRequest, NextResponse } from "next/server";
import { createAiCreative } from "@/lib/creative-ai-pipeline";

// POST /api/admin/creatives/ai-generate
// Gera creative via IA: Uma → Blotato → Quinn → Meta /adimages upload.
//
// Body: {
//   collectionId: string,
//   slug: string,                   // unico dentro da colecao
//   name: string,
//   format: "feed" | "story" | "banner",
//   briefing: string,               // texto livre: dor/prova/objecao/promessa
//   angle?: "dor" | "prova" | "objecao" | "promessa" | "cta",
//   headline?: string,
//   cta?: string
// }

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      collectionId?: string;
      slug?: string;
      name?: string;
      format?: "feed" | "story" | "banner";
      briefing?: string;
      angle?: "dor" | "prova" | "objecao" | "promessa" | "cta";
      headline?: string;
      cta?: string;
    };

    if (!body.collectionId || !body.slug || !body.name || !body.format || !body.briefing) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Campos obrigatorios: collectionId, slug, name, format, briefing",
        },
        { status: 400 }
      );
    }

    const result = await createAiCreative({
      collectionId: body.collectionId,
      slug: body.slug,
      name: body.name,
      format: body.format,
      briefing: body.briefing,
      angle: body.angle,
      headline: body.headline,
      cta: body.cta,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg.includes("Quinn bloqueou") ? 422 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
