import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";

// POST /api/app/push/subscribe
// Body: { endpoint, keys: { p256dh, auth }, deviceLabel? }
//
// Salva subscription no banco. Idempotente: upsert por endpoint unique.
// Tambem cria AppNotificationPref se nao existir (defaults ligados).
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  let body: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
    deviceLabel?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "endpoint e keys.p256dh, keys.auth sao obrigatorios" },
      { status: 400 }
    );
  }

  await prisma.appPushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: user.id,
      endpoint,
      p256dh,
      auth,
      deviceLabel: body.deviceLabel?.slice(0, 200) ?? null,
    },
    update: {
      userId: user.id,
      p256dh,
      auth,
      active: true,
      lastUsedAt: new Date(),
    },
  });

  // Garante prefs row pra usuaria
  await prisma.appNotificationPref.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/app/push/subscribe?endpoint=...
// Marca subscription como inativa (nao deleta pra manter historico)
export async function DELETE(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const endpoint = req.nextUrl.searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ error: "endpoint obrigatorio" }, { status: 400 });

  await prisma.appPushSubscription.updateMany({
    where: { userId: user.id, endpoint },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
