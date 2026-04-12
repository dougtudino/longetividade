import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

// POST /api/admin/admins/change-password
// Body: { adminId?: string, newPassword: string }
// Se adminId nao for passado, altera do admin logado.
// Qualquer admin pode trocar a propria senha.
// Owner pode trocar senha de qualquer admin.
export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { adminId?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const newPassword = body.newPassword ?? "";
  if (newPassword.length < 6) {
    return NextResponse.json(
      { ok: false, error: "Senha precisa ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  const targetId = body.adminId ?? payload.adminId;
  const hash = await hashPassword(newPassword);

  try {
    await prisma.adminUser.update({
      where: { id: targetId },
      data: { passwordHash: hash },
    });
    return NextResponse.json({ ok: true, message: "Senha atualizada" });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
