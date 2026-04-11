import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLauncherCreds, uploadAdImage } from "@/lib/meta-launcher";

// POST /api/admin/campaigns/upload-creative
// Body: { key: "feed_dor", base64: "..." }
// Sobe a imagem na Meta /act_/adimages e persiste o hash em AppSetting
// com a chave meta_creative_hash_<key> para reuso pelo launch.

export async function POST(req: NextRequest) {
  const creds = await getLauncherCreds();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "Credenciais Meta nao configuradas em /admin/configuracoes" },
      { status: 200 }
    );
  }

  let body: { key?: string; base64?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const key = body.key?.trim();
  const base64 = body.base64?.trim();
  if (!key || !base64) {
    return NextResponse.json(
      { ok: false, error: "key e base64 sao obrigatorios" },
      { status: 400 }
    );
  }

  const filename = `longetividade-${key}.png`;
  const result = await uploadAdImage(creds, base64, filename);

  if (result.ok === false) {
    return NextResponse.json(result);
  }

  const settingKey = `meta_creative_hash_${key}`;
  try {
    await prisma.appSetting.upsert({
      where: { key: settingKey },
      update: { value: result.hash },
      create: { key: settingKey, value: result.hash },
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: `Hash recebido mas falhou ao persistir: ${(e as Error).message}`,
      hash: result.hash,
    });
  }

  return NextResponse.json({ ok: true, key, hash: result.hash });
}
