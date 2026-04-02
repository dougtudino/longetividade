import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const body = await req.json();
  if (!body.weight || typeof body.weight !== "number") {
    return NextResponse.json({ error: "Peso obrigatorio" }, { status: 400 });
  }

  const log = await prisma.appWeightLog.create({
    data: {
      userId: user.id,
      weight: body.weight,
      note: body.note ?? null,
    },
  });

  return NextResponse.json({ log });
}

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const logs = await prisma.appWeightLog.findMany({
    where: { userId: user.id },
    orderBy: { loggedAt: "asc" },
  });

  return NextResponse.json({ logs });
}
