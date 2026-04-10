import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "brevo_key", title: "Configurar BREVO_API_KEY real", done: false },
  { id: "bm_create", title: "Criar Business Manager no Meta", done: false },
  { id: "pixel_create", title: "Criar Pixel Meta Ads proprio", done: false },
  { id: "meta_token", title: "Inserir Token Meta Ads em Configuracoes", done: false },
  { id: "purchase_test", title: "Fazer compra teste com cupom 100% off", done: true },
  { id: "email_pro", title: "Criar email barbara@longetividade.com.br", done: false },
];

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

  let pendencias: ChecklistItem[] = DEFAULT_CHECKLIST;
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: "admin_checklist" },
    });
    if (row?.value) {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed)) {
        pendencias = parsed as ChecklistItem[];
      }
    }
  } catch {
    // usa default
  }

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
