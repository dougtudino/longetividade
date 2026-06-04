import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminWorkspace, requireAdminForWorkspace } from "@/lib/workspace";
import { parseBlocksStrict } from "@/lib/blocks/schema";

export const runtime = "nodejs";

// GET /api/admin/landing-pages — lista as LPs do workspace ATIVO da sessão.
export async function GET(req: NextRequest) {
  const auth = await requireAdminWorkspace(req);
  if (!auth.ok) return auth.response;
  try {
    const pages = await prisma.landingPage.findMany({
      where: { workspaceId: auth.workspaceId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, slug: true, title: true, status: true, templateId: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, pages, workspaceId: auth.workspaceId });
  } catch (e) {
    return NextResponse.json({ ok: true, pages: [], warning: (e as Error).message });
  }
}

// POST /api/admin/landing-pages — cria uma LP no workspace ativo.
// Body: { slug, title?, templateId? } — blocos copiados do template (ou vazio).
export async function POST(req: NextRequest) {
  const auth = await requireAdminWorkspace(req);
  if (!auth.ok) return auth.response;

  let body: { slug?: string; title?: string; templateId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim().toLowerCase();
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "Slug inválido (minúsculas, números, hífen)" }, { status: 400 });
  }

  // Defesa em profundidade no workspace alvo (= ativo).
  const access = await requireAdminForWorkspace(req, auth.workspaceId);
  if (!access.ok) return access.response;

  try {
    const existing = await prisma.landingPage.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ ok: false, error: "Slug já existe" }, { status: 400 });

    let blocks: unknown = [];
    let templateId: string | null = null;
    if (body.templateId) {
      const tpl = await prisma.template.findUnique({ where: { id: body.templateId }, select: { id: true, blocks: true } });
      if (tpl) {
        // valida os blocos do template antes de copiar
        blocks = parseBlocksStrict(tpl.blocks);
        templateId = tpl.id;
      }
    }

    const page = await prisma.landingPage.create({
      data: {
        workspaceId: auth.workspaceId,
        templateId,
        slug,
        title: (body.title ?? "").trim() || slug,
        blocks: blocks as object,
        status: "draft",
      },
      select: { id: true, slug: true },
    });
    return NextResponse.json({ ok: true, page });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
