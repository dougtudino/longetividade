import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishPostViaBlotato, type BlotatoPostResult } from "@/lib/blotato-poster";

// GET /api/cron/blotato-auto-post
// Cron DIARIO: pega SocialPost approved com scheduledAt <= agora e publica
// via Blotato em IG+FB. Marca como posted quando qualquer plataforma voltar
// ok (consistente com o cron antigo /api/cron/social-auto-post).
//
// Setup sugerido:
//   0 15 * * * curl .../api/cron/blotato-auto-post -H "x-cron-secret: $CRON_SECRET"
//
// Se voce ativar este cron, desative o /api/cron/social-auto-post pra nao
// postar em duplicata.

const BATCH = 10;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET nao configurado" }, { status: 503 });
  }
  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const ready = await prisma.socialPost.findMany({
    where: {
      status: "approved",
      scheduledAt: { lte: now },
      // Blotato so posta com imagem — pega apenas os que ja tem midia.
      OR: [{ imageUrl: { not: null } }, { images: { some: {} } }],
    },
    orderBy: { scheduledAt: "asc" },
    take: BATCH,
    select: { id: true, title: true },
  });

  const results: Array<{ postId: string; title: string; results: BlotatoPostResult[]; ok: boolean }> = [];
  let posted = 0;

  for (const p of ready) {
    try {
      const r = await publishPostViaBlotato(p.id);
      const anyOk = r.some((x) => x.ok);
      if (anyOk) {
        await prisma.socialPost.update({
          where: { id: p.id },
          data: {
            status: "posted",
            postedAt: new Date(),
            engagementData: JSON.parse(JSON.stringify(r)),
          },
        });
        posted += 1;
      }
      results.push({ postId: p.id, title: p.title, results: r, ok: anyOk });
    } catch (e) {
      results.push({
        postId: p.id,
        title: p.title,
        results: [{ platform: "instagram", ok: false, error: e instanceof Error ? e.message : String(e) }],
        ok: false,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    runAt: now.toISOString(),
    found: ready.length,
    posted,
    results,
  });
}
