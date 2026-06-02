import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  signAdminToken,
  ADMIN_TOKEN_COOKIE,
  ADMIN_TOKEN_MAX_AGE,
} from "@/lib/admin-auth";
import { adminCanAccessWorkspace } from "@/lib/workspace";

// POST /api/admin/workspace/switch  { workspaceId }
// Troca o workspace ativo da sessão: valida membership e re-assina o token
// com o novo activeWorkspaceId. O front recarrega após sucesso.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  let workspaceId: string | undefined;
  try {
    ({ workspaceId } = await req.json());
  } catch {
    /* body inválido tratado abaixo */
  }

  if (!workspaceId || typeof workspaceId !== "string") {
    return NextResponse.json(
      { ok: false, error: "workspaceId obrigatório" },
      { status: 400 }
    );
  }

  const canAccess = await adminCanAccessWorkspace(auth.admin.adminId, workspaceId);
  if (!canAccess) {
    return NextResponse.json(
      { ok: false, error: "Sem acesso a este workspace" },
      { status: 403 }
    );
  }

  const token = await signAdminToken({
    adminId: auth.admin.adminId,
    email: auth.admin.email,
    name: auth.admin.name,
    role: auth.admin.role,
    activeWorkspaceId: workspaceId,
  });

  const response = NextResponse.json({ ok: true, activeWorkspaceId: workspaceId });
  response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TOKEN_MAX_AGE,
  });
  return response;
}
