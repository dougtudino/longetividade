import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Setar cookies via response headers
    const token = uuid();
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOpts = `Path=/app; HttpOnly; SameSite=Lax; Max-Age=31536000${isProduction ? "; Secure" : ""}`;

    const response = NextResponse.json({ ok: true, email: DEMO_EMAIL });
    response.headers.append("Set-Cookie", `app_token=${token}; ${cookieOpts}`);
    response.headers.append("Set-Cookie", `app_email=${DEMO_EMAIL}; ${cookieOpts}`);

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Demo login error:", msg);
    return NextResponse.json({ error: "Falha ao criar acesso demo", detail: msg }, { status: 500 });
  }
}
