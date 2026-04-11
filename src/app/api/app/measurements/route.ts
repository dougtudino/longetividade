import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";

// GET /api/app/measurements
// Retorna historico de medidas corporais (cintura, quadril) do usuario
export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const measurements = await prisma.appMeasurement.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: "asc" },
    });

    return NextResponse.json({
      ok: true,
      measurements,
      latest: measurements[measurements.length - 1] ?? null,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: (e as Error).message,
      measurements: [],
    });
  }
}

// POST /api/app/measurements
// Body: { waist?: number, hip?: number, note?: string }
export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { waist?: number; hip?: number; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  if (body.waist == null && body.hip == null) {
    return NextResponse.json(
      { ok: false, error: "Precisa enviar pelo menos cintura ou quadril" },
      { status: 400 }
    );
  }

  try {
    const measurement = await prisma.appMeasurement.create({
      data: {
        userId: user.id,
        waist: typeof body.waist === "number" ? body.waist : null,
        hip: typeof body.hip === "number" ? body.hip : null,
        note: body.note?.trim() || null,
      },
    });

    return NextResponse.json({ ok: true, measurement });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
