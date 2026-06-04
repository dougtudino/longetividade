import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminForWorkspace } from "@/lib/workspace";
import { BlocksSchema } from "@/lib/blocks/schema";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ id: string }> };

// Carrega a LP e checa ownership do workspace dono. Retorna a LP ou a resposta
// de erro (401/403/404) pra ser propagada.
async function loadOwned(req: NextRequest, id: string) {
  const page = await prisma.landingPage.findUnique({ where: { id } });
  if (!page) {
    return { ok: false as const, response: NextResponse.json({ ok: false, error: "LP não encontrada" }, { status: 404 }) };
  }
  const auth = await requireAdminForWorkspace(req, page.workspaceId);
  if (!auth.ok) return { ok: false as const, response: auth.response };
  return { ok: true as const, page };
}

// GET /api/admin/landing-pages/:id
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const r = await loadOwned(req, id);
  if (!r.ok) return r.response;
  return NextResponse.json({ ok: true, page: r.page });
}

// PATCH /api/admin/landing-pages/:id — atualiza title/status/blocks/slug.
// blocks SEMPRE validado por Zod estrito antes de persistir.
export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const r = await loadOwned(req, id);
  if (!r.ok) return r.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body.blocks !== undefined) {
    const parsed = BlocksSchema.safeParse(body.blocks);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Blocos inválidos", issues: parsed.error.issues.slice(0, 10) },
        { status: 400 }
      );
    }
    data.blocks = parsed.data;
  }
  if (typeof body.title === "string") data.title = body.title.trim();
  if (body.status === "draft" || body.status === "published") data.status = body.status;
  if (typeof body.slug === "string") {
    const slug = body.slug.trim().toLowerCase();
    if (!/^[a-z0-9-]{2,60}$/.test(slug)) {
      return NextResponse.json({ ok: false, error: "Slug inválido" }, { status: 400 });
    }
    data.slug = slug;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "nenhum campo válido" }, { status: 400 });
  }

  try {
    const page = await prisma.landingPage.update({ where: { id }, data });
    return NextResponse.json({ ok: true, page });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg.includes("Unique") || msg.includes("unique")) {
      return NextResponse.json({ ok: false, error: "Slug já usado por outra LP" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/landing-pages/:id
export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { id } = await ctx.params;
  const r = await loadOwned(req, id);
  if (!r.ok) return r.response;
  try {
    await prisma.landingPage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
