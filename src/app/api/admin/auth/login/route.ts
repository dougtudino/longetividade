import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signAdminToken,
  ADMIN_TOKEN_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const token = await signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const response = NextResponse.json({
      ok: true,
      name: admin.name,
      role: admin.role,
    });
    response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_TOKEN_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Credenciais inválidas" },
      { status: 401 }
    );
  }
}
