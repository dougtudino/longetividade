import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.appSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return NextResponse.json(map);
  } catch {
    // Tabela pode nao existir ainda
    return NextResponse.json({});
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entries = Object.entries(body) as [string, string][];

  for (const [key, value] of entries) {
    await prisma.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  return NextResponse.json({ ok: true });
}
