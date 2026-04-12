import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/admin-auth";
import { setAppSessionCookies } from "@/lib/app-session";

// POST /api/app/auth
// Body: { email, password? }
//
// Cenarios:
//   1. AppUser existe + tem passwordHash → exige password, valida bcrypt
//   2. AppUser existe + SEM passwordHash (legado) → aceita email-only
//   3. AppUser nao existe → fallback cria via Order VIP aprovada,
//      login email-only apos criacao
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "JSON invalido" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email) {
    return NextResponse.json({ ok: false, reason: "Email obrigatorio" }, { status: 400 });
  }

  let appUser = await prisma.appUser.findUnique({ where: { email } });

  if (!appUser) {
    const order = await prisma.order.findFirst({
      where: { email, plan: "vip", status: "approved" },
      orderBy: { createdAt: "desc" },
    });

    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          reason:
            "Email nao encontrado. Verifique se usou o mesmo email da compra Hotmart.",
        },
        { status: 404 }
      );
    }

    appUser = await prisma.appUser.create({
      data: {
        email,
        orderId: order.id,
        plan: "vip",
        accessType: "lifetime",
      },
    });
  }

  // Se tem passwordHash, exige senha
  if (appUser.passwordHash) {
    if (!password) {
      return NextResponse.json(
        {
          ok: false,
          reason: "Essa conta tem senha. Digite sua senha para entrar.",
          requiresPassword: true,
        },
        { status: 401 }
      );
    }
    const valid = await verifyPassword(password, appUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ ok: false, reason: "Senha incorreta" }, { status: 401 });
    }
  }

  const response = NextResponse.json({ ok: true });
  setAppSessionCookies(response, email);
  return response;
}
