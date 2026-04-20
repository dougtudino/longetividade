import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/creatives/bulk
// Body: { ids: string[], action: 'delete' | 'archive' | 'unarchive' }
// Aplica acao em batch. Retorna count afetado.

type BulkAction = "delete" | "archive" | "unarchive";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { ids?: string[]; action?: BulkAction };
    const ids = body.ids ?? [];
    const action = body.action;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { ok: false, error: "ids (string[]) nao pode estar vazio" },
        { status: 400 }
      );
    }
    if (action !== "delete" && action !== "archive" && action !== "unarchive") {
      return NextResponse.json(
        { ok: false, error: "action deve ser delete | archive | unarchive" },
        { status: 400 }
      );
    }

    if (action === "delete") {
      const res = await prisma.creative.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ ok: true, count: res.count });
    }

    const res = await prisma.creative.updateMany({
      where: { id: { in: ids } },
      data: { archived: action === "archive" },
    });
    return NextResponse.json({ ok: true, count: res.count });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
