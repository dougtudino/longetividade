import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { getLauncherCreds, uploadAdImage } from "@/lib/meta-launcher";

// POST /api/admin/creatives/[id]/upload-meta
// Body: { imageBase64: "data:image/png;base64,..." }
//
// Uploada PNG do criativo pra Meta /adimages, salva metaImageHash no
// Creative. Idempotente: se ja tem hash, retorna o atual sem re-uploadar.
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const creative = await prisma.creative.findUnique({ where: { id } });
  if (!creative) {
    return NextResponse.json({ ok: false, error: "Creative nao encontrado" }, { status: 404 });
  }
  if (creative.metaImageHash) {
    return NextResponse.json({ ok: true, creative, skipped: true, reason: "Hash ja existe" });
  }

  let body: { imageBase64?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  // Pra creatives IA-generated: imageUrl CDN Blotato. Fetch + base64 no server.
  // Pra React-based: client envia imageBase64 (gerado via html-to-image).
  let base64 = body.imageBase64;
  if (!base64 && creative.imageUrl) {
    try {
      const res = await fetch(creative.imageUrl);
      if (!res.ok) throw new Error(`CDN ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      base64 = `data:image/png;base64,${buf.toString("base64")}`;
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: `Falha ao buscar imageUrl do criativo: ${(e as Error).message}` },
        { status: 502 }
      );
    }
  }
  if (!base64) {
    return NextResponse.json(
      { ok: false, error: "imageBase64 obrigatorio (creatives React-based precisam renderizar no client)" },
      { status: 400 }
    );
  }

  const creds = await getLauncherCreds();
  if (!creds) {
    return NextResponse.json({ ok: false, error: "Credenciais Meta nao configuradas" }, { status: 400 });
  }

  const filename = `${creative.slug}-${creative.width}x${creative.height}.png`;
  const result = await uploadAdImage(creds, base64, filename);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, step: result.step }, { status: 502 });
  }

  const updated = await prisma.creative.update({
    where: { id: creative.id },
    data: { metaImageHash: result.hash },
  });
  return NextResponse.json({ ok: true, creative: updated, hash: result.hash });
}
