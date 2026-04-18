import { NextRequest, NextResponse } from "next/server";
import { getCreation, getOutputUrl } from "@/lib/blotato-client";

// GET /api/admin/blotato/creations/[id]
// Busca status de um creation no Blotato por ID. Util pra recuperar
// renders que deram timeout no POST /ai-generate — o render continua
// no Blotato mesmo depois do timeout no nosso lado.
//
// Retorna: { ok, id, status, outputUrl, raw }

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const creation = await getCreation(id);
    return NextResponse.json({
      ok: true,
      id,
      status: creation.status,
      outputUrl: getOutputUrl(creation),
      raw: creation,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
