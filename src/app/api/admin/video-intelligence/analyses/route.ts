import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/video-intelligence/analyses?page=1&limit=20&username=xxx
// Lista analises de video, com filtro opcional por username do concorrente.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") ?? "20")));
  const username = searchParams.get("username");
  const days = Number(searchParams.get("days") ?? "0");

  const where: {
    competitor?: { username: string };
    createdAt?: { gte: Date };
  } = {};
  if (username) where.competitor = { username };
  if (days > 0) {
    where.createdAt = { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  }

  const [total, items] = await Promise.all([
    prisma.videoAnalysis.count({ where }),
    prisma.videoAnalysis.findMany({
      where,
      include: { competitor: { select: { username: true, followers: true } } },
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ ok: true, page, limit, total, items });
}
