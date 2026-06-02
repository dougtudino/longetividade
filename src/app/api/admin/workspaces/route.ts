import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  getAdminWorkspaces,
  resolveActiveWorkspaceId,
} from "@/lib/workspace";

// GET /api/admin/workspaces
// Lista os workspaces aos quais o admin logado pertence + qual está ativo.
// Usado pelo switcher da AdminSidebar.
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const workspaces = await getAdminWorkspaces(auth.admin.adminId);
  const activeWorkspaceId = await resolveActiveWorkspaceId(
    auth.admin.adminId,
    auth.admin.activeWorkspaceId
  );

  return NextResponse.json({ ok: true, workspaces, activeWorkspaceId });
}
