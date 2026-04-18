import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CRUD de concorrentes do Video Intelligence.
// GET lista ativos (ou todos com ?includeInactive=1), POST cria, PATCH toggle active.

export async function GET(req: NextRequest) {
  const includeInactive = new URL(req.url).searchParams.get("includeInactive") === "1";
  const competitors = await prisma.videoCompetitor.findMany({
    where: includeInactive ? {} : { active: true },
    orderBy: { username: "asc" },
    include: {
      _count: { select: { analyses: true } },
    },
  });
  return NextResponse.json({ ok: true, competitors });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      username?: string;
      category?: string;
      followers?: number;
      avgViews30d?: number;
    };
    const username = (body.username ?? "").trim().replace(/^@/, "");
    if (!username) {
      return NextResponse.json({ ok: false, error: "username obrigatorio" }, { status: 400 });
    }
    const created = await prisma.videoCompetitor.create({
      data: {
        username,
        category: body.category ?? "longetividade",
        followers: body.followers ?? 0,
        avgViews30d: body.avgViews30d ?? 0,
        active: true,
      },
    });
    return NextResponse.json({ ok: true, competitor: created });
  } catch (e) {
    const msg = (e as Error).message;
    const status = msg.includes("Unique") || msg.includes("unique") ? 409 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; active?: boolean };
    if (!body.id) {
      return NextResponse.json({ ok: false, error: "id obrigatorio" }, { status: 400 });
    }
    const updated = await prisma.videoCompetitor.update({
      where: { id: body.id },
      data: { active: body.active ?? true },
    });
    return NextResponse.json({ ok: true, competitor: updated });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "id obrigatorio" }, { status: 400 });
    }
    const analysesCount = await prisma.videoAnalysis.count({ where: { competitorId: id } });
    if (analysesCount > 0) {
      return NextResponse.json(
        { ok: false, error: `tem ${analysesCount} analise(s) — desative ao inves de apagar` },
        { status: 409 },
      );
    }
    await prisma.videoCompetitor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
