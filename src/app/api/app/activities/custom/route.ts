// GET    /api/app/activities/custom — lista atividades custom da usuaria (nao-arquivadas)
// POST   /api/app/activities/custom — cria { name, icon?, category? }
// DELETE /api/app/activities/custom?id=xxx — soft-delete (archive) — preserva logs antigos
//
// Validacao minima: nome 2-40 chars, category dentro do enum, icon opcional.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUser } from "@/lib/app-auth";

const ALLOWED_CATEGORIES = new Set(["movimento", "mental", "social", "criativo"]);

export async function GET(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const items = await prisma.appCustomActivity.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  let body: { name?: string; icon?: string; category?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 40);
  if (name.length < 2) {
    return NextResponse.json({ error: "Nome muito curto (min 2 caracteres)" }, { status: 400 });
  }

  const category = ALLOWED_CATEGORIES.has(body.category ?? "")
    ? (body.category as string)
    : "movimento";

  // Icon: pega primeiro emoji da string ou fallback. Sem validacao rigorosa
  // — emoji eh livre, max 4 chars (alguns compostos como 🏋️‍♀️ ocupam mais).
  const icon = String(body.icon ?? "🏃").slice(0, 8) || "🏃";

  // Evita duplicata pelo mesmo nome (case-insensitive). Reativa se estiver
  // arquivada em vez de criar duplicado.
  const existing = await prisma.appCustomActivity.findFirst({
    where: {
      userId: user.id,
      name: { equals: name, mode: "insensitive" },
    },
  });
  if (existing) {
    if (existing.archived) {
      const reactivated = await prisma.appCustomActivity.update({
        where: { id: existing.id },
        data: { archived: false, icon, category },
      });
      return NextResponse.json({ item: reactivated, reactivated: true });
    }
    return NextResponse.json({ item: existing, alreadyExists: true });
  }

  const created = await prisma.appCustomActivity.create({
    data: { userId: user.id, name, icon, category },
  });

  return NextResponse.json({ item: created });
}

export async function DELETE(req: NextRequest) {
  const user = await getAppUser(req);
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id obrigatorio" }, { status: 400 });

  // Soft-delete (archive) — preserva AppActivityLog antigos sem quebrar FK
  const updated = await prisma.appCustomActivity.updateMany({
    where: { id, userId: user.id },
    data: { archived: true },
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Atividade nao encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
