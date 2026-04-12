import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";

// GET /api/admin/me
// Retorna info do admin logado atualmente (lido do cookie).
// Usado pelo AdminShell pra mostrar nome + email no sidebar.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ ok: false, error: "Admin nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, admin });
  } catch (e) {
    // Fallback: retorna o que tem no token
    return NextResponse.json({
      ok: true,
      admin: {
        id: payload.adminId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
      warning: (e as Error).message,
    });
  }
}
