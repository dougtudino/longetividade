// Helpers de workspace (fábrica multi-produto). Server-side / node runtime —
// NÃO usar no middleware (edge não roda o adapter pg).
//
// Filosofia strangler: tudo aqui falha GRACIOSAMENTE pro workspace default
// (longetividade). Assim, mesmo antes da migration rodar em prod (tabelas
// Workspace* inexistentes), login e rotas admin continuam funcionando — só
// caem no default. Quando as tabelas existirem, a resolução real entra.

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { requireAdmin } from "./require-admin";
import type { AdminTokenPayload } from "./admin-token";

// id fixo do workspace seed (ver db-migrations.ts). É o fallback universal.
export const DEFAULT_WORKSPACE_ID = "longetividade";

export type AdminWorkspace = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  role: string; // role do admin NESTE workspace
};

// Workspaces aos quais um admin pertence (via membership). [] em qualquer
// erro (ex: tabela ainda não migrada) — o caller decide o fallback.
export async function getAdminWorkspaces(
  adminId: string
): Promise<AdminWorkspace[]> {
  try {
    const memberships = await prisma.workspaceMembership.findMany({
      where: { adminId },
      include: { workspace: true },
      orderBy: { createdAt: "asc" },
    });
    return memberships
      .filter((m) => m.workspace.status !== "archived")
      .map((m) => ({
        id: m.workspace.id,
        slug: m.workspace.slug,
        name: m.workspace.name,
        brandName: m.workspace.brandName,
        role: m.role,
      }));
  } catch {
    return [];
  }
}

// Resolve qual workspace deve ficar ativo na sessão. Se `preferredId` (vindo
// do token ou de um switch) for um workspace válido do admin, usa ele; senão
// o primeiro membership; senão o default. Nunca lança.
export async function resolveActiveWorkspaceId(
  adminId: string,
  preferredId?: string | null
): Promise<string> {
  const workspaces = await getAdminWorkspaces(adminId);
  if (workspaces.length === 0) return DEFAULT_WORKSPACE_ID;
  if (preferredId && workspaces.some((w) => w.id === preferredId)) {
    return preferredId;
  }
  return workspaces[0].id;
}

// Confere se o admin pode acessar um workspace específico (membership).
export async function adminCanAccessWorkspace(
  adminId: string,
  workspaceId: string
): Promise<boolean> {
  const workspaces = await getAdminWorkspaces(adminId);
  // Tabela não migrada / sem membership → permite só o default (realidade
  // single-produto atual). Quando migrado, exige membership de verdade.
  if (workspaces.length === 0) return workspaceId === DEFAULT_WORKSPACE_ID;
  return workspaces.some((w) => w.id === workspaceId);
}

export type RequireAdminWorkspaceResult =
  | { ok: true; admin: AdminTokenPayload; workspaceId: string }
  | { ok: false; response: NextResponse };

// Guard de route handler que, além de exigir admin, resolve o workspace ativo.
// Use no topo de rotas admin que já forem workspace-aware. Lenient na Fase 0:
// nunca tranca (cai no default) — o aperto vem em fase posterior.
export async function requireAdminWorkspace(
  req: NextRequest
): Promise<RequireAdminWorkspaceResult> {
  const auth = await requireAdmin(req);
  if (!auth.ok) return { ok: false, response: auth.response };
  const workspaceId = await resolveActiveWorkspaceId(
    auth.admin.adminId,
    auth.admin.activeWorkspaceId
  );
  return { ok: true, admin: auth.admin, workspaceId };
}

// Resolve workspace a partir do host (LP pública por domínio). Usar em server
// components / route handlers públicos via headers().get("host"). Default se
// host desconhecido. Node runtime apenas.
export async function getWorkspaceFromHost(
  host: string | null | undefined
): Promise<string> {
  if (!host) return DEFAULT_WORKSPACE_ID;
  const bare = host.split(":")[0].replace(/^www\./, "").toLowerCase();
  try {
    const ws = await prisma.workspace.findFirst({
      where: { domains: { has: bare }, status: { not: "archived" } },
      select: { id: true },
    });
    return ws?.id ?? DEFAULT_WORKSPACE_ID;
  } catch {
    return DEFAULT_WORKSPACE_ID;
  }
}
