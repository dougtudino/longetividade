import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminWorkspace } from "@/lib/workspace";
import { BlocksSchema } from "@/lib/blocks/schema";

export const runtime = "nodejs";

// GET /api/admin/templates — templates globais + os privados do workspace ativo.
export async function GET(req: NextRequest) {
  const auth = await requireAdminWorkspace(req);
  if (!auth.ok) return auth.response;
  try {
    const templates = await prisma.template.findMany({
      where: { OR: [{ scope: "global" }, { workspaceId: auth.workspaceId }] },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, niche: true, scope: true, workspaceId: true, blocks: true, updatedAt: true },
    });
    return NextResponse.json({ ok: true, templates });
  } catch (e) {
    return NextResponse.json({ ok: true, templates: [], warning: (e as Error).message });
  }
}

// POST /api/admin/templates — cria template. Body: { name, niche?, scope?, blocks? }
// scope "workspace" => privado do workspace ativo; senão global.
export async function POST(req: NextRequest) {
  const auth = await requireAdminWorkspace(req);
  if (!auth.ok) return auth.response;

  let body: { name?: string; niche?: string; scope?: string; blocks?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "Nome obrigatório" }, { status: 400 });

  let blocks: unknown = [];
  if (body.blocks !== undefined) {
    const parsed = BlocksSchema.safeParse(body.blocks);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Blocos inválidos", issues: parsed.error.issues.slice(0, 10) }, { status: 400 });
    }
    blocks = parsed.data;
  }

  const scope = body.scope === "workspace" ? "workspace" : "global";

  try {
    const template = await prisma.template.create({
      data: {
        name,
        niche: (body.niche ?? "").trim() || null,
        scope,
        workspaceId: scope === "workspace" ? auth.workspaceId : null,
        blocks: blocks as object,
      },
      select: { id: true, name: true },
    });
    return NextResponse.json({ ok: true, template });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
