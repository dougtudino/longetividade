import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminForWorkspace } from "@/lib/workspace";
import { improveBlocks } from "@/lib/blocks/ai";
import { parseBlocksLenient } from "@/lib/blocks/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteCtx = { params: Promise<{ id: string }> };

// POST /api/admin/landing-pages/:id/improve
// Body: { instruction } → a IA edita os blocos atuais da LP e retorna o array
// VALIDADO por Zod (não persiste — o editor aplica e o usuário salva).
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;

  const page = await prisma.landingPage.findUnique({ where: { id }, select: { workspaceId: true, blocks: true } });
  if (!page) return NextResponse.json({ ok: false, error: "LP não encontrada" }, { status: 404 });

  const auth = await requireAdminForWorkspace(req, page.workspaceId);
  if (!auth.ok) return auth.response;

  let body: { instruction?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const instruction = (body.instruction ?? "").trim();
  if (instruction.length < 4) {
    return NextResponse.json({ ok: false, error: "Instrução muito curta" }, { status: 400 });
  }

  try {
    const blocks = await improveBlocks({ current: parseBlocksLenient(page.blocks), instruction });
    return NextResponse.json({ ok: true, blocks });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
