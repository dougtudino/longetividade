import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

// GET /api/admin/blotato/templates/[id]
// Retorna metadata completa + inputs esperados de um template especifico.
// Primeiro tenta cache DB; se nao tem `inputs` completo, busca direto no
// Blotato com fields=inputs.
//
// Isso responde: "quais campos esse template precisa? tem limite de chars?
// tem campo numerico? lista de items?"

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    // 1. Busca cache local
    const cached = await prisma.agentKnowledge.findFirst({
      where: { agentId: "uma", source: "blotato-templates", title: id },
      select: { metadata: true, body: true, createdAt: true, updatedAt: true },
    });

    // 2. Busca direto no Blotato pra ter `inputs` fresh
    const apiKey =
      process.env.BLOTATO_API_KEY || (await getSetting("BLOTATO_API_KEY"));
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "BLOTATO_API_KEY nao configurada" },
        { status: 500 }
      );
    }

    // Tenta endpoint direto /videos/templates/[id] (se existir)
    let remote: unknown = null;
    try {
      const encoded = encodeURIComponent(id);
      const r = await fetch(
        `https://backend.blotato.com/v2/videos/templates/${encoded}?fields=id,name,description,type,category,aspectRatio,inputs`,
        { headers: { "blotato-api-key": apiKey } }
      );
      if (r.ok) {
        remote = await r.json().catch(() => null);
      }
    } catch {
      /* silent */
    }

    // Fallback: busca listing inteiro e filtra
    if (!remote) {
      const listRes = await fetch(
        `https://backend.blotato.com/v2/videos/templates?fields=id,name,description,type,category,aspectRatio,inputs`,
        { headers: { "blotato-api-key": apiKey } }
      );
      if (listRes.ok) {
        const listData = (await listRes.json()) as {
          items?: Array<{ id: string } & Record<string, unknown>>;
        };
        const items = listData.items ?? [];
        remote = items.find((t) => t.id === id) ?? null;
      }
    }

    return NextResponse.json({
      ok: true,
      id,
      cached: cached?.metadata ?? null,
      cachedAt: cached?.updatedAt ?? null,
      remote,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
