// Leitura de planos por workspace (data-driven, substitui hardcode de
// config/plans.ts para produtos novos). Server-side / node runtime.

import { prisma } from "./prisma";

export type WorkspacePlanView = {
  planKey: string;
  label: string;
  priceCents: number;
  checkoutUrl: string;
  orderIndex: number;
};

// Planos ativos de um workspace, ordenados. [] em qualquer erro (ex: tabela
// não migrada) — o caller usa fallback estático.
export async function getWorkspacePlans(
  workspaceId: string
): Promise<WorkspacePlanView[]> {
  try {
    return await prisma.workspacePlan.findMany({
      where: { workspaceId, active: true },
      orderBy: { orderIndex: "asc" },
      select: {
        planKey: true,
        label: true,
        priceCents: true,
        checkoutUrl: true,
        orderIndex: true,
      },
    });
  } catch {
    return [];
  }
}

export function formatBRL(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}
