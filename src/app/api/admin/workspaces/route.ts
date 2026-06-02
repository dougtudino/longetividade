import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { resolveActiveWorkspaceId } from "@/lib/workspace";

export const runtime = "nodejs";

// GET /api/admin/workspaces
// Lista TODOS os workspaces (gestão) com seus planos + qual está ativo na
// sessão. (Na Fase 0 esta rota servia o switcher; o switcher migrou pro /me,
// então aqui ela vira a API da tela de gestão.)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        plans: { orderBy: { orderIndex: "asc" } },
        _count: { select: { memberships: true } },
      },
    });
    const activeWorkspaceId = await resolveActiveWorkspaceId(
      auth.admin.adminId,
      auth.admin.activeWorkspaceId
    );
    return NextResponse.json({ ok: true, workspaces, activeWorkspaceId });
  } catch (e) {
    return NextResponse.json({ ok: true, workspaces: [], warning: (e as Error).message });
  }
}

// POST /api/admin/workspaces  { slug, name, brandName?, domains? }
// Cria workspace + membership owner pro admin atual.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  let body: { slug?: string; name?: string; brandName?: string; domains?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const brandName = (body.brandName ?? "").trim() || name;

  if (!/^[a-z0-9-]{2,40}$/.test(slug)) {
    return NextResponse.json(
      { ok: false, error: "Slug inválido (use letras minúsculas, números e hífen)" },
      { status: 400 }
    );
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "Nome obrigatório" }, { status: 400 });
  }

  try {
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Slug já existe" }, { status: 400 });
    }

    const workspace = await prisma.workspace.create({
      data: {
        slug,
        name,
        brandName,
        domains: Array.isArray(body.domains) ? body.domains : [],
        memberships: {
          create: { adminId: auth.admin.adminId, role: "owner" },
        },
      },
    });

    return NextResponse.json({ ok: true, workspace });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
