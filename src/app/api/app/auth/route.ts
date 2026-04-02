import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email ?? "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: false, reason: "Email obrigatorio." }, { status: 400 });
  }

  // Verifica se tem AppUser (criado pelo webhook)
  const appUser = await prisma.appUser.findUnique({ where: { email } });

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
    await prisma.appUser.create({
      data: {
        email,
        orderId: order.id,
        plan: "vip",
        accessType: "lifetime",
      },
    });
  }

  // Criar token de sessao
  const token = uuid();
  const cookieStore = await cookies();
  cookieStore.set("app_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/app",
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  });
  cookieStore.set("app_email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/app",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true, token });
}
