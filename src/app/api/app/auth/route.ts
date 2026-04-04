import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: false, reason: "Email obrigatorio." }, { status: 400 });
  }

  // Verifica se tem AppUser (criado pelo webhook)
  let appUser = await prisma.appUser.findUnique({ where: { email } });

  if (!appUser) {
    // Fallback: verificar Order VIP aprovada (caso webhook nao tenha criado ainda)
    const order = await prisma.order.findFirst({
      where: { email, plan: "vip", status: "approved" },
      orderBy: { createdAt: "desc" },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, reason: "Email nao encontrado. Verifique se usou o mesmo email da compra." },
        { status: 404 }
      );
    }

    // Criar AppUser on-the-fly
    appUser = await prisma.appUser.create({
      data: {
        email,
        orderId: order.id,
        plan: "vip",
        accessType: "lifetime",
      },
    });
  }

  // Criar token de sessao via response headers
  const token = uuid();
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOpts = `Path=/app; HttpOnly; SameSite=Lax; Max-Age=31536000${isProduction ? "; Secure" : ""}`;

  const response = NextResponse.json({ ok: true, token });
  response.headers.append("Set-Cookie", `app_token=${token}; ${cookieOpts}`);
  response.headers.append("Set-Cookie", `app_email=${email}; ${cookieOpts}`);

  return response;
}
