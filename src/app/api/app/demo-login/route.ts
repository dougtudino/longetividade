import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { setAppSessionCookies } from "@/lib/app-session";

const ADMIN_EMAIL = "admin@longetividade.com.br";

// POST /api/app/demo-login
// Cria/reusa um AppUser VIP "admin@longetividade.com.br" e seta
// cookies app_token + app_email, permitindo o admin abrir /app como
// se fosse um cliente VIP real. Usado pro demo/QA.
//
// Autorizacao: requer cookie admin valido (so quem ja esta logado no
// painel admin pode usar esse atalho). Em dev, tambem permite sem auth.
export async function POST(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev) {
    // Em producao: exige admin logado
    const adminToken = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
    const payload = await verifyAdminToken(adminToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized — apenas admin logado pode usar demo login" },
        { status: 401 }
      );
    }
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

    const response = NextResponse.json({ ok: true, email: ADMIN_EMAIL });
    await setAppSessionCookies(response, ADMIN_EMAIL, appUser.id, appUser.plan);
    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Admin login error:", msg);
    return NextResponse.json({ error: "Falha ao criar acesso admin", detail: msg }, { status: 500 });
  }
}
