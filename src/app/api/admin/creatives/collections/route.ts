import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/creatives/collections
// Lista todas as colecoes com contagem de criativos
export async function GET() {
  try {
    const collections = await prisma.creativeCollection.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { creatives: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      collections: collections.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        campaignId: c.campaignId,
        creativesCount: c._count.creatives,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      collections: [],
      warning: `Tabela CreativeCollection indisponivel: ${(e as Error).message}. Aguarde deploy completar.`,
    });
  }
}

// POST /api/admin/creatives/collections
// Body: { slug, name, description?, icon?, campaignId? }
export async function POST(req: NextRequest) {
  let body: {
    slug?: string;
    name?: string;
    description?: string;
    icon?: string;
    campaignId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  if (!body.slug || !body.name) {
    return NextResponse.json(
      { ok: false, error: "slug e name sao obrigatorios" },
      { status: 400 }
    );
  }

  const slugClean = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

  try {
    const collection = await prisma.creativeCollection.create({
      data: {
        slug: slugClean,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        icon: body.icon?.trim() || null,
        campaignId: body.campaignId?.trim() || null,
      },
    });

    return NextResponse.json({ ok: true, collection });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({
      ok: false,
      error: msg.includes("Unique")
        ? `Colecao com slug "${slugClean}" ja existe`
        : msg,
    });
  }
}
