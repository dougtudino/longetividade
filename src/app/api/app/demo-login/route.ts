import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";

const DEMO_EMAIL = "demo@longetividade.com.br";

export async function POST() {
  try {
    // Criar ou buscar usuario demo
    let appUser = await prisma.appUser.findUnique({ where: { email: DEMO_EMAIL } });

    if (!appUser) {
      // Criar Order demo primeiro
      const order = await prisma.order.create({
        data: {
          email: DEMO_EMAIL,
          name: "Admin Demo",
          plan: "vip",
          amount: 9700,
          status: "approved",
        },
      });

      appUser = await prisma.appUser.create({
        data: {
          email: DEMO_EMAIL,
          orderId: order.id,
          plan: "vip",
          accessType: "lifetime",
        },
      });
    }

    // Setar cookies de sessao
    const token = uuid();
    const cookieStore = await cookies();
    cookieStore.set("app_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/app",
      maxAge: 60 * 60 * 24 * 365,
    });
    cookieStore.set("app_email", DEMO_EMAIL, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/app",
      maxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({ ok: true, email: DEMO_EMAIL });
  } catch (error: unknown) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Falha ao criar acesso demo" }, { status: 500 });
  }
}
