import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/social?status=draft|review|approved|posted
// Lista posts com filtros
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;
    const pillar = url.searchParams.get("pillar") ?? undefined;

    const posts = await prisma.socialPost.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(pillar ? { pillar } : {}),
      },
      orderBy: { scheduledAt: "asc" },
      take: 100,
    });

    const counts = await prisma.socialPost.groupBy({
      by: ["status"],
      _count: true,
    });
    const statusCounts: Record<string, number> = {};
    for (const c of counts) statusCounts[c.status] = c._count;

    return NextResponse.json({ ok: true, posts, counts: statusCounts });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      posts: [],
      counts: {},
      warning: (e as Error).message,
    });
  }
}

// POST /api/admin/social
// Body: { title, content, platform, format, pillar, hashtags?, imageBriefing?, scheduledAt? }
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const title = (body.title as string)?.trim();
  const content = (body.content as string)?.trim();

  if (!title || !content) {
    return NextResponse.json({ ok: false, error: "title e content obrigatorios" }, { status: 400 });
  }

  try {
    const post = await prisma.socialPost.create({
      data: {
        title,
        content,
        platform: (body.platform as string) ?? "instagram",
        format: (body.format as string) ?? "imagem",
        pillar: (body.pillar as string) ?? "s",
        hashtags: (body.hashtags as string) ?? null,
        imageBriefing: (body.imageBriefing as string) ?? null,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt as string) : null,
        status: "draft",
      },
    });
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// PUT /api/admin/social — update status or content
export async function PUT(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const id = body.id as string;
  if (!id) {
    return NextResponse.json({ ok: false, error: "id obrigatorio" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.title) data.title = body.title;
  if (body.content) data.content = body.content;
  if (body.hashtags !== undefined) data.hashtags = body.hashtags;
  if (body.imageBriefing !== undefined) data.imageBriefing = body.imageBriefing;
  if (body.pillar) data.pillar = body.pillar;
  if (body.format) data.format = body.format;
  if (body.scheduledAt !== undefined) data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt as string) : null;
  if (body.reviewNote) data.reviewNote = body.reviewNote;
  if (body.postedAt) data.postedAt = new Date(body.postedAt as string);

  try {
    const post = await prisma.socialPost.update({ where: { id }, data });
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

// DELETE /api/admin/social?id=<postId>
// Remove o post (e imagens via cascade).
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "id obrigatorio" }, { status: 400 });
  }
  try {
    await prisma.socialPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
