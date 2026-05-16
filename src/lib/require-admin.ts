import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_TOKEN_COOKIE } from "./admin-token";
import type { AdminTokenPayload } from "./admin-token";

// Guard interno pra route handlers admin. Defesa em profundidade:
// o middleware ja bloqueia /api/admin/* sem cookie, mas se ele falhar
// (regression, bug do framework, cache stale de dev) o handler ainda
// devolve 401 ao inves de vazar dados. Use no topo de toda rota admin
// que toca dados sensiveis (financeiro, PII, segredos, acoes destrutivas).
//
// Uso:
//   export async function GET(req: NextRequest) {
//     const auth = await requireAdmin(req);
//     if (!auth.ok) return auth.response;
//     // ...auth.admin esta disponivel
//   }
export type RequireAdminResult =
  | { ok: true; admin: AdminTokenPayload }
  | { ok: false; response: NextResponse };

export async function requireAdmin(req: NextRequest): Promise<RequireAdminResult> {
  const token = req.cookies.get(ADMIN_TOKEN_COOKIE)?.value;
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
  return { ok: true, admin: payload };
}
