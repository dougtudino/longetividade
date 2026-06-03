import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteCtx = { params: Promise<{ id: string }> };

// PATCH /api/admin/workspaces/:id — atualiza config do workspace.
export async function PATCH(req: Request, ctx: RouteCtx) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const allowed = [
    "name",
    "brandName",
    "status",
    "domains",
    "enabledModules",
    "metaPixelId",
    "hotmartProductId",
    "adAccountId",
    "businessManagerId",
    "fromEmail",
  ] as const;

  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "nenhum campo válido" }, { status: 400 });
  }

  try {
    const workspace = await prisma.workspace.update({ where: { id }, data });
    return NextResponse.json({ ok: true, workspace });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
