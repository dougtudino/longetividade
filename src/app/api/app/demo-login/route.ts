import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

const ADMIN_EMAIL = "admin@longetividade.com.br";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  try {
    // Criar ou buscar usuario demo
    let appUser = await prisma.appUser.findUnique({ where: { email: ADMIN_EMAIL } });

    if (!appUser) {
      // Criar Order demo primeiro
      const order = await prisma.order.create({
        data: {
          email: ADMIN_EMAIL,
          name: "Admin",
          plan: "vip",
          amount: 9700,
          status: "approved",
        },
      });

      appUser = await prisma.appUser.create({
        data: {
          email: ADMIN_EMAIL,
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

    const response = NextResponse.json({ ok: true, email: ADMIN_EMAIL });
    response.headers.append("Set-Cookie", `app_token=${token}; ${cookieOpts}`);
    response.headers.append("Set-Cookie", `app_email=${ADMIN_EMAIL}; ${cookieOpts}`);

    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Admin login error:", msg);
    return NextResponse.json({ error: "Falha ao criar acesso admin", detail: msg }, { status: 500 });
  }
}
