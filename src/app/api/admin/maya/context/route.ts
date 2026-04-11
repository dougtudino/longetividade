import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  link?: string;
};

export type MayaContext = {
  vendasHoje: { count: number; receita: number };
  receitaMes: number;
  totalVendas: number;
  usuariosVip: number;
  checkinsHoje: number;
  pendencias: ChecklistItem[];
  dataHoje: string;
  horaAtual: string;
  adminName: string;
};

async function buildSetupChecklist(): Promise<ChecklistItem[]> {
  const [brevoKey, metaAccount, metaPixel, metaToken, emailDnsOk] = await Promise.all([
    getSetting("BREVO_API_KEY"),
    getSetting("META_ADS_ACCOUNT_ID"),
    getSetting("NEXT_PUBLIC_META_PIXEL_ID"),
    getSetting("META_ADS_ACCESS_TOKEN"),
    getSetting("EMAIL_PRO_DNS_OK"),
  ]);

  let approvedExists = false;
  try {
    const approved = await prisma.order.count({ where: { status: "approved" } });
    approvedExists = approved > 0;
  } catch {
    approvedExists = false;
  }

  return [
    {
      id: "email_pro",
      title: "Email profissional barbara@longetividade.com.br (Registro.br)",
      done: emailDnsOk === "true",
      link: "/admin/setup#email_pro",
    },
    {
      id: "brevo_key",
      title: "Conectar Brevo (BREVO_API_KEY)",
      done: !!brevoKey,
      link: "/admin/setup#brevo_key",
    },
    {
      id: "bm_create",
      title: "Business Manager Meta + Conta de Anuncios",
      done: !!metaAccount,
      link: "/admin/setup#bm_create",
    },
    {
      id: "pixel_create",
      title: "Pixel Meta vinculado ao dominio",
      done: !!metaPixel,
      link: "/admin/setup#pixel_create",
    },
    {
      id: "meta_token",
      title: "Token Meta Ads API em Configuracoes",
      done: !!metaToken,
      link: "/admin/configuracoes#meta",
    },
    {
      id: "purchase_test",
      title: "Compra teste validada (Hotmart -> webhook -> Order)",
      done: approvedExists,
      link: "/admin/configuracoes",
    },
  ];
}

export async function buildMayaContext(adminName: string): Promise<MayaContext> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let vendasHojeCount = 0;
  let vendasHojeReceita = 0;
  let receitaMes = 0;
  let totalVendas = 0;
  let usuariosVip = 0;
  let checkinsHoje = 0;

  try {
    const approvedOrders = await prisma.order.findMany({
      where: { status: "approved" },
      select: { amount: true, createdAt: true },
    });

    totalVendas = approvedOrders.length;

    for (const o of approvedOrders) {
      if (o.createdAt >= todayStart) {
        vendasHojeCount++;
        vendasHojeReceita += o.amount / 100;
      }
      if (o.createdAt >= monthStart) {
        receitaMes += o.amount / 100;
      }
    }
  } catch {
    // tabela pode nao existir
  }

  try {
    usuariosVip = await prisma.appUser.count({ where: { plan: "vip" } });
  } catch {
    // tabela pode nao existir
  }

  try {
    checkinsHoje = await prisma.appCheckin.count({
      where: { createdAt: { gte: todayStart } },
    });
  } catch {
    // tabela pode nao existir
  }

  const pendencias: ChecklistItem[] = await buildSetupChecklist();

  const dataHoje = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaAtual = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    vendasHoje: { count: vendasHojeCount, receita: vendasHojeReceita },
    receitaMes,
    totalVendas,
    usuariosVip,
    checkinsHoje,
    pendencias,
    dataHoje,
    horaAtual,
    adminName,
  };
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctx = await buildMayaContext(payload.name);
  return NextResponse.json(ctx);
}
