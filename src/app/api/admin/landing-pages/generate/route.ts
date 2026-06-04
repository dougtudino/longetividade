import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminWorkspace } from "@/lib/workspace";
import { generateBlocks } from "@/lib/blocks/ai";
import { parseBlocksStrict, type Blocks } from "@/lib/blocks/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/admin/landing-pages/generate
// Body: { niche, brief, templateId? } → retorna blocos VALIDADOS por Zod (não
// persiste — o editor decide). Saída inválida nunca volta (a lib lança).
export async function POST(req: NextRequest) {
  const auth = await requireAdminWorkspace(req);
  if (!auth.ok) return auth.response;

  let body: { niche?: string; brief?: string; templateId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const brief = (body.brief ?? "").trim();
  if (brief.length < 10) {
    return NextResponse.json({ ok: false, error: "Brief muito curto (mín. 10 caracteres)" }, { status: 400 });
  }

  let base: Blocks | undefined;
  if (body.templateId) {
    const tpl = await prisma.template.findUnique({ where: { id: body.templateId }, select: { blocks: true } });
    if (tpl) {
      const p = parseBlocksStrict(tpl.blocks);
      base = p;
    }
  }

  try {
    const blocks = await generateBlocks({ niche: (body.niche ?? "").trim(), brief, base });
    return NextResponse.json({ ok: true, blocks });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
