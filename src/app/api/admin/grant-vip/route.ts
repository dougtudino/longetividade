import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildVipInviteEmail } from "@/lib/email-invite";
import { requireAdmin } from "@/lib/require-admin";

// POST /api/admin/grant-vip
// Body: { email, name?, sendInvite?: boolean }
//
// Cria Order VIP + AppUser + envia email de convite com link do app.
// Se sendInvite=true (default), envia email de boas-vindas VIP.
// Se email ja tem AppUser, envia convite de reacesso (link do app).
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  let body: { email?: string; name?: string; sendInvite?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? email.split("@")[0]).trim();
  const sendInvite = body.sendInvite !== false; // default true

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Email invalido" }, { status: 400 });
  }

  // Checa se ja tem AppUser
  const existing = await prisma.appUser.findUnique({ where: { email } });

  if (existing) {
    // Ja tem VIP — envia email de reacesso se pedido
    if (sendInvite) {
      try {
        const tmpl = buildVipInviteEmail(name, email);
        await sendEmail({ to: email, toName: name, ...tmpl });
      } catch (e) {
        console.error("Failed to send VIP invite:", e);
      }
    }
    return NextResponse.json({
      ok: true,
      message: `${email} ja tem acesso VIP` + (sendInvite ? " · convite reenviado" : ""),
      appUserId: existing.id,
      alreadyExisted: true,
      inviteSent: sendInvite,
    });
  }

  // Busca ou cria Order VIP. amount=0 pra grant manual nao inflar receita
  // em /api/admin/stats (sum(amount)/100). Status="approved" eh necessario
  // pro fallback do /api/app/auth criar AppUser na primeira vez.
  let order = await prisma.order.findFirst({
    where: { email, plan: "vip", status: "approved" },
  });

  if (!order) {
    order = await prisma.order.create({
      data: {
        email,
        name,
        plan: "vip",
        amount: 0, // grant manual nao conta como receita
        status: "approved",
      },
    });
  }

  // Cria AppUser + incrementa AppVipSlot atomicamente.
  // Compatibilidade com slots dessincronizados: recomputa usedSlots a partir
  // do count real de AppUsers VIP a cada chamada de grant-vip (self-heal).
  const vipCount = await prisma.appUser.count({ where: { plan: "vip" } });
  const [, appUser] = await prisma.$transaction([
    prisma.appVipSlot.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", totalSlots: 100, usedSlots: vipCount + 1 },
      update: { usedSlots: vipCount + 1 },
    }),
    prisma.appUser.create({
      data: {
        email,
        orderId: order.id,
        plan: "vip",
        accessType: "lifetime",
      },
    }),
  ]);

  // Envia convite por email
  if (sendInvite) {
    try {
      const tmpl = buildVipInviteEmail(name, email);
      await sendEmail({ to: email, toName: name, ...tmpl });
    } catch (e) {
      console.error("Failed to send VIP invite:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    message: `Acesso VIP concedido pra ${email}` + (sendInvite ? " · convite enviado" : ""),
    appUserId: appUser.id,
    orderId: order.id,
    alreadyExisted: false,
    inviteSent: sendInvite,
  });
}
