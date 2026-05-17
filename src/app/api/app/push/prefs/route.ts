import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import { prisma } from "@/lib/prisma";

// GET /api/app/push/prefs
// Retorna preferencias atuais + estado de subscriptions
export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const [pref, activeSubs] = await Promise.all([
    prisma.appNotificationPref.findUnique({ where: { userId: user.id } }),
    prisma.appPushSubscription.count({ where: { userId: user.id, active: true } }),
  ]);

  return NextResponse.json({
    hasSubscriptions: activeSubs > 0,
    activeSubsCount: activeSubs,
    prefs: pref ?? {
      water: true,
      challenge: true,
      cycle: true,
      weeklyRecap: true,
      generalMessages: true,
      quietHoursStart: null,
      quietHoursEnd: null,
    },
  });
}

// PUT /api/app/push/prefs
// Body: { water?, challenge?, cycle?, weeklyRecap?, generalMessages?, quietHoursStart?, quietHoursEnd? }
export async function PUT(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  // Whitelist + sanitize
  const data: Record<string, boolean | number | null> = {};
  for (const k of ["water", "challenge", "cycle", "weeklyRecap", "generalMessages"]) {
    if (typeof body[k] === "boolean") data[k] = body[k] as boolean;
  }
  for (const k of ["quietHoursStart", "quietHoursEnd"]) {
    const v = body[k];
    if (v === null) data[k] = null;
    else if (typeof v === "number" && v >= 0 && v <= 23) data[k] = v;
  }

  const pref = await prisma.appNotificationPref.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...data,
    },
    update: data,
  });

  return NextResponse.json({ ok: true, prefs: pref });
}
