import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getHotmartCreds,
  getAccessToken,
  fetchSalesHistory,
  planFromOfferCode,
  mapHotmartStatus,
  type NormalizedSale,
} from "@/lib/hotmart";

// POST /api/admin/sync-hotmart
// Body: { days?: number, status?: "APPROVED" | "REFUNDED" | ... }
// Default: ultimos 30 dias, todos status
//
// Para cada venda normalizada:
//  - Upsert em prisma.order por hotmartTransactionId (unique)
//  - Atualiza status, amount, syncedFromApiAt
//  - Se e venda nova (nao existia localmente), cria com todos os campos

async function syncSales(body: { days?: number; status?: string } = {}) {
  const creds = await getHotmartCreds();
  if (!creds) {
    return {
      ok: false as const,
      error:
        "Credenciais Hotmart nao configuradas. Adicione HOTMART_CLIENT_ID e HOTMART_CLIENT_SECRET em /admin/configuracoes.",
    };
  }

  const tokenResult = await getAccessToken(creds);
  if (!tokenResult.ok) {
    return {
      ok: false as const,
      error: `Falha OAuth Hotmart: ${tokenResult.error}`,
    };
  }

  const days = body.days ?? 30;
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const salesResult = await fetchSalesHistory(tokenResult.token, {
    startDate,
    endDate,
    maxResults: 500,
  });

  if (!salesResult.ok) {
    return {
      ok: false as const,
      error: `Falha ao buscar vendas: ${salesResult.error}`,
    };
  }

  const sales = salesResult.sales;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const sale of sales) {
    try {
      const plan = await planFromOfferCode(sale.offerCode, sale.amountCents);
      const status = mapHotmartStatus(sale.status);

      const existing = await prisma.order.findUnique({
        where: { hotmartTransactionId: sale.transactionId },
      });

      if (existing) {
        // Atualiza apenas campos que mudaram
        const changed =
          existing.status !== status ||
          existing.amount !== sale.amountCents ||
          existing.plan !== plan;

        if (changed || !existing.syncedFromApiAt) {
          await prisma.order.update({
            where: { id: existing.id },
            data: {
              status,
              amount: sale.amountCents,
              plan,
              email: sale.email,
              name: sale.name,
              phone: sale.phone,
              syncedFromApiAt: new Date(),
            },
          });
          updated += 1;
        } else {
          skipped += 1;
        }
      } else {
        // Cria venda nova que o webhook nao pegou
        await prisma.order.create({
          data: {
            email: sale.email,
            name: sale.name,
            phone: sale.phone,
            plan,
            amount: sale.amountCents,
            status,
            hotmartTransactionId: sale.transactionId,
            syncedFromApiAt: new Date(),
            createdAt: sale.date,
          },
        });
        created += 1;
      }
    } catch (e) {
      errors.push(`${sale.transactionId}: ${(e as Error).message}`);
    }
  }

  return {
    ok: true as const,
    syncedAt: new Date().toISOString(),
    period: { days, from: startDate.toISOString(), to: endDate.toISOString() },
    total: sales.length,
    created,
    updated,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function POST(req: NextRequest) {
  let body: { days?: number; status?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body ok */
  }
  const result = await syncSales(body);
  return NextResponse.json(result);
}

export async function GET() {
  const result = await syncSales();
  return NextResponse.json(result);
}

// Helper export para o cron usar
export { syncSales as runHotmartSync };
