import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSettingsCache } from "@/lib/settings";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
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
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  const body = await req.json();
  const entries = Object.entries(body) as [string, string][];

  for (const [key, rawValue] of entries) {
    // Trim para evitar espacos invisiveis colados de tokens/chaves
    const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;
    await prisma.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    clearSettingsCache(key);
  }

  return NextResponse.json({ ok: true });
}
