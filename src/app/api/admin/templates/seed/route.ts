import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { DEFAULT_TEMPLATES } from "@/lib/blocks/default-templates";

export const runtime = "nodejs";

// POST /api/admin/templates/seed — cria os templates globais default
// (idempotente: pula os que já existem pelo nome). Rodar 1x após o deploy.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const created: string[] = [];
  const skipped: string[] = [];
  try {
    for (const t of DEFAULT_TEMPLATES) {
      const exists = await prisma.template.findFirst({
        where: { name: t.name, scope: "global" },
        select: { id: true },
      });
      if (exists) {
        skipped.push(t.name);
        continue;
      }
      await prisma.template.create({
        data: { name: t.name, niche: t.niche, scope: "global", blocks: t.blocks as object },
      });
      created.push(t.name);
    }
    return NextResponse.json({ ok: true, created, skipped });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
