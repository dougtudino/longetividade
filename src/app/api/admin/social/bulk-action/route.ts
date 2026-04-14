import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/social/bulk-action
// Body:
//   { action: "approve-all-drafts" | "review-all-drafts" | "approve-all-review" }
//   OU
//   { action: "delete", ids: string[] }
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const action = body.action as string;

  if (action === "delete") {
    const ids = body.ids as string[] | undefined;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: false, error: "ids obrigatorio" }, { status: 400 });
    }
    try {
      const result = await prisma.socialPost.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ ok: true, action, deleted: result.count });
    } catch (e) {
      return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
    }
  }

  const transitions: Record<string, { from: string; to: string }> = {
    "approve-all-drafts": { from: "draft", to: "approved" },
    "review-all-drafts": { from: "draft", to: "review" },
    "approve-all-review": { from: "review", to: "approved" },
  };

  const t = transitions[action];
  if (!t) {
    return NextResponse.json({ ok: false, error: `Acao invalida: ${action}` }, { status: 400 });
  }

  try {
    const result = await prisma.socialPost.updateMany({
      where: { status: t.from },
      data: { status: t.to },
    });

    return NextResponse.json({
      ok: true,
      action,
      updated: result.count,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
