import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/grant-vip
// Body: { email, name? }
//
// Cria Order VIP aprovada + AppUser pra qualquer email, sem precisar
// de compra Hotmart. Usado pra:
//   - Admins testarem o app com email proprio
//   - Convidados especiais / giveaways
//   - Parceiros e afiliados
//
// Se o email ja tem AppUser, retorna ok (idempotente).
// Se o email ja tem Order mas nao AppUser, cria o AppUser.
export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? email.split("@")[0]).trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Email invalido" }, { status: 400 });
  }

  // Checa se ja tem AppUser
  const existing = await prisma.appUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({
      ok: true,
      message: `${email} ja tem acesso VIP`,
      appUserId: existing.id,
      alreadyExisted: true,
    });
  }

  // Busca ou cria Order VIP
  let order = await prisma.order.findFirst({
    where: { email, plan: "vip", status: "approved" },
  });

  if (!order) {
    order = await prisma.order.create({
      data: {
        email,
        name,
        plan: "vip",
        amount: 9700, // R$ 97
        status: "approved",
      },
    });
  }

  // Cria AppUser
  const appUser = await prisma.appUser.create({
    data: {
      email,
      orderId: order.id,
      plan: "vip",
      accessType: "lifetime",
    },
  });

  return NextResponse.json({
    ok: true,
    message: `Acesso VIP concedido pra ${email}`,
    appUserId: appUser.id,
    orderId: order.id,
    alreadyExisted: false,
  });
}
