import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/agents/gaia/knowledge?kind=rule
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const kind = url.searchParams.get("kind") ?? undefined;

    const entries = await prisma.agentKnowledge.findMany({
      where: {
        agentId: "gaia",
        ...(kind ? { kind } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = await prisma.agentKnowledge.groupBy({
      by: ["kind"],
      where: { agentId: "gaia" },
      _count: true,
    });
    const countsMap: Record<string, number> = {};
    for (const c of counts) countsMap[c.kind] = c._count;

    return NextResponse.json({ ok: true, entries, counts: countsMap });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      entries: [],
      counts: {},
      warning: `Tabela AgentKnowledge indisponivel: ${(e as Error).message}`,
    });
  }
}

// POST /api/admin/agents/gaia/knowledge
// Body: { kind, title, body, source?, metadata? }
export async function POST(req: NextRequest) {
  let body: {
    kind?: string;
    title?: string;
    body?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  if (!body.kind || !body.title || !body.body) {
    return NextResponse.json(
      { ok: false, error: "kind, title, body obrigatorios" },
      { status: 400 }
    );
  }

  const entry = await prisma.agentKnowledge.create({
    data: {
      agentId: "gaia",
      kind: body.kind,
      title: body.title,
      body: body.body,
      source: body.source ?? null,
      metadata: body.metadata ? JSON.parse(JSON.stringify(body.metadata)) : undefined,
    },
  });

  return NextResponse.json({ ok: true, entry });
}
