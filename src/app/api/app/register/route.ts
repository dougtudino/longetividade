import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/admin-auth";
import { setAppSessionCookies } from "@/lib/app-session";

// POST /api/app/register
// Body: { email, password }
//
// Fluxo:
//   1. Valida email + senha (min 6 chars)
//   2. Busca Order com esse email + plan=vip + status=approved
//      (precisa ter comprado pra poder criar conta)
//   3. Busca ou cria AppUser
//   4. Hash bcrypt da senha e salva
//   5. Seta cookies de sessao
//
// Para usuarios que ja tem AppUser mas sem password: tambem funciona
// (seta a password no user existente).
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "JSON invalido" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, reason: "Email invalido" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { ok: false, reason: "Senha precisa ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  // Busca Order VIP aprovada pra esse email
  const order = await prisma.order.findFirst({
    where: { email, plan: "vip", status: "approved" },
    orderBy: { createdAt: "desc" },
  });

  if (!order) {
    return NextResponse.json(
      {
        ok: false,
        reason:
          "Nao encontramos uma compra VIP aprovada com esse email. Verifique se usou o mesmo email da compra Hotmart.",
      },
      { status: 404 }
    );
  }

  const hash = await hashPassword(password);

  // Upsert AppUser — se ja existe, atualiza passwordHash
  const appUser = await prisma.appUser.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: {
      email,
      orderId: order.id,
      plan: "vip",
      accessType: "lifetime",
      passwordHash: hash,
    },
  });

  const response = NextResponse.json({ ok: true, userId: appUser.id });
  setAppSessionCookies(response, email);
  return response;
}
