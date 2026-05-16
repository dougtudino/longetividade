import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/admin-auth";
import { requireAdmin } from "@/lib/require-admin";

// GET /api/admin/admins
// Lista todos os AdminUsers com metadata (sem passwordHash por seguranca)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  try {
    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        googleId: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { mayaMessages: true } },
      },
    });
    return NextResponse.json({ ok: true, admins });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      admins: [],
      warning: (e as Error).message,
    });
  }
}

// POST /api/admin/admins
// Body: { email, name, password, role? }
// Cria novo admin. Use pra adicionar Barbara, colaboradores, etc.
export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const password = body.password ?? "";
  const role = body.role ?? "manager";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Email invalido" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "Nome obrigatorio" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { ok: false, error: "Senha precisa ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email ja cadastrado" }, { status: 400 });
    }

    const hash = await hashPassword(password);
    const admin = await prisma.adminUser.create({
      data: { email, name, passwordHash: hash, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, admin });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
